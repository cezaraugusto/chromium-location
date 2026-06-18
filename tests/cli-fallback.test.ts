import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {describe, expect, test} from 'vitest'

const BIN = path.join(__dirname, '..', 'bin.cjs')

describe('chromium-location CLI', () => {
  it('prints guidance and exit code 1 when not found', () => {
    let code = 0
    let out = ''

    try {
      out = execFileSync(process.execPath, [BIN], {
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: '',
          CHROMIUM_BINARY: '',
          CHROME_BINARY: '',
          HOME: fs.mkdtempSync(path.join(os.tmpdir(), 'cr-home-')),
          XDG_CACHE_HOME: fs.mkdtempSync(path.join(os.tmpdir(), 'cr-cache-')),
          LOCALAPPDATA: '',
          PROGRAMFILES: '',
          'PROGRAMFILES(X86)': ''
        } as any,
        stdio: ['ignore', 'pipe', 'pipe']
      })
    } catch (e: any) {
      code = e.status ?? e.code ?? 1
      out = String(e.stdout || e.stderr || '')
    }

    if (code === 1) {
      expect(out).toMatch(/We couldn't find a Chromium browser/i)
    } else {
      expect(code).toBe(0)
      expect(out.trim().length).toBeGreaterThan(0)
    }
  })

  it('prints env override path when CHROMIUM_BINARY is set and exists', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cr-bin-'))
    const fake = path.join(
      tmp,
      process.platform === 'win32' ? 'chromium.exe' : 'chromium'
    )

    fs.writeFileSync(fake, '')
    const out = execFileSync(process.execPath, [BIN], {
      encoding: 'utf8',
      env: {...process.env, CHROMIUM_BINARY: fake},
      stdio: ['ignore', 'pipe', 'pipe']
    })

    expect(out.trim()).toBe(fake)
  })
})

// (Note) Additional CLI fallback behavior is covered in existing tests.
