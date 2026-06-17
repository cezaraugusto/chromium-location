import fs from 'node:fs'
import path from 'node:path'

export default function scanWindowsPath (allowFallback = false): string | null {
  const prefixes = [
    process.env.LOCALAPPDATA,
    process.env.PROGRAMFILES,
    process.env['PROGRAMFILES(X86)']
  ].filter(Boolean) as string[]

  const suffixes = ['\\Chromium\\Application\\chromium.exe']

  for (const prefix of prefixes) {
    for (const suffix of suffixes) {
      const exe = path.join(prefix, suffix)

      if (fs.existsSync(exe)) return exe
    }
  }

  return null
}
