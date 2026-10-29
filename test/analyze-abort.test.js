import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { startServer } from "./helpers.js";

// A stand-in for the Anthropic Messages API that streams slowly and records
// whether the upstream connection was closed before the stream finished.
const upstream = { closedEarly: 0, finished: 0 };
const sse = (type, data) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`;
const fake = http.createServer((req, res) => {
  req.resume();
  const slow = upstream.mode === "slow";
  res.writeHead(200, { "Content-Type": "text/event-stream" });
  res.write(sse("message_start", { message: { id: "msg_1", type: "message", role: "assistant", model: "m", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } } }));
  res.write(sse("content_block_start", { index: 0, content_block: { type: "text", text: "" } }));
  let n = 0;
  let done = false;
  const total = slow ? 200 : 3;
  const timer = setInterval(() => {
    res.write(sse("content_block_delta", { index: 0, delta: { type: "text_delta", text: `chunk${n} ` } }));
    if (++n >= total) {
      clearInterval(timer);
      res.write(sse("content_block_stop", { index: 0 }));
      res.write(sse("message_delta", { delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 3 } }));
      res.write(sse("message_stop", {}));
      done = true;
      upstream.finished++;
      res.end();
    }
  }, slow ? 50 : 5);
  res.on("close", () => { clearInterval(timer); if (!done) upstream.closedEarly++; });
});

let s;
before(async () => {
  await new Promise((r) => fake.listen(0, "127.0.0.1", r));
  s = await startServer({
    MARKMAN_PUBLIC: "1",
    ANTHROPIC_API_KEY: "test-key",
    ANTHROPIC_BASE_URL: `http://127.0.0.1:${fake.address().port}`,
  });
});
after(() => { s.stop(); fake.close(); });

const analyze = (signal) => fetch(`${s.url}/api/analyze`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "x" }), signal,
});

test("a completed analysis streams text and a done event", async () => {
  upstream.mode = "fast";
  const text = await (await analyze()).text();
  assert.match(text, /chunk0/);
  assert.match(text, /"done":true/);
  assert.match(text, /"stop_reason":"end_turn"/);
});

test("closing the client connection aborts the upstream stream", async () => {
  upstream.mode = "slow";
  const before = upstream.closedEarly;
  const ac = new AbortController();
  const r = await analyze(ac.signal);
  const reader = r.body.getReader();
  await reader.read(); // first chunk arrives
  ac.abort();
  const deadline = Date.now() + 3000;
  while (upstream.closedEarly === before && Date.now() < deadline) await new Promise((r) => setTimeout(r, 50));
  assert.equal(upstream.closedEarly, before + 1, "upstream request was closed before it finished");
});
