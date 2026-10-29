// Converts Markdown analysis output into docx paragraphs and tables.
// Uses the marked lexer for tokenizing; raw HTML in the input is kept as plain text.
// Single newlines are kept as line breaks, matching the web view.
import { Lexer } from "marked";

const RISK_RE = /(MEDIUM-HIGH RISK|HIGH RISK|MEDIUM RISK|LOW RISK|CRITICAL)/;
const riskColor = (m) => (m.includes("HIGH") || m === "CRITICAL" ? "CC0000" : m.includes("MEDIUM") ? "CC6600" : "336600");

// A single-line paragraph in ALL CAPS with no Markdown is treated as a section heading,
// which keeps plain-text drafts readable.
function isCapsHeading(token) {
  const t = (token.text || "").trim();
  return token.tokens?.length === 1 && token.tokens[0].type === "text" && !t.includes("\n")
    && t.length > 3 && t.length < 80 && t === t.toUpperCase() && /[A-Z]/.test(t);
}

/**
 * @param {string} markdown
 * @param {object} docx - the imported docx module
 * @param {{font?: string, size?: number}} [opts]
 * @returns {Array} Paragraph and Table instances, in document order
 */
export function markdownToDocx(markdown, docx, opts = {}) {
  const { Paragraph, TextRun, ExternalHyperlink, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, AlignmentType } = docx;
  const font = opts.font || "Times New Roman";
  const size = opts.size || 22;
  const MONO = "Courier New";
  const HEADINGS = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3];
  const HEADING_SIZES = [32, 26, 23];
  const border = { style: BorderStyle.SINGLE, size: 4, color: "999999" };

  // fmt: { bold, italics, strike, code, size, link }
  function textRuns(text, fmt = {}) {
    const sz = fmt.size || size;
    return String(text).split(RISK_RE).filter(Boolean).map((part) => {
      if (!fmt.code && RISK_RE.test(part)) {
        return new TextRun({ text: part, font, size: sz, bold: true, italics: fmt.italics, color: riskColor(part) });
      }
      return new TextRun({
        text: part, font: fmt.code ? MONO : font, size: fmt.code ? sz - 2 : sz,
        bold: fmt.bold, italics: fmt.italics, strike: fmt.strike,
        ...(fmt.link ? { color: "0563C1", underline: {} } : {}),
      });
    });
  }

  function inline(tokens = [], fmt = {}) {
    const runs = [];
    for (const t of tokens) {
      switch (t.type) {
        case "strong": runs.push(...inline(t.tokens, { ...fmt, bold: true })); break;
        case "em": runs.push(...inline(t.tokens, { ...fmt, italics: true })); break;
        case "del": runs.push(...inline(t.tokens, { ...fmt, strike: true })); break;
        case "codespan": runs.push(...textRuns(t.text, { ...fmt, code: true })); break;
        case "br": runs.push(new TextRun({ break: 1 })); break;
        case "link": {
          // Keep the URL: a live hyperlink, plus the address in text when it differs,
          // so citations survive printing
          const href = String(t.href || "");
          const linkable = /^(https?:|mailto:)/i.test(href);
          const label = inline(t.tokens, linkable ? { ...fmt, link: true } : fmt);
          if (linkable) runs.push(new ExternalHyperlink({ link: href, children: label }));
          else runs.push(...label);
          const shown = String(t.text || "").replace(/^mailto:/i, "");
          if (href && shown !== href && shown !== href.replace(/^mailto:/i, "")) runs.push(...textRuns(` (${href})`, fmt));
          break;
        }
        case "text":
          if (t.tokens?.length) runs.push(...inline(t.tokens, fmt));
          else runs.push(...textRuns(t.text, fmt));
          break;
        default: runs.push(...textRuns(t.text ?? "", fmt));
      }
    }
    return runs;
  }

  const indentOf = (left) => (left ? { left } : undefined);

  function headingPara(level, tokens) {
    const i = Math.min(level, 3) - 1;
    return new Paragraph({
      heading: HEADINGS[i],
      spacing: { before: i === 0 ? 360 : 280, after: 120 },
      children: inline(tokens, { bold: true, size: HEADING_SIZES[i] }),
    });
  }

  function list(t, indent) {
    const out = [];
    const start = Number(t.start) || 1;
    const left = indent + 720;
    t.items.forEach((item, idx) => {
      const marker = t.ordered ? `${start + idx}.` : "•";
      const check = item.task ? (item.checked ? "[x] " : "[ ] ") : "";
      const markerPara = (runs) => new Paragraph({
        spacing: { after: 60 },
        indent: { left, hanging: 360 },
        tabStops: [{ type: "left", position: left }],
        children: [new TextRun({ text: `${marker}\t${check}`, font, size }), ...runs],
      });
      const children = (item.tokens || []).filter((c) => c.type !== "space" && c.type !== "checkbox");
      const [first, ...rest] = children;
      // The marker always gets its own line, even for an empty item or one that opens with a block
      if (first && (first.type === "text" || first.type === "paragraph")) {
        out.push(markerPara(inline(first.tokens || [{ type: "text", text: first.text }])));
      } else {
        out.push(markerPara([]));
        if (first) rest.unshift(first);
      }
      for (const child of rest) {
        if (child.type === "list") out.push(...list(child, left));
        else out.push(...blocks([child], { indent: left }));
      }
    });
    return out;
  }

  function cell(tok, isHeader, align) {
    return new TableCell({
      shading: isHeader ? { type: ShadingType.CLEAR, fill: "EDEDED", color: "auto" } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({
        alignment: align === "center" ? AlignmentType.CENTER : align === "right" ? AlignmentType.RIGHT : undefined,
        children: inline(tok.tokens, isHeader ? { bold: true, size: size - 2 } : { size: size - 2 }),
      })],
    });
  }

  function table(t) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
      rows: [
        new TableRow({ tableHeader: true, children: t.header.map((h, i) => cell(h, true, t.align[i])) }),
        ...t.rows.map((row) => new TableRow({ children: row.map((c, i) => cell(c, false, t.align[i])) })),
      ],
    });
  }

  function blocks(tokens, ctx = { indent: 0 }) {
    const out = [];
    for (const t of tokens) {
      switch (t.type) {
        case "heading":
          out.push(headingPara(t.depth, t.tokens));
          break;
        case "paragraph":
          if (!ctx.indent && isCapsHeading(t)) out.push(headingPara(2, t.tokens));
          else out.push(new Paragraph({ spacing: { after: 120 }, indent: indentOf(ctx.indent), children: inline(t.tokens, ctx.fmt) }));
          break;
        case "text":
          out.push(new Paragraph({ spacing: { after: 80 }, indent: indentOf(ctx.indent), children: inline(t.tokens || [{ type: "text", text: t.text }], ctx.fmt) }));
          break;
        case "list":
          out.push(...list(t, ctx.indent || 0));
          break;
        case "table":
          out.push(table(t), new Paragraph({ spacing: { after: 120 } }));
          break;
        case "code":
          for (const line of String(t.text).split("\n")) {
            out.push(new Paragraph({
              spacing: { after: 0 },
              indent: { left: (ctx.indent || 0) + 360 },
              shading: { type: ShadingType.CLEAR, fill: "F2F2F2", color: "auto" },
              children: [new TextRun({ text: line || " ", font: MONO, size: size - 2 })],
            }));
          }
          out.push(new Paragraph({ spacing: { after: 120 } }));
          break;
        case "blockquote":
          out.push(...blocks(t.tokens, { indent: (ctx.indent || 0) + 720, fmt: { ...ctx.fmt, italics: true } }));
          break;
        case "hr":
          out.push(new Paragraph({ spacing: { before: 120, after: 240 } }));
          break;
        case "space":
        case "def":
          break;
        default: // html blocks and anything unknown stay as plain text
          if (t.text?.trim()) out.push(new Paragraph({ spacing: { after: 120 }, indent: indentOf(ctx.indent), children: textRuns(t.text.trim()) }));
      }
    }
    return out;
  }

  return blocks(Lexer.lex(String(markdown || ""), { gfm: true, breaks: true }));
}
