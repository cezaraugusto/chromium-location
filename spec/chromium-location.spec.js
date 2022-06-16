/* eslint-env jasmine */
const fs = require('fs')
const mock = require('mock-require');
const chromiumLocation = require('../module')

describe('chromium-location', function () {
  // Must have Chromium installed. Commented as GitHub CI doesn't have it.
  // it('outputs chromium path as a node module', function (done) {
  //   const location = chromiumLocation()

  //   expect(fs.existsSync(location)).toBe(true)
  //   expect(location).toBeDefined()
  //   done()
  // })

  it('outputs chromium path as a cli', function (done) {
    mock('child_process', {
      spawnSync: (location) => {
        return {stdout: location}
      }
    });

    const location = chromiumLocation()

    const { spawnSync } = require( 'child_process' );
    const output = spawnSync(location);

    expect(fs.existsSync(location)).toBe(true)
    expect(output.stdout.toString()).toBe(location)
    done()
  })
})
