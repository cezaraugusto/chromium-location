// Default import: `which` ships as CommonJS (v4 through v7), so a named ESM
// import of `sync` breaks under Node ESM when the host resolves a version
// without an exports map. The default export interops everywhere.
import which from 'which'

const whichSync = which.sync

export default function scanUnknownPlatformPath (
  allowFallback = false
): string | null {
  const stable = ['chromium']
  const fallbacks = ['chromium-browser', 'chromium-freeworld']
  const candidates = allowFallback ? [...stable, ...fallbacks] : stable

  for (const cmd of candidates) {
    try {
      const resolved = whichSync(cmd)

      if (resolved) return resolved
    } catch {
      // Continue
    }
  }

  return null
}
