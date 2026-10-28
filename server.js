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
    const k = key && key.trim();
    if (k && val.length && !(k in process.env)) process.env[k] = val.join("=").trim();
  });
} catch {}

const USPTO_API_KEY = process.env.USPTO_API_KEY || "";
const TSDR_API_KEY = process.env.TSDR_API_KEY || USPTO_API_KEY;
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
// Plain multi-word queries match ANY word by default; require ALL words unless the user wrote their own syntax
function toPatentQuery(query) {
  const q = String(query).trim();
  if (/["():]|\b(AND|OR|NOT)\b/.test(q)) return q;
  return q.split(/\s+/).join(" AND ");
}

app.post("/api/patents/search", async (req, res) => {
  try {
    const { query, rows = 20, start = 0 } = req.body;
    if (!query) return res.status(400).json({ error: "query is required" });

    const params = new URLSearchParams({ q: toPatentQuery(query), rows: String(rows), start: String(start) });
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
      patentNumber: meta.patentNumber || normalized,
      applicationNumber: wrapper.applicationNumberText || normalized,
      title: meta.inventionTitle || meta.applicationTypeLabelName || "",
      abstract: meta.abstractText || meta.inventionAbstractText || null,
      claims: meta.claimText || meta.claims || null,
      grantDate: meta.grantDate || null,
      filingDate: meta.filingDate || "",
      effectiveFilingDate: meta.effectiveFilingDate || null,
      expirationDate: meta.expirationDate || null,
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// ─── Trademark status ───
app.post("/api/trademarks/status", async (req, res) => {
  try {
    const { serialNumber } = req.body;
    if (!serialNumber) return res.status(400).json({ error: "serialNumber is required" });

    const normalized = serialNumber.replace(/[-\s]/g, "").trim();
    const tsdrRes = await fetch(`https://tsdrapi.uspto.gov/ts/cd/casestatus/sn${normalized}/info.json`, {
      headers: { "Accept": "application/json", "USPTO-API-KEY": TSDR_API_KEY },
    });
    if (tsdrRes.status === 401) throw new Error("TSDR rejected the request: set TSDR_API_KEY (from account.uspto.gov/api-manager)");
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

function detectHeading(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length <= 2) return null;
  // ALL CAPS lines with letters (CLAIM SCOPE ASSESSMENT, PRIOR ART RED FLAGS, etc.)
  if (trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) && trimmed.length > 3) return "h2";
  // Lines starting with capital letter subsections: "A. REISSUE-SPECIFIC SCOPE ISSUES"
  if (/^[A-Z]\.\s+[A-Z]/.test(trimmed)) return "h3";
  // Lines like "Claim Map", "Scope Assessment" — title case, no period, under 60 chars
  if (/^[A-Z][a-z]/.test(trimmed) && !trimmed.includes(".") && trimmed.length < 60 && /^[A-Z][A-Za-z\s\-\/&:()]+$/.test(trimmed)) return "h3";
  return null;
}

app.post("/api/export", async (req, res) => {
  try {
    const { title, content, memoType } = req.body;
    if (!title || !content) return res.status(400).json({ error: "title and content required" });

    const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, BorderStyle, Header, Footer, PageNumber, TabStopType, TabStopPosition, TableOfContents } = await import("docx");
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}.docx`;
    const filepath = path.join(EXPORT_DIR, filename);

    const isFTO = /fto/i.test(memoType);
    const memoLabel = isFTO ? "Freedom-to-Operate Analysis" : /trademark/i.test(memoType) ? "Trademark Clearance Report" : /intake/i.test(memoType) ? "IP Triage Report" : "Patent Analysis Memorandum";

    const children = [];

    // ─── Privilege header (all memo types) ───
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 8 } },
      children: [new TextRun({ text: "ATTORNEY WORK PRODUCT / PRIVILEGED AND CONFIDENTIAL", bold: true, size: 18, font: "Times New Roman", color: "888888" })],
    }));

    children.push(new Paragraph({ spacing: { after: 200 } }));

    // ─── Memo heading block ───
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 60 },
      children: [new TextRun({ text: memoLabel.toUpperCase(), bold: true, size: 28, font: "Times New Roman", allCaps: true })],
    }));

    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 300 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "333333", space: 12 } },
      children: [new TextRun({ text: title, bold: true, size: 24, font: "Times New Roman" })],
    }));

    // ─── Memo metadata block ───
    const metaFields = [
      ["Date:", timestamp],
      ["Prepared by:", "Markman IP Analysis Platform"],
      ["Classification:", "Privileged & Confidential"],
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

    // ─── Table of Contents ───
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2, spacing: { after: 100 },
      children: [new TextRun({ text: "TABLE OF CONTENTS", bold: true, size: 22, font: "Times New Roman" })],
    }));

    children.push(new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }));

    children.push(new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: "[Update table of contents in Word: right-click above → Update Field]", italics: true, size: 16, font: "Times New Roman", color: "999999" })],
    }));

    children.push(new Paragraph({
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 8 } },
    }));

    // ─── Body content with smart heading detection ───
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!line.trim()) {
        children.push(new Paragraph({ spacing: { after: 80 } }));
        continue;
      }

      const headingLevel = detectHeading(line);

      if (headingLevel === "h2") {
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD", space: 4 } },
          children: [new TextRun({ text: line.trim(), bold: true, size: 24, font: "Times New Roman" })],
        }));
      } else if (headingLevel === "h3") {
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 80 },
          children: [new TextRun({ text: line.trim(), bold: true, size: 22, font: "Times New Roman" })],
        }));
      } else {
        // Detect risk/severity markers and bold them
        const runs = [];
        const riskMatch = line.match(/^(.*?)(HIGH RISK|MEDIUM-HIGH RISK|MEDIUM RISK|LOW RISK|CRITICAL|⚠️)(.*)$/);
        if (riskMatch) {
          if (riskMatch[1]) runs.push(new TextRun({ text: riskMatch[1], size: 22, font: "Times New Roman" }));
          runs.push(new TextRun({ text: riskMatch[2], bold: true, size: 22, font: "Times New Roman", color: riskMatch[2].includes("HIGH") || riskMatch[2] === "CRITICAL" ? "CC0000" : riskMatch[2].includes("MEDIUM") ? "CC6600" : "336600" }));
          if (riskMatch[3]) runs.push(new TextRun({ text: riskMatch[3], size: 22, font: "Times New Roman" }));
        } else {
          // Detect numbered items for slight indent
          const isNumbered = /^\s*\d+[\.\)]\s/.test(line);
          const isBullet = /^\s*[-•]\s/.test(line);
          runs.push(new TextRun({ text: line, size: 22, font: "Times New Roman" }));

          if (isNumbered || isBullet) {
            children.push(new Paragraph({
              spacing: { after: 60 },
              indent: { left: 360 },
              children: runs,
            }));
            continue;
          }
        }

        children.push(new Paragraph({ spacing: { after: 80 }, children: runs }));
      }
    }

    // ─── Disclaimer ───
    children.push(new Paragraph({ spacing: { before: 400 }, border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 8 } } }));
    children.push(new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: "DISCLAIMER", bold: true, size: 18, font: "Times New Roman", color: "888888" })],
    }));
    children.push(new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: "This analysis was generated with AI assistance and does not constitute legal advice. All citations, statutory references, and legal conclusions must be independently verified by a licensed attorney before reliance. No attorney-client relationship is created by receipt of this document.", italics: true, size: 18, font: "Times New Roman", color: "888888" })],
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: `Generated by Markman IP Analysis Platform — ${timestamp}`, italics: true, size: 16, font: "Times New Roman", color: "AAAAAA" })],
    }));

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
              children: [new TextRun({ text: "PRIVILEGED AND CONFIDENTIAL", size: 14, font: "Times New Roman", color: "AAAAAA", italics: true })],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Markman IP Analysis  |  ", size: 14, font: "Times New Roman", color: "AAAAAA" }),
                new TextRun({ text: "Page ", size: 14, font: "Times New Roman", color: "AAAAAA" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 14, font: "Times New Roman", color: "AAAAAA" }),
                new TextRun({ text: " of ", size: 14, font: "Times New Roman", color: "AAAAAA" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, font: "Times New Roman", color: "AAAAAA" }),
              ],
            })],
          }),
        },
        children,
      }],
    });

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
      model: "claude-opus-4-6",
      max_tokens: 8192,
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
