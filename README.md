[npm-version-image]: https://img.shields.io/npm/v/chromium-location.svg?color=0971fe
[npm-version-url]: https://www.npmjs.com/package/chromium-location
[npm-downloads-image]: https://img.shields.io/npm/dm/chromium-location.svg?color=2ecc40
[npm-downloads-url]: https://www.npmjs.com/package/chromium-location
[action-image]: https://github.com/cezaraugusto/chromium-location/actions/workflows/ci.yml/badge.svg?branch=main
[action-url]: https://github.com/cezaraugusto/chromium-location/actions

> Approximates the current location of the Chromium browser across platforms.

# chromium-location [![Version][npm-version-image]][npm-version-url] [![Downloads][npm-downloads-image]][npm-downloads-url] [![workflow][action-image]][action-url]

<img alt="Chromium" align="right" src="https://cdn.jsdelivr.net/gh/extension-js/media@9ef31f005a0192907d9f6405838e43776aca2124/browser_logos/svg/chromium.svg" width="10.5%" />

* By default checks only `stable`.
* Supports macOS / Windows / Linux
* CommonJS module and CLI

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
const chromiumLocation = require('chromium-location')

// Strict (Stable only)
console.log(chromiumLocation())
// => "/Applications/Chromium.app/Contents/MacOS/Chromium" or null

// Enable fallback (Stable / alternative binaries on Linux)
console.log(chromiumLocation(true))
```

**Via CLI:**

```bash
npx chromium-location
```

## Related projects

* [brave-location](https://github.com/cezaraugusto/brave-location)
* [chrome-location2](https://github.com/cezaraugusto/chrome-location2)
* [edge-location](https://github.com/cezaraugusto/edge-location)
* [firefox-location2](https://github.com/cezaraugusto/firefox-location2)
* [opera-location2](https://github.com/cezaraugusto/opera-location2)
* [vivaldi-location2](https://github.com/cezaraugusto/vivaldi-location2)
* [yandex-location](https://github.com/cezaraugusto/yandex-location)
* [waterfox-location](https://github.com/cezaraugusto/waterfox-location)

## Acknowledgements

This project is adapted from [chrome-location](http://github.com/hughsk/chrome-location).

## License

MIT (c) Cezar Augusto.
