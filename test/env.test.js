import { test } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "./helpers.js";

test("variables already in the environment win over .env", async () => {
  const s = await startServer({ ANTHROPIC_API_KEY: "" });
  try {
    const status = await (await fetch(`${s.url}/api/status`)).json();
    assert.equal(status.claude, "missing");
  } finally {
    s.stop();
  }
});
