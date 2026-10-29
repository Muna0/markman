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
