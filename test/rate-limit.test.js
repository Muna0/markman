import { test } from "node:test";
import assert from "node:assert/strict";
import { createDailyLimiter } from "../lib/rate-limit.js";

test("allows 3 per visitor, refuses the 4th", () => {
  const l = createDailyLimiter({ perKey: 3, total: 150 });
  for (let i = 0; i < 3; i++) assert.equal(l.take("a").ok, true);
  assert.deepEqual(l.take("a"), { ok: false, reason: "visitor" });
  assert.equal(l.take("b").ok, true);
});

test("site-wide cap applies across visitors", () => {
  const l = createDailyLimiter({ perKey: 3, total: 2 });
  l.take("a"); l.take("b");
  assert.deepEqual(l.take("c"), { ok: false, reason: "site" });
});

test("counters reset on a new UTC day", () => {
  let t = Date.UTC(2026, 9, 28, 23, 0);
  const l = createDailyLimiter({ perKey: 1, total: 150, now: () => t });
  l.take("a");
  assert.equal(l.take("a").ok, false);
  t = Date.UTC(2026, 9, 29, 0, 1);
  assert.equal(l.take("a").ok, true);
});
