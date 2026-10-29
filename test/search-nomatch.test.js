import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { startServer } from "./helpers.js";
import { isNoMatchResponse } from "../lib/patent-query.js";

const NO_MATCH_BODY = JSON.stringify({ code: "404", message: "Not Found", detailedMessage: "No matching records found, refine your search criteria and try again" });

test("isNoMatchResponse: only a 404 that says no records matched counts as an empty result", () => {
  assert.equal(isNoMatchResponse(404, NO_MATCH_BODY), true);
  assert.equal(isNoMatchResponse(404, "<html>Not Found</html>"), false);
  assert.equal(isNoMatchResponse(500, NO_MATCH_BODY), false);
  assert.equal(isNoMatchResponse(503, ""), false);
  assert.equal(isNoMatchResponse(403, "Forbidden"), false);
});

let stub, s;
before(async () => {
  stub = http.createServer((req, res) => {
    const q = new URL(req.url, "http://x").searchParams.get("q") || "";
    if (q.includes("zzqxvbn")) { res.writeHead(404, { "Content-Type": "application/json" }); return res.end(NO_MATCH_BODY); }
    if (q.includes("outage")) { res.writeHead(503); return res.end("Service Unavailable"); }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ count: 1, patentFileWrapperDataBag: [{ applicationNumberText: "17988084", applicationMetaData: { inventionTitle: "Widget" } }] }));
  });
  await new Promise((r) => stub.listen(0, "127.0.0.1", r));
  s = await startServer({ MARKMAN_PUBLIC: "1", USPTO_API_KEY: "test-key", USPTO_BASE_URL: `http://127.0.0.1:${stub.address().port}` });
});
after(() => { s.stop(); stub.close(); });

const search = (query) => fetch(`${s.url}/api/patents/search`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }),
});

test("a search with no USPTO matches returns 200 with zero results", async () => {
  const r = await search("zzqxvbn");
  assert.equal(r.status, 200);
  const body = await r.json();
  assert.equal(body.totalResults, 0);
  assert.deepEqual(body.results, []);
});

test("a real USPTO outage is still an error", async () => {
  const r = await search("outage");
  assert.equal(r.status, 500);
  assert.equal((await r.json()).error, "USPTO data is temporarily unavailable. Please try again later.");
});

test("a normal search still returns results", async () => {
  const r = await search("widget");
  assert.equal(r.status, 200);
  assert.equal((await r.json()).results[0].title, "Widget");
});
