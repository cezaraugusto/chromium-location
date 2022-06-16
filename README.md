[action-image]: https://github.com/cezaraugusto/chromium-location/workflows/CI/badge.svg
[action-url]: https://github.com/cezaraugusto/chromium-location/actions?query=workflow%3ACI
[npm-image]: https://img.shields.io/npm/v/chromium-location.svg
[npm-url]: https://npmjs.org/package/chromium-location

# chromium-location [![workflow][action-image]][action-url] [![npm][npm-image]][npm-url]

> Approximates the current location of the Chromium browser across platforms.

# Usage

**Via Node.js:**

```js
// Returns the path to Chromium as a string.
const chromiumLocation = require('chromium-location')

console.log(chromiumLocation())
// /Applications/Chromium.app/Contents/MacOS/Chromium
```

**Via CLI:**

```bash
> chromium-location
# /Applications/Chromium.app/Contents/MacOS/Chromium
```

Open Chromium (remember to use quotes as Chrome's path usually has spaces in it):

```bash
> "`chromium-location`"
```

## Acknowledgements

This project is adapted from [chrome-location](http://github.com/hughsk/chrome-location).

## License

MIT (c) Cezar Augusto.
