---
name: fto-analysis
description: Run a freedom-to-operate analysis for a described technology. Searches for relevant patents, maps claims, assesses infringement risk, and outputs a structured FTO memo.
command: /ip:fto-analysis
arguments:
  - name: technology
    description: Description of the technology, product, or feature to clear
    required: true
---

# /ip:fto-analysis

Generate a freedom-to-operate risk assessment memo.

## Input

The user provides a description of the technology, product, or feature they want to assess for patent infringement risk. The description should include:
- What the technology does (functional description)
- How it works (technical implementation)
- Key differentiating features
- Target market or commercial context (if relevant)

If the description is insufficient to perform element-by-element claim mapping, ask one targeted clarifying question before proceeding.

## Workflow

1. **Technology characterization**: Parse the technology description and identify key functional elements and components

2. **Patent search** (if USPTO/WIPO connectors are available):
   - Search for patents with claims potentially reading on the technology
   - Prioritize unexpired, maintained patents from active entities
   - Cast a broad initial net, then narrow to the most relevant claims
   - If connectors are unavailable, ask the user to provide specific patent numbers of concern

3. **Run the fto-memo skill** with:
   - The technology description
   - The identified relevant patents and claims
   - Any prosecution history available via USPTO connector

4. **Apply playbook thresholds** from ip-playbook.md for risk rating

5. **Output the structured FTO memo** per the fto-memo skill format

## Output

A complete FTO memo including:
- Executive summary with overall risk rating (HIGH/MEDIUM/LOW)
- Technology description
- Relevant patents table
- Claim-by-claim analysis with element mapping
- Non-infringement arguments with strength ratings
- Design-around options for HIGH/MEDIUM risk claims
- Recommendations and next steps
- Standard limitations and privilege markings

## Example Usage

```
/ip:fto-analysis Our product uses a transformer-based model to extract structured data from unstructured medical records. Key features: fine-tuned on clinical text, outputs FHIR-compliant JSON, runs on-device for HIPAA compliance.
```
