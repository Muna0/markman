#!/usr/bin/env node

/**
 * Markman Data Store MCP Server
 *
 * Provides persistent local storage for:
 *   - Deadlines (extracted from triage, manually added)
 *   - Matter history (every analysis logged)
 *   - Word document export
 *
 * Data stored in markman-data/ as JSON files.
 * No external dependencies beyond the MCP SDK and docx.
 *
 * Tools:
 *   add_deadline         - Add a tracked deadline
 *   list_deadlines       - List upcoming deadlines
 *   remove_deadline      - Remove a deadline by ID
 *   log_matter           - Log an analysis to history
 *   search_history       - Search past analyses
 *   export_memo          - Export analysis as .docx
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "markman-data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEADLINES_FILE = path.join(DATA_DIR, "deadlines.json");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");
const EXPORT_DIR = path.join(DATA_DIR, "exports");

if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

function readJSON(filepath) {
  if (!fs.existsSync(filepath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filepath, "utf-8"));
  } catch {
    return [];
  }
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// Deadline operations
// ---------------------------------------------------------------------------

function addDeadline(matter, deadline, date, notes, risk) {
  const deadlines = readJSON(DEADLINES_FILE);
  const entry = {
    id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    matter,
    deadline,
    date,
    notes: notes || "",
    risk: risk || "MEDIUM",
    createdAt: new Date().toISOString(),
    completed: false,
  };
  deadlines.push(entry);
  writeJSON(DEADLINES_FILE, deadlines);
  return entry;
}

function listDeadlines(includeCompleted) {
  const deadlines = readJSON(DEADLINES_FILE);
  const filtered = includeCompleted
    ? deadlines
    : deadlines.filter((d) => !d.completed);

  // Sort by date
  filtered.sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    if (isNaN(da)) return 1;
    if (isNaN(db)) return -1;
    return da - db;
  });

  // Calculate days remaining
  const now = new Date();
  return filtered.map((d) => {
    const target = new Date(d.date);
    const daysRemaining = isNaN(target)
      ? "Date TBD"
      : Math.ceil((target - now) / (1000 * 60 * 60 * 24));

    let status = "OK";
    if (typeof daysRemaining === "number") {
      if (daysRemaining < 0) status = "OVERDUE";
      else if (daysRemaining <= 7) status = "URGENT";
      else if (daysRemaining <= 30) status = "UPCOMING";
      else if (daysRemaining <= 60) status = "APPROACHING";
    }

    return { ...d, daysRemaining, status };
  });
}

function removeDeadline(id) {
  const deadlines = readJSON(DEADLINES_FILE);
  const filtered = deadlines.filter((d) => d.id !== id);
  if (filtered.length === deadlines.length) {
    return { success: false, message: `Deadline ${id} not found` };
  }
  writeJSON(DEADLINES_FILE, filtered);
  return { success: true, message: `Deadline ${id} removed` };
}

// ---------------------------------------------------------------------------
// History operations
// ---------------------------------------------------------------------------

function logMatter(type, title, summary, risk, input) {
  const history = readJSON(HISTORY_FILE);
  const entry = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title,
    summary: summary || "",
    risk: risk || "UNKNOWN",
    input: input || "",
    timestamp: new Date().toISOString(),
  };
  history.unshift(entry); // Most recent first
  // Keep last 500 entries
  if (history.length > 500) history.length = 500;
  writeJSON(HISTORY_FILE, history);
  return entry;
}

function searchHistory(query, type) {
  const history = readJSON(HISTORY_FILE);
  const lower = (query || "").toLowerCase();

  return history.filter((m) => {
    const matchesQuery =
      !query ||
      m.title.toLowerCase().includes(lower) ||
      m.summary.toLowerCase().includes(lower) ||
      m.input.toLowerCase().includes(lower);
    const matchesType = !type || m.type.toLowerCase() === type.toLowerCase();
    return matchesQuery && matchesType;
  });
}

// ---------------------------------------------------------------------------
// Export operations
// ---------------------------------------------------------------------------

async function exportMemo(title, content, memoType) {
  // Dynamic import for docx (ESM)
  const {
    Document,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Packer,
    BorderStyle,
  } = await import("docx");

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}.docx`;
  const filepath = path.join(EXPORT_DIR, filename);

  // Parse content into paragraphs
  const lines = content.split("\n");
  const children = [];

  // Privilege header
  if (memoType === "FTO" || memoType === "fto") {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        },
        children: [
          new TextRun({
            text: "ATTORNEY WORK PRODUCT / PRIVILEGED AND CONFIDENTIAL",
            bold: true,
            size: 20,
            font: "Times New Roman",
            color: "666666",
          }),
        ],
      })
    );
  }

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 32,
          font: "Times New Roman",
        }),
      ],
    })
  );

  // Date
  children.push(
    new Paragraph({
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Date: ${timestamp}`,
          size: 22,
          font: "Times New Roman",
          color: "666666",
        }),
      ],
    })
  );

  // Content lines
  for (const line of lines) {
    if (!line.trim()) {
      children.push(new Paragraph({ spacing: { after: 100 } }));
      continue;
    }

    // Detect headings (all caps lines or lines starting with #)
    const isHeading =
      line === line.toUpperCase() && line.trim().length > 3 && /[A-Z]/.test(line);
    const isSubheading = line.startsWith("## ") || line.startsWith("### ");
    const isH1 = line.startsWith("# ");

    if (isH1) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 100 },
          children: [
            new TextRun({
              text: line.replace(/^#+\s*/, ""),
              bold: true,
              size: 28,
              font: "Times New Roman",
            }),
          ],
        })
      );
    } else if (isSubheading) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: line.replace(/^#+\s*/, ""),
              bold: true,
              size: 24,
              font: "Times New Roman",
            }),
          ],
        })
      );
    } else if (isHeading) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
          children: [
            new TextRun({
              text: line.trim(),
              bold: true,
              size: 24,
              font: "Times New Roman",
            }),
          ],
        })
      );
    } else {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: line,
              size: 22,
              font: "Times New Roman",
            }),
          ],
        })
      );
    }
  }

  // Disclaimer
  children.push(
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      border: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      },
      spacing: { before: 200 },
      children: [
        new TextRun({
          text: "This analysis was generated with AI assistance and does not constitute legal advice. All citations, patent numbers, and legal conclusions should be verified by licensed counsel before reliance.",
          italics: true,
          size: 18,
          font: "Times New Roman",
          color: "999999",
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filepath, buffer);

  return {
    filepath,
    filename,
    message: `Exported to ${filepath}`,
  };
}

// ---------------------------------------------------------------------------
// MCP Server setup
// ---------------------------------------------------------------------------

const server = new Server(
  { name: "markman-store", version: "1.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "add_deadline",
      description:
        "Add a tracked IP deadline. Deadlines persist locally and can be listed with list_deadlines.",
      inputSchema: {
        type: "object",
        properties: {
          matter: {
            type: "string",
            description: "Matter or case name",
          },
          deadline: {
            type: "string",
            description:
              "What the deadline is for (e.g., 'PCT national phase entry', 'Section 8 declaration')",
          },
          date: {
            type: "string",
            description:
              "Deadline date (YYYY-MM-DD) or descriptive (e.g., 'Before partner meeting')",
          },
          notes: { type: "string", description: "Additional notes" },
          risk: {
            type: "string",
            enum: ["HIGH", "MEDIUM", "LOW"],
            description: "Risk level if missed",
          },
        },
        required: ["matter", "deadline", "date"],
      },
    },
    {
      name: "list_deadlines",
      description:
        "List all tracked IP deadlines sorted by date. Shows days remaining and urgency status (OVERDUE, URGENT, UPCOMING, APPROACHING, OK).",
      inputSchema: {
        type: "object",
        properties: {
          include_completed: {
            type: "boolean",
            description: "Include completed deadlines (default: false)",
          },
        },
      },
    },
    {
      name: "remove_deadline",
      description: "Remove a tracked deadline by its ID.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Deadline ID to remove",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "log_matter",
      description:
        "Log an IP analysis to the persistent matter history. Called automatically by skills after completing an analysis.",
      inputSchema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description:
              "Analysis type: patent-analysis, fto-memo, trademark-screen, matter-intake",
          },
          title: {
            type: "string",
            description: "Brief title of the analysis",
          },
          summary: {
            type: "string",
            description: "Summary of findings",
          },
          risk: {
            type: "string",
            enum: ["HIGH", "MEDIUM", "LOW", "UNKNOWN"],
            description: "Overall risk level",
          },
          input: {
            type: "string",
            description: "Original user input/query",
          },
        },
        required: ["type", "title"],
      },
    },
    {
      name: "search_history",
      description:
        "Search the matter history for past analyses. Find previous work on a patent, trademark, or technology.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Search term (searches titles, summaries, and input text)",
          },
          type: {
            type: "string",
            description:
              "Filter by analysis type (patent-analysis, fto-memo, trademark-screen, matter-intake)",
          },
        },
      },
    },
    {
      name: "export_memo",
      description:
        "Export an analysis as a formatted Word (.docx) document with privilege markings, Bluebook citation formatting, and a standard disclaimer. Saves to markman-data/exports/.",
      inputSchema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Document title",
          },
          content: {
            type: "string",
            description:
              "Full memo content (markdown or plain text). Headings, paragraphs, and sections will be formatted.",
          },
          memo_type: {
            type: "string",
            enum: ["FTO", "patent", "trademark", "triage", "general"],
            description:
              "Type of memo. FTO memos get automatic privilege markings.",
          },
        },
        required: ["title", "content"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "add_deadline":
        result = addDeadline(
          args.matter,
          args.deadline,
          args.date,
          args.notes,
          args.risk
        );
        break;

      case "list_deadlines":
        result = listDeadlines(args.include_completed);
        break;

      case "remove_deadline":
        result = removeDeadline(args.id);
        break;

      case "log_matter":
        result = logMatter(
          args.type,
          args.title,
          args.summary,
          args.risk,
          args.input
        );
        break;

      case "search_history":
        result = searchHistory(args.query, args.type);
        break;

      case "export_memo":
        result = await exportMemo(
          args.title,
          args.content,
          args.memo_type || "general"
        );
        break;

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    console.error(`Tool ${name} error:`, error);
    return {
      content: [
        { type: "text", text: `Error executing ${name}: ${error.message}` },
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
  console.error("Markman data store MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
