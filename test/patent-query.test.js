import { test } from "node:test";
import assert from "node:assert/strict";
import { toPatentQuery, numberQueryDigits, exactNumberMatches } from "../lib/patent-query.js";

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

test("numberQueryDigits returns digits only for a single number token", () => {
  assert.equal(numberQueryDigits("US 10,000,000"), "10000000");
  assert.equal(numberQueryDigits("14/643,719"), "14643719");
  assert.equal(numberQueryDigits("wireless charging"), null);
  assert.equal(numberQueryDigits("2020"), null);
});

test("exactNumberMatches keeps only exact patent or application number hits when any exist", () => {
  const results = [
    { applicationNumber: "14643719", patentNumber: "10000000" },
    { applicationNumber: "PCTUS2002041432", patentNumber: "" },
  ];
  assert.deepEqual(exactNumberMatches(results, "10000000"), [results[0]]);
  assert.deepEqual(exactNumberMatches(results, "14643719"), [results[0]]);
  assert.deepEqual(exactNumberMatches(results, "99999999"), results);
  assert.deepEqual(exactNumberMatches(results, null), results);
});
