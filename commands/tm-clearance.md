---
name: tm-clearance
description: Draft a preliminary trademark clearance screen for attorney review. Links to USPTO Trademark Search for the knockout search, analyzes likelihood of confusion against marks found, and identifies jurisdiction coverage gaps.
arguments:
  - name: mark
    description: The proposed mark (word, phrase, or description of design mark)
    required: true
  - name: goods_services
    description: Description of the goods and/or services
    required: true
  - name: jurisdictions
    description: Target jurisdictions (defaults to US, EU, UK, CA per playbook)
    required: false
---

# /tm-clearance

Run a preliminary trademark clearance screen.

## Input

The user provides:
- **Mark**: The proposed word mark, phrase, or description of a design mark
- **Goods/Services**: Description of the goods and/or services the mark will cover
- **Jurisdictions** (optional): Target jurisdictions. If not specified, defaults to US, EU, UK, CA per the ip-playbook.md standard for tech clients.

## Workflow

1. **Mark characterization**: Classify the mark type and assess distinctiveness on the spectrum (generic through fanciful)

2. **Nice Classification**: Determine the appropriate International Class(es) for the stated goods/services

3. **USPTO search**:
   - USPTO offers no API for trademark search by text. `search_trademarks` returns no results; it points to USPTO Trademark Search (tmsearch.uspto.gov)
   - Ask the user to search the mark and its phonetic variants and common misspellings there, and paste the marks they find
   - For a specific serial number, `check_trademark_status(serial_number)` may return its status from TSDR (TSDR was not responding reliably as of October 2026)
   - Do not present conflicts from general knowledge as search results; base the conflict analysis only on marks the user provides

4. **Run the trademark-screen skill** with:
   - The proposed mark and its characterization
   - Goods/services and Nice Classification
   - Marks the user found and pasted from USPTO Trademark Search
   - Target jurisdictions

5. **Apply playbook standards** from ip-playbook.md for preliminary conflict risk ratings and jurisdiction requirements

6. **Output the structured clearance screen** per the trademark-screen skill format

## Output

A draft trademark clearance screen for attorney review, including:
- Mark assessment (type, distinctiveness, registrability concerns)
- Identical marks table
- Similar marks table with similarity scores
- Likelihood of confusion analysis using the relevant DuPont factors for each conflict
- Jurisdiction coverage map
- Preliminary conflict risk (LOW / MEDIUM / HIGH)
- Recommended next steps
- Standard limitations

## Example Usage

```
/tm-clearance NEXAFLOW | AI-powered workflow automation software | US, EU, UK, CA, AU
/tm-clearance BRIGHTPATH | Educational consulting services
/tm-clearance VOXIS | Voice-controlled smart home devices | US
```
