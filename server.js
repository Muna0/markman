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
 *   POST /api/export               - Export memo as .docx (streamed, nothing saved)
 *   POST /api/analyze              - Stream an analysis (3/visitor/day in public mode)
 *   GET  /api/status               - Mode, model, and API key status
 *
 * Set MARKMAN_PUBLIC=1 for the public demo: no CORS, no history, deadlines,
 * or TSDR lookups, capped input size, daily limits, demo model.
 */

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createDailyLimiter } from "./lib/rate-limit.js";
import { toPatentQuery, numberQueryDigits, exactNumberMatches, isNoMatchResponse, earliestPriority } from "./lib/patent-query.js";
import { markdownToDocx } from "./lib/markdown-docx.js";
import { memoTitle, stripLeadingTitle, memoFooter } from "./lib/memo.js";
import { buildSystemPrompt } from "./lib/system-prompt.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv import needed for simple case)
try {
  const envFile = fs.readFileSync(path.join(__dirname, ".env"), "utf-8");
  envFile.split("\n").forEach((line) => {
    const [key, ...val] = line.split("=");
    const k = key && key.trim();
    if (k && val.length && !(k in process.env)) process.env[k] = val.join("=").trim();
  });
} catch {}

const USPTO_API_KEY = process.env.USPTO_API_KEY || "";
const WIPO_API_KEY = process.env.WIPO_API_KEY || "";
const USPTO_BASE = (process.env.USPTO_BASE_URL || "https://api.uspto.gov").replace(/\/$/, "");
const PORT = process.env.PORT || 3001;
const PUBLIC = process.env.MARKMAN_PUBLIC === "1";
const MODEL = process.env.MARKMAN_MODEL || (PUBLIC ? "claude-sonnet-5-5" : "claude-opus-5-5");
const MAX_TOKENS = PUBLIC ? 6000 : 8192;
const MAX_QUERY_CHARS = 20000;
const limiter = createDailyLimiter({ perKey: 3, total: 150 });
const searchLimiter = createDailyLimiter({ perKey: 100, total: 3000 });
const visitorKey = (req) => req.get("fly-client-ip") || req.ip;

const DATA_DIR = path.join(__dirname, "markman-data");
if (!PUBLIC && !fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DEADLINES_FILE = path.join(DATA_DIR, "deadlines.json");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

function readJSON(fp) {
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, "utf-8")); } catch { return []; }
}
function writeJSON(fp, data) {
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Error messages for visitors ───
// Full upstream errors go to the server log only; clients get a plain message.
const MSG_USPTO = "USPTO data is temporarily unavailable. Please try again later.";
const MSG_ANALYSIS_UNAVAILABLE = "The analysis service is temporarily unavailable. Please try again later.";
const MSG_ANALYSIS_FAILED = "Something went wrong running the analysis. Please try again.";
const MSG_EXPORT_FAILED = "Something went wrong creating the document. Please try again.";
const UNAVAILABLE_TYPES = new Set(["authentication_error", "permission_error", "billing_error", "overloaded_error", "rate_limit_error"]);

function logError(where, err) {
  console.error(`[${where}]`, err?.status ? `status ${err.status}:` : "", err?.message || String(err));
}

// Local users get the actionable missing-key message; the public demo gets the generic one
function usptoErrorMessage(err) {
  return !PUBLIC && err?.missingKey ? err.message : MSG_USPTO;
}

function analysisErrorMessage(err) {
  const type = err?.error?.error?.type || err?.error?.type;
  if (UNAVAILABLE_TYPES.has(type) || [401, 402, 403, 429, 529].includes(err?.status)) return MSG_ANALYSIS_UNAVAILABLE;
  return MSG_ANALYSIS_FAILED;
}

// ─── USPTO fetch helper ───
async function usptoFetch(url) {
  if (!USPTO_API_KEY) {
    const err = new Error("USPTO_API_KEY is not set. Get a free key at https://data.uspto.gov/myodp, add USPTO_API_KEY to your .env file, and restart the server.");
    err.missingKey = true;
    throw err;
  }
  const res = await fetch(url, {
    headers: { "Accept": "application/json", "X-API-KEY": USPTO_API_KEY },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(`USPTO API ${res.status}: ${body.slice(0, 200)}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}

// ─── Express app ───
const app = express();
app.disable("x-powered-by");
if (!PUBLIC) app.use(cors());
app.use(express.json({ limit: "200kb" }));
app.use((req, res, next) => {
  res.set({ "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "strict-origin-when-cross-origin" });
  next();
});
const localOnly = (req, res, next) => PUBLIC ? res.status(404).json({ error: "Not available on the public demo." }) : next();

// Shared daily cap on USPTO-backed routes in public mode. Returns true if the request was refused.
function searchLimitReached(req, res) {
  if (!PUBLIC) return false;
  const r = searchLimiter.take(visitorKey(req));
  if (r.ok) return false;
  res.status(429).json({ error: "Daily search limit reached on the public demo. Install the free plugin to keep going.", limit: r.reason });
  return true;
}

function clampInt(value, min, max, fallback) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// ─── Patent search ───

app.post("/api/patents/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "query is required" });
    const rows = clampInt(req.body.rows, 1, 50, 20);
    const start = clampInt(req.body.start, 0, Number.MAX_SAFE_INTEGER, 0);
    if (searchLimitReached(req, res)) return;

    // The Open Data Portal pages with limit/offset; it ignores rows/start and returns 25
    const params = new URLSearchParams({ q: toPatentQuery(query), limit: String(rows), offset: String(start) });
    let data;
    try {
      data = await usptoFetch(`${USPTO_BASE}/api/v1/patent/applications/search?${params}`);
    } catch (err) {
      // No matches comes back as a 404; that is an empty result, not an outage
      if (isNoMatchResponse(err.status, err.body)) return res.json({ totalResults: 0, query, results: [] });
      throw err;
    }

    const bag = data.patentFileWrapperDataBag || [];
    const mapped = bag.map((p) => {
      const meta = p.applicationMetaData || {};
      const inventors = (meta.inventorBag || []).map(i => i.inventorNameText).filter(Boolean);
      const assignees = (meta.applicantBag || []).map(a => a.applicantNameText || a.organizationNameText).filter(Boolean);
      return {
        applicationNumber: p.applicationNumberText || "",
        patentNumber: meta.patentNumber || "",
        title: meta.inventionTitle || meta.applicationTypeLabelName || "",
        filingDate: meta.filingDate || meta.effectiveFilingDate || "",
        grantDate: meta.grantDate || "",
        status: meta.applicationStatusCode,
        statusDescription: meta.applicationStatusDescriptionText || "",
        type: meta.applicationTypeCategory || "",
        class: meta.class || "",
        firstInventor: meta.firstInventorName || "",
        inventors,
        assignee: assignees.join("; ") || "",
      };
    });

    // A search for one patent or application number shows only the exact match when there is one
    const results = exactNumberMatches(mapped, numberQueryDigits(query));
    const totalResults = results.length < mapped.length ? results.length : (data.count || results.length);
    res.json({ totalResults, query, results });
  } catch (err) {
    logError("patents/search", err);
    res.status(500).json({ error: usptoErrorMessage(err) });
  }
});

// ─── Patent details ───
app.post("/api/patents/details", async (req, res) => {
  try {
    const { patentNumber } = req.body;
    if (!patentNumber) return res.status(400).json({ error: "patentNumber is required" });

    const normalized = String(patentNumber).replace(/\s+/g, "").replace(/^US/i, "").replace(/,/g, "");
    if (!/^[0-9A-Z\/]{5,20}$/i.test(normalized)) return res.status(400).json({ error: "Invalid patent or application number" });
    if (searchLimitReached(req, res)) return;
    const data = await usptoFetch(`${USPTO_BASE}/api/v1/patent/applications/${encodeURIComponent(normalized)}`);

    // Parse the file wrapper response into a clean structure
    const wrapper = data.patentFileWrapperDataBag?.[0] || data;
    const meta = wrapper.applicationMetaData || {};
    const events = wrapper.eventDataBag || [];
    const inventors = (meta.inventorBag || []).map(i => {
      const addr = i.correspondenceAddressBag?.[0] || {};
      return { name: i.inventorNameText, city: addr.cityName, country: addr.countryName };
    }).filter(i => i.name);
    const assignees = (meta.applicantBag || []).map(a => a.applicantNameText || a.organizationNameText).filter(Boolean);

    // Prosecution timeline
    const prosecutionHistory = events
      .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
      .map(e => `${e.eventDate}: ${e.eventDescriptionText} (${e.eventCode})`)
      .join("\n");

    // Parent/continuity data
    const continuity = (wrapper.parentContinuityBag || []).map(p => ({
      type: p.claimParentageTypeCodeDescriptionText,
      parentApplication: p.parentApplicationNumberText,
      parentFilingDate: p.parentApplicationFilingDate,
      parentStatus: p.parentApplicationStatusDescriptionText,
    }));

    // Foreign priority
    const foreignPriority = (wrapper.foreignPriorityBag || []).map(fp => ({
      country: fp.ipOfficeName,
      applicationNumber: fp.applicationNumberText,
      filingDate: fp.filingDate,
    }));

    // Earliest priority date the record claims (null when it claims none). Never the filing date.
    const priority = earliestPriority(wrapper.parentContinuityBag, wrapper.foreignPriorityBag);

    // Assignment data
    const assignments = (wrapper.assignmentBag || []).map(a => ({
      assignee: (a.assigneeBag || []).map(ae => ae.assigneeNameText).join("; "),
      conveyance: a.conveyanceText,
      recordedDate: a.assignmentRecordedDate,
      reelFrame: a.reelAndFrameNumber,
    }));

    // Attorney/firm
    const attorney = wrapper.recordAttorney?.customerNumberCorrespondenceData;
    const firmName = attorney?.powerOfAttorneyAddressBag?.[0]?.nameLineOneText || null;

    // Entity status
    const entityStatus = meta.entityStatusData?.businessEntityStatusCategory || null;

    res.json({
      patentNumber: meta.patentNumber || null,
      applicationNumber: wrapper.applicationNumberText || normalized,
      title: meta.inventionTitle || meta.applicationTypeLabelName || "",
      abstract: meta.abstractText || meta.inventionAbstractText || null,
      claims: meta.claimText || meta.claims || null,
      grantDate: meta.grantDate || null,
      filingDate: meta.filingDate || "",
      effectiveFilingDate: meta.effectiveFilingDate || null,
      priorityDate: priority?.date || null,
      priorityBasis: priority ? { application: priority.source, type: priority.basis } : null,
      assignee: assignees.join("; ") || "",
      inventors,
      firstInventor: meta.firstInventorName || "",
      type: meta.applicationTypeCategory || "",
      status: meta.applicationStatusCode,
      statusDescription: meta.applicationStatusDescriptionText || meta.applicationTypeLabelName || "",
      statusDate: meta.applicationStatusDate || null,
      class: meta.class || "",
      subclass: meta.subclass || "",
      uspcSymbol: meta.uspcSymbolText || "",
      groupArtUnit: meta.groupArtUnitNumber || null,
      docketNumber: meta.docketNumber || null,
      entityStatus,
      firmName,
      nationalStage: meta.nationalStageIndicator === "True" || meta.nationalStageIndicator === true,
      confirmationNumber: meta.applicationConfirmationNumber || null,
      classifications: {
        cpc: meta.cpcClassification || meta.cpcCodes || null,
        uspc: meta.uspcClassification || meta.uspcCodes || meta.uspcSymbolText || null,
      },
      references: {
        citedBy: meta.citedByCount || meta.referencedByCount || null,
        citesPatents: meta.referenceCitedCount || null,
      },
      continuity,
      foreignPriority,
      assignments,
      prosecutionHistory,
      eventCount: events.length,
    });
  } catch (err) {
    logError("patents/details", err);
    res.status(500).json({ error: usptoErrorMessage(err) });
  }
});

// ─── Trademark search (TSDR) ───
app.post("/api/trademarks/search", async (req, res) => {
  try {
    const { markText } = req.body;
    if (!markText) return res.status(400).json({ error: "markText is required" });

    // USPTO offers no API for trademark text search, only its web search tool
    res.json({
      note: "USPTO does not offer trademark search by text through any API. Search the mark on USPTO Trademark Search to check for conflicting registrations.",
      searchUrl: "https://tmsearch.uspto.gov/search/search-information",
      query: markText,
      results: [],
    });
  } catch (err) {
    logError("trademarks/search", err);
    res.status(500).json({ error: usptoErrorMessage(err) });
  }
});

// ─── Trademark status ───
app.post("/api/trademarks/status", localOnly, async (req, res) => {
  try {
    const { serialNumber } = req.body;
    if (!serialNumber) return res.status(400).json({ error: "serialNumber is required" });

    const normalized = serialNumber.replace(/[-\s]/g, "").trim();
    const tsdrRes = await fetch(`https://tsdrapi.uspto.gov/ts/cd/casestatus/sn${normalized}/info.json`, {
      headers: { "Accept": "application/json", "USPTO-API-KEY": USPTO_API_KEY },
    });
    if (tsdrRes.status === 401) throw new Error("TSDR rejected the request. TSDR uses your USPTO key and was not responding reliably as of October 2026; check the record at tsdr.uspto.gov.");
    if (!tsdrRes.ok) throw new Error(`TSDR ${tsdrRes.status}`);
    const data = await tsdrRes.json();
    res.json(data);
  } catch (err) {
    logError("trademarks/status", err);
    res.status(500).json({ error: usptoErrorMessage(err) });
  }
});

// ─── Deadlines ───
app.get("/api/deadlines", localOnly, (req, res) => {
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

app.post("/api/deadlines", localOnly, (req, res) => {
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

app.delete("/api/deadlines/:id", localOnly, (req, res) => {
  const all = readJSON(DEADLINES_FILE);
  const filtered = all.filter(d => d.id !== req.params.id);
  if (filtered.length === all.length) return res.status(404).json({ error: "not found" });
  writeJSON(DEADLINES_FILE, filtered);
  res.json({ success: true });
});

// ─── History ───
app.get("/api/history", localOnly, (req, res) => {
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

app.post("/api/history", localOnly, (req, res) => {
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

    const docx = await import("docx");
    const { Document, Paragraph, TextRun, AlignmentType, Packer, BorderStyle, Header } = docx;
    const timestamp = new Date().toISOString().split("T")[0];
    const heading = memoTitle(memoType, title);
    const filename = `${heading.replace(/\(Draft\)/, "").trim().replace(/[^a-zA-Z0-9]+/g, "_")}_${timestamp}.docx`;

    const children = [];

    // ─── Title (one, by memo type). The draft label is in the page header; privilege labels are left to the user. ───
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 300 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "333333", space: 12 } },
      children: [new TextRun({ text: heading, bold: true, size: 28, font: "Times New Roman" })],
    }));

    // ─── Memo metadata block ───
    const metaFields = [
      ["Date:", timestamp],
      ["Prepared with:", "Markman (open-source IP drafting tool)"],
    ];

    for (const [label, value] of metaFields) {
      children.push(new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: label, bold: true, size: 20, font: "Times New Roman" }),
          new TextRun({ text: `  ${value}`, size: 20, font: "Times New Roman" }),
        ],
      }));
    }

    children.push(new Paragraph({
      spacing: { after: 300 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 8 } },
    }));

    // ─── Body content: Markdown converted to Word formatting. The draft carries its own
    // disclaimer line and LIMITATIONS section, so none is added here. ───
    children.push(...markdownToDocx(stripLeadingTitle(content), docx));

    const doc = new Document({
      styles: {
        default: {
          document: { run: { font: "Times New Roman", size: 22 } },
          heading1: { run: { font: "Times New Roman", size: 32, bold: true } },
          heading2: { run: { font: "Times New Roman", size: 24, bold: true } },
          heading3: { run: { font: "Times New Roman", size: 22, bold: true } },
        },
      },
      sections: [{
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "DRAFT FOR ATTORNEY REVIEW", size: 14, font: "Times New Roman", color: "AAAAAA", italics: true })],
            })],
          }),
        },
        footers: { default: memoFooter(docx) },
        children,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    });
    res.send(buffer);
  } catch (err) {
    logError("export", err);
    res.status(500).json({ error: MSG_EXPORT_FAILED });
  }
});

// ─── Claude Analysis (the bridge) ───
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

// Load skill files as system prompts
function loadSkill(skillType) {
  const skillMap = {
    "patent": "skills/patent-analysis/SKILL.md",
    "trademark": "skills/trademark-screen/SKILL.md",
    "fto": "skills/fto-memo/SKILL.md",
    "intake": "skills/ip-triage/SKILL.md",
  };
  const filepath = path.join(__dirname, Object.hasOwn(skillMap, skillType) ? skillMap[skillType] : skillMap["patent"]);
  if (!fs.existsSync(filepath)) return "";
  return fs.readFileSync(filepath, "utf-8");
}

function loadPlaybook() {
  const filepath = path.join(__dirname, "playbooks/ip-playbook.md");
  if (!fs.existsSync(filepath)) return "";
  return fs.readFileSync(filepath, "utf-8");
}

app.post("/api/analyze", async (req, res) => {
  const { query, skillType, context } = req.body;
  if (!query) return res.status(400).json({ error: "query is required" });
  if (typeof query !== "string" || (context != null && typeof context !== "string"))
    return res.status(400).json({ error: "query and context must be text" });
  if (PUBLIC) {
    if (String(query).length + String(context || "").length > MAX_QUERY_CHARS)
      return res.status(413).json({ error: `The public demo accepts up to ${MAX_QUERY_CHARS.toLocaleString()} characters. Install the free plugin for longer documents.` });
    const r = limiter.take(visitorKey(req));
    if (!r.ok) return res.status(429).json({
      limit: r.reason,
      error: r.reason === "visitor"
        ? "You've used today's 3 free analyses on the public demo. Install the free Markman plugin to keep going."
        : "The public demo has reached today's limit. Install the free Markman plugin to keep going.",
    });
  }

  if (!ANTHROPIC_API_KEY) {
    return res.status(400).json({ error: "ANTHROPIC_API_KEY not configured. Add it to your .env file." });
  }

  const skill = loadSkill(skillType || "patent");
  const playbook = loadPlaybook();

  const systemPrompt = buildSystemPrompt({ skill, playbook, context, isPublic: PUBLIC });

  // Set up SSE streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Stop the upstream request if the visitor leaves, so abandoned runs stop billing
  const upstream = new AbortController();
  res.on("close", () => { if (!res.writableFinished) upstream.abort(); });

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // This model thinks by default and can spend the whole token cap before any text
      ...(MODEL === "claude-sonnet-5-5" ? { thinking: { type: "between_tools" } } : {}),
      system: systemPrompt,
      messages: [{ role: "user", content: query }],
    }, { signal: upstream.signal });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta?.text) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    // Final message
    const finalMessage = await stream.finalMessage();
    res.write(`data: ${JSON.stringify({ done: true, usage: finalMessage.usage, stop_reason: finalMessage.stop_reason })}\n\n`);
    res.end();

    // Log to history
    if (!PUBLIC) {
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
    }

  } catch (err) {
    if (upstream.signal.aborted) {
      console.log("[analyze] client disconnected; upstream stream aborted");
      return;
    }
    logError("analyze", err);
    res.write(`data: ${JSON.stringify({ error: analysisErrorMessage(err) })}\n\n`);
    res.end();
  }
});

// Check if Claude API is configured
app.get("/api/status", (req, res) => {
  res.json({
    public: PUBLIC, model: MODEL,
    uspto: USPTO_API_KEY ? "configured" : "missing",
    wipo: WIPO_API_KEY ? "configured" : "missing",
    claude: ANTHROPIC_API_KEY ? "configured" : "missing",
  });
});

// ─── Static app ───
const DIST = path.join(__dirname, "frontend", "dist");
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, maxAge: "1h" }));
  app.use((req, res, next) => {
    if ((req.method !== "GET" && req.method !== "HEAD") || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(DIST, "index.html"));
  });
}

// ─── Start ───
const httpServer = app.listen(PORT, () => {
  console.log(`Markman API server running on http://localhost:${httpServer.address().port}`);
  console.log(`  Mode:         ${PUBLIC ? "public demo" : "local"}`);
  console.log(`  Model:        ${MODEL}`);
  console.log(`  USPTO API:    ${USPTO_API_KEY ? "configured" : "NOT SET"}`);
  console.log(`  WIPO API:     ${WIPO_API_KEY ? "configured" : "NOT SET"}`);
  console.log(`  Claude API:   ${ANTHROPIC_API_KEY ? "configured" : "NOT SET"}`);
});
