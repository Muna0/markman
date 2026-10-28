import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { startServer } from "./helpers.js";

let s;
before(async () => { s = await startServer({ MARKMAN_PUBLIC: "1" }); });
after(() => s.stop());

const analyze = (body) => fetch(`${s.url}/api/analyze`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

test("4th analysis from one visitor is refused with 429", async () => {
  for (let i = 0; i < 3; i++) assert.notEqual((await analyze({ query: "x" })).status, 429);
  const r = await analyze({ query: "x" });
  assert.equal(r.status, 429);
  assert.equal((await r.json()).limit, "visitor");
});

test("oversized query is refused with 413", async () => {
  const r = await analyze({ query: "a".repeat(20001) });
  assert.equal(r.status, 413);
});

test("history, deadlines, and TSDR status are off", async () => {
  assert.equal((await fetch(`${s.url}/api/history`)).status, 404);
  assert.equal((await fetch(`${s.url}/api/deadlines`)).status, 404);
  const tsdr = await fetch(`${s.url}/api/trademarks/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  assert.equal(tsdr.status, 404);
});

test("status reports public mode and the demo model", async () => {
  const st = await (await fetch(`${s.url}/api/status`)).json();
  assert.equal(st.public, true);
  assert.equal(st.model, "claude-sonnet-5-5");
});

test("export streams a docx and writes nothing to disk", async () => {
  const before = fs.existsSync("markman-data/exports") ? fs.readdirSync("markman-data/exports").length : 0;
  const r = await fetch(`${s.url}/api/export`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Test Memo", content: "CLAIM SCOPE\nBody", memoType: "patent" }),
  });
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-disposition"), /attachment; filename="Test_Memo_/);
  const bytes = Buffer.from(await r.arrayBuffer());
  assert.equal(bytes.subarray(0, 2).toString(), "PK");
  const after = fs.existsSync("markman-data/exports") ? fs.readdirSync("markman-data/exports").length : 0;
  assert.equal(after, before);
});

test("deep links serve the app shell when frontend/dist exists", { skip: !fs.existsSync("frontend/dist/index.html") }, async () => {
  const r = await fetch(`${s.url}/app/patent`);
  assert.equal(r.status, 200);
  assert.match(await r.text(), /<div id="root">/);
});

test("security headers are set", async () => {
  const r = await fetch(`${s.url}/api/status`);
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("x-frame-options"), "DENY");
});

test("non-text query or context is refused with 400 before the limiter", async () => {
  const blocks = [{ type: "text", text: "x".repeat(50000) }];
  assert.equal((await analyze({ query: blocks })).status, 400);
  assert.equal((await analyze({ query: "x", context: { a: 1 } })).status, 400);
});
