import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

const execMock: any = vi.fn();
vi.mock("node:child_process", () => ({
  execFileSync: (...args: any[]) => execMock(...args),
}));

describe("CLI fallback (npx @puppeteer/browsers path chromium)", () => {
  const originalPlatform = process.platform;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    execMock.mockReset();
  });

  afterEach(() => {
    Object.defineProperty(process, "platform", { value: originalPlatform });
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  test("uses CLI fallback when standard + cache fail", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    vi.doMock("../src/scan/scan-unknown-platform-path", () => ({
      default: () => null,
    }));
    vi.doMock("../src/resolve-puppeteer-cache", () => ({
      resolveFromPuppeteerCache: () => null,
    }));
    execMock.mockReturnValue("/tmp/cache/chromium");
    vi.doMock("node:fs", () => ({
      default: { existsSync: (p: string) => p === "/tmp/cache/chromium" },
    }));
    const mod = await import("../src/index");
    const out = mod.default(false);
    expect(out).toBe("/tmp/cache/chromium");
    expect(execMock).toHaveBeenCalled();
  });

  test("does not call CLI when cache finds a path", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    vi.doMock("../src/scan/scan-unknown-platform-path", () => ({
      default: () => null,
    }));
    vi.doMock("../src/resolve-puppeteer-cache", () => ({
      resolveFromPuppeteerCache: () => "/from/cache/chromium",
    }));
    execMock.mockImplementation(() => "" as any);
    const mod = await import("../src/index");
    const out = mod.default(false);
    expect(out).toBe("/from/cache/chromium");
    expect(execMock).not.toHaveBeenCalled();
  });
});
