import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { startServer } from "./helpers.js";

const UNAVAILABLE = "The analysis service is temporarily unavailable. Please try again later.";

const analyze = (s) => fetch(`${s.url}/api/analyze`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: "x" }),
});

function assertClean(text) {
  assert.ok(!text.includes("x-api-key"), text);
  assert.ok(!text.includes("request_id"), text);
  assert.ok(!text.includes("authentication_error"), text);
}

test("an invalid Anthropic key returns a plain message, not the raw API error", { skip: process.env.MARKMAN_LIVE_TESTS !== "1" && "set MARKMAN_LIVE_TESTS=1 to run" }, async () => {
  // Makes one real call to the Anthropic API, which answers 401 for this key at no cost
  const s = await startServer({ ANTHROPIC_API_KEY: "sk-ant-invalid" });
  try {
    const text = await (await analyze(s)).text();
    assert.ok(text.includes(UNAVAILABLE), text);
    assertClean(text);
    assert.match(s.stderr(), /\[analyze\]/);
  } finally {
    s.stop();
  }
});

test("a raw 401 body from the API never reaches the client (offline stub)", async () => {
  const stub = http.createServer((req, res) => {
    req.resume();
    req.on("end", () => {
      res.writeHead(401, { "Content-Type": "application/json", "request-id": "req_stub123" });
      res.end(JSON.stringify({ type: "error", error: { type: "authentication_error", message: "invalid x-api-key" }, request_id: "req_stub123" }));
    });
  });
  await new Promise((r) => stub.listen(0, "127.0.0.1", r));
  const s = await startServer({ ANTHROPIC_API_KEY: "test-key", ANTHROPIC_BASE_URL: `http://127.0.0.1:${stub.address().port}` });
  try {
    const text = await (await analyze(s)).text();
    assert.ok(text.includes(UNAVAILABLE), text);
    assertClean(text);
  } finally {
    s.stop();
    stub.close();
  }
});

const searchWidget = (s) => fetch(`${s.url}/api/patents/search`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: "widget" }),
});

test("public demo: USPTO failures return a plain message", async () => {
  const s = await startServer({ MARKMAN_PUBLIC: "1" });
  try {
    const r = await searchWidget(s);
    assert.equal(r.status, 500);
    assert.equal((await r.json()).error, "USPTO data is temporarily unavailable. Please try again later.");
  } finally {
    s.stop();
  }
});

test("local mode: a missing USPTO key returns the actionable message", async () => {
  const s = await startServer();
  try {
    const r = await searchWidget(s);
    assert.equal(r.status, 500);
    assert.match((await r.json()).error, /^USPTO_API_KEY is not set\. Get a free key at https:\/\/data\.uspto\.gov\/myodp/);
  } finally {
    s.stop();
  }
});
