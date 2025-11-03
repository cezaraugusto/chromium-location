const which = require('which');

module.exports = function scanUnknownPlatform (allowFallback = false) {
  const stable = ['chromium']
  const fallbacks = ['chromium-browser', 'chromium-freeworld']
  const candidates = allowFallback ? [...stable, ...fallbacks] : stable

  for (const cmd of candidates) {
    try {
      const resolved = which.sync(cmd);
      if (resolved) return resolved;
    } catch (_) {}
  }

  return null
}
