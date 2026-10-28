import { test } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "./helpers.js";

test("variables already in the environment win over .env", async () => {
  const s = await startServer({ ANTHROPIC_API_KEY: "" });
  const status = await (await fetch(`${s.url}/api/status`)).json();
  s.stop();
  assert.equal(status.claude, "missing");
});
