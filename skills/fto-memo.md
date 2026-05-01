---
name: fto-memo
description: Structure a freedom-to-operate analysis with technology description, relevant claims, non-infringement arguments, design-around options, and risk rating. Triggers on FTO, freedom to operate, infringement risk, or clearance analysis discussions.
---

# Freedom-to-Operate Memo

You are drafting an FTO analysis memo for patent counsel. When the user describes a technology, product, or feature they want to clear, follow this workflow.

## Step 1: Technology Description

- Summarize the technology or product under analysis
- Identify key functional elements, components, or method steps
- Note the commercial context (product launch, licensing, acquisition due diligence)
- Ask clarifying questions if the technology description is ambiguous on any element that could affect claim mapping

## Step 2: Relevant Patent Identification

- If USPTO tools are connected, search for patents with claims potentially reading on the technology
- Identify the most relevant independent claims from each patent
- For each relevant patent, note: patent number, assignee, expiration date, maintenance fee status
- Prioritize unexpired, maintained patents from active entities

## Step 3: Claim-by-Claim Analysis

For each relevant independent claim:

- Map each claim limitation against the user's technology element-by-element
- Apply the doctrine of equivalents analysis where literal infringement is not met
- Note any prosecution history estoppel that narrows claim scope
- Consider means-plus-function interpretations where applicable
- Document the claim construction positions that favor and disfavor the client

## Step 4: Non-Infringement Arguments

For each claim analyzed:

- Identify missing limitations (elements in the claim not present in the technology)
- Document structural or functional differences
- Note any prosecution history that supports a narrow construction
- Reference relevant claim construction case law where applicable
- Rate argument strength: STRONG / MODERATE / WEAK

## Step 5: Design-Around Options

- For claims presenting HIGH or MEDIUM risk, propose specific design-around alternatives
- For each design-around, assess: technical feasibility, implementation cost (relative), impact on product functionality, whether it introduces new IP risk
- Prioritize design-arounds that eliminate literal infringement on the highest-risk claims

## Step 6: Risk Rating

Apply the thresholds from the ip-playbook.md:

- **HIGH**: One or more claims appear to read directly on the technology with no strong non-infringement argument. Litigation risk is material. Recommend: do not proceed without design-around or license.
- **MEDIUM**: Reasonable non-infringement arguments exist, but claim construction could go either way. Recommend: implement design-around if feasible; monitor prosecution/litigation of the patent.
- **LOW**: Strong non-infringement arguments, or viable design-around is already part of the design. Recommend: document the analysis and proceed.

## Step 7: Output

Structure the memo as follows:

```
FREEDOM-TO-OPERATE ANALYSIS
============================
Date: [date]
Prepared for: [client/matter]
Re: [technology description]
Confidential / Attorney Work Product

1. EXECUTIVE SUMMARY
   Overall Risk Rating: [HIGH / MEDIUM / LOW]
   [2-3 sentence summary of key findings and recommendation]

2. TECHNOLOGY DESCRIPTION
   [Detailed description of the technology under analysis]

3. RELEVANT PATENTS
   [Table: Patent # | Assignee | Expiration | Status | Risk Level]

4. CLAIM ANALYSIS
   [For each patent: claim text, element mapping, infringement analysis]

5. NON-INFRINGEMENT ARGUMENTS
   [For each claim: arguments and strength rating]

6. DESIGN-AROUND OPTIONS
   [For each HIGH/MEDIUM risk claim: alternatives with feasibility]

7. RISK ASSESSMENT AND RECOMMENDATIONS
   [Overall risk, recommended next steps, timeline]

8. LIMITATIONS
   - This analysis is based on currently available information
   - Claim construction may change in litigation
   - New prior art or patent continuations may alter the landscape
   - Does not constitute legal advice; review by licensed counsel required
```

## Important

- Mark all FTO memos as Attorney Work Product / Privileged
- Never provide a definitive "freedom to operate" conclusion; frame as risk assessment
- If the playbook specifies additional jurisdictions, note that this analysis covers U.S. patents only unless international patents are also analyzed
- Reference prosecution history when available via USPTO connector
