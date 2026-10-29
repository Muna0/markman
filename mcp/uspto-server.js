#!/usr/bin/env node

/**
 * USPTO Open Data Portal MCP Server
 *
 * Connects to the USPTO Open Data Portal API (api.uspto.gov) for patent
 * application data and to TSDR (tsdrapi.uspto.gov) for trademark status.
 *
 * Environment variables:
 *   USPTO_API_KEY  - Open Data Portal API key from data.uspto.gov/myodp
 *
 * Tools:
 *   search_patents         - Search patent applications by query and optional filing date range
 *   get_patent_details     - Get bibliographic and transaction data for a patent or application number
 *   search_trademarks      - Explains that USPTO has no trademark text search API and links to USPTO Trademark Search
 *   check_trademark_status - Check the status of a trademark by serial number (TSDR)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { toPatentQuery } from "../lib/patent-query.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const USPTO_API_KEY = process.env.USPTO_API_KEY;
// Without a key the server still starts, so Claude can explain how to add one
const MISSING_KEY_MESSAGE = "USPTO_API_KEY is not set. Get a free key at https://data.uspto.gov/myodp (sign in with a USPTO.gov account verified through ID.me, and complete the required profile fields: job title, organization type, organization name, intended use). Add it to your shell environment (for example ~/.zshrc), then restart Claude Code. Markman's skills still work on text you paste in.";

const ODP_BASE = "https://api.uspto.gov/api/v1";
const TSDR_BASE = "https://tsdrapi.uspto.gov/ts/cd/casestatus";

const RATE_LIMIT = {
  maxRequests: 50,
  windowMs: 60_000,
  tokens: 50,
  lastReset: Date.now(),
};

// ---------------------------------------------------------------------------
// Rate limiter
// ---------------------------------------------------------------------------

function checkRateLimit() {
  const now = Date.now();
  if (now - RATE_LIMIT.lastReset > RATE_LIMIT.windowMs) {
    RATE_LIMIT.tokens = RATE_LIMIT.maxRequests;
    RATE_LIMIT.lastReset = now;
  }
  if (RATE_LIMIT.tokens <= 0) {
    const retryAfter = Math.ceil(
      (RATE_LIMIT.windowMs - (now - RATE_LIMIT.lastReset)) / 1000
    );
    throw new Error(
      `Rate limit exceeded. Retry after ${retryAfter} seconds.`
    );
  }
  RATE_LIMIT.tokens--;
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

async function fetchWithRetry(url, options = {}, retries = 3) {
  if (!USPTO_API_KEY) throw new Error(MISSING_KEY_MESSAGE);
  checkRateLimit();

  const headers = {
    Accept: "application/json",
    "X-API-KEY": USPTO_API_KEY,
    ...options.headers,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("retry-after") || "5", 10);
        console.error(`USPTO API rate limited. Waiting ${retryAfter}s (attempt ${attempt}/${retries})`);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        const err = new Error(
          `USPTO API error ${response.status}: ${response.statusText}. ${body}`
        );
        // Client errors (bad number, no match, bad key) will not succeed on retry
        if (response.status >= 400 && response.status < 500) err.noRetry = true;
        throw err;
      }

      return await response.json();
    } catch (err) {
      if (err.noRetry || attempt === retries) throw err;
      const backoff = Math.min(1000 * 2 ** (attempt - 1), 10_000);
      console.error(`Request failed (attempt ${attempt}/${retries}): ${err.message}. Retrying in ${backoff}ms`);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw new Error(`USPTO API is rate limiting requests (HTTP 429 on all ${retries} attempts). Try again in a minute.`);
}

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------


async function searchPatents(query, dateRange) {
  const params = new URLSearchParams({
    q: toPatentQuery(query),
    rows: "20",
    start: "0",
  });

  if (dateRange?.start) {
    params.set("fq", `filingDate:[${dateRange.start} TO ${dateRange.end || "*"}]`);
  }

  const url = `${ODP_BASE}/patent/applications/search?${params}`;
  const data = await fetchWithRetry(url);

  // ODP API returns patentFileWrapperDataBag with applicationMetaData inside each item
  const bag = data.patentFileWrapperDataBag || [];
  const results = bag.map((w) => {
    const r = mapFileWrapper(w);
    return {
      applicationNumber: r.applicationNumber,
      patentNumber: r.patentNumber,
      title: r.title,
      filingDate: r.filingDate,
      grantDate: r.grantDate,
      status: r.status,
      applicationType: r.applicationType,
      applicants: r.applicants,
      inventors: r.inventors,
      cpc: r.cpc,
    };
  });

  return {
    totalResults: data.count || results.length,
    query,
    dateRange: dateRange ? `filing date ${dateRange.start} to ${dateRange.end || "present"}` : "all dates",
    results,
  };
}

// Map one ODP file wrapper record to the fields this server returns
function mapFileWrapper(wrapper) {
  const meta = wrapper.applicationMetaData || {};
  const inventors = (meta.inventorBag || []).map((i) => i.inventorNameText).filter(Boolean);
  const applicants = (meta.applicantBag || []).map((a) => a.applicantNameText || a.organizationNameText).filter(Boolean);
  const assignees = (wrapper.assignmentBag || [])
    .flatMap((a) => (a.assigneeBag || []).map((ae) => ae.assigneeNameText))
    .filter(Boolean);
  const events = (wrapper.eventDataBag || [])
    .slice()
    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
    .map((e) => `${e.eventDate}: ${e.eventDescriptionText} (${e.eventCode})`);
  return {
    applicationNumber: wrapper.applicationNumberText || meta.applicationNumber || null,
    patentNumber: meta.patentNumber || null,
    title: meta.inventionTitle || "",
    filingDate: meta.filingDate || null,
    effectiveFilingDate: meta.effectiveFilingDate || null,
    grantDate: meta.grantDate || null,
    status: meta.applicationStatusDescriptionText || meta.applicationStatusCode || null,
    statusDate: meta.applicationStatusDate || null,
    applicationType: meta.applicationTypeLabelName || null,
    applicants,
    assigneesOfRecord: [...new Set(assignees)],
    inventors,
    cpc: meta.cpcClassificationBag || [],
    uspc: meta.uspcSymbolText || null,
    groupArtUnit: meta.groupArtUnitNumber || null,
    examiner: meta.examinerNameText || null,
    entityStatus: meta.entityStatusData?.businessEntityStatusCategory || null,
    patentTermAdjustmentDays: wrapper.patentTermAdjustmentData?.adjustmentTotalQuantity ?? null,
    parentContinuity: (wrapper.parentContinuityBag || []).map((p) => ({
      type: p.claimParentageTypeCodeDescriptionText,
      parentApplication: p.parentApplicationNumberText,
      parentFilingDate: p.parentApplicationFilingDate,
    })),
    foreignPriority: (wrapper.foreignPriorityBag || []).map((f) => ({
      office: f.ipOfficeName,
      applicationNumber: f.applicationNumberText,
      filingDate: f.filingDate,
    })),
    transactionHistory: events,
  };
}

const CLAIMS_NOTE =
  "This USPTO endpoint does not return claim text or an abstract. Get the claims from the published patent (for example on Google Patents, https://patents.google.com, or the patent PDF) and paste them in. Expiration is not computed here; check term, terminal disclaimers, and maintenance fee status before relying on any date.";

async function getPatentDetails(number) {
  const raw = String(number).trim();
  // Application numbers are usually written with a slash (17/123,456); patent numbers are not
  const looksLikeApplication = raw.includes("/");
  const normalized = raw.replace(/^US\s*/i, "").replace(/[,\/\s]/g, "");
  const n = encodeURIComponent(normalized);

  let wrapper = null;
  let matchedAs = null;
  if (!looksLikeApplication) {
    const params = new URLSearchParams({ q: `applicationMetaData.patentNumber:${normalized}`, rows: "1" });
    try {
      const data = await fetchWithRetry(`${ODP_BASE}/patent/applications/search?${params}`);
      wrapper = data.patentFileWrapperDataBag?.[0] || null;
      if (wrapper) matchedAs = "patent number";
    } catch (err) {
      // No patent with that number (USPTO answers 404); try it as an application number next
      if (!/ 404/.test(err.message)) throw err;
    }
  }
  if (!wrapper) {
    const data = await fetchWithRetry(`${ODP_BASE}/patent/applications/${n}`);
    wrapper = data.patentFileWrapperDataBag?.[0] || null;
    if (wrapper) matchedAs = "application number";
  }
  if (!wrapper) throw new Error(`No USPTO record found for ${raw}.`);

  return {
    input: raw,
    matchedAs,
    ...mapFileWrapper(wrapper),
    note: `Matched ${raw} as a ${matchedAs}. Confirm the title and number before relying on this record. ${CLAIMS_NOTE}`,
  };
}

async function searchTrademarks(markText, niceClass) {
  // USPTO offers no API for trademark search by text. Return guidance instead of a failed call.
  return {
    query: markText,
    classFilter: niceClass || "all classes",
    results: [],
    note: "USPTO does not offer trademark search by text through any API. Search this mark manually at https://tmsearch.uspto.gov (USPTO Trademark Search), then continue the clearance analysis with what you find.",
  };
}

async function checkTrademarkStatus(serialNumber) {
  // Normalize: remove dashes, spaces
  const normalized = String(serialNumber).replace(/[-\s]/g, "").trim();
  const tsdrUrl = `${TSDR_BASE}/sn${normalized}/info.json`;
  try {
    const data = await fetchWithRetry(tsdrUrl, { headers: { "USPTO-API-KEY": USPTO_API_KEY } });
    const status = data?.trademarkBag?.trademark?.[0]?.status || {};
    return {
      serialNumber: normalized,
      status: status.usCode || "unknown",
      statusDescription: status.statusText || "See TSDR for details",
      source: "TSDR",
      note: "Confirm the full record at https://tsdr.uspto.gov/#caseNumber=" + normalized,
    };
  } catch (err) {
    throw new Error(
      `Could not retrieve trademark status from USPTO TSDR (${err.message}). TSDR was not responding reliably as of October 2026. Check the record at https://tsdr.uspto.gov/#caseNumber=${normalized}`
    );
  }
}

// ---------------------------------------------------------------------------
// MCP Server setup
// ---------------------------------------------------------------------------

const server = new Server(
  {
    name: "uspto-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_patents",
      description:
        "Search USPTO patent application records (Open Data Portal) by keyword query. Returns up to 20 records with application and patent numbers, title, filing and grant dates, status, applicants, inventors, and CPC codes. Does not return abstracts or claim text. Supports an optional filing date range.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query (keywords, phrases, CPC class codes)",
          },
          date_range: {
            type: "object",
            description: "Optional filing date range filter",
            properties: {
              start: {
                type: "string",
                description: "Start date (YYYY-MM-DD)",
              },
              end: {
                type: "string",
                description: "End date (YYYY-MM-DD). Defaults to today.",
              },
            },
          },
        },
        required: ["query"],
      },
    },
    {
      name: "get_patent_details",
      description:
        "Get the USPTO Open Data Portal record for a U.S. patent or application number: title, filing and grant dates, status, applicants, assignees of record, inventors, CPC codes, patent term adjustment, continuity, foreign priority, and the transaction history (which includes maintenance fee events). Does not return claim text or an abstract. Numbers without a slash are tried as patent numbers first, then as application numbers; numbers with a slash (e.g. 17/123,456) are treated as application numbers.",
      inputSchema: {
        type: "object",
        properties: {
          patent_number: {
            type: "string",
            description:
              "U.S. patent number (e.g., 'US11,234,567' or '11234567') or application number (e.g., '17/123,456')",
          },
        },
        required: ["patent_number"],
      },
    },
    {
      name: "search_trademarks",
      description:
        "USPTO offers no API for trademark search by text. This tool returns no results; it returns a note pointing to USPTO Trademark Search (tmsearch.uspto.gov) so the user can run the search and paste what they find.",
      inputSchema: {
        type: "object",
        properties: {
          mark_text: {
            type: "string",
            description: "The trademark text to search for",
          },
          class: {
            type: "string",
            description:
              "Nice Classification class number (e.g., '009' for software, '042' for SaaS). Optional.",
          },
        },
        required: ["mark_text"],
      },
    },
    {
      name: "check_trademark_status",
      description:
        "Check the status of a U.S. trademark application or registration by serial number using USPTO TSDR. Returns the status code and status text when TSDR responds. TSDR was not responding reliably as of October 2026.",
      inputSchema: {
        type: "object",
        properties: {
          serial_number: {
            type: "string",
            description:
              "USPTO serial number (e.g., '97123456' or '97-123-456')",
          },
        },
        required: ["serial_number"],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "search_patents":
        result = await searchPatents(args.query, args.date_range);
        break;

      case "get_patent_details":
        result = await getPatentDetails(args.patent_number);
        break;

      case "search_trademarks":
        result = await searchTrademarks(args.mark_text, args.class);
        break;

      case "check_trademark_status":
        result = await checkTrademarkStatus(args.serial_number);
        break;

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error(`Tool ${name} error:`, error);
    return {
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("USPTO MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
