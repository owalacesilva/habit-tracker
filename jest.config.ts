import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Only *.test.* files are suites; __tests__ also holds shared helpers such as
  // the repository contract and the fake API server.
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    // Server-runtime wiring: exercised by the app, not reachable from jsdom.
    '!src/app/**/page.tsx',
    '!src/app/**/layout.tsx',
    // Thin route shells: they compose components that are covered on their own.
    '!src/app/**/loading.tsx',
    '!src/app/**/error.tsx',
    // NextAuth wiring, exercised by running the app in API mode.
    '!src/components/auth/sign-out-button.tsx',
    '!src/app/api/**',
    '!src/auth.ts',
    '!src/proxy.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
  },
}

export default createJestConfig(config)
