const scanOsxPath = require('./scan/scanOsxPath')
const scanWindowsPath = require('./scan/scanWindowsPath')
const scanUnknownPlatformPath = require('./scan/scanUnknownPlatformPath')

module.exports = function locateChromium (allowFallback = false) {
  switch (process.platform) {
    case 'darwin':
      return scanOsxPath(allowFallback)
    case 'win32':
      return scanWindowsPath(allowFallback)
    default:
      return scanUnknownPlatformPath(allowFallback)
  }
}
