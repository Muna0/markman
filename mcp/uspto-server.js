#!/usr/bin/env node

/**
 * USPTO Open Data Portal MCP Server
 *
 * Connects to the USPTO Open Data Portal (data.uspto.gov) and the legacy
 * TSDR API (tsdrapi.uspto.gov) to provide patent and trademark search tools.
 *
 * Environment variables:
 *   USPTO_API_KEY  - API key for data.uspto.gov (required)
 *
 * Tools:
 *   search_patents       - Search patents by query and optional date range
 *   get_patent_details   - Get full details for a specific patent number
 *   search_trademarks    - Search trademark registrations by mark text and class
 *   check_trademark_status - Check current status of a trademark by serial number
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const USPTO_API_KEY = process.env.USPTO_API_KEY;
if (!USPTO_API_KEY) {
  console.error("Error: USPTO_API_KEY environment variable is required.");
  console.error("Get an API key at https://data.uspto.gov/apis/getting-started");
  process.exit(1);
}

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
        throw new Error(
          `USPTO API error ${response.status}: ${response.statusText}. ${body}`
        );
      }

      return await response.json();
    } catch (err) {
      if (attempt === retries) throw err;
      const backoff = Math.min(1000 * 2 ** (attempt - 1), 10_000);
      console.error(`Request failed (attempt ${attempt}/${retries}): ${err.message}. Retrying in ${backoff}ms`);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
}

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

async function searchPatents(query, dateRange) {
  const params = new URLSearchParams({
    q: query,
    rows: "20",
    start: "0",
  });

  if (dateRange?.start) {
    params.set("fq", `filingDate:[${dateRange.start} TO ${dateRange.end || "*"}]`);
  }

  const url = `${ODP_BASE}/patent/applications/search?${params}`;
  const data = await fetchWithRetry(url);

  // ODP API returns patentFileWrapperDataBag with applicationMetaData inside each item
  const bag = data.patentFileWrapperDataBag || data.results || data.patents || [];
  const results = bag.map((p) => {
    const meta = p.applicationMetaData || {};
    const inventors = (meta.inventorBag || []).map(i => i.inventorNameText).filter(Boolean);
    const assignees = (meta.applicantBag || []).map(a => a.applicantNameText || a.organizationNameText).filter(Boolean);
    return {
      applicationNumber: p.applicationNumberText || meta.applicationNumber,
      patentNumber: meta.patentNumber || meta.publicationNumber || p.applicationNumberText,
      title: meta.inventionTitle || meta.inventionSubjectMatterCategory || "",
      filingDate: meta.filingDate || meta.effectiveFilingDate,
      status: meta.applicationStatusCode,
      statusDescription: meta.applicationTypeLabelName,
      type: meta.applicationTypeCategory,
      class: meta.class,
      uspcSymbol: meta.uspcSymbolText,
      firstInventor: meta.firstInventorName,
      inventors: inventors.length > 0 ? inventors : (meta.firstInventorName ? [meta.firstInventorName] : []),
      assignee: assignees.length > 0 ? assignees.join("; ") : "",
    };
  });

  return {
    totalResults: data.count || results.length,
    query,
    dateRange: dateRange || "all dates",
    results,
  };
}

async function getPatentDetails(patentNumber) {
  // Normalize patent number: remove "US", commas, spaces
  const normalized = patentNumber
    .replace(/^US\s*/i, "")
    .replace(/,/g, "")
    .trim();

  const url = `${ODP_BASE}/patent/applications/${normalized}`;
  const data = await fetchWithRetry(url);

  return {
    patentNumber: data.patentNumber || normalized,
    title: data.inventionTitle || data.title,
    abstract: data.abstractText || data.abstract,
    claims: data.claims || data.claimText,
    grantDate: data.grantDate,
    filingDate: data.filingDate,
    expirationDate: data.expirationDate,
    assignee: data.assigneeEntityName || data.assignee,
    inventors: data.inventorNameArrayText || data.inventors,
    classifications: {
      cpc: data.cpcClassification || data.cpcCodes,
      uspc: data.uspcClassification || data.uspcCodes,
    },
    references: {
      citedBy: data.citedByCount || data.referencedByCount,
      citesPatents: data.referenceCitedCount,
    },
    maintenanceFeeStatus: data.maintenanceFeeStatus || "check PAIR for current status",
    prosecutionHistory: data.prosecutionHistory || "use USPTO PAIR for full history",
  };
}

async function searchTrademarks(markText, niceClass) {
  const params = new URLSearchParams({
    q: markText,
    rows: "20",
    start: "0",
  });

  if (niceClass) {
    params.set("fq", `internationalClassCode:${niceClass}`);
  }

  const url = `${ODP_BASE}/trademark/applications/search?${params}`;
  const data = await fetchWithRetry(url);

  const results = (data.results || data.trademarks || []).map((tm) => ({
    serialNumber: tm.serialNumber || tm.applicationNumber,
    registrationNumber: tm.registrationNumber,
    markText: tm.wordMark || tm.markLiteralElements || tm.markText,
    status: tm.statusCode || tm.status,
    statusDate: tm.statusDate,
    filingDate: tm.filingDate || tm.applicationDate,
    registrationDate: tm.registrationDate,
    owner: tm.ownerName || tm.applicantName || tm.owner,
    niceClasses: tm.internationalClassCode || tm.niceClasses,
    goodsServices: tm.goodsAndServicesDescription || tm.goodsServices,
    markType: tm.markTypeCategory || tm.markType,
    liveOrDead: tm.liveDeadIndicator || tm.liveOrDead,
  }));

  return {
    totalResults: data.totalCount || data.numFound || results.length,
    query: markText,
    classFilter: niceClass || "all classes",
    results,
  };
}

async function checkTrademarkStatus(serialNumber) {
  // Normalize: remove dashes, spaces
  const normalized = serialNumber.replace(/[-\s]/g, "").trim();

  // Try ODP first, fall back to TSDR
  try {
    const url = `${ODP_BASE}/trademark/applications/${normalized}`;
    const data = await fetchWithRetry(url);

    return {
      serialNumber: data.serialNumber || normalized,
      registrationNumber: data.registrationNumber,
      markText: data.wordMark || data.markLiteralElements,
      status: data.statusCode || data.status,
      statusDescription: data.statusDescription,
      statusDate: data.statusDate,
      filingDate: data.filingDate,
      registrationDate: data.registrationDate,
      owner: data.ownerName || data.applicantName,
      ownerAddress: data.ownerAddress,
      attorneys: data.attorneyName,
      niceClasses: data.internationalClassCode,
      goodsServices: data.goodsAndServicesDescription,
      renewalDate: data.renewalDate,
      filingBasis: data.filingBasisCode,
      markType: data.markTypeCategory,
      liveOrDead: data.liveDeadIndicator,
      correspondenceAddress: data.correspondenceAddress,
    };
  } catch (odpError) {
    // Fallback to TSDR XML endpoint
    try {
      const tsdrUrl = `${TSDR_BASE}/sn${normalized}/info.json`;
      const data = await fetchWithRetry(tsdrUrl);
      const header = data?.trademarkBag?.trademark?.[0]?.status || {};
      return {
        serialNumber: normalized,
        status: header.usCode || "unknown",
        statusDescription: header.statusText || "See TSDR for details",
        source: "TSDR fallback",
        note: "Full details available at https://tsdr.uspto.gov/#caseNumber=" + normalized,
      };
    } catch (tsdrError) {
      throw new Error(
        `Could not retrieve trademark status from ODP or TSDR. ODP: ${odpError.message}. TSDR: ${tsdrError.message}`
      );
    }
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
        "Search USPTO patent database by keyword query. Returns matching patents with titles, abstracts, dates, and assignees. Supports optional date range filtering.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query (keywords, phrases, CPC class codes)",
          },
          date_range: {
            type: "object",
            description: "Optional date range filter for grant date",
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
        "Get full details for a specific U.S. patent by number, including claims text, prosecution history references, assignee, inventors, classifications, and maintenance fee status.",
      inputSchema: {
        type: "object",
        properties: {
          patent_number: {
            type: "string",
            description:
              "U.S. patent number (e.g., 'US11,234,567', '11234567', or 'US2024/0123456')",
          },
        },
        required: ["patent_number"],
      },
    },
    {
      name: "search_trademarks",
      description:
        "Search USPTO trademark database by mark text and optional Nice Classification class number. Returns matching marks with owner, status, classes, and goods/services.",
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
        "Check the current status of a U.S. trademark by serial number. Returns filing/registration dates, owner, status, goods/services, and renewal information.",
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
