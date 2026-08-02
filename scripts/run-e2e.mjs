import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const nextCli = join(root, "node_modules", "next", "dist", "bin", "next");
const playwrightCli = join(root, "node_modules", "@playwright", "test", "cli.js");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer(url) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await delay(500);
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function stopProcessTree(pid) {
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
      killer.on("close", () => resolve());
      killer.on("error", () => resolve());
    });
    return;
  }
  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // The server may have already exited.
    }
  }
}

async function main() {
  if (!existsSync(nextCli) || !existsSync(playwrightCli)) {
    throw new Error("Missing local Next.js or Playwright CLI. Run pnpm install first.");
  }

  const server = spawn(process.execPath, [nextCli, "dev", "--hostname", "127.0.0.1"], {
    cwd: root,
    env: process.env,
    stdio: "inherit",
    detached: process.platform !== "win32"
  });

  try {
    await waitForServer("http://127.0.0.1:3000/");
    const exitCode = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [playwrightCli, "test"], {
        cwd: root,
        env: { ...process.env, PLAYWRIGHT_EXTERNAL_SERVER: "1" },
        stdio: "inherit"
      });
      child.on("error", reject);
      child.on("close", (code) => resolve(code ?? 1));
    });
    process.exitCode = exitCode;
  } finally {
    if (server.pid) await stopProcessTree(server.pid);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
