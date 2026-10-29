// Memo titles and title cleanup shared by the web export and the plugin's export_memo tool.

const TITLES = [
  [/fto|freedom/i, "Freedom-to-Operate Analysis (Draft)"],
  [/trademark/i, "Trademark Clearance Screen (Draft)"],
  [/intake|triage/i, "IP Matter Intake Summary (Draft)"],
  [/patent/i, "Patent Analysis (Draft)"],
];

// Title for a memo type. Unknown types ("general") keep the caller's title when given.
export function memoTitle(memoType, fallback) {
  const type = String(memoType || "");
  for (const [re, title] of TITLES) if (re.test(type)) return title;
  return fallback || "Patent Analysis (Draft)";
}

const TITLE_WORDS = /freedom.to.operate|fto|patent analysis|trademark|clearance|triage|intake|memorandum|ip matter/i;

// Drops a leading memo-title heading from model output, since the export adds its own title.
// Only a first-line heading (ATX "# ...", setext "...\n===", or an ALL CAPS line) naming the
// memo type is dropped; anything else is left alone.
export function stripLeadingTitle(markdown) {
  const text = String(markdown || "");
  const m = /^\s*(?:#{1,2}[ \t]+([^\n]+)|([^\n]+)\n[ \t]*(?:=+|-+)[ \t]*(?=\n|$)|\*{0,2}([A-Z0-9 \-:&()]+)\*{0,2})[ \t]*(?:\n|$)/.exec(text);
  if (!m) return text;
  const heading = (m[1] || m[2] || m[3] || "").trim();
  if (!TITLE_WORDS.test(heading)) return text;
  if (m[3] && heading !== heading.toUpperCase()) return text;
  return text.slice(m[0].length).replace(/^\s*\n/, "");
}

export const FOOTER_DISCLAIMER = "Draft for attorney review. Not legal advice. Prepared with Markman; verify all citations and conclusions.";

// Page footer on every page: a fixed short disclaimer and the page number, so an export
// never depends on the draft text for its disclaimer.
export function memoFooter(docx) {
  const { Footer, Paragraph, TextRun, AlignmentType, PageNumber } = docx;
  const run = (opts) => new TextRun({ size: 14, font: "Times New Roman", color: "888888", ...opts });
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        run({ text: `${FOOTER_DISCLAIMER}  |  Page ` }),
        run({ children: [PageNumber.CURRENT] }),
        run({ text: " of " }),
        run({ children: [PageNumber.TOTAL_PAGES] }),
      ],
    })],
  });
}
