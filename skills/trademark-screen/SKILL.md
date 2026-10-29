---
name: trademark-screen
description: Draft a preliminary trademark clearance screen for attorney review, covering identical and phonetically similar marks the user provides, design codes, likelihood of confusion, and jurisdiction coverage gaps. Triggers on trademark search, clearance, brand naming, or mark availability discussions.
---

# Trademark Clearance Screen

You are assisting trademark counsel with a preliminary clearance screen. When the user provides a proposed mark and goods/services description, follow this workflow.

## Step 1: Mark Characterization

- Classify the mark type: word mark, design mark, composite (word + design), sound, color, or other non-traditional
- For word marks, analyze: inherent distinctiveness spectrum (generic, descriptive, suggestive, arbitrary, fanciful)
- Note any descriptiveness concerns that could affect registrability
- Identify the relevant Nice Classification(s) for the goods/services
- If the user has not specified jurisdictions, default to the playbook standard (US, EU, UK, CA minimum for tech clients)

## Step 2: Identical Marks Search

- USPTO offers no API for trademark search by text, so Markman cannot run this search itself. Ask the user to search USPTO Trademark Search (tmsearch.uspto.gov) and the relevant foreign registers for the mark in the relevant classes, and to paste what they find
- Base the conflict analysis only on marks the user provides; do not present marks from general knowledge as search results
- For each mark provided, document: mark text, registration/serial number, owner, status (live/dead), goods/services, filing date
- Flag any identical marks in the same or related classes as BLOCKING

## Step 3: Phonetically Similar Marks

- Generate phonetic variants of the proposed mark (homophones, common misspellings, sound-alikes)
- Ask the user to search each variant in the relevant classes
- Compare appearance, sound, connotation, and commercial impression (the first DuPont factor)
- Document near-matches with similarity scores

## Step 4: Design Class Analysis

- If the mark includes a design element, identify the relevant USPTO Design Search Codes
- Ask the user to search those design codes in USPTO Trademark Search
- For word marks, check if existing design marks incorporate similar wording

## Step 5: Likelihood of Confusion Analysis

For U.S. conflicts, assess the relevant factors from In re E. I. du Pont de Nemours & Co., 476 F.2d 1357, 1361 (C.C.P.A. 1973). There are thirteen; not every factor is relevant in every case, and the USPTO and TTAB weigh the factors for which there is relevant evidence and argument (see TMEP § 1207.01). For other jurisdictions, apply the equivalent local framework.

1. Similarity of the marks in their entireties (appearance, sound, connotation, commercial impression)
2. Similarity and nature of the goods or services
3. Similarity of established, likely-to-continue trade channels
4. Conditions of purchase and buyers (impulse vs. careful, sophisticated purchasing)
5. Fame of the prior mark
6. Number and nature of similar marks in use on similar goods
7. Nature and extent of any actual confusion
8. Length of time and conditions of concurrent use without evidence of actual confusion
9. Variety of goods on which the mark is or is not used (house mark, family mark, product mark)
10. Market interface between the applicant and the owner of the prior mark
11. Extent to which the applicant has a right to exclude others from use of its mark on its goods
12. Extent of potential confusion (de minimis or substantial)
13. Any other established fact probative of the effect of use

State which factors you assessed and why the others were not relevant on the facts provided. Rate each identified conflict:
- **HIGH RISK**: Likely to be refused or challenged; same/similar mark in same/related class with overlapping channels
- **MEDIUM RISK**: Arguable; some DuPont factors favor coexistence, others do not
- **LOW RISK**: Minimal overlap; strong differentiation on multiple factors

## Step 6: Jurisdiction Coverage Gap Analysis

- Compare the user's target markets against clearance results
- Identify jurisdictions where the mark is available vs. potentially blocked
- Note any Madrid Protocol considerations for international filing strategy
- Flag jurisdictions with first-to-file vs. first-to-use implications

## Step 7: Output

```
TRADEMARK CLEARANCE SCREEN
===========================
Date: [date]
Proposed Mark: [mark]
Goods/Services: [description]
Nice Class(es): [class numbers]
Jurisdictions: [list]

1. MARK ASSESSMENT
   Type: [word/design/composite]
   Distinctiveness: [generic through fanciful]
   Registrability Concerns: [if any]

2. IDENTICAL MARKS
   [Table: Mark | Reg/Serial # | Owner | Status | Class | Goods/Services | Risk]

3. SIMILAR MARKS
   [Table: Mark | Similarity Score | Reg/Serial # | Owner | Class | Risk]

4. DESIGN SEARCH RESULTS (if applicable)
   [Results with design codes]

5. LIKELIHOOD OF CONFUSION ANALYSIS
   [For each HIGH/MEDIUM conflict: analysis of the relevant DuPont factors]

6. JURISDICTION COVERAGE
   [Table: Jurisdiction | Status | Key Conflicts | Filing Strategy Notes]

7. OVERALL ASSESSMENT
   Preliminary Conflict Risk: [LOW / MEDIUM / HIGH]
   [Summary rationale]

8. RECOMMENDED NEXT STEPS
   - [Specific actions: full search, watch service, filing strategy, etc.]

9. LIMITATIONS
   - Preliminary screen only, limited to marks the user provided; not a substitute for a comprehensive search
   - Does not cover common law/unregistered marks
   - State registrations not included unless separately searched
   - Review by licensed trademark counsel required
```

## Important

- Always caveat that this is a preliminary screen, not a comprehensive search
- Common law marks and state registrations require separate investigation
- If the mark raises descriptiveness issues, note the potential need for a 2(f) acquired distinctiveness showing
- Reference the playbook (`${CLAUDE_PLUGIN_ROOT}/playbooks/ip-playbook.md`) for jurisdiction minimums and preliminary conflict risk ratings
- If the markman-store tools are available, call `log_matter` after completing the analysis (type, title, short summary, overall risk, original input)

## Required Disclaimers

Every output MUST begin with:
"This AI-assisted trademark screen does not constitute legal advice and is not a comprehensive clearance search. It must be reviewed by a licensed trademark attorney before filing or commercial use."

Every output MUST end with:
"LIMITATIONS: This is a preliminary screen based on available data. It does not cover common law marks, state registrations, pending applications not yet published, domain name conflicts, or social media usage. A comprehensive clearance search conducted by a trademark search firm is recommended before filing. This tool does not create an attorney-client relationship."
