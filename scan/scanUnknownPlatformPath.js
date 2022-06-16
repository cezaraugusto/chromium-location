const which = require('which');

module.exports = function scanUnknownPlatform () {
  let browserPath = null

  try {
    browserPath = which.sync('chromium-browser');
  } catch (err) {
    browserPath = null;
  }

  return browserPath
}
