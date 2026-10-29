---
name: fto-analysis
description: Run a freedom-to-operate analysis for a described technology. Searches for relevant patents, maps claims, assesses infringement risk, and drafts a structured FTO analysis for attorney review.
arguments:
  - name: technology
    description: Description of the technology, product, or feature to clear
    required: true
---

# /fto-analysis

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

2. **Patent search** (if the USPTO tools, or the experimental WIPO tools, are available):
   - Search for patents with claims potentially reading on the technology
   - Prioritize unexpired, maintained patents from active entities
   - Cast a broad initial net, then narrow to the most relevant claims
   - The USPTO tools return bibliographic data, not claim text. Ask the user to paste the claims of the patents of concern, and map only claim text the user provides
   - If the tools are unavailable, ask the user for the specific patent numbers and claims of concern

3. **Run the fto-memo skill** with:
   - The technology description
   - The identified relevant patents and claims
   - Any transaction history returned by `get_patent_details`

4. **Apply playbook thresholds** from ip-playbook.md for risk rating

5. **Output the structured FTO memo** per the fto-memo skill format

## Output

A draft FTO analysis for attorney review, including:
- Executive summary with overall risk rating (HIGH/MEDIUM/LOW)
- Technology description
- Relevant patents table
- Claim-by-claim analysis with element mapping
- Non-infringement arguments with strength ratings
- Design-around options for HIGH/MEDIUM risk claims
- Recommendations and next steps
- Standard limitations and the DRAFT FOR ATTORNEY REVIEW label (no privilege or work-product labels)

## Example Usage

```
/fto-analysis Our product uses a transformer-based model to extract structured data from unstructured medical records. Key features: fine-tuned on clinical text, outputs FHIR-compliant JSON, runs on-device for HIPAA compliance.
```
