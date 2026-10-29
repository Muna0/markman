---
name: export-memo
description: Export the most recent analysis as a Word document (.docx) marked DRAFT FOR ATTORNEY REVIEW, titled by memo type, with Times New Roman body text and heading hierarchy. Keeps the analysis's own disclaimer line and LIMITATIONS section. Does not add privilege or work-product labels. Saves to ~/.markman/data/exports/.
---

# /export-memo

Export an analysis as a Word document marked as a draft for attorney review.

## Usage

```
/export-memo                  # Export the last analysis discussed in this conversation
/export-memo [title]          # Export with a custom title (used for "general" memos)
```

## Behavior

1. Identify the most recent analysis from this conversation (patent analysis, FTO memo, trademark clearance, or matter intake).

2. Compile the full analysis content into a structured document:
   - Do not add privilege, confidentiality, or work-product labels; the export is marked as a draft for attorney review
   - Format all headings as proper Word heading styles
   - Use Times New Roman, 11pt body text
   - Include the date of analysis

3. Call the `export_memo` tool from the markman-store MCP server with:
   - title: the analysis title or user-provided title
   - content: the full formatted analysis text, including its disclaimer line and LIMITATIONS section
   - memo_type: "FTO", "patent", "trademark", "triage", or "general"

4. Report the file path where the .docx was saved.

## Output Format

The generated .docx includes:

- **Header**: DRAFT FOR ATTORNEY REVIEW (all memo types)
- **Title**: By memo type: "Freedom-to-Operate Analysis (Draft)", "Patent Analysis (Draft)", "Trademark Clearance Screen (Draft)", or "IP Matter Intake Summary (Draft)"; the custom title for "general" memos
- **Date**: Analysis date
- **Body**: Full analysis with proper heading hierarchy
  - HEADING 1: Major sections (EXECUTIVE SUMMARY, CLAIM ANALYSIS, etc.)
  - HEADING 2: Subsections
  - Body: 11pt Times New Roman
- **Disclaimer and LIMITATIONS**: The analysis's own disclaimer line and LIMITATIONS section; the export does not add a second one

## Important

- Always ask the user to review the exported document before relying on it
- The export does not change the analysis; it formats the existing content and adds the draft header
- Files are saved to ~/.markman/data/exports/ with timestamped filenames
- Recommend the user add their firm letterhead, any additional sections, and whatever labels their own practice requires
