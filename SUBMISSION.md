# Markman — Plugin Marketplace Submission

Use this text when submitting at https://claude.ai/settings/plugins/submit

---

## Plugin Name

markman

## Description (short)

IP law analysis plugin. Patent claim analysis, trademark clearance screening, FTO memos, and matter intake with persistent deadline tracking and Word export. Connected to live USPTO and WIPO APIs.

## Description (long)

Markman is a Claude Code plugin for intellectual property law practitioners. It provides four auto-firing skills (patent-analysis, fto-memo, trademark-screen, matter-intake), six slash commands, and three MCP servers that connect to live USPTO and WIPO data.

The plugin is designed for solo IP practitioners and boutique firms who need structured patent analysis, trademark clearance, and freedom-to-operate assessments without switching to expensive enterprise platforms.

Key capabilities:
- Parse patent claims into dependency trees with scope assessment and Alice/KSR risk flags
- Screen trademarks across multiple jurisdictions with DuPont factor analysis
- Generate privileged FTO memos with element-by-element claim mapping
- Classify and triage incoming IP matters with automated deadline detection
- Track deadlines persistently with urgency alerts (OVERDUE/URGENT/UPCOMING)
- Log all analyses to searchable matter history
- Export analysis as formatted Word documents with privilege markings

All outputs include mandatory disclaimers stating that AI-assisted analysis does not constitute legal advice and must be reviewed by licensed counsel. The plugin does not create attorney-client relationships.

## Author

Muna Omar

## Repository

https://github.com/Muna0/markman

(Note: currently private. Will need to be made public for marketplace review, or provide access to the review team.)

## License

Apache-2.0

## Category

Legal / Professional Services

## Requirements

- Node.js 18+
- USPTO API key (free from data.uspto.gov)
- WIPO API key (free from wipo.int/case)

## Safety Considerations

1. Every skill file contains mandatory disclaimers that appear at the start and end of all outputs
2. FTO memos are automatically marked as "Attorney Work Product / Privileged and Confidential"
3. The plugin never claims to provide legal advice or create attorney-client relationships
4. All outputs recommend independent verification by licensed counsel
5. Patent numbers, case citations, and statutory references are flagged for verification
6. The playbook is user-configurable so firms can set their own risk thresholds

## What makes it different from existing solutions

- Runs inside Claude Code (no separate platform login)
- Skills fire automatically on relevant conversations
- Connected to live government APIs (not a stale database)
- Produces structured legal analysis output (not just search results)
- Fully open source and configurable
- Free to use (APIs are free, plugin is free)
- Existing alternatives (PatSnap, Derwent, IPlytics) cost $15,000-$100,000/year and don't integrate into developer/attorney workflows

## Components

- 4 skills (auto-fire)
- 6 commands (/review-claims, /fto-analysis, /tm-clearance, /deadlines, /history, /export-memo)
- 3 MCP servers (12 tools total)
- 1 configurable playbook
- Persistent local storage for deadlines and history
- Word document export

## Testing

The plugin has been tested with:
- Real USPTO API calls returning 192,521+ patent results
- MCP server initialization and JSON-RPC protocol compliance
- Deadline tracking (add, list, remove with urgency calculation)
- Matter history (log, search, 500-entry retention)
- Word export (9KB .docx with privilege markings and proper formatting)

---

## Before Submitting

Checklist:
- [ ] Get a real demo recorded (screen recording of /review-claims with live data)
- [ ] Run `claude plugin validate .` to confirm structure
- [ ] Decide whether to make repo public or request private review
- [ ] Test full install flow on a clean machine: `git clone` → `npm install` → `claude plugin install ./`
- [ ] Have one real attorney review an output for accuracy and tone
