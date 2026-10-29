---
name: review-claims
description: Analyze patent claims from a patent number or pasted text. Identifies independent vs dependent claims, maps scope, flags prior art risks, and checks for Alice/Mayo and KSR issues.
arguments:
  - name: input
    description: A patent number (e.g., US X,XXX,XXX), application number, or pasted claim text
    required: true
---

# /review-claims

Review and analyze patent claims.

## Input

The user provides one of:
- A U.S. patent number (e.g., US X,XXX,XXX)
- A U.S. application number (e.g., 17/123,456)
- Pasted claim text from a patent document
- A PCT application number (e.g., PCT/US2024/012345)

## Workflow

1. **If a patent or application number is provided:**
   - Use `get_patent_details` to retrieve the USPTO record (title, dates, status, parties, classifications, transaction history). Confirm the returned title and number match what the user meant.
   - The USPTO tools do not return claim text. Ask the user to paste the claims, and analyze only claim text the user provides; never reconstruct or guess claim language
   - If a PCT number and the experimental WIPO tools are configured, try `get_pct_application`; otherwise ask the user to paste the claims

2. **Run the patent-analysis skill** on the retrieved or provided claims

3. **If the USPTO record was retrieved**, use its transaction history (which lists office actions, responses, and maintenance fee events by date) for context. It does not include the documents themselves or cited references; recommend reviewing the file wrapper in USPTO Patent Center

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
/review-claims US X,XXX,XXX
/review-claims 17/123,456
/review-claims [pasted claim text]
```
