import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { startServer } from "./helpers.js";
import { earliestPriority } from "../lib/patent-query.js";

test("earliestPriority: picks the earliest continuity or foreign priority date", () => {
  const r = earliestPriority(
    [{ parentApplicationFilingDate: "2014-11-14", parentApplicationNumberText: "14541563", claimParentageTypeCode: "CIP" },
     { parentApplicationFilingDate: "2013-11-14", parentApplicationNumberText: "61904175", claimParentageTypeCode: "PRO" }],
    [{ filingDate: "2014-01-02", applicationNumberText: "GB1", ipOfficeName: "UK" }],
  );
  assert.deepEqual(r, { date: "2013-11-14", source: "61904175", basis: "PRO" });
});

test("earliestPriority: returns null when the record has no priority claims", () => {
  assert.equal(earliestPriority([], []), null);
  assert.equal(earliestPriority(undefined, undefined), null);
});

let stub, s, lastParams;
before(async () => {
  stub = http.createServer((req, res) => {
    const u = new URL(req.url, "http://x");
    res.writeHead(200, { "Content-Type": "application/json" });
    if (u.pathname.endsWith("/search")) {
      lastParams = u.searchParams;
      return res.end(JSON.stringify({ count: 100, patentFileWrapperDataBag: [] }));
    }
    res.end(JSON.stringify({ patentFileWrapperDataBag: [{
      applicationNumberText: "16030036",
      applicationMetaData: { patentNumber: "10814729", filingDate: "2018-07-09", grantDate: "2020-10-27", applicationStatusDescriptionText: "Patented Case" },
      parentContinuityBag: [
        { claimParentageTypeCode: "CIP", claimParentageTypeCodeDescriptionText: "is a Continuation in-part of", parentApplicationNumberText: "14541563", parentApplicationFilingDate: "2014-11-14" },
        { claimParentageTypeCode: "PRO", claimParentageTypeCodeDescriptionText: "Claims priority from a provisional application", parentApplicationNumberText: "61904175", parentApplicationFilingDate: "2013-11-14" },
      ],
    }] }));
  });
  await new Promise((r) => stub.listen(0, "127.0.0.1", r));
  s = await startServer({ MARKMAN_PUBLIC: "1", USPTO_API_KEY: "test-key", USPTO_BASE_URL: `http://127.0.0.1:${stub.address().port}` });
});
after(() => { s.stop(); stub.close(); });

const post = (path, body) => fetch(`${s.url}${path}`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

test("search sends the requested page size to USPTO as limit/offset, clamped to 1..50", async () => {
  await post("/api/patents/search", { query: "coffee", rows: 5, start: 10 });
  assert.equal(lastParams.get("limit"), "5");
  assert.equal(lastParams.get("offset"), "10");
  await post("/api/patents/search", { query: "coffee", rows: 500 });
  assert.equal(lastParams.get("limit"), "50");
  await post("/api/patents/search", { query: "coffee", rows: 0 });
  assert.equal(lastParams.get("limit"), "1");
});

test("details report the earliest claimed priority date, not the filing date", async () => {
  const r = await post("/api/patents/details", { patentNumber: "16030036" });
  const d = await r.json();
  assert.equal(d.filingDate, "2018-07-09");
  assert.equal(d.priorityDate, "2013-11-14");
  assert.equal(d.grantDate, "2020-10-27");
  assert.equal(d.continuity.length, 2);
  assert.equal(d.expirationDate, undefined);
});
