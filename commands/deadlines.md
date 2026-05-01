---
name: deadlines
description: View, add, and manage tracked IP deadlines. Shows upcoming deadlines sorted by urgency with days remaining. Use this to check what is due soon, add new deadlines from a triage or analysis, or remove completed items.
---

# /deadlines

Manage tracked IP deadlines across all matters.

## Usage

```
/deadlines                    — List all upcoming deadlines
/deadlines add [matter] [deadline] [date]  — Add a new deadline
/deadlines remove [id]        — Remove a deadline
```

## Behavior

When invoked without arguments, call the `list_deadlines` tool from the markman-store MCP server and present results in a formatted table:

```
UPCOMING DEADLINES
==================

| Status   | Days | Matter                    | Deadline                      | Date       |
|----------|------|---------------------------|-------------------------------|------------|
| URGENT   | 5    | ML Patent Application     | Provisional filing deadline   | 2026-05-06 |
| UPCOMING | 22   | NexaFlow TM               | Opposition period response    | 2026-05-23 |
| OK       | 145  | Data Pipeline Patent      | PCT national phase entry      | 2026-09-22 |
```

When invoked with "add", call the `add_deadline` tool with the provided matter name, deadline description, and date.

When invoked with "remove", call the `remove_deadline` tool with the provided ID.

## Important

- After any triage or analysis that identifies deadlines, proactively ask if the user wants to track them
- Deadlines with less than 7 days remaining are URGENT
- Deadlines with less than 30 days are UPCOMING
- Flag any OVERDUE deadlines prominently at the top
- All data persists locally in markman-data/deadlines.json
