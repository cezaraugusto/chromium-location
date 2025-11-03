const fs = require('fs')
const path = require('path')

module.exports = function scanWindowsPath (allowFallback = false) {
  const prefixes = [
    process.env.LOCALAPPDATA,
    process.env.PROGRAMFILES,
    process.env['PROGRAMFILES(X86)']
  ].filter(Boolean)
  const suffixes = [
    '\\Chromium\\Application\\chromium.exe'
  ]

  for (const prefix of prefixes) {
    for (const suffix of suffixes) {
      const exe = path.join(prefix, suffix)
      if (fs.existsSync(exe)) return exe
    }
  }

  return null
}
