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
