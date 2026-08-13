import { findUserByEmail, hashPassword, verifyPassword } from '@/lib/users'

describe('password hashing', () => {
  it('accepts the correct password', () => {
    const hash = hashPassword('correct horse battery')
    expect(verifyPassword('correct horse battery', hash)).toBe(true)
  })

  it('rejects a wrong password', () => {
    const hash = hashPassword('correct horse battery')
    expect(verifyPassword('wrong password', hash)).toBe(false)
  })

  it('salts every hash, so identical passwords differ', () => {
    expect(hashPassword('same')).not.toBe(hashPassword('same'))
  })

  it('rejects a malformed stored hash instead of throwing', () => {
    expect(verifyPassword('anything', 'not-a-hash')).toBe(false)
    expect(verifyPassword('anything', '')).toBe(false)
  })
})

describe('findUserByEmail', () => {
  it('finds the demo user regardless of case and padding', () => {
    const email = process.env.DEMO_USER_EMAIL ?? 'demo@habit.app'
    expect(findUserByEmail(`  ${email.toUpperCase()} `)).not.toBeNull()
  })

  it('returns null for unknown accounts', () => {
    expect(findUserByEmail('nobody@example.com')).toBeNull()
  })
})
