import scanOsxPath from "./scan/scan-osx-path";
import scanWindowsPath from "./scan/scan-windows-path";
import scanUnknownPlatformPath from "./scan/scan-unknown-platform-path";
import { execFileSync } from "child_process";
import fs from "node:fs";
import path from "node:path";
import { resolveFromPuppeteerCache } from "./resolve-puppeteer-cache";

export type FsLike = Pick<typeof fs, "existsSync" | "readdirSync">;
export type WhichLike = { sync: (cmd: string) => string };
export type Deps = {
  fs?: FsLike;
  which?: WhichLike;
  env?: NodeJS.ProcessEnv;
  platform?: NodeJS.Platform;
  userhome?: (p: string) => string;
};

export default function locateChromium(
  allowFallbackOrDeps?: boolean | Deps,
  depsMaybe?: Deps,
): string | null {
  const isBoolean = typeof allowFallbackOrDeps === "boolean";
  const allowFallback = isBoolean ? (allowFallbackOrDeps as boolean) : false;
  const deps: Deps | undefined = isBoolean
    ? depsMaybe
    : (allowFallbackOrDeps as Deps | undefined);

  const f: FsLike = deps?.fs ?? fs;
  const e = deps?.env ?? process.env;
  const platform = deps?.platform ?? process.platform;
  // 0) Environment overrides (Chromium / Chrome)
  const envPath = e?.CHROMIUM_BINARY || e?.CHROME_BINARY;
  if (envPath && f.existsSync(envPath)) return envPath;

  let found: string | null = null;
  switch (platform) {
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
  if (!found) found = resolveFromPuppeteerCache({ fs: f, env: e, platform });

  // Last resort: short, silent CLI probe of @puppeteer/browsers cache path
  // Skip during tests to avoid timeouts and external process spawning on macOS
  const isTestEnv =
    e?.NODE_ENV === "test" ||
    typeof (e as any)?.VITEST !== "undefined" ||
    typeof (e as any)?.JEST_WORKER_ID !== "undefined";
  const skipCliProbe = isTestEnv && platform === "darwin";
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
    "Then re-run your command — we'll detect it automatically.",
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

/**
 * Cross-platform Chromium version resolver.
 * - Never executes the browser by default.
 * - On Windows: reads PE metadata via PowerShell.
 * - On macOS: reads Info.plist next to the binary when using CfT layout (via cache or conventional install).
 * - On Linux/others: attempts to infer from Puppeteer cache folder; otherwise returns null unless allowExec is true.
 */
export function getChromiumVersion(
  bin: string,
  opts?: { allowExec?: boolean },
): string | null {
  // Try to extract from Puppeteer cache layout (works across platforms)
  const fromPptr = extractVersionFromPuppeteerPath(bin);
  if (fromPptr) return fromPptr;

  if (process.platform === "win32") {
    try {
      const psPath = bin.replace(/'/g, "''");
      const pv = execFileSync(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          `(Get-Item -LiteralPath '${psPath}').VersionInfo.ProductVersion`,
        ],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      ).trim();

      return normalizeVersion(pv);
    } catch {}
    if (opts?.allowExec) {
      const v =
        tryExec(bin, ["--product-version"]) || tryExec(bin, ["--version"]);
      return normalizeVersion(v);
    }
    return null;
  }

  if (process.platform === "darwin") {
    try {
      // CfT layout: .../chrome-mac*/Google Chrome for
      // Testing.app/Contents/MacOS/Google Chrome for Testing
      const contentsDir = path.dirname(path.dirname(bin));
      const infoPlist = path.join(contentsDir, "Info.plist");
      if (fs.existsSync(infoPlist)) {
        const xml = fs.readFileSync(infoPlist, "utf8");
        const v =
          parsePlistString(xml, "CFBundleShortVersionString") ||
          parsePlistString(xml, "CFBundleVersion") ||
          "";
        return normalizeVersion(v);
      }
    } catch {
      // noop
    }

    if (opts?.allowExec) {
      const v = tryExec(bin, ["--version"]);
      return normalizeVersion(v);
    }

    return null;
  }

  if (opts?.allowExec) {
    const v = tryExec(bin, ["--version"]);
    return normalizeVersion(v);
  }

  return null;
}

function extractVersionFromPuppeteerPath(p: string): string | null {
  const m = p.match(
    /[\\/]puppeteer[\\/]chrome[\\/](?:mac(?:_arm)?|win(?:32|64)|linux)-(\d+(?:\.\d+)*)(?:[\\/]|$)/i,
  );

  return m ? normalizeVersion(m[1]) : null;
}

function parsePlistString(xml: string, key: string): string | null {
  const re = new RegExp(`<key>${key}<\\/key>\\s*<string>([^<]+)<\\/string>`);

  const m = xml.match(re);

  return m ? m[1].trim() : null;
}

function normalizeVersion(s: string | null | undefined): string | null {
  if (!s) return null;

  const m = String(s).match(/(\d+(?:\.\d+){1,3})/);

  return m ? m[1] : null;
}

function tryExec(bin: string, args: string[]): string | null {
  try {
    return execFileSync(bin, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
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
  const printBrowserVersion =
    argv.includes("--chromium-version") || argv.includes("--browser-version");
  const allowExec = argv.includes("--allow-exec");

  try {
    const location = locateChromium(allowFallback) || locateChromium(true);
    if (!location) {
      // eslint-disable-next-line no-console
      console.error(getInstallGuidance());
      process.exit(1);
    }
    if (printBrowserVersion) {
      const v = getChromiumVersion(location, { allowExec });
      if (!v) {
        // eslint-disable-next-line no-console
        console.log("");
        process.exit(2);
      }
      // eslint-disable-next-line no-console
      console.log(v);
      process.exit(0);
    }
    // eslint-disable-next-line no-console
    console.log(location);
    process.exit(0);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(String((e as any)?.message || e));
    process.exit(1);
  }
}
