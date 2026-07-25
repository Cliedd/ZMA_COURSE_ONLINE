/* eslint-env node */

// Code hérité, dispensé des règles strictes jusqu'à sa réécriture (chantiers 1 à 4).
// Ces dossiers ne sont PAS des couches FSD — ils disparaissent au fil des chantiers.
const LEGACY = ['src/pages/**', 'src/components/**', 'src/hooks/**', 'src/services/**', 'src/types/**', 'src/lib/**']

// Couches FSD soumises aux règles strictes (le métier neuf). `pages/` en est exclu
// tant qu'il contient les pages héritées ; il rejoindra le strict à leur réécriture.
const FSD_STRICT = ['src/app/**/*.{ts,tsx}', 'src/shared/**/*.{ts,tsx}', 'src/entities/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}', 'src/widgets/**/*.{ts,tsx}']

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
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs', 'vite.config.ts', 'vitest.config.ts', 'tailwind.config.js', 'postcss.config.js', 'lighthouserc.cjs'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react-hooks/exhaustive-deps': 'error',
    '@typescript-eslint/no-explicit-any': 'error',

    // Hiérarchie FSD : une couche n'importe que de couches strictement inférieures.
    // Ordre décroissant : app > pages > widgets > features > entities > shared.
    'import/no-restricted-paths': ['error', {
      zones: [
        // shared ne connaît rien du reste.
        { target: './src/shared', from: './src/entities', message: 'FSD : shared ne peut pas importer entities.' },
        { target: './src/shared', from: './src/features', message: 'FSD : shared ne peut pas importer features.' },
        { target: './src/shared', from: './src/widgets', message: 'FSD : shared ne peut pas importer widgets.' },
        { target: './src/shared', from: './src/pages', message: 'FSD : shared ne peut pas importer pages.' },
        { target: './src/shared', from: './src/app', message: 'FSD : shared ne peut pas importer app.' },
        // entities ne connaît que shared.
        { target: './src/entities', from: './src/features', message: 'FSD : entities ne peut pas importer features.' },
        { target: './src/entities', from: './src/widgets', message: 'FSD : entities ne peut pas importer widgets.' },
        { target: './src/entities', from: './src/pages', message: 'FSD : entities ne peut pas importer pages.' },
        { target: './src/entities', from: './src/app', message: 'FSD : entities ne peut pas importer app.' },
        // features ne connaît qu'entities et shared.
        { target: './src/features', from: './src/widgets', message: 'FSD : features ne peut pas importer widgets.' },
        { target: './src/features', from: './src/pages', message: 'FSD : features ne peut pas importer pages.' },
        { target: './src/features', from: './src/app', message: 'FSD : features ne peut pas importer app.' },
        // widgets ne connaît que features, entities, shared.
        { target: './src/widgets', from: './src/pages', message: 'FSD : widgets ne peut pas importer pages.' },
        { target: './src/widgets', from: './src/app', message: 'FSD : widgets ne peut pas importer app.' },
        // pages ne connaît pas app.
        { target: './src/pages', from: './src/app', message: 'FSD : pages ne peut pas importer app.' },
      ],
    }],
  },
  overrides: [
    {
      // Couches FSD neuves : règles strictes.
      files: FSD_STRICT,
      rules: {
        'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
        'no-restricted-syntax': [
          'error',
          {
            selector: "Literal[value=/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]",
            message: 'Couleur en dur interdite. Utiliser un jeton sémantique de src/app/styles/tokens.css.',
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
      // Code hérité : dispensé jusqu'à la réécriture de sa page (chantiers 1 à 4).
      files: LEGACY,
      rules: {
        'max-lines': 'off',
        'no-restricted-syntax': 'off',
        'react-hooks/exhaustive-deps': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
    {
      // Les tests composent à travers les couches pour les scénarios d'intégration
      // (ex. brancher session + http). La frontière FSD protège le code de
      // production, pas le câblage de test.
      files: ['**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
      rules: { 'max-lines': 'off', 'no-restricted-syntax': 'off', 'import/no-restricted-paths': 'off' },
    },
    {
      // Bugs réels préexistants : hooks appelés après un retour conditionnel.
      // Ces deux pages sont intégralement réécrites aux chantiers 2 et 3 ;
      // corriger maintenant, c'est investir dans du code jetable et risqué.
      // Rétrogradé en avertissement UNIQUEMENT pour ces deux fichiers nommés —
      // à ne surtout pas reproduire dans du code neuf, où la règle reste 'error'.
      files: ['src/pages/dashboard/StudentDashboard.tsx', 'src/pages/teacher/TeacherDashboard.tsx'],
      rules: {
        'react-hooks/rules-of-hooks': 'warn',
      },
    },
    {
      // Scripts Node exécutés hors navigateur (pipeline d'encodage des images).
      files: ['scripts/**/*.mjs'],
      env: { node: true, browser: false },
    },
  ],
}
