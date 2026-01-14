#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
let api;
try {
  api = require("./dist/index.cjs");
} catch {
  // If dist is not present (e.g., running tests before build), provide a graceful fallback:
  // 1) Honor env override if present and exists
  const e = process.env || {};
  const envPath = e.CHROMIUM_BINARY || e.CHROME_BINARY;
  if (envPath && fs.existsSync(envPath)) {
    console.log(String(envPath));
    process.exit(0);
  }
  // 2) Print guidance and exit with code 1 (match normal error behavior)
  const guidance = [
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
  console.error(guidance);
  process.exit(1);
}
const locateChromium = api.default || api;
const getChromiumVersion = api.getChromiumVersion;
const getInstallGuidance = api.getInstallGuidance;

const argv = process.argv.slice(2);
const allowFallback = argv.includes("--fallback") || argv.includes("-f");
const printBrowserVersion =
  argv.includes("--chromium-version") || argv.includes("--browser-version");
const allowExec = argv.includes("--allow-exec");

try {
  const chromiumPath =
    (typeof locateChromium === "function" && locateChromium(allowFallback)) ||
    (typeof locateChromium === "function" && locateChromium(true)) ||
    null;

  if (!chromiumPath) {
    const guidance =
      (typeof getInstallGuidance === "function" && getInstallGuidance()) ||
      "Chromium not found.";
    console.error(guidance);
    process.exit(1);
  }

  if (printBrowserVersion && typeof getChromiumVersion === "function") {
    const v = getChromiumVersion(chromiumPath, { allowExec });
    if (!v) {
      console.log("");
      process.exit(2);
    }
    console.log(String(v));
    process.exit(0);
  }

  console.log(String(chromiumPath));
} catch (e) {
  console.error(String(e?.message ? e.message : e));
  process.exit(1);
}
