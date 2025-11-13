[npm-version-image]: https://img.shields.io/npm/v/chromium-location.svg?color=0971fe
[npm-version-url]: https://www.npmjs.com/package/chromium-location
[npm-downloads-image]: https://img.shields.io/npm/dm/chromium-location.svg?color=2ecc40
[npm-downloads-url]: https://www.npmjs.com/package/chromium-location
[action-image]: https://github.com/cezaraugusto/chromium-location/actions/workflows/ci.yml/badge.svg?branch=main
[action-url]: https://github.com/cezaraugusto/chromium-location/actions

> Approximates the current location of the Chromium browser across platforms.

# chromium-location [![Version][npm-version-image]][npm-version-url] [![Downloads][npm-downloads-image]][npm-downloads-url] [![workflow][action-image]][action-url]

<img alt="Chromium" align="right" src="https://cdn.jsdelivr.net/gh/extension-js/media@9ef31f005a0192907d9f6405838e43776aca2124/browser_logos/svg/chromium.svg" width="10.5%" />

- By default checks only `stable`.
- Supports macOS / Windows / Linux
- Works both as an ES module or CommonJS

New in this version:

- Honors environment overrides: `CHROMIUM_BINARY`, `CHROME_BINARY`
- Optional helper to throw with a friendly install guide when nothing is found
- After you run `npx @puppeteer/browsers install chromium` once, we auto-detect Chromium from Puppeteer's cache on all platforms (no env vars needed)
- Cross-platform version API that does not execute the browser by default

## Support table

This table lists the default locations where Chromium is typically installed for each supported platform and channel. By default, only the Stable channel is checked.

<table>
  <thead>
    <tr>
      <th>Platform</th>
      <th>Channel</th>
      <th>Paths checked</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center"><img alt="" width="64" height="64" src="https://cdn.jsdelivr.net/gh/extension-js/media@db5deb23fbfa85530f8146718812972998e13a4d/platform_logos/macos.png" /><br><strong>macOS</strong></td>
      <td align="center">Chromium (Stable)</td>
      <td>
        <ul>
          <li><code>/Applications/Chromium.app/Contents/MacOS/Chromium</code></li>
          <li><code>~/Applications/Chromium.app/Contents/MacOS/Chromium</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td align="center"><img alt="" width="64" height="64" src="https://cdn.jsdelivr.net/gh/extension-js/media@db5deb23fbfa85530f8146718812972998e13a4d/platform_logos/windows.png" /><br><strong>Windows</strong></td>
      <td align="center">Chromium (Stable)</td>
      <td>
        <ul>
          <li><code>%LOCALAPPDATA%\Chromium\Application\chrome.exe</code></li>
          <li><code>%PROGRAMFILES%\Chromium\Application\chrome.exe</code></li>
          <li><code>%PROGRAMFILES(X86)%\Chromium\Application\chrome.exe</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td align="center"><img alt="" width="64" height="64" src="https://cdn.jsdelivr.net/gh/extension-js/media@db5deb23fbfa85530f8146718812972998e13a4d/platform_logos/linux.png" /><br><strong>Linux/other</strong></td>
      <td align="center">Chromium (Stable)</td>
      <td>
        <ul>
          <li><code>chromium</code> (on <code>$PATH</code>)</li>
          <li><code>chromium-browser</code> (on <code>$PATH</code>)</li>
          <li><code>chromium-freeworld</code> (on <code>$PATH</code>)</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

Returns the first existing path found (given selected channels), or <code>null</code> if none are found.

## Usage

**Via Node.js (strict by default):**

```js
// Returns the path to Chromium as a string.
import chromiumLocation, {
  locateChromiumOrExplain,
  getInstallGuidance,
  getChromiumVersion
} from 'chromium-location'

// Strict (Stable only)
console.log(chromiumLocation())
// => "/Applications/Chromium.app/Contents/MacOS/Chromium" or null

// Enable fallback (Stable / alternative binaries on Linux)
console.log(chromiumLocation(true))

// Throw with a friendly, copy-pasteable guide when not found
try {
  const path = locateChromiumOrExplain({allowFallback: true})
  console.log(path)

  // Cross-platform version (no exec by default)
  const v = getChromiumVersion(path)
  console.log(v) // e.g. "120.0.6099.109" or null

  // Opt-in: allow executing the binary to fetch version on platforms without metadata (e.g. Linux)
  const v2 = getChromiumVersion(path, {allowExec: true})
  console.log(v2)
} catch (e) {
  console.error(String(e))
  // Or print getInstallGuidance() explicitly
}
```

**Via CLI:**

```bash
npx chromium-location

# Respect Puppeteer cache (after you install once):
npx @puppeteer/browsers install chromium
npx chromium-location

# Respect environment overrides
CHROMIUM_BINARY=/custom/path/to/chromium npx chromium-location
```

### Environment overrides

If any of these environment variables are set and point to an existing binary, they take precedence:

- `CHROMIUM_BINARY`
- `CHROME_BINARY`

### When nothing is found

The helper returns actionable guidance:

```
We couldn't find a Chromium browser on this machine.

Here's the fastest way to get set up:

1) Install Chromium via Puppeteer Browsers (recommended)
   npx @puppeteer/browsers install chromium

Then re-run your command — we'll detect it automatically.

Alternatively, install Chromium using your OS package manager and re-run.
```

## API

- `default export locateChromium(allowFallback?: boolean): string | null`
  - Returns the first existing path among the selected channels or `null`.
  - When `allowFallback` is `true`, checks the stable locations and common alternatives per-platform.

- `locateChromiumOrExplain(options?: boolean | { allowFallback?: boolean }): string`
  - Returns a path if found, otherwise throws an `Error` with a friendly installation guide.

- `getChromiumVersion(bin: string, opts?: { allowExec?: boolean }): string | null`
  - Cross-platform version resolver that does not execute the browser by default.
  - Windows: reads PE file metadata via PowerShell (no GUI spawn).
  - macOS: reads `Info.plist` (no GUI spawn).
  - Linux/other: attempts to infer from Puppeteer cache path; otherwise returns `null` unless `allowExec` is `true`.

- `getInstallGuidance(): string`
  - Returns the same guidance text used by `locateChromiumOrExplain()`.

## Related projects

- [brave-location](https://github.com/cezaraugusto/brave-location)
- [chrome-location2](https://github.com/cezaraugusto/chrome-location2)
- [edge-location](https://github.com/cezaraugusto/edge-location)
- [firefox-location2](https://github.com/cezaraugusto/firefox-location2)
- [opera-location2](https://github.com/cezaraugusto/opera-location2)
- [vivaldi-location2](https://github.com/cezaraugusto/vivaldi-location2)
- [yandex-location](https://github.com/cezaraugusto/yandex-location)
- [waterfox-location](https://github.com/cezaraugusto/waterfox-location)

## Acknowledgements

This project is adapted from [chrome-location](http://github.com/hughsk/chrome-location).

## License

MIT (c) Cezar Augusto.
