---
name: history
description: Search and browse the local matter history. Markman skills ask Claude to log each completed patent analysis, trademark screen, FTO analysis, and matter intake. Use this to find past work, check if a patent was previously analyzed, or review prior analysis results.
---

# /history

Search and browse persistent matter history.

## Usage

```
/history                      # Show recent analyses (last 10)
/history [search term]        # Search by keyword across all past analyses
/history patent               # Filter to patent analyses only
/history trademark            # Filter to trademark analyses only
/history fto                  # Filter to FTO analyses only
```

## Behavior

Call the `search_history` tool from the markman-store MCP server with the provided query and optional type filter.

Present results in a formatted list:

```
MATTER HISTORY
==============

[2026-04-30] Patent Analysis: US X,XXX,XXX Claim Review
  Risk: MEDIUM | 6 claims parsed, 2 Alice flags
  
[2026-04-28] Trademark Clearance: NEXAFLOW
  Risk: MEDIUM | Preliminary conflict risk MEDIUM (US conflict)

[2026-04-25] FTO Memo: Transformer Medical NER
  Risk: LOW | 2 patents reviewed, possible non-infringement positions

Found 3 results.
```

## Important

- Each skill asks Claude to call `log_matter` after completing an analysis
- History is stored locally in ~/.markman/data/history.json
- Maximum 500 entries retained (oldest pruned automatically)
- When a user asks "did we ever look at this patent before?" or "have we analyzed this mark?", use search_history to check
