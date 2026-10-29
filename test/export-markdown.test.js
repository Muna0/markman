import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import AdmZip from "adm-zip";
import { startServer } from "./helpers.js";

let s;
before(async () => { s = await startServer({ MARKMAN_PUBLIC: "1" }); });
after(() => s.stop());

const MD = `# Overview

## Claim Scope

The claim is **broad** and *arguably* indefinite.

- First point with **bold**
- Second point

1. Step one
2. Step two

| Element | Risk |
|---------|------|
| Widget  | **HIGH** |
| Gadget  | LOW |

\`\`\`
code sample
\`\`\`

---

### Limitations

Plain text.`;

async function exportXml(content) {
  const r = await fetch(`${s.url}/api/export`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Markdown Memo", content, memoType: "patent" }),
  });
  assert.equal(r.status, 200);
  const zip = new AdmZip(Buffer.from(await r.arrayBuffer()));
  return zip.readAsText("word/document.xml");
}

test("export converts Markdown into Word formatting", async () => {
  const xml = await exportXml(MD);
  assert.ok(!xml.includes("**"), "no literal bold markers");
  assert.ok(!xml.includes("|---"), "no literal table separators");
  assert.ok(!/<w:t[^>]*>#+ /.test(xml), "no literal heading markers");
  assert.ok(!/<w:t[^>]*>\| /.test(xml), "no literal table pipes");
  assert.match(xml, /<w:tbl>/, "table rendered as a Word table");
  assert.match(xml, /w:val="Heading1"/);
  assert.match(xml, /w:val="Heading2"/);
  assert.match(xml, /w:val="Heading3"/);
  assert.match(xml, /<w:b\/>[\s\S]*?broad/);
  assert.match(xml, /<w:i\/>[\s\S]*?arguably/);
  assert.match(xml, /Widget/);
  assert.match(xml, /code sample/);
});

async function exportZip(content, memoType, title = "Markman Fto Analysis") {
  const r = await fetch(`${s.url}/api/export`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, memoType }),
  });
  assert.equal(r.status, 200);
  return { zip: new AdmZip(Buffer.from(await r.arrayBuffer())), disposition: r.headers.get("content-disposition") };
}

test("FTO export has one proper title, no table of contents, and no added disclaimer block", async () => {
  const md = "# FREEDOM-TO-OPERATE ANALYSIS\n\nDRAFT FOR ATTORNEY REVIEW. Not legal advice.\n\n## Executive Summary\n\nText.\n\n## LIMITATIONS\n\nOnly one.";
  const { zip, disposition } = await exportZip(md, "FTO");
  const xml = zip.readAsText("word/document.xml");
  const text = xml.replace(/<[^>]+>/g, "");
  assert.equal((text.match(/Freedom-to-Operate Analysis \(Draft\)/g) || []).length, 1);
  assert.ok(!/FREEDOM-TO-OPERATE ANALYSIS(?! \(Draft)/.test(text), "model's own title heading is dropped");
  assert.ok(!/Fto/.test(text), "no 'Fto' in the document");
  assert.ok(!/Markman Fto Analysis/.test(text));
  assert.ok(!/TABLE OF CONTENTS|Update Field|w:fldSimple|TOC \\/i.test(xml), "no table of contents");
  assert.ok(!/DISCLAIMER/.test(text), "no hard-coded disclaimer block");
  assert.equal((text.match(/LIMITATIONS/g) || []).length, 1);
  assert.equal((text.match(/DRAFT FOR ATTORNEY REVIEW/g) || []).length, 1, "only the model's disclaimer line in the body");
  assert.match(zip.readAsText("word/header1.xml"), /DRAFT FOR ATTORNEY REVIEW/);
  assert.match(disposition, /Freedom_to_Operate_Analysis_\d{4}-\d{2}-\d{2}\.docx/);
});

test("memo titles by type", async () => {
  for (const [type, title] of [["patent", "Patent Analysis (Draft)"], ["trademark", "Trademark Clearance Screen (Draft)"], ["intake", "IP Matter Intake Summary (Draft)"]]) {
    const { zip } = await exportZip("Body.", type, "x");
    assert.match(zip.readAsText("word/document.xml"), new RegExp(title.replace(/[()]/g, "\\$&")));
  }
});

test("case names in Markdown italics are italic in Word", async () => {
  const { zip } = await exportZip("See *Phillips v. AWH Corp.*, 415 F.3d 1303 (Fed. Cir. 2005).", "patent");
  const xml = zip.readAsText("word/document.xml");
  assert.match(xml, /<w:i\/>(?:(?!<\/w:r>)[\s\S])*Phillips v\. AWH Corp\./);
  assert.ok(!xml.includes("*Phillips"), "no literal asterisks");
});

test("single newlines inside a paragraph become line breaks", async () => {
  const xml = await exportXml("**Title:** Widget\n**Filing Date:** 2020-01-01");
  assert.match(xml, /Widget<\/w:t><\/w:r><w:r>(<w:rPr>[\s\S]*?<\/w:rPr>)?<w:br\/>/);
});

test("list items keep their marker even when they start with a block or are empty", async () => {
  const xml = await exportXml("- ```\n  code in item\n  ```\n- > quoted item\n-\n- plain");
  assert.equal((xml.match(/•/g) || []).length, 4);
  assert.match(xml, /code in item/);
});

test("links keep their URL", async () => {
  const r = await fetch(`${s.url}/api/export`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Links", content: "See [the opinion](https://example.com/op) and <https://example.com/bare>.", memoType: "patent" }),
  });
  const zip = new AdmZip(Buffer.from(await r.arrayBuffer()));
  const xml = zip.readAsText("word/document.xml");
  const rels = zip.readAsText("word/_rels/document.xml.rels");
  assert.match(xml, /<w:hyperlink/);
  assert.match(xml, /the opinion/);
  assert.match(xml, /\(https:\/\/example\.com\/op\)/);
  assert.match(rels, /https:\/\/example\.com\/op/);
  assert.match(xml, /https:\/\/example\.com\/bare/);
  assert.ok(!xml.includes("(https://example.com/bare)"), "bare URL is not repeated");
});
