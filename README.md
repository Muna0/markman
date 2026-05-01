# IP Law Plugin for Claude Cowork

An IP law practice plugin for Claude Cowork (also compatible with Claude Code). Provides patent analysis, freedom-to-operate memo drafting, trademark clearance screening, and matter intake triage, with live data from USPTO and WIPO APIs.

**Disclaimer:** This plugin assists with IP workflows but does not provide legal advice. All AI-generated analysis must be reviewed by licensed attorneys before reliance.

## What's Included

**Skills** (fire automatically when relevant):
- `patent-analysis` — Compare patent claims, identify independent vs. dependent claims, flag scope issues and prior art red flags
- `fto-memo` — Structure a freedom-to-operate analysis with claim mapping, non-infringement arguments, design-around options, and risk rating
- `trademark-screen` — Conduct preliminary trademark clearance with identical/similar mark searches, DuPont factor analysis, and jurisdiction gap assessment
- `ip-triage` — Intake a new IP matter, classify it, extract key facts, identify deadlines, and assign risk level

**Slash Commands** (invoke explicitly):
- `/ip:review-claims` — Analyze a patent by number or pasted claims
- `/ip:fto-analysis` — Run an FTO analysis for a described technology
- `/ip:tm-clearance` — Screen a proposed mark for clearance

**MCP Connectors** (live API access):
- `uspto` — USPTO Open Data Portal (patent search, patent details, trademark search, trademark status)
- `wipo` — WIPO CASE / PATENTSCOPE (international patent search, PCT application details)

**Playbook** (customizable practice standards):
- FTO risk thresholds (HIGH/MEDIUM/LOW)
- Trademark clearance jurisdiction requirements
- Patent claim drafting preferences
- Deadline rules for patents and trademarks

## Installation

### Prerequisites

- Node.js 18 or later
- Claude Desktop app with Cowork enabled (Pro, Max, Team, or Enterprise plan)
- API keys for USPTO and WIPO (see below)

### Step 1: Install the Plugin

**From Cowork:**
Upload the plugin folder through the Cowork plugin installer, or use Plugin Create to import it.

**From Claude Code:**
```bash
# Clone or copy the plugin to your local machine
cd ip-law-plugin

# Install MCP server dependencies
npm install

# Install the plugin in Claude Code
claude plugin install ./
```

### Step 2: Get API Keys

**USPTO Open Data Portal:**
1. Go to https://data.uspto.gov/apis/getting-started
2. Create an account and request an API key
3. Set the environment variable: `USPTO_API_KEY=your_key_here`

**WIPO CASE:**
1. Go to https://www.wipo.int/case/en/
2. Apply for API access
3. Set the environment variable: `WIPO_API_KEY=your_key_here`

### Step 3: Register MCP Servers with Claude Desktop

Add the following to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "uspto": {
      "command": "node",
      "args": ["/absolute/path/to/ip-law-plugin/mcp/uspto-server.js"],
      "env": {
        "USPTO_API_KEY": "your_uspto_api_key"
      }
    },
    "wipo": {
      "command": "node",
      "args": ["/absolute/path/to/ip-law-plugin/mcp/wipo-server.js"],
      "env": {
        "WIPO_API_KEY": "your_wipo_api_key"
      }
    }
  }
}
```

Replace `/absolute/path/to/` with the actual path to the plugin directory.

### Step 4: Restart Claude Desktop

Restart the Claude Desktop app. The MCP servers will start automatically. You should see the tools icon in Cowork indicating the USPTO and WIPO connectors are active.

## Customization

### Playbook

Edit `playbooks/ip-playbook.md` to match your firm's practices:
- Adjust FTO risk thresholds
- Change jurisdiction requirements for trademark clearance
- Modify claim drafting preferences
- Add or adjust deadline rules

### Skills

Edit the files in `skills/` to adjust analysis workflows, output formats, or add firm-specific instructions.

### Local Overrides

Create a `ip-law.local.md` file in your Cowork shared folder (or `.claude/` directory for Claude Code) to add organization-specific context such as client lists, standard clauses, or internal terminology that should not be committed to the plugin itself.

## Plugin Structure

```
ip-law-plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── .mcp.json                # MCP server configuration
├── skills/
│   ├── patent-analysis.md   # Patent claim analysis skill
│   ├── fto-memo.md          # Freedom-to-operate memo skill
│   ├── trademark-screen.md  # Trademark clearance skill
│   └── ip-triage.md         # IP matter triage skill
├── commands/
│   ├── review-claims.md     # /ip:review-claims command
│   ├── fto-analysis.md      # /ip:fto-analysis command
│   └── tm-clearance.md      # /ip:tm-clearance command
├── mcp/
│   ├── uspto-server.js      # USPTO Open Data Portal MCP server
│   └── wipo-server.js       # WIPO CASE API MCP server
├── playbooks/
│   └── ip-playbook.md       # Practice standards and thresholds
├── package.json             # Node.js dependencies
└── README.md                # This file
```

## License

Apache-2.0
