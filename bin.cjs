#!/usr/bin/env node
"use strict";

const api = require("./dist/index.cjs");
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
  console.error(String(e && e.message ? e.message : e));
  process.exit(1);
}
