import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

describe('install guidance and error helper (chromium)', () => {
  const originalPlatform = process.platform
  const originalEnv = {...process.env}

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    Object.defineProperty(process, 'platform', {value: originalPlatform})
    process.env = {...originalEnv}
    vi.restoreAllMocks()
  })

  it('getInstallGuidance references Puppeteer chromium install', async () => {
    const mod = await import('../src/index')
    const msg = mod.getInstallGuidance()

    expect(msg).toMatch(/@puppeteer\/browsers install chromium/)
    expect(msg).not.toMatch(/chrome@stable/)
    expect(msg).not.toMatch(/CHROME_FOR_TESTING_PATH/)
  })

  it('getInstallGuidance renders caller-provided install steps in order', async () => {
    const mod = await import('../src/index')
    const msg = mod.getInstallGuidance({
      steps: [
        {
          summary: 'Install Chrome for Testing (recommended)',
          command: 'npx extension install chrome'
        },
        {
          summary: 'Install Chromium',
          command: 'npx extension install chromium'
        }
      ]
    })

    expect(msg).toMatch(
      /1\) Install Chrome for Testing \(recommended\)\n {3}npx extension install chrome/
    )
    expect(msg).toMatch(
      /2\) Install Chromium\n {3}npx extension install chromium/
    )
    expect(msg).not.toMatch(/@puppeteer\/browsers install chromium/)
    expect(msg).toMatch(/We couldn't find a Chromium browser/)
  })

  it('getInstallGuidance with empty steps keeps the default hint', async () => {
    const mod = await import('../src/index')

    expect(mod.getInstallGuidance({steps: []})).toBe(mod.getInstallGuidance())
  })

  it('locateChromiumOrExplain throws with guidance when nothing found (darwin)', async () => {
    Object.defineProperty(process, 'platform', {value: 'darwin'})
    vi.doMock('../src/scan/scan-osx-path', () => ({default: () => null}))
    vi.doMock('../src/resolve-puppeteer-cache', () => ({
      resolveFromPuppeteerCache: () => null
    }))
    // Ensure CLI resolution returns no path
    vi.doMock('child_process', () => ({
      execFileSync: () => ''
    }))
    const mod = await import('../src/index')

    expect(() => mod.locateChromiumOrExplain({allowFallback: false})).toThrow(
      /We couldn't find a Chromium browser/
    )
  })
})
