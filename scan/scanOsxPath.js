const fs = require('fs')
const userhome = require('userhome')

module.exports = function scanOsxPath (allowFallback = false) {
  const apps = [
    { app: 'Chromium.app', exec: 'Chromium' }
  ]

  const systemBase = '/Applications'
  const userBase = userhome('Applications')

  const channels = allowFallback ? apps : [apps[0]]

  for (const { app, exec } of channels) {
    const systemPath = `${systemBase}/${app}/Contents/MacOS/${exec}`
    if (fs.existsSync(systemPath)) return systemPath

    const userPath = `${userBase}/${app}/Contents/MacOS/${exec}`
    if (fs.existsSync(userPath)) return userPath
  }

  return null
}
