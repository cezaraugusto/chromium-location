import scanOsxPath from "./scan/scan-osx-path";
import scanWindowsPath from "./scan/scan-windows-path";
import scanUnknownPlatformPath from "./scan/scan-unknown-platform-path";
import { execFileSync } from "child_process";
import fs from "node:fs";
import { resolveFromPuppeteerCache } from "./resolve-puppeteer-cache";

export default function locateChromium(allowFallback = false): string | null {
  // 0) Environment overrides (Chromium / Chrome)
  const envPath = process.env.CHROMIUM_BINARY || process.env.CHROME_BINARY;
  if (envPath && fs.existsSync(envPath)) return envPath;

  let found: string | null = null;
  switch (process.platform) {
    case "darwin":
      found = scanOsxPath(allowFallback);
      break;
    case "win32":
      found = scanWindowsPath(allowFallback);
      break;
    default:
      found = scanUnknownPlatformPath(allowFallback);
      break;
  }

  // Try Puppeteer cache
  if (!found) found = resolveFromPuppeteerCache();

  // Last resort: short, silent CLI probe of @puppeteer/browsers cache path
  // Skip during tests to avoid timeouts and external process spawning on macOS
  const isTestEnv =
    process.env.NODE_ENV === "test" ||
    typeof (process as any).env?.VITEST !== "undefined" ||
    typeof (process as any).env?.JEST_WORKER_ID !== "undefined";
  const skipCliProbe = isTestEnv && process.platform === "darwin";
  if (!found && !skipCliProbe) found = resolveFromPuppeteerBrowsersCLI();

  return found;
}

export function getInstallGuidance(): string {
  return [
    "We couldn't find a Chromium browser on this machine.",
    "",
    "Here's the fastest way to get set up:",
    "",
    "1) Install Chromium via Puppeteer Browsers (recommended)",
    "   npx @puppeteer/browsers install chromium",
    "",
    "Then re-run your command , we'll detect it automatically.",
    "",
    "Alternatively, install Chromium using your OS package manager and re-run.",
  ].join("\n");
}

export function locateChromiumOrExplain(
  options?: boolean | { allowFallback?: boolean },
): string {
  const allowFallback =
    typeof options === "boolean" ? options : Boolean(options?.allowFallback);
  const found = locateChromium(allowFallback) || locateChromium(true);
  if (typeof found === "string" && found) return found;
  throw new Error(getInstallGuidance());
}

function resolveFromPuppeteerBrowsersCLI(): string | null {
  const attempts: Array<{ cmd: string; args: string[] }> = [
    { cmd: "npx", args: ["-y", "@puppeteer/browsers", "path", "chromium"] },
    { cmd: "pnpm", args: ["dlx", "@puppeteer/browsers", "path", "chromium"] },
    { cmd: "yarn", args: ["dlx", "@puppeteer/browsers", "path", "chromium"] },
    { cmd: "bunx", args: ["@puppeteer/browsers", "path", "chromium"] },
  ];

  for (const { cmd, args } of attempts) {
    try {
      const out = execFileSync(cmd, args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 2000,
      }).trim();
      if (out && fs.existsSync(out)) return out;
    } catch {}
  }
  return null;
}

// CLI execution guard (CJS)
declare const require: any;
declare const module: any;

if (
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module
) {
  const argv = process.argv.slice(2);
  const allowFallback = argv.includes("--fallback") || argv.includes("-f");
  const location = locateChromium(allowFallback);
  if (location) {
    // eslint-disable-next-line no-console
    console.log(location);
    process.exit(0);
  } else {
    process.exitCode = 1;
  }
}
