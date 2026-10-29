import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import AdmZip from "adm-zip";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

test("plugin export_memo puts the draft label in the page header, once in the body", async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "markman-export-"));
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["mcp/markman-store.js"],
    env: { ...process.env, MARKMAN_DATA_DIR: dataDir },
    stderr: "ignore",
  });
  const client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(transport);
  try {
    const md = "DRAFT FOR ATTORNEY REVIEW. Not legal advice.\n\n## Summary\n\nText.\n\n## LIMITATIONS\n\nOnly one.";
    await client.callTool({ name: "export_memo", arguments: { title: "Screen", content: md, memo_type: "trademark" } });
    const files = fs.readdirSync(path.join(dataDir, "exports")).filter((f) => f.endsWith(".docx"));
    assert.equal(files.length, 1);
    const zip = new AdmZip(path.join(dataDir, "exports", files[0]));
    const text = zip.readAsText("word/document.xml").replace(/<[^>]+>/g, "");
    assert.equal((text.match(/draft for attorney review/gi) || []).length, 1, "only the draft's own disclaimer line in the body");
    assert.match(zip.readAsText("word/header1.xml"), /DRAFT FOR ATTORNEY REVIEW/);
    const footer = zip.getEntries().filter((e) => /^word\/footer\d*\.xml$/.test(e.entryName)).map((e) => zip.readAsText(e)).join("");
    assert.match(footer, /Not legal advice/);
  } finally {
    await client.close();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
});
