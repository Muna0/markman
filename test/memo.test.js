import { test } from "node:test";
import assert from "node:assert/strict";
import { memoTitle, stripLeadingTitle } from "../lib/memo.js";
import { buildSystemPrompt } from "../lib/system-prompt.js";

test("memo titles by type", () => {
  assert.equal(memoTitle("FTO"), "Freedom-to-Operate Analysis (Draft)");
  assert.equal(memoTitle("fto"), "Freedom-to-Operate Analysis (Draft)");
  assert.equal(memoTitle("patent"), "Patent Analysis (Draft)");
  assert.equal(memoTitle("trademark"), "Trademark Clearance Screen (Draft)");
  assert.equal(memoTitle("intake"), "IP Matter Intake Summary (Draft)");
  assert.equal(memoTitle("triage"), "IP Matter Intake Summary (Draft)");
  assert.equal(memoTitle("general", "My Memo"), "My Memo");
  assert.equal(memoTitle(undefined), "Patent Analysis (Draft)");
});

test("a leading memo title in the model output is dropped", () => {
  assert.equal(stripLeadingTitle("# Freedom-to-Operate Analysis\n\nBody").trim(), "Body");
  assert.equal(stripLeadingTitle("FREEDOM-TO-OPERATE ANALYSIS\n============================\nDate: x").trim(), "Date: x");
  assert.equal(stripLeadingTitle("\n## PATENT ANALYSIS MEMORANDUM\nText").trim(), "Text");
  assert.equal(stripLeadingTitle("## Executive Summary\nText"), "## Executive Summary\nText");
  assert.equal(stripLeadingTitle("Plain first line\nText"), "Plain first line\nText");
});

test("a disclaimer line is never stripped, even when followed by a rule or written in caps", () => {
  const fto = "DRAFT FOR ATTORNEY REVIEW. This AI-assisted FTO analysis does not constitute legal advice.\n---\n## Executive Summary";
  assert.equal(stripLeadingTitle(fto), fto);
  const tm = "This AI-assisted trademark screen does not constitute legal advice and is not a comprehensive clearance search.\n---\nBody";
  assert.equal(stripLeadingTitle(tm), tm);
  assert.equal(stripLeadingTitle("DRAFT FOR ATTORNEY REVIEW\nBody"), "DRAFT FOR ATTORNEY REVIEW\nBody");
  assert.equal(stripLeadingTitle("# Trademark Clearance Screen: Draft For Attorney Review\nBody"), "# Trademark Clearance Screen: Draft For Attorney Review\nBody");
  const long = "Trademark clearance notes for the proposed mark covering software and related services in class 9\n===\nBody";
  assert.equal(stripLeadingTitle(long), long, "long lines are not headings");
  assert.equal(stripLeadingTitle("Trademark screen complete.\n---\nBody"), "Trademark screen complete.\n---\nBody", "sentences are not headings");
});

test("system prompt sets the memo voice and single disclaimer/limitations rule", () => {
  const p = buildSystemPrompt({ skill: "SKILL", playbook: "PLAYBOOK", context: "", isPublic: false });
  assert.match(p, /third-person/i);
  assert.match(p, /Never refer to tools, sessions, connections, the model, or yourself/);
  assert.match(p, /"I"/);
  assert.match(p, /\[insert\]/);
  assert.match(p, /Not provided/);
  assert.match(p, /exactly one disclaimer line at the top/i);
  assert.match(p, /exactly one LIMITATIONS section at the end/i);
  assert.match(p, /\*Phillips v\. AWH Corp\.\*/);
  assert.ok(p.includes("SKILL") && p.includes("PLAYBOOK"));
  assert.ok(!/Include a limitations section/.test(p));
  assert.ok(!p.includes("\u2014"), "no em dashes");
});

test("public prompt keeps the length cap", () => {
  assert.match(buildSystemPrompt({ skill: "", playbook: "", isPublic: true }), /1,500 words/);
});

test("memoFooter (used by the web and plugin exports) puts the fixed disclaimer and page number in the footer", async () => {
  const docx = await import("docx");
  const { default: AdmZip } = await import("adm-zip");
  const { memoFooter } = await import("../lib/memo.js");
  const doc = new docx.Document({ sections: [{ footers: { default: memoFooter(docx) }, children: [new docx.Paragraph("x")] }] });
  const zip = new AdmZip(await docx.Packer.toBuffer(doc));
  const footer = zip.getEntries().filter((e) => /^word\/footer\d*\.xml$/.test(e.entryName)).map((e) => zip.readAsText(e)).join("");
  assert.match(footer, /Draft for attorney review\. Not legal advice\. Prepared with Markman; verify all citations and conclusions\./);
  assert.match(footer, /PAGE/);
});

test("the print view disclaimer matches the Word footer disclaimer", async () => {
  const { FOOTER_DISCLAIMER } = await import("../lib/memo.js");
  const { PRINT_DISCLAIMER } = await import("../frontend/src/store/disclaimer.js");
  assert.equal(PRINT_DISCLAIMER, FOOTER_DISCLAIMER);
});
