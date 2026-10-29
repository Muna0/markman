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
  assert.match(r.headers.get("content-disposition"), /attachment; filename="Patent_Analysis_/);
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

const postJSON = (path, body, ip) => fetch(`${s.url}${path}`, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...(ip ? { "fly-client-ip": ip } : {}) },
  body: JSON.stringify(body),
});

test("x-powered-by header is not sent", async () => {
  const r = await fetch(`${s.url}/api/status`);
  assert.equal(r.headers.get("x-powered-by"), null);
});

test("patent details rejects path traversal and malformed numbers with 400", async () => {
  for (const patentNumber of ["../../foo?x=1", "US 10,000,000/../x", "abc", "1234567890123456789012345", "12 34#5"]) {
    const r = await postJSON("/api/patents/details", { patentNumber }, "10.0.1.1");
    assert.equal(r.status, 400, patentNumber);
    assert.equal((await r.json()).error, "Invalid patent or application number");
  }
});

test("patent details accepts a normal number past validation", async () => {
  const r = await postJSON("/api/patents/details", { patentNumber: "US 10,000,000" }, "10.0.1.2");
  assert.notEqual(r.status, 400);
});

test("USPTO routes share a 100/visitor daily limit in public mode", async () => {
  const ip = "10.0.2.1";
  for (let i = 0; i < 50; i++) assert.notEqual((await postJSON("/api/patents/search", { query: "widget" }, ip)).status, 429);
  for (let i = 0; i < 50; i++) assert.notEqual((await postJSON("/api/patents/details", { patentNumber: "10000000" }, ip)).status, 429);
  const r = await postJSON("/api/patents/search", { query: "widget" }, ip);
  assert.equal(r.status, 429);
  const body = await r.json();
  assert.equal(body.limit, "visitor");
  assert.equal(body.error, "Daily search limit reached on the public demo. Install the free plugin to keep going.");
  assert.equal((await postJSON("/api/patents/details", { patentNumber: "10000000" }, ip)).status, 429);
  assert.notEqual((await postJSON("/api/patents/search", { query: "widget" }, "10.0.2.2")).status, 429);
});

test("skillType 'constructor' falls back to the patent skill instead of a 500", async () => {
  const http = await import("node:http");
  const stub = http.createServer((req, res) => {
    req.resume();
    req.on("end", () => {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ type: "error", error: { type: "authentication_error", message: "stub" } }));
    });
  });
  await new Promise((r) => stub.listen(0, "127.0.0.1", r));
  const s2 = await startServer({ MARKMAN_PUBLIC: "1", ANTHROPIC_API_KEY: "test-key", ANTHROPIC_BASE_URL: `http://127.0.0.1:${stub.address().port}` });
  try {
    for (const skillType of ["constructor", "__proto__", "toString"]) {
      const r = await fetch(`${s2.url}/api/analyze`, {
        method: "POST", headers: { "Content-Type": "application/json", "fly-client-ip": `10.0.3.${skillType.length}` },
        body: JSON.stringify({ query: "x", skillType }),
      });
      assert.equal(r.status, 200, skillType);
      await r.text();
    }
  } finally {
    s2.stop();
    stub.close();
  }
});

test("HEAD / and HEAD on an app route return 200", { skip: !fs.existsSync(new URL("../frontend/dist/index.html", import.meta.url)) && "frontend not built" }, async () => {
  assert.equal((await fetch(`${s.url}/`, { method: "HEAD" })).status, 200);
  assert.equal((await fetch(`${s.url}/app/fto`, { method: "HEAD" })).status, 200);
});
