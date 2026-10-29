import { test } from "node:test";
import assert from "node:assert/strict";
import { ftoKeyTerms, ftoSearchQueries } from "../frontend/src/store/ftoQuery.js";

const DESC = "A mobile recipe app that recommends meals from pantry inventory using a graph neural network";

test("key terms skip filler and generic words and keep 2 to 4 distinctive terms in order", () => {
  const terms = ftoKeyTerms(DESC);
  assert.ok(terms.length >= 2 && terms.length <= 4, terms.join(","));
  assert.deepEqual(terms, ["recipe", "meal", "pantry", "inventory"]);
  for (const generic of ["mobile", "app", "using", "that", "recommends"]) assert.ok(!terms.includes(generic));
});

test("queries go from narrow AND to grouped OR to plain OR", () => {
  assert.deepEqual(ftoSearchQueries(DESC), [
    "recipe AND meal AND pantry AND inventory",
    "(recipe OR meal) AND (pantry OR inventory)",
    "recipe OR meal OR pantry OR inventory",
  ]);
});

test("three terms group the first two", () => {
  assert.deepEqual(ftoSearchQueries("a wireless charging coil"), [
    "wireless AND charging AND coil",
    "(wireless OR charging) AND coil",
    "wireless OR charging OR coil",
  ]);
});

test("two terms give AND then OR; one term gives one query; none gives none", () => {
  assert.deepEqual(ftoSearchQueries("lidar sensor"), ["lidar AND sensor", "lidar OR sensor"]);
  assert.deepEqual(ftoSearchQueries("a lidar"), ["lidar"]);
  assert.deepEqual(ftoSearchQueries("the and of"), []);
});

test("duplicates and punctuation are ignored", () => {
  assert.deepEqual(ftoKeyTerms("Battery; battery-pack (batteries) thermal"), ["battery", "pack", "thermal"]);
});
