import { describe, it, expect } from 'vitest'
import { hashPasscode, verifyPasscode } from '../passcode'

describe('hashPasscode', () => {
  it('returns a string starting with "pbkdf2:"', () => {
    const hash = hashPasscode('123456')
    expect(hash).toMatch(/^pbkdf2:/)
  })

  it('produces different hashes for the same input (random salt)', () => {
    const hash1 = hashPasscode('123456')
    const hash2 = hashPasscode('123456')
    expect(hash1).not.toBe(hash2)
  })
})

describe('verifyPasscode', () => {
  it('returns true for correct passcode', () => {
    const hash = hashPasscode('123456')
    expect(verifyPasscode('123456', hash)).toBe(true)
  })

  it('returns false for incorrect passcode', () => {
    const hash = hashPasscode('123456')
    expect(verifyPasscode('000000', hash)).toBe(false)
  })

  it('roundtrip works for various passcodes', () => {
    for (const code of ['000000', '999999', '123456', '654321']) {
      const hash = hashPasscode(code)
      expect(verifyPasscode(code, hash)).toBe(true)
      expect(verifyPasscode('111111', hash)).toBe(false)
    }
  })
})
