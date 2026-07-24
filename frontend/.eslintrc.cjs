/* eslint-env node */
const LEGACY = ['src/pages/**', 'src/components/**', 'src/hooks/**', 'src/services/**', 'src/store/**', 'src/types/**', 'src/lib/images.ts']

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh', 'import'],
  settings: {
    'import/resolver': { typescript: { project: './tsconfig.json' } },
  },
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs', 'vite.config.ts', 'vitest.config.ts', 'tailwind.config.js', 'postcss.config.js'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react-hooks/exhaustive-deps': 'error',
    '@typescript-eslint/no-explicit-any': 'error',

    // Dépendances à sens unique : features → shell → design → lib
    'import/no-restricted-paths': ['error', {
      zones: [
        { target: './src/lib', from: './src/design', message: 'lib ne peut pas dépendre de design.' },
        { target: './src/lib', from: './src/shell', message: 'lib ne peut pas dépendre de shell.' },
        { target: './src/lib', from: './src/features', message: 'lib ne peut pas dépendre de features.' },
        { target: './src/design', from: './src/shell', message: 'design ne peut pas dépendre de shell.' },
        { target: './src/design', from: './src/features', message: 'design ne peut pas dépendre de features. Une primitive ne connaît pas le métier.' },
        { target: './src/shell', from: './src/features', message: 'shell ne peut pas dépendre de features.' },
      ],
    }],
  },
  overrides: [
    {
      // Code neuf : règles strictes
      files: ['src/app/**/*.{ts,tsx}', 'src/design/**/*.{ts,tsx}', 'src/shell/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}'],
      rules: {
        'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
        'no-restricted-syntax': [
          'error',
          {
            selector: "Literal[value=/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]",
            message: 'Couleur en dur interdite. Utiliser un jeton sémantique de src/design/tokens.css.',
          },
          {
            selector: "Literal[value=/\\b(?:amber|purple|rose|emerald|violet|pink|orange|indigo|sky|cyan|lime|fuchsia)-\\d{2,3}\\b/]",
            message: 'Classe de palette Tailwind interdite. Utiliser un jeton sémantique.',
          },
          {
            selector: "JSXAttribute[name.name='style']",
            message: 'style={{ }} interdit pour ce qui est thémable. Utiliser les classes utilitaires liées aux jetons.',
          },
        ],
      },
    },
    {
      // Code hérité : dispensé jusqu'à la réécriture de sa page (chantiers 1 à 4)
      files: LEGACY,
      rules: {
        'max-lines': 'off',
        'no-restricted-syntax': 'off',
        'react-hooks/exhaustive-deps': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
    {
      files: ['**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
      rules: { 'max-lines': 'off', 'no-restricted-syntax': 'off' },
    },
  ],
}
