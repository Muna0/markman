# Markman Redesign and Public Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Markman web app in the Gateway Thirteen look and run it publicly on Fly.io in a capped demo mode.

**Architecture:** One Express process (`server.js`) serves the built React app from `frontend/dist` and the `/api` routes. `MARKMAN_PUBLIC=1` switches on demo behavior: per-visitor and site-wide analysis limits, a cheaper model, no server-side history, no TSDR route. The visual redesign is mostly a token swap: every page already uses the `ink-*` and `blu-*` Tailwind color scales, so redefining those scales in `index.css` repaints the app, then shared components and the landing page get hand restyling.

**Tech Stack:** Node 22, Express 5, React 19, Vite 8, Tailwind v4, react-router-dom 7, lucide-react, node:test, Playwright (MCP), flyctl.

**Spec:** `docs/superpowers/specs/2026-10-28-markman-redesign-launch-design.md`

## Global Constraints

- Colors (light / dark): background #FFFFFF / #0A0F1C; surface #FFFFFF / #111827; text #0B0F19 / #EEF2FA; muted #5B6475 / #A3AEC4; border #E6E8EE / rgba(255,255,255,.08); accent #2F63F0 (hover #2350D4, tint #EAF0FE); navy panels #0C1631 to #15213B.
- Risk colors: high #8C1D18, medium amber, low #1D6B45.
- Font Satoshi 400/500/700 self-hosted; code font `ui-monospace, SFMono-Regular, Menlo, monospace`.
- Buttons 5px radius, cards 12 to 16px, pills 999px; sticky 68px blurred nav.
- Public limits: 3 analyses per visitor per UTC day, 150 per day site-wide. Public model `claude-sonnet-5-5`, `max_tokens` 4096.
- Copy: no em dashes, no mention of AI authorship, no Claude co-author lines in commits, commits use M's GitHub noreply email.
- Secrets are never printed, never committed, never baked into the Docker image.
- Fly app `markman-ip`, region `ord`, shared-cpu-1x, 256 MB, auto stop/start, exactly 1 machine.

## Review Focus

1. A visitor who hits the limit sees a plain message and a link to the free plugin, not a raw error. (Task 2 test + Task 3 UI.)
2. `.env` never reaches the image or overrides Fly secrets: the loader must not overwrite variables already set, and `.dockerignore` excludes `.env`. (Task 1 test, Task 8 check.)
3. A huge pasted query (for example a full patent spec of 300k characters) must be refused in public mode instead of being billed. (Task 2 test.)
4. Deep links such as `/app/patent` loaded directly on the live site must return the app, not a 404. (Task 2 test.)
5. Word export works without the server writing files, in both modes. (Task 2 test.)

---

### Task 1: Server test harness and safe env loading

**Files:**
- Modify: `server.js:31-39` (env loader)
- Modify: `package.json` (add `test` script)
- Create: `test/helpers.js`, `test/env.test.js`

**Interfaces:**
- Produces: `startServer(env) -> Promise<{ url, stop() }>` in `test/helpers.js`, used by Task 2 tests.

- [ ] **Step 1: Write the helper and failing test**

`test/helpers.js`:
```js
import { spawn } from "node:child_process";
import net from "node:net";

function freePort() {
  return new Promise((resolve) => {
    const s = net.createServer().listen(0, () => { const p = s.address().port; s.close(() => resolve(p)); });
  });
}

export async function startServer(env = {}) {
  const port = await freePort();
  const child = spawn(process.execPath, ["server.js"], {
    env: { ...process.env, ANTHROPIC_API_KEY: "", USPTO_API_KEY: "", ...env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    child.stdout.on("data", (d) => { if (String(d).includes("running")) resolve(); });
    child.on("exit", (c) => reject(new Error(`server exited ${c}`)));
  });
  return { url: `http://127.0.0.1:${port}`, stop: () => child.kill() };
}
```

`test/env.test.js`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "./helpers.js";

test("variables already in the environment win over .env", async () => {
  const s = await startServer({ ANTHROPIC_API_KEY: "" });
  const status = await (await fetch(`${s.url}/api/status`)).json();
  s.stop();
  assert.equal(status.claude, "missing");
});
```

- [ ] **Step 2: Run, expect FAIL** (`.env` overwrites the empty value, so status is `configured`)

Run: `npm test`

- [ ] **Step 3: Implement**

`package.json` scripts: `"test": "node --test test/"`.

`server.js` loader:
```js
try {
  const envFile = fs.readFileSync(path.join(__dirname, ".env"), "utf-8");
  envFile.split("\n").forEach((line) => {
    const [key, ...val] = line.split("=");
    const k = key && key.trim();
    if (k && val.length && !(k in process.env)) process.env[k] = val.join("=").trim();
  });
} catch {}
```

- [ ] **Step 4: Run, expect PASS.** `npm test`
- [ ] **Step 5: Commit** `git commit -m "Let real environment variables override .env; add server tests"`

---

### Task 2: Public mode on the server

**Files:**
- Create: `lib/rate-limit.js`
- Modify: `server.js` (config block, middleware, `/api/analyze`, `/api/export`, history/deadlines/TSDR routes, `/api/status`, static serving, `loadSkill`)
- Create: `test/rate-limit.test.js`, `test/public-mode.test.js`

**Interfaces:**
- Produces: `createDailyLimiter({ perKey, total, now = () => Date.now() }) -> { take(key) -> { ok: boolean, reason?: "visitor" | "site" } }`
- Produces API contract: `/api/analyze` returns HTTP 429 `{ error, limit: "visitor" | "site" }` when limited; HTTP 413 `{ error }` when the query is over 20,000 characters in public mode. `/api/status` returns `{ public: boolean, uspto, wipo, claude, model }`. `/api/export` returns the `.docx` bytes directly with `Content-Disposition: attachment; filename="..."`.

- [ ] **Step 1: Failing tests**

`test/rate-limit.test.js`:
```js
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
```

`test/public-mode.test.js`:
```js
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { startServer } from "./helpers.js";

let s;
before(async () => { s = await startServer({ MARKMAN_PUBLIC: "1" }); });
after(() => s.stop());

const analyze = (body) => fetch(`${s.url}/api/analyze`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

test("4th analysis from one visitor is refused with 429", async () => {
  for (let i = 0; i < 3; i++) assert.notEqual((await analyze({ query: "x" })).status, 429);
  const r = await analyze({ query: "x" });
  assert.equal(r.status, 429);
  assert.equal((await r.json()).limit, "visitor");
});

test("oversized query is refused with 413", async () => {
  const r = await analyze({ query: "a".repeat(20001) });
  assert.equal(r.status, 413);
});

test("history, deadlines, and TSDR status are off", async () => {
  assert.equal((await fetch(`${s.url}/api/history`)).status, 404);
  assert.equal((await fetch(`${s.url}/api/deadlines`)).status, 404);
  const tsdr = await fetch(`${s.url}/api/trademarks/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  assert.equal(tsdr.status, 404);
});

test("status reports public mode and the demo model", async () => {
  const st = await (await fetch(`${s.url}/api/status`)).json();
  assert.equal(st.public, true);
  assert.equal(st.model, "claude-sonnet-5-5");
});

test("export streams a docx and writes nothing to disk", async () => {
  const before = fs.existsSync("markman-data/exports") ? fs.readdirSync("markman-data/exports").length : 0;
  const r = await fetch(`${s.url}/api/export`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Test Memo", content: "CLAIM SCOPE\nBody", memoType: "patent" }),
  });
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-disposition"), /attachment; filename="Test_Memo_/);
  const bytes = Buffer.from(await r.arrayBuffer());
  assert.equal(bytes.subarray(0, 2).toString(), "PK");
  const after = fs.existsSync("markman-data/exports") ? fs.readdirSync("markman-data/exports").length : 0;
  assert.equal(after, before);
});

test("deep links serve the app shell when frontend/dist exists", { skip: !fs.existsSync("frontend/dist/index.html") }, async () => {
  const r = await fetch(`${s.url}/app/patent`);
  assert.equal(r.status, 200);
  assert.match(await r.text(), /<div id="root">/);
});

test("security headers are set", async () => {
  const r = await fetch(`${s.url}/api/status`);
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("x-frame-options"), "DENY");
});
```

- [ ] **Step 2: Run, expect FAIL.** `npm test`

- [ ] **Step 3: Implement `lib/rate-limit.js`**

```js
// In-memory daily counters. Reset at UTC midnight. Fine for a single Fly machine.
export function createDailyLimiter({ perKey, total, now = () => Date.now() }) {
  let day = "";
  let counts = new Map();
  let used = 0;
  return {
    take(key) {
      const today = new Date(now()).toISOString().slice(0, 10);
      if (today !== day) { day = today; counts = new Map(); used = 0; }
      if (used >= total) return { ok: false, reason: "site" };
      const n = counts.get(key) || 0;
      if (n >= perKey) return { ok: false, reason: "visitor" };
      counts.set(key, n + 1);
      used++;
      return { ok: true };
    },
  };
}
```

- [ ] **Step 4: Implement server changes**

After the key constants:
```js
const PUBLIC = process.env.MARKMAN_PUBLIC === "1";
const MODEL = process.env.MARKMAN_MODEL || (PUBLIC ? "claude-sonnet-5-5" : "claude-opus-5-5");
const MAX_TOKENS = PUBLIC ? 4096 : 8192;
const MAX_QUERY_CHARS = 20000;
const limiter = createDailyLimiter({ perKey: 3, total: 150 });
const visitorKey = (req) => req.get("fly-client-ip") || req.ip;
```
Import: `import { createDailyLimiter } from "./lib/rate-limit.js";`. Remove the `EXPORT_DIR` constant and its `mkdirSync`.

Middleware (replace `app.use(cors()); app.use(express.json());`):
```js
if (!PUBLIC) app.use(cors());
app.use(express.json({ limit: "200kb" }));
app.use((req, res, next) => {
  res.set({ "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "strict-origin-when-cross-origin" });
  next();
});
const localOnly = (req, res, next) => PUBLIC ? res.status(404).json({ error: "Not available on the public demo." }) : next();
```
Add `localOnly` as the second argument to `/api/trademarks/status`, all three `/api/deadlines` routes, and both `/api/history` routes.

`/api/analyze`, at the top of the handler, before the key check:
```js
const { query, skillType, context } = req.body;
if (!query) return res.status(400).json({ error: "query is required" });
if (PUBLIC) {
  if (String(query).length + String(context || "").length > MAX_QUERY_CHARS)
    return res.status(413).json({ error: `The public demo accepts up to ${MAX_QUERY_CHARS.toLocaleString()} characters. Install the free plugin for longer documents.` });
  const r = limiter.take(visitorKey(req));
  if (!r.ok) return res.status(429).json({
    limit: r.reason,
    error: r.reason === "visitor"
      ? "You've used today's 3 free analyses on the public demo. Install the free Markman plugin to keep going."
      : "The public demo has reached today's limit. Install the free Markman plugin to keep going.",
  });
}
```
Then the existing key check; delete the duplicate destructure below it. Use `model: MODEL, max_tokens: MAX_TOKENS`. Remove the `Access-Control-Allow-Origin` SSE header. Wrap the history-logging block in `if (!PUBLIC) { ... }`.

`loadSkill` map values become `skills/patent-analysis/SKILL.md`, `skills/trademark-screen/SKILL.md`, `skills/fto-memo/SKILL.md`, `skills/ip-triage/SKILL.md` (the old flat paths no longer exist, so the system prompt has been missing the skill).

`/api/export`: replace `fs.writeFileSync(filepath, buffer); res.json(...)` with
```js
res.set({
  "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "Content-Disposition": `attachment; filename="${filename}"`,
});
res.send(buffer);
```
Delete `filepath`, and delete the `/api/export/download/:filename` route.

`/api/status`:
```js
res.json({
  public: PUBLIC, model: MODEL,
  uspto: USPTO_API_KEY ? "configured" : "missing",
  wipo: WIPO_API_KEY ? "configured" : "missing",
  claude: ANTHROPIC_API_KEY ? "configured" : "missing",
});
```

Static app, placed after all `/api` routes and before `app.listen`:
```js
const DIST = path.join(__dirname, "frontend", "dist");
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, maxAge: "1h" }));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(DIST, "index.html"));
  });
}
```
Update the `listen` log to include `Mode: ${PUBLIC ? "public demo" : "local"}` and the model. Update the header comment's endpoint list.

- [ ] **Step 5: Run, expect PASS.** `npm test`
- [ ] **Step 6: Commit** `git commit -m "Add public demo mode: limits, demo model, streamed export, static app"`

---

### Task 3: Frontend data layer for the public site

**Files:**
- Modify: `frontend/src/store/api.js`, `frontend/vite.config.js`
- Create: `frontend/src/store/localHistory.js`
- Modify: `frontend/src/components/ClaudeAnalysis.jsx`, `frontend/src/pages/Dashboard.jsx`, `FtoAnalysis.jsx:158`, `PatentAnalysis.jsx:215`, `TrademarkClearance.jsx:178`

**Interfaces:**
- Consumes: Task 2 API contract.
- Produces: `localHistory.logMatter(type, title, summary, risk, input)`, `localHistory.list() -> Array<{id,type,title,summary,risk,input,timestamp}>` (newest first, max 100), `localHistory.clear()`; `api.exportMemo(...) -> Promise<void>` (triggers a browser download); errors thrown by `api.analyze` carry `.status` and `.limit`.

- [ ] **Step 1: `api.js`**: `const BASE = '/api'`. Remove `listDeadlines`, `addDeadline`, `removeDeadline`, `searchHistory`, `logMatter`, `getTrademarkStatus`. In `analyze`, on `!res.ok`:
```js
const err = await res.json().catch(() => ({}))
const e = new Error(err.error || 'Analysis failed')
e.status = res.status
e.limit = err.limit
throw e
```
`exportMemo`:
```js
exportMemo: async (title, content, memoType) => {
  const res = await fetch(`${BASE}/export`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, memoType }) })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Export failed')
  const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') || '')?.[1] || 'markman-memo.docx'
  const url = URL.createObjectURL(await res.blob())
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  a.click()
  URL.revokeObjectURL(url)
},
```

- [ ] **Step 2: `vite.config.js`** add `server: { proxy: { '/api': 'http://localhost:3001' } }`.

- [ ] **Step 3: `localHistory.js`**
```js
const KEY = 'markman-history'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }

export const localHistory = {
  list: read,
  logMatter(type, title, summary = '', risk = 'UNKNOWN', input = '') {
    const entry = { id: `m-${Date.now()}`, type, title, summary, risk, input, timestamp: new Date().toISOString() }
    localStorage.setItem(KEY, JSON.stringify([entry, ...read()].slice(0, 100)))
  },
  clear: () => localStorage.removeItem(KEY),
}
```
Replace the three `api.logMatter(` calls with `localHistory.logMatter(` and import it.

- [ ] **Step 4: `ClaudeAnalysis.jsx`**: store the caught error object (`setError(err)`), render `error.message`, and when `error.limit` is set add a link `Install the free plugin` to `https://github.com/Muna0/markman#quick-start`. Export: `await api.exportMemo(...)` inside try/catch, delete the `window.open(localhost...)` code. Fix the header comment (no model name).

- [ ] **Step 5: `Dashboard.jsx`**: history from `localHistory.list()`; remove deadlines state and panel; replace the "Configure" settings link with a "Get the plugin" link to the GitHub quick start; when `serverStatus?.public` show "Public demo: 3 free analyses per day. Your history stays in this browser." The clear button calls `localHistory.clear()` and also removes `markman-analyses`.

- [ ] **Step 6: Verify** `cd frontend && npm run build` passes, and `grep -rn "localhost:3001" frontend/src` returns only `vite.config.js`.
- [ ] **Step 7: Commit** `git commit -m "Keep history in the browser, stream exports, show demo limits"`

---

### Task 4: Design tokens and font

**Files:**
- Create: `frontend/public/fonts/satoshi-{400,500,700}.woff2`
- Modify: `frontend/src/index.css`, `frontend/index.html`

- [ ] **Step 1: Extract fonts** from `~/Desktop/gateway-thirteen-website/index.html`:
```bash
python3 - <<'EOF'
import re, base64, pathlib
html = pathlib.Path.home().joinpath("Desktop/gateway-thirteen-website/index.html").read_text()
out = pathlib.Path("frontend/public/fonts"); out.mkdir(parents=True, exist_ok=True)
for w, b64 in re.findall(r'font-weight:(\d+);font-display:swap;src:url\(data:font/woff2;base64,([A-Za-z0-9+/=]+)\)', html):
    (out / f"satoshi-{w}.woff2").write_bytes(base64.b64decode(b64)); print(w)
EOF
```
Expected output: `400`, `500`, `700`. Keep the license note "Satoshi by Indian Type Foundry, via Fontshare (ITF Free Font License)" as a comment in `index.css`.

- [ ] **Step 2: `index.html`**: delete the three Google Fonts `<link>` tags; add `<link rel="preload" href="/fonts/satoshi-500.woff2" as="font" type="font/woff2" crossorigin>`; title `Markman | IP research for the rest of the bar`; meta description "Free, open-source patent search, FTO, and trademark clearance for solo and boutique IP practitioners."

- [ ] **Step 3: `index.css` tokens.** Replace the `@theme` color block with:
```css
--color-ink-950: #0A0F1C; --color-ink-900: #111827; --color-ink-800: #1A2335;
--color-ink-700: #2A3550; --color-ink-600: #3B4660; --color-ink-500: #5B6475;
--color-ink-400: #A3AEC4; --color-ink-300: #C5CCDA; --color-ink-200: #E6E8EE;
--color-ink-100: #F1F3F7; --color-ink-50: #EEF2FA;  --color-ink-25: #F7F8FB;
--color-blu-700: #1C42B0; --color-blu-600: #2350D4; --color-blu-500: #2F63F0;
--color-blu-400: #5A82F4; --color-blu-300: #8AA6F7; --color-blu-200: #B9CBFA;
--color-blu-100: #D9E3FD; --color-blu-50: #EAF0FE;
--color-nav-900: #0C1631; --color-nav-800: #15213B;
--color-red-500: #8C1D18; --color-red-400: #D9534F; --color-red-100: #F8E3E1;
--color-grn-500: #1D6B45; --color-grn-400: #2E9D66; --color-grn-100: #DDF2E6;
--color-amb-500: #B45309; --color-amb-400: #F59E0B; --color-amb-100: #FEF3C7;
--color-vio-500: #4F46E5; --color-vio-400: #818CF8;
--font-sans: "Satoshi", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
```
Add three `@font-face` rules (`font-display: swap`, `src: url(/fonts/satoshi-W.woff2) format("woff2")`). Body: `font-family: var(--font-sans); font-size: 16px; line-height: 1.6; background: #FFFFFF; color: #0B0F19;` and `.dark body { background: #0A0F1C; color: #EEF2FA; }`. Headings, `.serif`, and `.mono` all use `var(--font-sans)` (`.mono` gains `letter-spacing: -0.005em`); `pre, code, kbd, pre.mono, code.mono` use `var(--font-mono)`. Scrollbar color `#C5CCDA`. Update `.glass-light`/`.glass-dark` to `background: rgba(255,255,255,.8)` / `rgba(10,15,28,.75)` with `backdrop-filter: saturate(180%) blur(12px)`. `.btn-shadow` becomes `box-shadow: 0 1px 2px rgba(47,99,240,.25), 0 6px 16px -6px rgba(47,99,240,.45)`.

- [ ] **Step 4: Fix contrast on primary buttons** across `frontend/src`:
```bash
grep -rl "bg-blu-500 text-ink-950" frontend/src | xargs sed -i '' 's/bg-blu-500 text-ink-950/bg-blu-500 text-white/g; s/hover:bg-blu-400/hover:bg-blu-600/g'
grep -rl "rounded-md" frontend/src | xargs sed -i '' 's/rounded-md/rounded-[5px]/g'
```

- [ ] **Step 5: Verify** `npm run build` passes; open `npm run dev` and confirm Satoshi loads (no 404 on `/fonts/*`).
- [ ] **Step 6: Commit** `git commit -m "Adopt Gateway Thirteen tokens and Satoshi font"`

---

### Task 5: App shell (nav, sidebar, logo) and removed pages

**Files:**
- Modify: `frontend/src/components/TopBar.jsx`, `Sidebar.jsx`, `Logo.jsx`, `frontend/src/App.jsx`
- Delete: `frontend/src/pages/{Login,Signup,Files,Settings}.jsx`, `frontend/src/store/AuthContext.jsx`

- [ ] **Step 1: Remove pages.** Delete the files above. In `App.jsx` drop the `Files` and `Settings` imports and routes. `grep -rn "AuthContext\|/app/files\|/app/settings" frontend/src` must return nothing afterward.

- [ ] **Step 2: TopBar**: height 68px, `sticky top-0 z-30`, `glass-light`/`glass-dark`, bottom border `border-ink-200` / `border-white/10`. Left: Home link. Remove the fake search box. Right: Docs link, theme toggle button (Sun/Moon), and a primary `Get the plugin` button (`rounded-[5px] bg-blu-500 text-white btn-shadow hover:bg-blu-600`) linking to `https://github.com/Muna0/markman#quick-start`.

- [ ] **Step 3: Sidebar**: background white / `ink-950`; section labels in Satoshi 12px semibold uppercase `text-ink-500`; active link `bg-blu-50 text-blu-600` / `bg-blu-500/15 text-blu-300`, `rounded-[8px]`; "Manage" section keeps only Documentation; footer shows `v1.2.0 · Free and open source` plus a GitHub link. Move the theme toggle to TopBar (Step 2).

- [ ] **Step 4: Logo**: wordmark text in Satoshi 700, mark fill `#2F63F0`, no copper colors.

- [ ] **Step 5: Verify** build passes; `/app`, `/app/patent`, `/app/docs` render; `/app/settings` redirects to `/`.
- [ ] **Step 6: Commit** `git commit -m "Restyle app shell; remove fake login and server settings pages"`

---

### Task 6: Landing page

**Files:**
- Modify (rewrite): `frontend/src/pages/Landing.jsx`

Structure, top to bottom (Gateway Thirteen layout: max width 1120px, 24px side padding, sections 96px apart):

1. **Nav** (68px, sticky, blurred): wordmark; links `Tools`, `How it works`, `Install` (anchors), `Docs`; theme toggle; primary `Try it free` to `/app`.
2. **Hero**: pill `Free and open source · Apache-2.0`; H1 `IP research for the rest of the bar.` (clamp 40 to 72px, 700, tracking -0.03em); subhead `Patent search, freedom-to-operate memos, and trademark clearance for solo practitioners and boutique firms. Live USPTO data. No subscription.`; buttons `Try it free` (primary, `/app`) and `Install the plugin` (secondary outline, `#install`); note `No account needed. Your work stays in your browser.`
3. **Tools** (`id="tools"`): three cards (radius 14px, border, hover lift): Patent analysis (`/app/patent`, "Search USPTO patents and map claim scope, with Alice and KSR flags."), Freedom to operate (`/app/fto`, "Element-by-element claim mapping, design-arounds, and a risk rating."), Trademark clearance (`/app/trademark`, "DuPont likelihood-of-confusion analysis with phonetic variants."). Fourth smaller link row: Matter intake (`/app/intake`).
4. **How it works** (`id="how"`): three numbered steps: `Describe the matter`, `Markman pulls live USPTO data`, `Review the analysis and export to Word`.
5. **Cost comparison**: navy panel (`bg-gradient-to-br from-nav-900 to-nav-800`, white text, radius 16px): `PatSnap and Derwent run $15,000 to $100,000 a year. Markman is free.`
6. **Install** (`id="install"`): code block `/plugin install markman --marketplace Muna0/markman` with a copy button; line `Works in Claude Code. Add a free USPTO key for live lookups.`; link to GitHub.
7. **Demo note**: `The public demo allows 3 analyses per visitor per day. For unlimited use, install the plugin.`
8. **Footer**: `Markman does not provide legal advice. All analysis must be reviewed by a licensed attorney.`; links Privacy (`/privacy`), GitHub, Docs; `© 2026 Muna Omar`.

Use `useTheme()` for dark classes, as the existing page does. Keep lucide icons. No em dashes in copy.

- [ ] **Step 1: Write the page.**
- [ ] **Step 2: Verify** build passes; anchors scroll; `Try it free` opens `/app`; copy button copies the command.
- [ ] **Step 3: Commit** `git commit -m "Rewrite landing page in the new design"`

---

### Task 7: Page restyles and Privacy copy

**Files:**
- Modify: `frontend/src/pages/{PatentAnalysis,FtoAnalysis,TrademarkClearance,IpTriage,Dashboard,Docs,Privacy}.jsx`

The token swap does most of the work. Per page:

- [ ] **Step 1: Sweep** each page for: page header (H1 28px 700 `tracking-[-0.02em]`, muted subhead), cards (`rounded-[14px] border border-ink-200 bg-white` / `dark:border-white/10 bg-ink-900`), inputs (`rounded-[8px] border-ink-200 focus:ring-2 focus:ring-blu-500/30 focus:border-blu-500`), primary buttons (`rounded-[5px] bg-blu-500 text-white btn-shadow hover:bg-blu-600`), pills (`rounded-full`). Replace leftover `bg-blu-700` hovers with `hover:bg-blu-600`. Risk badges use `red-500`, `amb-500`, `grn-500` tints.
- [ ] **Step 2: Docs**: remove mentions of Settings and Files pages; keep everything else.
- [ ] **Step 3: Privacy**: rewrite "Data Collection" and "Third-Party Services" to: the public demo has no accounts and stores nothing on the server; searches go to the USPTO Open Data Portal; analysis text goes to Anthropic's API to generate the analysis; history stays in this browser's local storage and can be cleared from the Dashboard; the server keeps an in-memory count of analyses per IP address for the daily limit, cleared daily, never written to disk. Date the policy October 28, 2026.
- [ ] **Step 4: Verify** build passes and `grep -rn "—" frontend/src/pages/Landing.jsx frontend/src/pages/Privacy.jsx` is empty.
- [ ] **Step 5: Commit** `git commit -m "Restyle tool pages; update privacy policy for the public demo"`

---

### Task 8: Visual review gate (M approves before deploy)

- [ ] **Step 1:** `cd frontend && npm run build && cd .. && MARKMAN_PUBLIC=1 PORT=3001 node server.js` (background).
- [ ] **Step 2:** With Playwright, screenshot `/`, `/app`, `/app/patent`, `/app/fto`, `/app/trademark`, `/app/intake`, `/app/docs`, `/privacy` at 1440x900 and 390x844, light and dark (`browser_emulate_media` colorScheme plus clearing `ip-law-theme`). Save to `/tmp/markman-shots/`.
- [ ] **Step 3:** Run one real patent search (`wireless charging coil alignment`) and one real analysis on `/app/patent`; confirm streaming, then a Word export opens.
- [ ] **Step 4:** In a second browser context, confirm the Dashboard shows no history from the first.
- [ ] **Step 5:** Show M the key screenshots. Fix what M flags. Do not deploy until M says go.
- [ ] **Step 6:** Run `npm test` again; all pass.

---

### Task 9: Deploy to Fly.io

**Files:**
- Create: `Dockerfile`, `.dockerignore`, `fly.toml`

- [ ] **Step 1: `.dockerignore`**
```
.env
.env.*
!.env.example
node_modules
frontend/node_modules
frontend/dist
markman-data
.git
docs/images
test
```

- [ ] **Step 2: `Dockerfile`**
```dockerfile
FROM node:22-slim AS web
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js ./
COPY lib ./lib
COPY skills ./skills
COPY playbooks ./playbooks
COPY --from=web /app/frontend/dist ./frontend/dist
USER node
EXPOSE 8080
CMD ["node", "server.js"]
```
`server.js` creates `markman-data` at startup; as `USER node` in `/app` that fails. Guard the `mkdirSync` with `if (!PUBLIC)`.

- [ ] **Step 3: `fly.toml`**
```toml
app = "markman-ip"
primary_region = "ord"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0

  [[http_service.checks]]
    method = "GET"
    path = "/api/status"
    interval = "30s"
    timeout = "5s"

[[vm]]
  size = "shared-cpu-1x"
  memory = "256mb"
```

- [ ] **Step 4: Confirm the image has no secrets:** `docker build -t markman-check . && docker run --rm markman-check sh -c 'ls -a /app; test ! -f /app/.env && echo "no .env"'` (skip if Docker is not installed; then rely on `.dockerignore` and the Fly remote builder).

- [ ] **Step 5: Create app and secrets** (keys read from `.env` into variables, never echoed):
```bash
fly apps create markman-ip --org personal
U=$(grep '^USPTO_API_KEY=' .env | cut -d= -f2-); A=$(grep '^ANTHROPIC_API_KEY=' .env | cut -d= -f2-)
fly secrets set --app markman-ip --stage USPTO_API_KEY="$U" ANTHROPIC_API_KEY="$A" MARKMAN_PUBLIC=1 >/dev/null
unset U A
```

- [ ] **Step 6: Deploy and pin to one machine:** `fly deploy --remote-only --ha=false` then `fly scale count 1 --app markman-ip --yes`.

- [ ] **Step 7: Live smoke test** against `https://markman-ip.fly.dev`: `/` loads under 3 seconds when warm; `/app/patent` deep link loads; `/api/status` shows `public: true`, model `claude-sonnet-5-5`; one patent search returns results; one analysis streams; Word export downloads.

- [ ] **Step 8: Commit** `git commit -m "Add Fly.io deployment"`

---

### Task 10: GitHub and README

**Files:**
- Modify: `README.md`; replace `docs/images/01-landing.jpeg`, `02-dashboard.jpeg`, `03-patent-analysis.jpeg`, `04-trademark.jpeg`

- [ ] **Step 1:** Re-shoot the four images from the live site at 1440x900 light mode (JPEG, quality 85), same filenames.
- [ ] **Step 2: README**: under the title add `**Try it in your browser:** [markman-ip.fly.dev](https://markman-ip.fly.dev) (free public demo, 3 analyses per day; no account needed).` Fix the image alt text (`Markman landing page`, `Dashboard`, `Patent analysis`, `Trademark clearance`). In "Web dashboard" mention the public demo and `MARKMAN_PUBLIC=1`. Add `lib/`, `test/`, `Dockerfile`, `fly.toml` to the project structure. Add `npm test` under the rebuild note.
- [ ] **Step 3:** Commit `git commit -m "Link the live demo; refresh screenshots"` and push `git push origin main` (only after M's force-push of the redacted history has landed, so this is a normal fast-forward).

---

## Self-Review Notes

- Spec coverage: visual system (Tasks 4, 5, 7), pages table (5, 6, 7), server public mode (2), localStorage history (3), export streaming (2, 3), request limit and headers (2), TSDR hidden (2), Fly hosting (9), M's actions (spend limit done 2026-10-28; deploy approval is the Task 8 gate), GitHub (10), testing (1, 2, 8, 9).
- Found during planning and fixed in Task 2: `loadSkill` points at old flat skill paths, so web analyses have been running without the skill text.
- Deadlines: the web app has no UI to add deadlines (no `addDeadline` caller exists), so the Dashboard panel is removed rather than moved to localStorage. Deadline tracking stays in the plugin's `/deadlines` command.
- Local default model moves from `claude-opus-4-6` to `claude-opus-5-5`; override with `MARKMAN_MODEL`.
