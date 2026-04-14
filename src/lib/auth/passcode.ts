'use server'

import {
  randomBytes,
  pbkdf2Sync,
  timingSafeEqual,
} from 'crypto'

const ALGORITHM = 'sha256'
const ITERATIONS = 310_000
const KEY_LENGTH = 32
const SALT_BYTES = 16

/**
 * Hash a 6-digit passcode using PBKDF2.
 * Returns a string in the format: "pbkdf2:{salt_hex}:{hash_hex}"
 */
export function hashPasscode(passcode: string): string {
  const salt = randomBytes(SALT_BYTES)
  const hash = pbkdf2Sync(passcode, salt, ITERATIONS, KEY_LENGTH, ALGORITHM)
  return `pbkdf2:${salt.toString('hex')}:${hash.toString('hex')}`
}

/**
 * Verify a passcode against a stored PBKDF2 hash.
 * Uses timingSafeEqual to prevent timing-based side-channel attacks.
 */
export function verifyPasscode(passcode: string, stored: string): boolean {
  const parts = stored.split(':')
  if (parts.length !== 3 || parts[0] !== 'pbkdf2') {
    return false
  }

  const salt = Buffer.from(parts[1], 'hex')
  const expectedHash = Buffer.from(parts[2], 'hex')

  const actualHash = pbkdf2Sync(passcode, salt, ITERATIONS, KEY_LENGTH, ALGORITHM)

  try {
    return timingSafeEqual(actualHash, expectedHash)
  } catch {
    return false
  }
}
