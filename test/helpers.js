import { spawn } from "node:child_process";
import net from "node:net";

function freePort() {
  return new Promise((resolve) => {
    const s = net.createServer().listen(0, () => { const p = s.address().port; s.close(() => resolve(p)); });
  });
}

export async function startServer(env = {}) {
  const port = await freePort();
  const child = spawn(process.execPath, ["server.js"], {
    env: { ...process.env, ANTHROPIC_API_KEY: "", USPTO_API_KEY: "", ...env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    child.stdout.on("data", (d) => { if (String(d).includes("running")) resolve(); });
    child.on("exit", (c) => reject(new Error(`server exited ${c}`)));
  });
  return { url: `http://127.0.0.1:${port}`, stop: () => child.kill() };
}
