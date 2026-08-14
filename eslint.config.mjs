import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

/**
 * ESLint is kept alongside Biome for the Next.js-specific rules Biome has no
 * equivalent for — the React Compiler checks in particular. Formatting, import
 * sorting and general linting belong to Biome (see biome.json).
 */
const config = [
  {
    ignores: ['node_modules/**', '.next/**', 'coverage/**', 'public/sw.js', 'next-env.d.ts'],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]

export default config
