# Markman

**Try it in your browser:** [markman-ip.fly.dev](https://markman-ip.fly.dev) (free public demo, 3 analyses per day; no account needed).

A free, open-source Claude Code plugin for intellectual property law, built for solo practitioners and boutique firms. Patent claim analysis, freedom-to-operate memos, trademark clearance, matter intake, deadline tracking, matter history, and Word export, connected to live USPTO patent data.

Commercial IP platforms such as PatSnap and Derwent cost $15,000 to $100,000 a year. Markman is free under the Apache-2.0 license.

**Markman does not provide legal advice.** All AI-generated analysis must be reviewed by a licensed attorney before reliance.

![Markman landing page](docs/images/01-landing.jpeg)

![Dashboard](docs/images/02-dashboard.jpeg)

![Patent analysis](docs/images/03-patent-analysis.jpeg)

![Trademark clearance](docs/images/04-trademark.jpeg)

## What it does

Markman teaches Claude Code how to do structured IP work. You describe what you need in natural language. Claude reads the skill definitions, calls the USPTO and WIPO APIs through MCP servers, references your firm's playbook for risk thresholds and standards, and produces formatted legal analysis output.

```
You: Analyze the claims in US11,234,567

Claude: [reads patent-analysis skill]
        [calls get_patent_details via USPTO MCP server]
        [references playbook for claim drafting preferences]
        [outputs structured claim map, scope assessment, prior art flags]
```

## Quick start

Requires [Claude Code](https://claude.com/claude-code) and Node.js 18 or later.

In Claude Code, run:

```
/plugin install markman --marketplace Muna0/markman
```

That's it. The skills and commands work right away on patents and marks you paste in. To add live USPTO lookups, set up a free API key (below) and restart Claude Code.

## Components

**Skills** (fire automatically):
- `patent-analysis`: parse claims, map scope, flag Alice and KSR issues
- `fto-memo`: element-by-element claim mapping, non-infringement arguments, design-arounds
- `trademark-screen`: likelihood-of-confusion (DuPont) analysis, phonetic variants, jurisdiction coverage
- `ip-triage`: classify IP type, extract facts, identify deadlines, assign risk

**Commands** (invoke explicitly):
- `/review-claims`: analyze a patent by number or pasted claims
- `/fto-analysis`: FTO assessment for a described technology
- `/tm-clearance`: screen a proposed trademark
- `/deadlines`: view, add, and manage tracked IP deadlines
- `/history`: search past analyses
- `/export-memo`: export analysis as a formatted Word document

**MCP servers** (3 servers, 12 tools):
- `uspto`: patent search and full patent file wrapper details (api.uspto.gov), trademark status by serial number
- `wipo`: international patent search, PCT application details
- `markman-store`: deadline tracking, matter history, Word export (stored locally in `~/.markman/data`)

**Playbook** (configurable, `playbooks/ip-playbook.md`):
- FTO risk thresholds (HIGH, MEDIUM, LOW with required actions)
- Trademark clearance jurisdictions and recommendation thresholds
- Patent claim drafting preferences
- Deadline rules with alert intervals (90, 60, 30, 7 days)

## API keys (optional, free)

Markman reads keys from your shell environment. Add them to `~/.zshrc` (or `~/.bashrc`), then restart Claude Code:

```bash
export USPTO_API_KEY="your_key"
export WIPO_API_KEY="your_key"
```

**USPTO**: Sign in at [data.uspto.gov/myodp](https://data.uspto.gov/myodp) with a USPTO.gov account verified through ID.me, then open Manage API Key. Since August 2026, USPTO requires four profile fields (job title, organization type, organization name, intended use) before a key works. New keys can take a couple of minutes to activate.

**WIPO**: Apply for API access at [wipo.int/case/en](https://www.wipo.int/case/en/). Approval may take one to three business days.

**Trademark search**: USPTO offers no API for trademark search by text. Markman points you to [USPTO Trademark Search](https://tmsearch.uspto.gov) for the knockout search and runs the clearance analysis on what you find. Trademark status lookups by serial number depend on USPTO's TSDR service, which was not responding reliably as of October 2026.

Without keys, the servers still start and explain how to add a key. The skills work on text you paste in.

## Usage

Once installed, use Markman by talking to Claude Code naturally or using slash commands:

```
# Natural language (skills fire automatically)
You: We're developing an ML recommendation engine. Need to check
     if it infringes any existing patents.

# Slash commands (explicit invocation)
You: /review-claims US11,234,567
You: /tm-clearance NEXAFLOW | SaaS workflow software | US, EU, UK
You: /fto-analysis Transformer-based medical NER with FHIR output

# Deadline management
You: /deadlines
You: /deadlines add "ML Patent" "Provisional filing" "2026-05-15"

# Search past work
You: /history patent
You: /history NEXAFLOW

# Export to Word
You: /export-memo
```

## Web dashboard (optional)

The repo also includes a web dashboard for patent search, FTO, and trademark clearance. A public demo runs at [markman-ip.fly.dev](https://markman-ip.fly.dev) with `MARKMAN_PUBLIC=1`: 3 analyses per visitor per day, 150 site-wide, and history kept in the visitor's browser. To run it locally:

```bash
git clone https://github.com/Muna0/markman.git
cd markman
npm install && (cd frontend && npm install)
cp .env.example .env   # then add USPTO_API_KEY and ANTHROPIC_API_KEY
npm run dev            # opens on http://localhost:5173
```

## Project structure

```
markman/
├── .claude-plugin/
│   ├── plugin.json               # Plugin manifest
│   └── marketplace.json          # One-step install
├── .mcp.json                     # MCP server configuration
├── mcp/
│   ├── uspto-server.js           # USPTO API (4 tools)
│   ├── wipo-server.js            # WIPO API (2 tools)
│   ├── markman-store.js          # Local store (6 tools)
│   └── dist/                     # Bundled servers (no npm install needed)
├── skills/<name>/SKILL.md        # 4 skills
├── commands/                     # 6 slash commands
├── playbooks/ip-playbook.md      # Firm standards
├── server.js                     # Web dashboard API (optional)
├── lib/                          # Server helpers (rate limiter)
├── test/                         # Server tests
├── Dockerfile                    # Container build for the public demo
├── fly.toml                      # Fly.io configuration
└── frontend/                     # Web dashboard UI (optional)
```

To rebuild the bundled servers after editing `mcp/*.js`, run `npm run build:mcp`.

Run the server tests with `npm test`.

## Customization

Fork the repo and edit `playbooks/ip-playbook.md` to match your firm's standards. The playbook controls risk thresholds, jurisdiction requirements, claim drafting preferences, deadline rules, and output formatting across all skills.

## License

Apache-2.0
