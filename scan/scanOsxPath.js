const fs = require('fs')
const userhome = require('userhome')

module.exports = function scanOsxPath () {
  const defaultPath = '/Applications/Chromium.app/Contents/MacOS/Chromium'
  const alternativePath = userhome(defaultPath.slice(1))

  if (fs.existsSync(defaultPath)) return defaultPath

  return alternativePath
}
