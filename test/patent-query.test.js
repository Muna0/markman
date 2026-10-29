import { test } from "node:test";
import assert from "node:assert/strict";
import { toPatentQuery } from "../lib/patent-query.js";

test("a single formatted patent or application number becomes bare digits", () => {
  assert.equal(toPatentQuery("US11,234,567"), "11234567");
  assert.equal(toPatentQuery("US11234567B2"), "11234567");
  assert.equal(toPatentQuery("US 11234567"), "11234567");
  assert.equal(toPatentQuery("17/988,084"), "17988084");
});

test("multiple tokens are AND-joined, even when numeric", () => {
  assert.equal(toPatentQuery("2020 2021"), "2020 AND 2021");
  assert.equal(toPatentQuery("11234567 10987654"), "11234567 AND 10987654");
  assert.equal(toPatentQuery("wireless charging 2020"), "wireless AND charging AND 2020");
  assert.equal(toPatentQuery("H04W 4/80"), "H04W AND 4/80");
});

test("non-US numbers and explicit syntax pass through", () => {
  assert.equal(toPatentQuery("PCT/US2025/041341"), "PCT/US2025/041341");
  assert.equal(toPatentQuery('"wireless charging" OR coil'), '"wireless charging" OR coil');
});
