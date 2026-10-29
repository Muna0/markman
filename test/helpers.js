import { spawn } from "node:child_process";

const START_TIMEOUT_MS = 20000;

// Starts server.js on an OS-assigned port (PORT=0) and reads the real port from its
// startup line. Picking a "free" port first and passing it in raced with the other test
// files, which node --test runs in parallel, and could hand two servers the same port.
export async function startServer(env = {}) {
  const child = spawn(process.execPath, ["server.js"], {
    env: { ...process.env, ANTHROPIC_API_KEY: "", USPTO_API_KEY: "", ...env, PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stderr = "";
  child.stderr.on("data", (d) => { stderr += String(d); });
  const port = await new Promise((resolve, reject) => {
    let buf = "";
    const onExit = (c) => { clearTimeout(timer); reject(new Error(`server exited ${c}: ${stderr.slice(-500)}`)); };
    const timer = setTimeout(() => {
      child.off("exit", onExit);
      child.kill();
      reject(new Error(`server did not start within ${START_TIMEOUT_MS / 1000}s: ${stderr.slice(-500)}`));
    }, START_TIMEOUT_MS);
    child.stdout.on("data", (d) => {
      buf += String(d);
      const m = /running on http:\/\/localhost:(\d+)/.exec(buf);
      if (m) {
        clearTimeout(timer);
        child.off("exit", onExit);
        resolve(Number(m[1]));
      }
    });
    child.on("exit", onExit);
  });
  child.stdout.resume();
  return {
    url: `http://127.0.0.1:${port}`,
    stderr: () => stderr,
    stop: () => child.kill(),
  };
}
