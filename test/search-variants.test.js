import { test } from "node:test";
import assert from "node:assert/strict";
import { searchVariants } from "../frontend/src/store/searchVariants.js";

test("two-word mark: compound, hyphenated, and plural/singular forms only", () => {
  const v = searchVariants("Brew Haven");
  assert.ok(v.includes("BREWHAVEN"));
  assert.ok(v.includes("BREW-HAVEN"));
  assert.ok(v.includes("BREW HAVENS"));
  assert.ok(!v.includes("BREW HAVEN"), "excludes the mark itself");
  assert.ok(!v.some((x) => /BBREW|BREWW|HAVENN/.test(x)), "no doubled-letter noise");
  assert.ok(v.every((x) => typeof x === "string"), "plain strings, no scores");
});

test("plural mark gets a singular form; phonetic spellings are conservative", () => {
  const v = searchVariants("Phone Clicks");
  assert.ok(v.includes("PHONE CLICK"));
  assert.ok(v.includes("FONE CLICKS"));
  assert.ok(v.includes("PHONE KLICKS") || v.includes("PHONE CLIKS"));
  assert.ok(v.length <= 10);
});

test("word swaps like LIGHT/LITE and NIGHT/NITE", () => {
  assert.ok(searchVariants("Night Light").includes("NITE LIGHT"));
  assert.ok(searchVariants("Night Light").includes("NIGHT LITE"));
});

test("empty input gives no variants", () => {
  assert.deepEqual(searchVariants("  "), []);
});
