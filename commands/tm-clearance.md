---
name: tm-clearance
description: Run a trademark clearance screen for a proposed mark. Searches identical and similar marks, analyzes likelihood of confusion, and identifies jurisdiction coverage gaps.
command: /ip:tm-clearance
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

# /ip:tm-clearance

Run a preliminary trademark clearance screen.

## Input

The user provides:
- **Mark**: The proposed word mark, phrase, or description of a design mark
- **Goods/Services**: Description of the goods and/or services the mark will cover
- **Jurisdictions** (optional): Target jurisdictions. If not specified, defaults to US, EU, UK, CA per the ip-playbook.md standard for tech clients.

## Workflow

1. **Mark characterization**: Classify the mark type and assess distinctiveness on the spectrum (generic through fanciful)

2. **Nice Classification**: Determine the appropriate International Class(es) for the stated goods/services

3. **USPTO search** (if connector is available):
   - Search for identical marks: `search_trademarks(mark_text, class)`
   - Search for phonetic variants and common misspellings
   - For each hit, retrieve status: `check_trademark_status(serial_number)`
   - If connector is unavailable, note that results are based on general knowledge and recommend a formal TESS search

4. **Run the trademark-screen skill** with:
   - The proposed mark and its characterization
   - Goods/services and Nice Classification
   - Search results from USPTO (if available)
   - Target jurisdictions

5. **Apply playbook standards** from ip-playbook.md for clearance thresholds and jurisdiction requirements

6. **Output the structured clearance screen** per the trademark-screen skill format

## Output

A complete trademark clearance screen including:
- Mark assessment (type, distinctiveness, registrability concerns)
- Identical marks table
- Similar marks table with similarity scores
- Likelihood of confusion analysis (DuPont factors) for each conflict
- Jurisdiction coverage map
- Overall clearance recommendation (CLEAR / CLEAR WITH RISK / DO NOT USE)
- Recommended next steps
- Standard limitations

## Example Usage

```
/ip:tm-clearance NEXAFLOW | AI-powered workflow automation software | US, EU, UK, CA, AU
/ip:tm-clearance BRIGHTPATH | Educational consulting services
/ip:tm-clearance VOXIS | Voice-controlled smart home devices | US
```
