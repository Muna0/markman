# Security Policy

## Reporting a vulnerability

Please report security issues privately through GitHub Security Advisories:
go to the repository's **Security** tab and choose **Report a vulnerability**
([direct link](https://github.com/Muna0/markman/security/advisories/new)).

Do not open a public issue for a security problem.

Include what you found, the steps to reproduce it, and the affected version or commit. You should get an initial response within a few days, and we will keep you updated as the fix progresses.

## Never include client data

Do not include client information, confidential documents, privileged material, or API keys in a report. Use made-up examples that show the problem instead.

## Scope

- The Claude Code plugin (skills, commands, and MCP servers in `mcp/`)
- The web dashboard and API server (`server.js`, `frontend/`)
- The public demo at https://markman-ip.fly.dev

Rate-limit tuning and third-party services (USPTO, WIPO, Anthropic) are out of scope; report issues in those services to their owners.
