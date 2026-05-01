#!/usr/bin/env node

/**
 * Markman Backend API Server
 *
 * Bridges the frontend to live USPTO/WIPO data and local storage.
 * Runs on port 3001 alongside the Vite dev server (5173).
 *
 * Endpoints:
 *   POST /api/patents/search       - Search USPTO patents
 *   POST /api/patents/details      - Get patent details by number
 *   POST /api/trademarks/search    - Search USPTO trademarks
 *   POST /api/trademarks/status    - Check trademark status
 *   POST /api/deadlines            - Add a deadline
 *   GET  /api/deadlines            - List all deadlines
 *   DELETE /api/deadlines/:id      - Remove a deadline
 *   POST /api/history              - Log a matter
 *   GET  /api/history              - Search history
 *   POST /api/export               - Export memo as .docx
 *   GET  /api/status               - Server and API key status
 */

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv import needed for simple case)
try {
  const envFile = fs.readFileSync(path.join(__dirname, ".env"), "utf-8");
  envFile.split("\n").forEach((line) => {
    const [key, ...val] = line.split("=");
    if (key && val.length) process.env[key.trim()] = val.join("=").trim();
  });
} catch {}

const USPTO_API_KEY = process.env.USPTO_API_KEY || "";
const WIPO_API_KEY = process.env.WIPO_API_KEY || "";
const PORT = process.env.PORT || 3001;

const DATA_DIR = path.join(__dirname, "markman-data");
const EXPORT_DIR = path.join(DATA_DIR, "exports");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });

const DEADLINES_FILE = path.join(DATA_DIR, "deadlines.json");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

function readJSON(fp) {
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, "utf-8")); } catch { return []; }
}
function writeJSON(fp, data) {
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf-8");
}

// ─── USPTO fetch helper ───
async function usptoFetch(url) {
  if (!USPTO_API_KEY) throw new Error("USPTO_API_KEY not configured");
  const res = await fetch(url, {
    headers: { "Accept": "application/json", "X-API-KEY": USPTO_API_KEY },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`USPTO API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

// ─── Express app ───
const app = express();
app.use(cors());
app.use(express.json());

// ─── Patent search ───
app.post("/api/patents/search", async (req, res) => {
  try {
    const { query, rows = 20 } = req.body;
    if (!query) return res.status(400).json({ error: "query is required" });

    const params = new URLSearchParams({ q: query, rows: String(rows), start: "0" });
    const data = await usptoFetch(`https://api.uspto.gov/api/v1/patent/applications/search?${params}`);

    const bag = data.patentFileWrapperDataBag || [];
    const results = bag.map((p) => {
      const meta = p.applicationMetaData || {};
      const inventors = (meta.inventorBag || []).map(i => i.inventorNameText).filter(Boolean);
      const assignees = (meta.applicantBag || []).map(a => a.applicantNameText || a.organizationNameText).filter(Boolean);
      return {
        applicationNumber: p.applicationNumberText || "",
        title: meta.inventionTitle || meta.applicationTypeLabelName || "",
        filingDate: meta.filingDate || meta.effectiveFilingDate || "",
        status: meta.applicationStatusCode,
        type: meta.applicationTypeCategory || "",
        class: meta.class || "",
        firstInventor: meta.firstInventorName || "",
        inventors,
        assignee: assignees.join("; ") || "",
      };
    });

    res.json({ totalResults: data.count || results.length, query, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Patent details ───
app.post("/api/patents/details", async (req, res) => {
  try {
    const { patentNumber } = req.body;
    if (!patentNumber) return res.status(400).json({ error: "patentNumber is required" });

    const normalized = patentNumber.replace(/^US\s*/i, "").replace(/,/g, "").trim();
    const data = await usptoFetch(`https://api.uspto.gov/api/v1/patent/applications/${normalized}`);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Trademark search (TSDR) ───
app.post("/api/trademarks/search", async (req, res) => {
  try {
    const { markText } = req.body;
    if (!markText) return res.status(400).json({ error: "markText is required" });

    // TSDR doesn't have a search-by-text endpoint without a separate key
    // Return a helpful message
    res.json({
      note: "Trademark text search requires a separate TSDR API key from developer.uspto.gov. Use the USPTO TESS web interface at tess2.uspto.gov for manual searches.",
      query: markText,
      results: [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Trademark status ───
app.post("/api/trademarks/status", async (req, res) => {
  try {
    const { serialNumber } = req.body;
    if (!serialNumber) return res.status(400).json({ error: "serialNumber is required" });

    const normalized = serialNumber.replace(/[-\s]/g, "").trim();
    const tsdrRes = await fetch(`https://tsdrapi.uspto.gov/ts/cd/casestatus/sn${normalized}/info.json`);
    if (!tsdrRes.ok) throw new Error(`TSDR ${tsdrRes.status}`);
    const data = await tsdrRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Deadlines ───
app.get("/api/deadlines", (req, res) => {
  const deadlines = readJSON(DEADLINES_FILE).filter(d => !d.completed);
  const now = new Date();
  const enriched = deadlines.map(d => {
    const target = new Date(d.date);
    const days = isNaN(target) ? "TBD" : Math.ceil((target - now) / 86400000);
    let status = "OK";
    if (typeof days === "number") {
      if (days < 0) status = "OVERDUE";
      else if (days <= 7) status = "URGENT";
      else if (days <= 30) status = "UPCOMING";
      else if (days <= 60) status = "APPROACHING";
    }
    return { ...d, daysRemaining: days, status };
  });
  enriched.sort((a, b) => {
    if (typeof a.daysRemaining !== "number") return 1;
    if (typeof b.daysRemaining !== "number") return -1;
    return a.daysRemaining - b.daysRemaining;
  });
  res.json(enriched);
});

app.post("/api/deadlines", (req, res) => {
  const { matter, deadline, date, notes, risk } = req.body;
  if (!matter || !deadline || !date) return res.status(400).json({ error: "matter, deadline, date required" });
  const all = readJSON(DEADLINES_FILE);
  const entry = {
    id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    matter, deadline, date, notes: notes || "", risk: risk || "MEDIUM",
    createdAt: new Date().toISOString(), completed: false,
  };
  all.push(entry);
  writeJSON(DEADLINES_FILE, all);
  res.json(entry);
});

app.delete("/api/deadlines/:id", (req, res) => {
  const all = readJSON(DEADLINES_FILE);
  const filtered = all.filter(d => d.id !== req.params.id);
  if (filtered.length === all.length) return res.status(404).json({ error: "not found" });
  writeJSON(DEADLINES_FILE, filtered);
  res.json({ success: true });
});

// ─── History ───
app.get("/api/history", (req, res) => {
  const { q, type } = req.query;
  let history = readJSON(HISTORY_FILE);
  if (q) {
    const lower = q.toLowerCase();
    history = history.filter(m =>
      m.title.toLowerCase().includes(lower) ||
      (m.summary || "").toLowerCase().includes(lower) ||
      (m.input || "").toLowerCase().includes(lower)
    );
  }
  if (type) history = history.filter(m => m.type === type);
  res.json(history.slice(0, 50));
});

app.post("/api/history", (req, res) => {
  const { type, title, summary, risk, input } = req.body;
  if (!type || !title) return res.status(400).json({ error: "type and title required" });
  const all = readJSON(HISTORY_FILE);
  const entry = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, title, summary: summary || "", risk: risk || "UNKNOWN",
    input: input || "", timestamp: new Date().toISOString(),
  };
  all.unshift(entry);
  if (all.length > 500) all.length = 500;
  writeJSON(HISTORY_FILE, all);
  res.json(entry);
});

// ─── Export ───
app.post("/api/export", async (req, res) => {
  try {
    const { title, content, memoType } = req.body;
    if (!title || !content) return res.status(400).json({ error: "title and content required" });

    const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, BorderStyle } = await import("docx");
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}.docx`;
    const filepath = path.join(EXPORT_DIR, filename);

    const children = [];

    if (memoType === "FTO" || memoType === "fto") {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 400 },
        children: [new TextRun({ text: "ATTORNEY WORK PRODUCT / PRIVILEGED AND CONFIDENTIAL", bold: true, size: 20, font: "Times New Roman", color: "666666" })],
      }));
    }

    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1, spacing: { after: 200 },
      children: [new TextRun({ text: title, bold: true, size: 32, font: "Times New Roman" })],
    }));

    children.push(new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: `Date: ${timestamp}`, size: 22, font: "Times New Roman", color: "666666" })],
    }));

    for (const line of content.split("\n")) {
      if (!line.trim()) { children.push(new Paragraph({ spacing: { after: 100 } })); continue; }
      const isHeading = line === line.toUpperCase() && line.trim().length > 3 && /[A-Z]/.test(line);
      if (isHeading) {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 }, children: [new TextRun({ text: line.trim(), bold: true, size: 24, font: "Times New Roman" })] }));
      } else {
        children.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: line, size: 22, font: "Times New Roman" })] }));
      }
    }

    children.push(new Paragraph({ spacing: { before: 400 } }));
    children.push(new Paragraph({
      children: [new TextRun({ text: "This analysis was generated with AI assistance and does not constitute legal advice.", italics: true, size: 18, font: "Times New Roman", color: "999999" })],
    }));

    const doc = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filepath, buffer);

    res.json({ filepath, filename, downloadUrl: `/api/export/download/${filename}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/export/download/:filename", (req, res) => {
  const filepath = path.join(EXPORT_DIR, req.params.filename);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: "not found" });
  res.download(filepath);
});

// ─── Claude Analysis (the bridge) ───
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

// Load skill files as system prompts
function loadSkill(skillType) {
  const skillMap = {
    "patent": "skills/patent-analysis.md",
    "trademark": "skills/trademark-screen.md",
    "fto": "skills/fto-memo.md",
    "intake": "skills/ip-triage.md",
  };
  const filepath = path.join(__dirname, skillMap[skillType] || skillMap["patent"]);
  if (!fs.existsSync(filepath)) return "";
  return fs.readFileSync(filepath, "utf-8");
}

function loadPlaybook() {
  const filepath = path.join(__dirname, "playbooks/ip-playbook.md");
  if (!fs.existsSync(filepath)) return "";
  return fs.readFileSync(filepath, "utf-8");
}

app.post("/api/analyze", async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(400).json({ error: "ANTHROPIC_API_KEY not configured. Add it to your .env file." });
  }

  const { query, skillType, context } = req.body;
  if (!query) return res.status(400).json({ error: "query is required" });

  const skill = loadSkill(skillType || "patent");
  const playbook = loadPlaybook();

  const systemPrompt = `You are Markman, an IP law analysis assistant. Follow this skill definition exactly:

${skill}

Reference these practice standards:

${playbook}

${context ? `Additional context:\n${context}` : ""}

Important:
- Produce structured, formatted output following the skill's output template
- Use Bluebook citation format where applicable
- Include a limitations section
- Be specific and actionable`;

  // Set up SSE streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: query }],
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta?.text) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    // Final message
    const finalMessage = await stream.finalMessage();
    res.write(`data: ${JSON.stringify({ done: true, usage: finalMessage.usage })}\n\n`);
    res.end();

    // Log to history
    const fullText = finalMessage.content.map(c => c.text || "").join("");
    const historyAll = readJSON(HISTORY_FILE);
    historyAll.unshift({
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: `${skillType || "patent"}-analysis`,
      title: query.slice(0, 80),
      summary: fullText.slice(0, 200),
      risk: "ANALYZED",
      input: query,
      timestamp: new Date().toISOString(),
    });
    if (historyAll.length > 500) historyAll.length = 500;
    writeJSON(HISTORY_FILE, historyAll);

  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// Check if Claude API is configured
app.get("/api/status", (req, res) => {
  res.json({
    uspto: USPTO_API_KEY ? "configured" : "missing",
    wipo: WIPO_API_KEY ? "configured" : "missing",
    claude: ANTHROPIC_API_KEY ? "configured" : "missing",
    deadlines: readJSON(DEADLINES_FILE).length,
    history: readJSON(HISTORY_FILE).length,
  });
});

// ─── Start ───
app.listen(PORT, () => {
  console.log(`Markman API server running on http://localhost:${PORT}`);
  console.log(`  USPTO API:    ${USPTO_API_KEY ? "configured" : "NOT SET"}`);
  console.log(`  WIPO API:     ${WIPO_API_KEY ? "configured" : "NOT SET"}`);
  console.log(`  Claude API:   ${ANTHROPIC_API_KEY ? "configured" : "NOT SET"}`);
});
