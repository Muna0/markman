import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import AdmZip from "adm-zip";
import { startServer } from "./helpers.js";

let s;
before(async () => { s = await startServer({ MARKMAN_PUBLIC: "1" }); });
after(() => s.stop());

const MD = `# Patent Analysis

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
  assert.match(xml, /DRAFT FOR ATTORNEY REVIEW/);
  assert.match(xml, /DISCLAIMER/);
});
