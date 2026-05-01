---
name: trademark-screen
description: Conduct trademark clearance screening including identical marks, phonetically similar marks, design class analysis, likelihood of confusion scoring, and jurisdiction coverage gaps. Triggers on trademark search, clearance, brand naming, or mark availability discussions.
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

- If USPTO tools are connected, search for identical registered marks and pending applications in the relevant classes
- Search for identical marks across all specified jurisdictions
- For each hit, document: mark text, registration/serial number, owner, status (live/dead), goods/services, filing date
- Flag any identical marks in the same or related classes as BLOCKING

## Step 3: Phonetically Similar Marks

- Generate phonetic variants of the proposed mark (homophones, common misspellings, sound-alikes)
- Search for each variant in relevant classes
- Apply the sight, sound, and meaning test from the DuPont factors
- Document near-matches with similarity scores

## Step 4: Design Class Analysis

- If the mark includes a design element, identify the relevant USPTO Design Search Codes
- Search for similar design marks in relevant classes
- For word marks, check if existing design marks incorporate similar wording

## Step 5: Likelihood of Confusion Analysis

Apply the DuPont factors (or equivalent multi-jurisdiction framework):

1. Similarity of the marks (sight, sound, meaning, commercial impression)
2. Similarity/relatedness of the goods/services
3. Similarity of trade channels
4. Conditions of purchase (sophisticated vs. impulse buyers)
5. Fame of the prior mark
6. Number and nature of similar marks in use
7. Nature and extent of any actual confusion
8. Length of concurrent use without confusion

Score each identified conflict:
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
   [For each HIGH/MEDIUM conflict: DuPont factor analysis]

6. JURISDICTION COVERAGE
   [Table: Jurisdiction | Status | Key Conflicts | Filing Strategy Notes]

7. OVERALL ASSESSMENT
   Clearance Recommendation: [CLEAR / CLEAR WITH RISK / DO NOT USE]
   [Summary rationale]

8. RECOMMENDED NEXT STEPS
   - [Specific actions: full search, watch service, filing strategy, etc.]

9. LIMITATIONS
   - Preliminary screen only; not a substitute for comprehensive search
   - Does not cover common law/unregistered marks
   - State registrations not included unless separately searched
   - Review by licensed trademark counsel required
```

## Important

- Always caveat that this is a preliminary screen, not a comprehensive search
- Common law marks and state registrations require separate investigation
- If the mark raises descriptiveness issues, note the potential need for a 2(f) acquired distinctiveness showing
- Reference the ip-playbook.md for jurisdiction minimums and clearance standards
