import {sync as whichSync} from 'which'

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
