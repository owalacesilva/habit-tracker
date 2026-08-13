import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

/**
 * In-memory user store for the credentials provider.
 *
 * Replace `findUserByEmail` with a real database lookup when persistence
 * lands — the password hashing helpers below can stay as they are.
 */

export interface AppUser {
  id: string
  email: string
  name: string
  /** `salt:derivedKey`, both hex encoded. */
  passwordHash: string
}

const KEY_LENGTH = 64

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')): string {
  return `${salt}:${scryptSync(password, salt, KEY_LENGTH).toString('hex')}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':')
  if (!salt || !key) return false

  const expected = Buffer.from(key, 'hex')
  const actual = scryptSync(password, salt, KEY_LENGTH)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

let cachedDemoUser: AppUser | null = null

function demoUser(): AppUser {
  if (!cachedDemoUser) {
    const email = process.env.DEMO_USER_EMAIL ?? 'demo@habit.app'
    const password = process.env.DEMO_USER_PASSWORD ?? 'demo1234'
    cachedDemoUser = {
      id: 'demo-user',
      email: email.toLowerCase(),
      name: process.env.DEMO_USER_NAME ?? 'Budi',
      passwordHash: hashPassword(password),
    }
  }
  return cachedDemoUser
}

export function findUserByEmail(email: string): AppUser | null {
  const user = demoUser()
  return user.email === email.trim().toLowerCase() ? user : null
}
