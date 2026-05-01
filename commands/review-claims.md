---
name: review-claims
description: Analyze patent claims from a patent number or pasted text. Identifies independent vs dependent claims, maps scope, flags prior art risks, and checks for Alice/Mayo and KSR issues.
command: /ip:review-claims
arguments:
  - name: input
    description: A patent number (e.g., US11,234,567), application number, or pasted claim text
    required: true
---

# /ip:review-claims

Review and analyze patent claims.

## Input

The user provides one of:
- A U.S. patent number (e.g., US11,234,567 or 11234567)
- A U.S. application number (e.g., 17/123,456)
- Pasted claim text from a patent document
- A PCT application number (e.g., PCT/US2024/012345)

## Workflow

1. **If a patent or application number is provided:**
   - Use the USPTO connector (search_patents or get_patent_details) to retrieve the claims
   - If a PCT number, use the WIPO connector (get_pct_application)
   - If neither connector is available, ask the user to paste the claims directly

2. **Run the patent-analysis skill** on the retrieved or provided claims

3. **If the USPTO connector is available**, also pull:
   - Prosecution history (office actions, responses, amendments)
   - Cited prior art references
   - Current maintenance fee status

4. **Present the analysis** using the output format from the patent-analysis skill

## Output

The structured patent analysis from the patent-analysis skill, including:
- Claim map (independent/dependent, type, dependencies)
- Scope assessment for each independent claim
- Prior art red flags (KSR, Alice/Mayo, § 112 issues)
- Recommendations

If comparing multiple patents, include the comparison table.

## Example Usage

```
/ip:review-claims US11,234,567
/ip:review-claims 17/123,456
/ip:review-claims [pasted claim text]
```
