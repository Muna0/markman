# Contributing to Markman

Thanks for helping improve Markman. It is a free, open-source tool for IP practitioners: a Claude Code plugin plus an optional web dashboard.

## Run it locally

Requires Node.js 22 (18 or later works for the plugin).

```bash
git clone https://github.com/Muna0/markman.git
cd markman
npm install && (cd frontend && npm install)
cp .env.example .env   # add USPTO_API_KEY and ANTHROPIC_API_KEY for the web dashboard
npm run dev            # web dashboard on http://localhost:5173, API on :3001
```

To try the plugin itself, see the Quick start in the [README](README.md).

## Test

```bash
npm test                        # server and library tests (no API keys needed)
(cd frontend && npm run build)  # the frontend must build
npm run build:mcp               # rebuild mcp/dist after changing mcp/ or lib/
claude plugin validate .        # if you changed plugin files
```

Tests stub USPTO and the Anthropic API, so they run offline and never use real keys.

## Pull requests

- Keep each pull request focused on one change, and describe what it fixes and how you tested it.
- Add or update tests for server and library changes. CI runs `npm ci`, `npm test`, and the frontend build on Node 22.
- Rebuild `mcp/dist` when you change anything under `mcp/` or `lib/` that the MCP servers use.
- Keep legal content accurate and cite the statute, rule, or case it relies on. Changes to skills or the playbook should say what source supports them.
- Never commit API keys, `.env` files, or client information.

## No legal advice

Markman produces drafts for attorney review. It does not provide legal advice, and contributions should not present output as legal advice or as a substitute for a licensed attorney's judgment. Do not include real client data in issues, examples, tests, or screenshots.

## License

By contributing, you agree that your contributions are licensed under the [Apache License 2.0](LICENSE).
