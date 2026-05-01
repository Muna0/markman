---
name: export-memo
description: Export the most recent analysis as a formatted Word document (.docx). Includes privilege markings for FTO memos, Bluebook citation formatting, Times New Roman body text, proper heading hierarchy, and a standard AI-assistance disclaimer. Saves to markman-data/exports/.
---

# /export-memo

Export an analysis as a professional Word document.

## Usage

```
/export-memo                  — Export the last analysis discussed in this conversation
/export-memo [title]          — Export with a custom title
```

## Behavior

1. Identify the most recent analysis from this conversation (patent analysis, FTO memo, trademark clearance, or matter intake).

2. Compile the full analysis content into a structured document:
   - For FTO memos: add "ATTORNEY WORK PRODUCT / PRIVILEGED AND CONFIDENTIAL" header
   - Format all headings as proper Word heading styles
   - Use Times New Roman, 11pt body text
   - Include the date of analysis

3. Call the `export_memo` tool from the markman-store MCP server with:
   - title: the analysis title or user-provided title
   - content: the full formatted analysis text
   - memo_type: "FTO", "patent", "trademark", "triage", or "general"

4. Report the file path where the .docx was saved.

## Output Format

The generated .docx includes:

- **Header**: Privilege marking (FTO memos only)
- **Title**: Document title in 16pt Times New Roman Bold
- **Date**: Analysis date
- **Body**: Full analysis with proper heading hierarchy
  - HEADING 1: Major sections (EXECUTIVE SUMMARY, CLAIM ANALYSIS, etc.)
  - HEADING 2: Subsections
  - Body: 11pt Times New Roman
- **Disclaimer**: Standard AI-assistance disclaimer in italics

## Important

- Always ask the user to review the exported document before relying on it
- The export does not add content — it formats the existing analysis
- Files are saved to markman-data/exports/ with timestamped filenames
- Recommend the user add their firm letterhead and any additional sections
