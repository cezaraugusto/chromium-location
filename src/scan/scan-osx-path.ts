import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export default function scanOsxPath (allowFallback = false): string | null {
  const apps = [{app: 'Chromium.app', exec: 'Chromium'}]
  const systemBase = '/Applications'
  const userBase = path.join(os.homedir(), 'Applications')

  const channels = allowFallback ? apps : [apps[0]]

  for (const {app, exec} of channels) {
    const systemPath = `${systemBase}/${app}/Contents/MacOS/${exec}`

    if (fs.existsSync(systemPath)) return systemPath

    const userPath = `${userBase}/${app}/Contents/MacOS/${exec}`

    if (fs.existsSync(userPath)) return userPath
  }

  return null
}
