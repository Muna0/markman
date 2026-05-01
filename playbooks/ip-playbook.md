---
name: ip-playbook
description: Firm-specific IP practice standards, risk thresholds, deadline rules, drafting preferences, and clearance requirements. Customize this file to match your organization's practices.
---

# IP Practice Playbook

This playbook defines the default standards, thresholds, and preferences for IP work. Customize each section to match your firm's or organization's specific practices.

## FTO Risk Thresholds

**HIGH RISK**
- One or more unexpired patent claims read directly on the technology with no strong non-infringement argument
- Literal infringement on all claim limitations, or equivalents infringement with weak prosecution history estoppel arguments
- Patent holder is an active litigator or known to enforce aggressively
- Action required: Do not proceed without a license, design-around, or invalidity opinion. Escalate to senior counsel.

**MEDIUM RISK**
- Reasonable non-infringement arguments exist, but claim construction is uncertain
- Some claim limitations may read on the technology under certain constructions
- Doctrine of equivalents arguments are plausible but not conclusive
- Action required: Implement design-around if feasible. Monitor the patent (prosecution, litigation, assignment). Reassess if claim construction is resolved in a related proceeding.

**LOW RISK**
- Strong non-infringement arguments on at least one claim limitation
- Viable design-around is already incorporated in the product design
- Patent is near expiration, or maintenance fees have lapsed
- Prior art identified that may invalidate relevant claims
- Action required: Document the analysis. Proceed with standard monitoring.

## Trademark Clearance Standards

**Minimum Jurisdiction Coverage (Tech Clients)**
Require clearance in: United States, European Union, United Kingdom, Canada

**Extended Coverage (when applicable)**
Add: Australia, Japan, South Korea, India, Brazil, Mexico

**Clearance Recommendation Thresholds**
- **CLEAR**: No identical marks in same/related classes across target jurisdictions. No similar marks scoring above LOW on likelihood of confusion.
- **CLEAR WITH RISK**: No identical marks, but one or more similar marks scoring MEDIUM on likelihood of confusion. Coexistence may be possible. Document risk and obtain client sign-off.
- **DO NOT USE**: Identical mark in same/related class in any target jurisdiction, OR similar mark scoring HIGH on likelihood of confusion in a primary market (US or EU).

**Search Scope**
- Federal (USPTO TESS) and state registrations
- Common law use (preliminary web search; note as limitation)
- Domain name availability (.com, primary ccTLDs for target markets)
- Social media handle availability (note but do not treat as blocking)

## Patent Claim Drafting Preferences

**Claim Structure**
- Independent claims first, followed by dependent claims in logical grouping
- At least one independent method claim and one independent system/apparatus claim for software inventions
- Broadest reasonable scope for independent claims; dependent claims add specificity in layers

**Language Guidelines**
- Avoid means-plus-function language unless strategically necessary (and if used, ensure specification includes clear corresponding structure)
- Use "configured to" or "operable to" rather than "adapted to" (less ambiguity)
- Use "comprising" (open-ended) as default transitional phrase; reserve "consisting of" and "consisting essentially of" for specific strategic needs
- Define key terms in the specification to anchor claim construction
- Avoid negative limitations where possible
- For software claims: recite concrete technical steps, avoid purely functional claiming at the point of novelty (Alice risk)

**Specification Preferences**
- Include multiple embodiments to support claim breadth
- Describe alternatives for each key element to preserve design-around space for continuation practice
- Include performance metrics and test results where available to support non-obviousness

## Deadline Rules

**Patent Deadlines**

| Deadline | Timeframe | Notes |
|----------|-----------|-------|
| Provisional to non-provisional (U.S.) | 12 months from provisional filing | No extensions available |
| PCT filing from priority | 12 months from earliest priority date | Paris Convention priority |
| PCT national phase entry | 30 months from earliest priority date | 31 months in some jurisdictions (e.g., EP via Euro-PCT) |
| USPTO non-final OA response | 3 months (extendable to 6 months) | Extension fees increase monthly |
| USPTO final OA response | 3 months (extendable to 6 months) | Consider RCE, appeal, or After Final |
| Notice of Allowance issue fee | 3 months | No extension available |
| Maintenance fees (U.S.) | 3.5, 7.5, 11.5 years from grant | 6-month grace period with surcharge |
| Foreign filing license | Before filing abroad | 35 U.S.C. § 184 |

**Trademark Deadlines**

| Deadline | Timeframe | Notes |
|----------|-----------|-------|
| Statement of Use (after NOA) | 6 months from NOA | Up to 5 extensions (6 months each) |
| Section 8 Declaration | Years 5-6 after registration | File within 1-year window |
| Section 15 (Incontestability) | After 5 years continuous use | File with Section 8 |
| Section 8/9 Renewal | Years 9-10 after registration | Combined filing; 10-year renewal cycle thereafter |
| Madrid Protocol renewal | 10 years from international registration | Managed through WIPO |
| Opposition period (U.S.) | 30 days after publication | Extendable |

**General Deadline Management**
- Set internal reminders at: 90 days, 60 days, 30 days, and 7 days before each deadline
- Flag any deadline within 30 days as URGENT in triage
- Flag any deadline within 60 days as UPCOMING in triage
- For deadlines with grace periods, always target the primary deadline, not the grace period

## General Practice Standards

**Privilege and Confidentiality**
- Mark all FTO memos and infringement analyses as "Attorney Work Product / Privileged and Confidential"
- Do not include client-identifying information in skill outputs unless explicitly provided
- Recommend anonymization for any analysis that may be shared outside privilege

**Quality Standards**
- All analyses should cite specific claim numbers, statutory provisions, and case law where applicable
- Use Bluebook citation format for formal deliverables
- Informal analysis may use information cite format
- Always include a limitations section noting the scope and boundaries of the analysis
- Recommend professional review by licensed counsel before reliance

**AI-Specific Disclaimers**
- Note that AI-assisted analysis does not constitute legal advice
- Flag any patent numbers, case citations, or statutory references for verification
- Do not represent AI-generated claim constructions as authoritative
