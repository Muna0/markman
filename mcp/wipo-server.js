#!/usr/bin/env node

/**
 * WIPO CASE API MCP Server
 *
 * Experimental. Calls wipocase.wipo.int/api/v1 and, as a fallback,
 * patentscope.wipo.int/search/api/v1, sending WIPO_API_KEY as a bearer token.
 * WIPO CASE is a system for participating patent offices, and PATENTSCOPE
 * programmatic access is a paid WIPO subscription, so these calls work only
 * with credentials WIPO has issued for them. See WIPO's current access terms.
 *
 * Environment variables:
 *   WIPO_API_KEY  - WIPO API credential (bearer token)
 *
 * Tools:
 *   search_international_patents  - Search international patent applications
 *   get_pct_application           - Get details of a specific PCT application
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

const WIPO_API_KEY = process.env.WIPO_API_KEY;
// Without a key the server still starts, so Claude can explain how to add one
const MISSING_KEY_MESSAGE = "WIPO_API_KEY is not set. WIPO support is experimental and requires WIPO API credentials; WIPO does not offer a self-service key for this. WIPO CASE is a system for participating patent offices, and PATENTSCOPE programmatic access is a paid WIPO subscription (see https://www.wipo.int/en/web/patentscope/data/index). You can search PCT applications for free on the PATENTSCOPE website (https://patentscope.wipo.int) and paste what you find. Markman's skills still work on text you paste in.";

const WIPO_BASE = "https://wipocase.wipo.int/api/v1";
const PATENTSCOPE_BASE = "https://patentscope.wipo.int/search/api/v1";

const RATE_LIMIT = {
  maxRequests: 30,
  windowMs: 60_000,
  tokens: 30,
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
  if (!WIPO_API_KEY) throw new Error(MISSING_KEY_MESSAGE);
  checkRateLimit();

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${WIPO_API_KEY}`,
    ...options.headers,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get("retry-after") || "10",
          10
        );
        console.error(
          `WIPO API rate limited. Waiting ${retryAfter}s (attempt ${attempt}/${retries})`
        );
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "WIPO API authentication failed. Check your WIPO_API_KEY."
        );
      }

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        const err = new Error(
          `WIPO API error ${response.status}: ${response.statusText}. ${body}`
        );
        // Client errors will not succeed on retry
        if (response.status >= 400 && response.status < 500) err.noRetry = true;
        throw err;
      }

      return await response.json();
    } catch (err) {
      if (
        err.noRetry ||
        err.message.includes("authentication failed") ||
        attempt === retries
      ) {
        throw err;
      }
      const backoff = Math.min(1000 * 2 ** (attempt - 1), 10_000);
      console.error(
        `Request failed (attempt ${attempt}/${retries}): ${err.message}. Retrying in ${backoff}ms`
      );
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw new Error(`WIPO API is rate limiting requests (HTTP 429 on all ${retries} attempts). Try again in a minute.`);
}

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

async function searchInternationalPatents(query) {
  // Try WIPO CASE first, fall back to PATENTSCOPE
  try {
    const params = new URLSearchParams({
      q: query,
      maximumRecords: "20",
    });

    const url = `${WIPO_BASE}/search?${params}`;
    const data = await fetchWithRetry(url);

    const results = (data.results || data.records || []).map((r) => ({
      applicationNumber: r.applicationNumber || r.appNumber,
      publicationNumber: r.publicationNumber,
      title: r.title || r.inventionTitle,
      abstract: r.abstract,
      applicant: r.applicantName || r.applicant,
      inventors: r.inventorName || r.inventors,
      filingDate: r.filingDate || r.applicationDate,
      publicationDate: r.publicationDate,
      ipcClassification: r.ipcClassification || r.ipc,
      designatedStates: r.designatedStates || r.designations,
      priorityClaims: r.priorityClaims || r.priorities,
      status: r.status || r.applicationStatus,
    }));

    return {
      totalResults: data.totalRecords || data.totalCount || results.length,
      query,
      source: "WIPO CASE",
      results,
    };
  } catch (caseError) {
    // Fallback to PATENTSCOPE
    try {
      const params = new URLSearchParams({
        q: query,
        n: "20",
      });

      const url = `${PATENTSCOPE_BASE}/search?${params}`;
      const data = await fetchWithRetry(url);

      const results = (data.results || data.response?.docs || []).map(
        (r) => ({
          applicationNumber: r.applicationNum || r.id,
          title: r.title || r.inventionTitle,
          abstract: r.abstract,
          applicant: r.applicant,
          filingDate: r.filingDate,
          publicationDate: r.publicationDate,
          ipcClassification: r.ipc,
          status: r.status,
        })
      );

      return {
        totalResults: data.totalCount || results.length,
        query,
        source: "PATENTSCOPE (CASE fallback)",
        results,
      };
    } catch (psError) {
      throw new Error(
        `Search failed. CASE: ${caseError.message}. PATENTSCOPE: ${psError.message}`
      );
    }
  }
}

async function getPctApplication(appNumber) {
  // Normalize: accept PCT/US2024/012345 or PCTUS2024012345
  const normalized = appNumber
    .replace(/\s/g, "")
    .replace(/^PCT\//i, "PCT/")
    .trim();

  // Try WIPO CASE endpoint
  try {
    const encodedApp = encodeURIComponent(normalized);
    const url = `${WIPO_BASE}/applications/${encodedApp}`;
    const data = await fetchWithRetry(url);

    return {
      applicationNumber: data.applicationNumber || normalized,
      internationalFilingDate: data.internationalFilingDate || data.filingDate,
      title: data.title || data.inventionTitle,
      abstract: data.abstract,
      applicant: {
        name: data.applicantName || data.applicant,
        country: data.applicantCountry,
        address: data.applicantAddress,
      },
      inventors: data.inventors || data.inventorName,
      priorityClaims: data.priorityClaims || data.priorities,
      ipcClassification: data.ipcClassification || data.ipc,
      publicationInfo: {
        publicationNumber: data.publicationNumber,
        publicationDate: data.publicationDate,
      },
      nationalPhaseEntries: data.nationalPhaseEntries || data.designations,
      status: data.status || data.applicationStatus,
      chapter: data.chapter,
      searchReport: {
        date: data.searchReportDate,
        citedReferences: data.searchReportCitations || data.citedReferences,
      },
      deadlines: {
        nationalPhaseDeadline: data.nationalPhaseDeadline,
        priorityDate: data.priorityDate,
        thirtyMonthDeadline: data.thirtyMonthDeadline,
      },
      documents: data.documents || data.documentList,
    };
  } catch (caseError) {
    // Fallback: try PATENTSCOPE biblio
    try {
      const encodedApp = encodeURIComponent(normalized);
      const url = `${PATENTSCOPE_BASE}/biblio/${encodedApp}`;
      const data = await fetchWithRetry(url);

      return {
        applicationNumber: normalized,
        title: data.title || data.inventionTitle,
        abstract: data.abstract,
        applicant: data.applicant,
        filingDate: data.filingDate,
        publicationDate: data.publicationDate,
        ipcClassification: data.ipc,
        status: data.status,
        source: "PATENTSCOPE (CASE fallback)",
        note: "Limited data from fallback source. Check WIPO CASE directly for full details.",
      };
    } catch (psError) {
      throw new Error(
        `Could not retrieve PCT application. CASE: ${caseError.message}. PATENTSCOPE: ${psError.message}`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// MCP Server setup
// ---------------------------------------------------------------------------

const server = new Server(
  {
    name: "wipo-server",
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
      name: "search_international_patents",
      description:
        "Experimental. Search international patent applications through WIPO endpoints (CASE, then PATENTSCOPE as a fallback). Requires WIPO API credentials in WIPO_API_KEY. When a call succeeds, returns whatever of these fields the response includes: application and publication numbers, title, abstract, applicant, inventors, dates, IPC codes, and status. Without credentials, use the PATENTSCOPE website and paste results.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Search query (keywords, IPC codes, applicant names, or combinations)",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "get_pct_application",
      description:
        "Experimental. Look up a PCT application through WIPO endpoints (CASE, then PATENTSCOPE as a fallback). Requires WIPO API credentials in WIPO_API_KEY. When a call succeeds, returns whatever bibliographic, priority, publication, and status fields the response includes. Does not compute deadlines; calculate the 30-month national phase date from the priority date yourself.",
      inputSchema: {
        type: "object",
        properties: {
          app_number: {
            type: "string",
            description:
              "PCT application number (e.g., 'PCT/US2024/012345' or 'PCTUS2024012345')",
          },
        },
        required: ["app_number"],
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
      case "search_international_patents":
        result = await searchInternationalPatents(args.query);
        break;

      case "get_pct_application":
        result = await getPctApplication(args.app_number);
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
  console.error("WIPO MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
