import {describe, expect, test} from 'vitest'

import chromiumLocation from '../src/index'

describe('chromium-location module', () => {
  it('returns a string or null without forcing fallbacks', () => {
    const result = chromiumLocation()

    expect(typeof result === 'string' || result === null).toBe(true)
  })
})
