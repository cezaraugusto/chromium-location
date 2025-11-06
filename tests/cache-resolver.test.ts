import { describe, expect, test } from "vitest";
import { resolveFromPuppeteerCache } from "../src/resolve-puppeteer-cache";

const makeFs = (entries: Record<string, "file" | "dir">) => {
  return {
    existsSync: (p: string) => Boolean(entries[p]),
    readdirSync: (p: string) => {
      const prefix = p.endsWith("/") ? p : p + "/";
      const names = Object.keys(entries)
        .filter((k) => k.startsWith(prefix))
        .map((k) => k.slice(prefix.length).split("/")[0]);
      const unique = Array.from(new Set(names));
      return unique.map((name) => ({ name, isDirectory: true })) as any;
    },
    statSync: (_p: string) => ({ mtimeMs: 0 }) as any,
  };
};

describe("resolveFromPuppeteerCache (chromium)", () => {
  test("macOS resolves Chromium binary from mac-* folders", () => {
    const home = "/Users/alice";
    const base = `${home}/Library/Caches/puppeteer/chromium/mac-123`;
    const bin = `${base}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`;
    const fs = makeFs({
      [`${home}/Library/Caches/puppeteer/chromium`]: "dir",
      [`${home}/Library/Caches/puppeteer/chromium/mac-123`]: "dir",
      [bin]: "file",
    });
    const out = resolveFromPuppeteerCache({
      fs,
      env: { HOME: home } as any,
      platform: "darwin",
    });
    expect(out).toBe(bin);
  });

  test("Linux resolves Chromium binary from linux-* folders", () => {
    const home = "/home/alice";
    const base = `${home}/.cache/puppeteer/chromium/linux-123`;
    const bin = `${base}/chrome-linux64/chrome`;
    const fs = makeFs({
      [`${home}/.cache/puppeteer/chromium`]: "dir",
      [`${home}/.cache/puppeteer/chromium/linux-123`]: "dir",
      [bin]: "file",
    });
    const out = resolveFromPuppeteerCache({
      fs,
      env: { HOME: home } as any,
      platform: "linux",
    });
    expect(out).toBe(bin);
  });

  test("Windows resolves Chromium binary (win64 preferred)", () => {
    const lad = "C:/Users/Alice/AppData/Local";
    const base = `${lad}/puppeteer/chromium`;
    const bin64 = `${base}/win64-123/chrome-win64/chrome.exe`;
    const fs = makeFs({
      [base]: "dir",
      [`${base}/win64-123`]: "dir",
      [bin64]: "file",
    });
    const out = resolveFromPuppeteerCache({
      fs,
      env: {} as any,
      platform: "win32",
      localAppData: lad,
    });
    expect(out).toBe(bin64);
  });
});
