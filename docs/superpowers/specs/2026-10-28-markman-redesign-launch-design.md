# Markman web redesign and public launch

Date: 2026-10-28
Owner: M (Muna0)

## Goal

Give people from M's LinkedIn post a live Markman site they can try in a browser, with no install. The site uses the Gateway Thirteen visual style and is safe to leave public: it cannot run up an unbounded Claude bill and never shows one visitor's work to another.

Success means: a public URL that loads in under 3 seconds, live USPTO patent search works for anyone, Claude analysis works within the demo limits, and the GitHub repo and README point to the live site.

## Decisions already made

- Visual style: Gateway Thirteen (`~/Desktop/gateway-thirteen-website/index.html`).
- Hosting: Fly.io, one app serving the built frontend and the Express API.
- Cost model: demo mode. USPTO search is free for everyone; Claude analysis is rate limited per visitor, and M sets a hard monthly spend cap in the Anthropic console.
- Privacy: each visitor's history and deadlines stay in their own browser.

## Visual system

Taken from Gateway Thirteen:

- Font: Satoshi (400, 500, 700), self-hosted woff2. Monospace: `ui-monospace, SFMono-Regular, Menlo`.
- Colors (light / dark): background #FFFFFF / #0A0F1C; surface #FFFFFF / #111827; text #0B0F19 / #EEF2FA; muted #5B6475 / #A3AEC4; border #E6E8EE / rgba(255,255,255,.08); accent blue #2F63F0 (hover #2350D4, tint #EAF0FE); navy panels #0C1631 to #15213B.
- Risk colors kept for legal meaning: high #8C1D18, medium amber, low #1D6B45.
- Shapes: buttons 5px radius, cards 12 to 16px, pills 999px. Soft blue shadow on primary buttons only.
- Nav: sticky 68px bar, translucent with blur, bottom border.
- Light and dark mode follow the system setting, with a toggle saved in localStorage.

Implementation: replace the copper tokens in `frontend/src/index.css` with these as Tailwind v4 theme variables, then restyle the shared components (TopBar, Sidebar, Logo, ClaudeAnalysis) and each page. Page logic stays as it is.

## Pages

| Page | Change |
|---|---|
| Landing | Rewritten in the Gateway Thirteen layout: hero ("IP research for the rest of the bar"), three tool cards, how it works, cost comparison, install-the-plugin section, GitHub link, not-legal-advice note. |
| Patent analysis, FTO, Trademark, Intake | Restyled only. |
| Dashboard | Restyled; reads history from the browser. |
| Docs, Privacy | Restyled; Privacy updated for the public demo (what is sent to USPTO and Anthropic, nothing stored on the server). |
| Login, Signup | Removed. They are fake (no real accounts). "Try it" opens the app directly. |
| Files, Settings | Removed from the public site. Settings showed server API keys, which do not belong in a public demo. |

## Server changes (public mode)

Turned on by `MARKMAN_PUBLIC=1`, so local use is unchanged.

- Claude analysis limit: 3 per visitor per day, by IP address, kept in memory, plus a site-wide limit of 150 per day as a backstop. When a limit is hit, the page says so and links to the free plugin.
- Model for the public demo: `claude-sonnet-5-5`, with output capped at 6,000 tokens. That costs roughly a fifth of Opus per analysis. Local use keeps whatever `.env` sets.
- History and deadlines: the `/api/history` and `/api/deadlines` routes are turned off in public mode. The frontend stores them in localStorage.
- Word export: the file is generated and sent straight to the browser, not saved on the server.
- Request size limit and basic security headers.
- Trademark status lookup: hidden in public mode while USPTO's TSDR service is down.

## Hosting

- Fly.io app `markman-ip` (URL `markman-ip.fly.dev`), region ord, shared-cpu-1x with 256 MB of memory. It stops when idle and starts on the next visit, so the first visit after a quiet spell takes a few seconds.
- A Dockerfile builds the frontend, then runs `node server.js`, which serves `frontend/dist` and `/api`.
- Secrets are set with `fly secrets set`: `USPTO_API_KEY`, `ANTHROPIC_API_KEY`, `MARKMAN_PUBLIC=1`.
- Fly account: M's personal Fly.io account.
- Expected Fly cost: under $5 a month at test traffic.

## M's actions

1. Set a monthly spend limit on the Anthropic API key in the Anthropic console.
2. Approve the Fly deploy, which creates a public app.

## GitHub

- Commit the redesign, Dockerfile, and fly.toml.
- Add the live link at the top of the README, and replace the four screenshots with the new design.
- No AI co-author lines; commits use M's GitHub private email.

## Testing

- `vite build` passes, and the server starts locally with `MARKMAN_PUBLIC=1`.
- Screenshot every page in light and dark mode at desktop and phone widths (Playwright), and review them before deploying.
- Check that the 4th analysis from one visitor in a day is refused, and that history does not appear in a second browser.
- After deploying: test the live URL for page loads, a patent search, one Claude analysis, and a Word export.

## Out of scope

- Real user accounts.
- Trademark search results (USPTO offers no API).
- WIPO (no key yet).
- A custom domain (can be added later).
