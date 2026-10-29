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
- Patent has expired, or lapsed for nonpayment of maintenance fees (exposure for past damages may remain; see 35 U.S.C. § 286). A lapsed patent may be revived on petition (37 C.F.R. § 1.378), subject to intervening rights (35 U.S.C. § 41(c)); check the maintenance fee record before relying on a lapse
- Action required: Document the analysis. Proceed with standard monitoring.

**Separate considerations (do not by themselves make a patent LOW RISK)**
- Invalidity: prior art that may invalidate relevant claims can reduce practical risk, but issued claims are presumed valid (35 U.S.C. § 282) and invalidity requires a separate validity analysis. The standard is clear and convincing evidence in district court (*Microsoft Corp. v. i4i Ltd. P'ship*, 564 U.S. 91 (2011)); in PTAB inter partes or post-grant review it is a preponderance of the evidence (35 U.S.C. §§ 316(e), 326(e)). Rate infringement risk on the claims as issued and report invalidity arguments separately.
- Remaining term: a patent near expiration affects remedies and timing (for example, the practical value of an injunction or the length of exposure), not whether the product infringes. Note the estimated expiration date and its effect on strategy separately from the infringement risk rating.

## Trademark Clearance Standards

**Minimum Jurisdiction Coverage (Tech Clients)**
Require clearance in: United States, European Union, United Kingdom, Canada

**Extended Coverage (when applicable)**
Add: Australia, Japan, South Korea, India, Brazil, Mexico

**Preliminary Conflict Risk Ratings**
These are preliminary screening ratings for attorney review, not clearance opinions.
- **LOW**: No identical marks found in same/related classes across target jurisdictions, and no similar marks rated above LOW on likelihood of confusion.
- **MEDIUM**: No identical marks found, but one or more similar marks rated MEDIUM on likelihood of confusion. Coexistence may be possible. Document the risk for the reviewing attorney.
- **HIGH**: Identical mark found in a same/related class in any target jurisdiction, OR a similar mark rated HIGH on likelihood of confusion in a primary market (US or EU).

**Jurisdiction Notes**
- United States: trademark rights arise from use. Applications may be filed on a use or intent-to-use basis; some foreign-based filings follow different rules.
- Canada: since June 17, 2019, use of the mark (and a declaration of use) is no longer required before registration. A registration may be vulnerable to cancellation for non-use (section 45 of the Trademarks Act) once three years have passed from registration. Confirm current requirements with Canadian counsel.
- Do not label jurisdictions with one-word regime labels such as "first-to-file" or "first-to-use".
- Rate conflict risk only for marks the user actually provides; never invent conflicting marks.

**Search Scope**
- Federal registrations and applications (USPTO Trademark Search; TESS was retired in 2023) and state registrations
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
| Provisional to non-provisional (U.S.) | 12 months from provisional filing | Not extendable; benefit can be restored up to 2 months later only by petition showing unintentional delay (37 C.F.R. § 1.78(b)) |
| PCT filing from priority | 12 months from earliest priority date | Paris Convention priority |
| PCT national phase entry | 30 months from earliest priority date | 31 months in some jurisdictions (e.g., EP via Euro-PCT) |
| USPTO non-final OA response | Typically a 3-month shortened statutory period | Extendable up to the 6-month statutory maximum with extension fees (37 C.F.R. § 1.136(a)) |
| USPTO final OA response | Typically a 3-month shortened statutory period | Extendable up to the 6-month statutory maximum with fees; consider RCE, appeal, or after-final practice |
| Notice of Allowance issue fee | 3 months from the notice | Statutory; not extendable |
| Maintenance fees (U.S.) | Due 3 to 3.5, 7 to 7.5, and 11 to 11.5 years after grant | 6-month grace period with surcharge |
| Foreign filing license | Before filing abroad an invention made in the U.S. | 35 U.S.C. § 184 |

**Trademark Deadlines**

| Deadline | Timeframe | Notes |
|----------|-----------|-------|
| Statement of Use (after NOA) | 6 months from Notice of Allowance | Up to 5 six-month extensions on request |
| Section 8 Declaration | Between the 5th and 6th year after registration | 6-month grace period with surcharge |
| Section 15 (Incontestability) | After 5 consecutive years of continuous use following registration | Optional; often filed with Section 8 |
| Section 8/9 Renewal | Within the year before each 10-year anniversary of registration | Combined filing; 6-month grace period with surcharge |
| Madrid Protocol renewal | Every 10 years from the international registration date | Filed with WIPO; 6-month grace period with surcharge |
| Opposition period (U.S.) | 30 days after publication in the Official Gazette | Extendable on request |

**General Deadline Management**
- Set internal reminders at: 90 days, 60 days, 30 days, and 7 days before each deadline
- Status labels (the same labels and thresholds /deadlines uses): OVERDUE (date has passed), URGENT (7 days or fewer), UPCOMING (8 to 30 days), APPROACHING (31 to 60 days), OK (more than 60 days)
- For deadlines with grace periods, always target the primary deadline, not the grace period

## General Practice Standards

**Labeling and Confidentiality**
- Label all outputs DRAFT FOR ATTORNEY REVIEW; do not add privilege or work-product labels
- Do not include client-identifying information in skill outputs unless explicitly provided
- Recommend anonymization for any analysis that may be shared outside the client relationship

**Quality Standards**
- All analyses should cite specific claim numbers, statutory provisions, and case law where applicable
- Use Bluebook citation format for formal deliverables
- Informal analysis may use an informal citation format
- Include exactly one limitations section, at the end, noting the scope and boundaries of the analysis
- Recommend professional review by licensed counsel before reliance

**Disclaimers**
- State once, in the opening disclaimer line, that the analysis does not constitute legal advice; do not repeat disclaimers elsewhere
- Flag any patent numbers, case citations, or statutory references for verification
- Do not represent AI-generated claim constructions as authoritative
