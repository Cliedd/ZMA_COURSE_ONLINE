# Chantier 0 — Socle du frontend ZMA Course Online

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire le socle technique et visuel sur lequel les 23 pages seront rebâties — jetons, polices, thème, primitives accessibles, châssis de navigation (dont la navigation mobile aujourd'hui absente), couche HTTP, i18n, et l'outillage qui rend ces conventions inviolables.

**Architecture:** Organisation par domaine métier avec dépendances à sens unique (`features → shell → design → lib`). Les jetons sémantiques CSS sont la source unique de vérité pour la couleur ; un test automatisé les lit et vérifie leurs contrastes WCAG. Les règles ESLint transforment les conventions d'architecture en erreurs de compilation.

**Tech Stack:** React 18.3 · TypeScript 5.9 (strict) · Vite 5.4 · Tailwind 3.4 · Radix UI · TanStack Query 5 · Zustand 4 · React Hook Form + Zod · i18next · Vitest + Testing Library + MSW + jest-axe

**Spec de référence :** `docs/superpowers/specs/2026-07-24-refonte-frontend-design.md`

---

## Global Constraints

Ces contraintes s'appliquent à **toutes** les tâches de ce plan. Elles ne sont pas répétées ensuite.

- **Répertoire de travail :** `/home/ryzen/ZMA_COURSE_ONLINE/frontend`. Tous les chemins sont relatifs à ce répertoire sauf mention contraire.
- **Aucune couleur en dur.** Jamais d'hexadécimal ni de classe de palette Tailwind (`amber-*`, `purple-*`, `rose-*`, `emerald-*`, `violet-*`, `pink-*`, `blue-900`…) dans un fichier `.tsx`. Uniquement des jetons sémantiques. Seule exception : `src/design/tokens.css`, où les valeurs sont définies.
- **Plafond de 200 lignes par fichier** dans `src/app`, `src/design`, `src/shell`, `src/lib`, `src/features`.
- **Dépendances à sens unique :** `features → shell → design → lib`. Jamais l'inverse.
- **Zéro `any`.** `tsc --noEmit` doit passer après chaque tâche.
- **Rayon 2 px, aucune ombre décorative, mouvement 150–250 ms ease-out**, `prefers-reduced-motion` respecté.
- **Corps de texte minimum 16 px, cibles tactiles minimum 44 × 44 px.**
- **Langue de l'interface : français.** Toute chaîne visible passe par i18next à partir de la tâche 10.
- **Routes en anglais** (décision D13 du spec). `/dashboard` est gelée : `services/zma-auth/.../OAuth2SuccessHandler.java:66` y redirige en dur.
- **Commit après chaque tâche**, message en français, préfixe conventionnel (`chore:`, `feat:`, `test:`, `refactor:`).

### Valeurs des jetons — à copier verbatim

Registre clair :
`--paper #FAF8F3` · `--surface #FFFFFF` · `--ink #12243D` · `--ink-muted #4A5A70` · `--ink-faint #7A8798` · `--line #E2DDD2` · `--blue #1A3C6E` · `--gold #C8960C` · `--gold-ink #7A5E10`

Registre sombre :
`--scene #0A0E14` · `--scene-surface #11161F` · `--scene-ink #F2EFE9` · `--gold` (sombre) `#D9AE3E`

États : `--success #1F6B4E` · `--warning #7A5E10` · `--danger #A3281E` · `--info #0D6E6E`

**Règle de l'or :** sur fond clair, `#C8960C` mesure 2,53:1 — décoratif uniquement (filets, séparateurs, aplats). Jamais de texte, jamais d'icône porteuse de sens. Tout ce qui doit être lu utilise `--gold-ink`.

---

## Structure des fichiers

Fichiers **créés** par ce chantier :

| Fichier | Responsabilité |
|---|---|
| `.eslintrc.cjs` | Règles architecturales — dépendances, taille, couleurs, hooks |
| `vitest.config.ts` | Configuration des tests |
| `src/test/setup.ts` | Setup global des tests (jest-dom, axe, nettoyage) |
| `src/test/msw.ts` | Serveur MSW partagé |
| `src/design/tokens.css` | **Source unique de vérité de la couleur**, clair + sombre |
| `src/design/fonts.css` | Import des 3 familles Fontsource |
| `src/design/tokens.contrast.test.ts` | Lit `tokens.css` et vérifie les contrastes WCAG |
| `src/design/primitives/button.tsx` | Bouton, variantes `cva` |
| `src/design/primitives/badge.tsx` | Badge / eyebrow |
| `src/design/primitives/card.tsx` | Carte par composition |
| `src/design/primitives/skeleton.tsx` | Squelette de chargement |
| `src/design/primitives/field.tsx` | Champ de formulaire accessible |
| `src/design/primitives/input.tsx` | Champ de saisie |
| `src/design/primitives/dialog.tsx` | Dialogue Radix |
| `src/design/primitives/menu.tsx` | Menu déroulant Radix |
| `src/design/primitives/picture.tsx` | Image responsive AVIF/WebP/JPEG |
| `src/design/images/manifest.ts` | Inventaire des visuels + emplacements du matériel ZTF |
| `src/lib/http.ts` | Client HTTP, `AppError`, refresh 401, `returnTo` |
| `src/lib/cn.ts` | Fusion de classes |
| `src/i18n/index.ts` | Initialisation i18next |
| `src/i18n/fr.json` | Chaînes françaises |
| `src/shell/ThemeProvider.tsx` | Thème clair/sombre sans FOUC |
| `src/shell/ThemeToggle.tsx` | Sélecteur de thème |
| `src/shell/Header.tsx` | En-tête desktop |
| `src/shell/MobileNav.tsx` | **Tiroir de navigation mobile — absent aujourd'hui** |
| `src/shell/Footer.tsx` | Pied de page |
| `src/shell/Breadcrumb.tsx` | Fil d'Ariane |
| `src/shell/layouts/PublicLayout.tsx` | Gabarit public |
| `src/shell/layouts/AppLayout.tsx` | Gabarit applicatif |
| `src/shell/layouts/ImmersiveLayout.tsx` | Gabarit sombre du lecteur |
| `src/shell/layouts/AuthLayout.tsx` | Gabarit d'authentification |
| `src/app/router.tsx` | Routes en `React.lazy` |
| `src/app/providers.tsx` | Query, Theme, i18n |
| `src/app/guards.tsx` | `RequireAuth`, `RequireRole` |
| `src/app/NotFound.tsx` | Page 404 |
| `src/app/OAuthTokenCapture.tsx` | Capture le `?token=` de la redirection Google |
| `src/shell/navigation.ts` | Structure du méga-menu |
| `scripts/encode-images.mjs` | Encodage et étalonnage de la photothèque |
| `lighthouserc.cjs` | Budget de performance opposable |
| `.github/workflows/frontend.yml` | Intégration continue (racine du dépôt) |

Fichiers **supprimés** : `frontend/frontend/` (2 fichiers dupliqués), `src/components/magicui/` (9 fichiers), `src/components/layout/RootLayout.tsx` et `src/components/layout/Header.tsx` (remplacés par le châssis).

Fichiers **modifiés** : `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `src/index.css`, `src/main.tsx`, `src/App.tsx`, `index.html`, `package.json`.

---

## Task 1: Nettoyage du code mort et configuration ESLint architecturale

Le script `npm run lint` existe depuis le début du projet et **n'a jamais fonctionné** : aucun fichier de configuration ESLint n'a jamais été créé. Cette tâche le rend opérationnel et lui fait porter les règles d'architecture.

**Files:**
- Delete: `frontend/frontend/` (répertoire entier — 2 fichiers dupliqués commités par erreur)
- Delete: `src/components/magicui/` (9 fichiers — décision D6 du spec)
- Create: `.eslintrc.cjs`
- Modify: `tsconfig.json`
- Modify: `vite.config.ts`
- Modify: `package.json` (dépendances)

**Interfaces:**
- Consumes: rien (première tâche)
- Produces: l'alias de chemin `@/*` → `src/*`, utilisable par toutes les tâches suivantes. La commande `npm run lint` fonctionnelle.

- [ ] **Step 1: Vérifier l'état de départ**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run lint 2>&1 | tail -5
```

Attendu : `ESLint couldn't find a configuration file.` — c'est bien le point de départ.

- [ ] **Step 2: Supprimer les fichiers morts**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
git rm -r --quiet frontend/
git rm -r --quiet src/components/magicui/
grep -rn "magicui" --include=*.tsx --include=*.ts src/ || echo "✓ aucune référence restante à magicui"
```

Attendu : `✓ aucune référence restante à magicui`. Si des références subsistent, elles se trouvent dans des pages qui seront réécrites aux chantiers 1–4 ; supprimer l'import et l'usage à la main.

- [ ] **Step 3: Retirer la dépendance d'animation en double**

`framer-motion@11` et `motion@12` sont la même bibliothèque, installée deux fois. On garde `framer-motion`, prescrite par le CDC.

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
grep -rn "from 'motion'\|from \"motion\"" --include=*.tsx --include=*.ts src/ || echo "✓ 'motion' n'est importé nulle part"
npm uninstall motion next-themes
```

`next-themes` est également retiré : la tâche 4 implémente un fournisseur de thème adapté à Vite (next-themes vise Next.js et ne gère pas le FOUC hors SSR).

- [ ] **Step 4: Installer les dépendances de lint manquantes**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm install -D eslint-plugin-import@^2.31.0 eslint-import-resolver-typescript@^3.7.0
```

- [ ] **Step 5: Créer la configuration ESLint**

Créer `.eslintrc.cjs` :

```js
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
```

Le tableau `LEGACY` est la dette explicite : chaque chantier suivant retire ses propres chemins de cette liste. Quand `LEGACY` est vide, la migration est terminée.

- [ ] **Step 6: Ajouter l'alias de chemin et durcir TypeScript**

Remplacer `tsconfig.json` par :

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Déclarer l'alias à Vite**

Remplacer `vite.config.ts` par :

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/v1': { target: 'http://localhost:8080', changeOrigin: true },
      '/oauth2': { target: 'http://localhost:8081', changeOrigin: true },
      '/login/oauth2': { target: 'http://localhost:8081', changeOrigin: true },
    },
  },
})
```

- [ ] **Step 8: Vérifier que le lint fonctionne enfin**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npx eslint . --ext ts,tsx 2>&1 | tail -20
npx tsc --noEmit && echo "✓ TSC OK"
```

Attendu : ESLint s'exécute — il peut signaler des avertissements sur le code hérité, mais **plus aucune erreur de configuration**. `noUncheckedIndexedAccess` peut faire apparaître des erreurs TypeScript dans le code hérité ; les corriger en ajoutant les gardes nécessaires, ou ajouter le fichier concerné à `LEGACY` si sa réécriture est prévue à un chantier ultérieur.

- [ ] **Step 9: Commit**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
git add -A frontend/
git commit -m "chore: nettoyage du code mort et configuration ESLint architecturale

- Suppression de frontend/frontend/ (2 fichiers dupliqués commités par erreur)
- Suppression de src/components/magicui/ (9 composants décoratifs, décision D6)
- Suppression des dépendances motion (doublon de framer-motion) et next-themes
- Première configuration ESLint du projet : le script npm run lint existait
  depuis le début sans jamais avoir fonctionné
- Règles architecturales : dépendances à sens unique, plafond de 200 lignes,
  interdiction des couleurs en dur
- Alias @/* et noUncheckedIndexedAccess"
```

---

## Task 2: Harnais de tests

Aucune infrastructure de test n'existe aujourd'hui, alors que le CDC exige 75 % de couverture. Cette tâche la met en place — elle doit précéder toutes les autres, qui sont écrites en TDD.

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/msw.ts`
- Create: `src/test/smoke.test.ts`
- Modify: `package.json` (scripts + dépendances)

**Interfaces:**
- Consumes: l'alias `@/*` de la tâche 1
- Produces: `mswServer` (exporté depuis `@/test/msw`) utilisé par la tâche 5 ; les commandes `npm test`, `npm run test:run`, `npm run coverage`

- [ ] **Step 1: Installer les dépendances de test**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm install -D vitest@^2.1.8 @vitest/coverage-v8@^2.1.8 jsdom@^25.0.1 \
  @testing-library/react@^16.1.0 @testing-library/user-event@^14.5.2 \
  @testing-library/jest-dom@^6.6.3 jest-axe@^9.0.0 @types/jest-axe@^3.5.9 \
  msw@^2.7.0
```

- [ ] **Step 2: Créer la configuration Vitest**

Créer `vitest.config.ts` :

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/app/**', 'src/design/**', 'src/shell/**', 'src/lib/**', 'src/features/**'],
      exclude: ['**/*.test.{ts,tsx}', 'src/test/**'],
      thresholds: { lines: 75, functions: 75, branches: 70, statements: 75 },
    },
  },
})
```

Le seuil de 75 % ne porte que sur le code neuf. Il ne peut pas s'appliquer au code hérité, qui n'a aucun test et sera remplacé.

- [ ] **Step 3: Créer le setup global**

Créer `src/test/setup.ts` :

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'
import { mswServer } from './msw'

expect.extend(toHaveNoViolations)

beforeAll(() => mswServer.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  mswServer.resetHandlers()
})
afterAll(() => mswServer.close())

// jsdom n'implémente pas matchMedia — requis par le fournisseur de thème (tâche 4)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
```

- [ ] **Step 4: Créer le serveur MSW**

Créer `src/test/msw.ts` :

```ts
import { setupServer } from 'msw/node'

/** Serveur MSW partagé. Les tests ajoutent leurs gestionnaires via mswServer.use(...). */
export const mswServer = setupServer()
```

- [ ] **Step 5: Écrire le test de fumée**

Créer `src/test/smoke.test.ts` :

```ts
import { describe, it, expect } from 'vitest'

describe('harnais de tests', () => {
  it('exécute les tests dans un environnement jsdom', () => {
    expect(typeof document).toBe('object')
    expect(document.createElement('div')).toBeInstanceOf(HTMLElement)
  })

  it('expose les matchers jest-dom', () => {
    const el = document.createElement('button')
    el.textContent = 'Explorer'
    document.body.appendChild(el)
    expect(el).toBeVisible()
    expect(el).toHaveTextContent('Explorer')
  })

  it('résout l\'alias matchMedia utilisé par le fournisseur de thème', () => {
    expect(window.matchMedia('(prefers-color-scheme: dark)').matches).toBe(false)
  })
})
```

- [ ] **Step 6: Ajouter les scripts npm**

Dans `package.json`, remplacer le bloc `"scripts"` par :

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run",
  "coverage": "vitest run --coverage",
  "typecheck": "tsc --noEmit",
  "verify": "npm run typecheck && npm run lint && npm run test:run"
}
```

`--max-warnings 0` est retiré tant que le code hérité produit des avertissements ; il sera remis au chantier 5.

- [ ] **Step 7: Lancer les tests**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run
```

Attendu : `Test Files  1 passed (1)` · `Tests  3 passed (3)`

- [ ] **Step 8: Commit**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
git add -A frontend/
git commit -m "test: harnais de tests Vitest + Testing Library + MSW + jest-axe

Aucune infrastructure de test n'existait, alors que le CDC exige 75 %
de couverture. Seuil appliqué au code neuf uniquement.
Ajout du script npm run verify (typecheck + lint + tests)."
```

---

## Task 3: Jetons de design, polices auto-hébergées, et test de contraste automatisé

**Files:**
- Create: `src/design/tokens.css`
- Create: `src/design/fonts.css`
- Create: `src/design/tokens.contrast.test.ts`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: le harnais de tests de la tâche 2
- Produces: les classes utilitaires Tailwind `bg-paper`, `bg-surface`, `text-ink`, `text-ink-muted`, `text-ink-faint`, `border-line`, `text-blue`, `bg-gold`, `text-gold-ink`, `bg-scene`, `text-success|warning|danger|info`, et les familles `font-serif`, `font-sans`, `font-mono`. Utilisées par toutes les tâches suivantes.

- [ ] **Step 1: Vérifier les noms de paquets Fontsource puis installer**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm view @fontsource-variable/source-serif-4 version
npm view @fontsource-variable/inter version
npm view @fontsource/ibm-plex-mono version
```

Les trois doivent renvoyer un numéro de version. Puis :

```bash
npm install @fontsource-variable/source-serif-4 @fontsource-variable/inter @fontsource/ibm-plex-mono
```

- [ ] **Step 2: Écrire le test de contraste — il doit échouer**

Créer `src/design/tokens.contrast.test.ts` :

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/** Lit tokens.css et en extrait les couples nom → valeur hexadécimale. */
function readTokens(selector: string): Record<string, string> {
  const css = readFileSync(resolve(__dirname, 'tokens.css'), 'utf8')
  const block = css.split(selector)[1]?.split('}')[0] ?? ''
  const tokens: Record<string, string> = {}
  for (const match of block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    const [, name, value] = match
    if (name && value) tokens[name] = value
  }
  return tokens
}

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const linear = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!
}

export function contrastRatio(a: string, b: string): number {
  const [high, low] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (high! + 0.05) / (low! + 0.05)
}

describe('jetons du registre clair', () => {
  const t = readTokens(':root')

  it('définit tous les jetons attendus', () => {
    for (const name of ['paper', 'surface', 'ink', 'ink-muted', 'ink-faint', 'line', 'blue', 'gold', 'gold-ink', 'success', 'warning', 'danger', 'info']) {
      expect(t[name], `jeton --${name} manquant`).toBeDefined()
    }
  })

  it.each([
    ['ink', 4.5],
    ['ink-muted', 4.5],
    ['blue', 4.5],
    ['gold-ink', 4.5],
    ['success', 4.5],
    ['warning', 4.5],
    ['danger', 4.5],
    ['info', 4.5],
  ])('--%s atteint le seuil AA texte normal (%s:1) sur --paper', (name, min) => {
    expect(contrastRatio(t[name]!, t['paper']!)).toBeGreaterThanOrEqual(min)
  })

  it('--ink-faint atteint le seuil gros texte (3:1) mais pas celui du texte normal', () => {
    const ratio = contrastRatio(t['ink-faint']!, t['paper']!)
    expect(ratio).toBeGreaterThanOrEqual(3)
    expect(ratio).toBeLessThan(4.5)
  })

  it('--gold est décoratif : il échoue le seuil de 3:1 sur fond clair', () => {
    // Documente la contrainte du spec § 5.1 : sur fond clair l'or de marque
    // ne peut porter ni texte ni icône porteuse de sens.
    expect(contrastRatio(t['gold']!, t['paper']!)).toBeLessThan(3)
  })

  it('--gold-ink reste lisible aussi sur --surface (blanc)', () => {
    expect(contrastRatio(t['gold-ink']!, t['surface']!)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('jetons du registre sombre', () => {
  const t = readTokens('[data-theme=\'dark\']')

  it.each([
    ['scene-ink', 4.5],
    ['gold', 4.5],
  ])('--%s atteint le seuil AA (%s:1) sur --scene', (name, min) => {
    expect(contrastRatio(t[name]!, t['scene']!)).toBeGreaterThanOrEqual(min)
  })
})
```

- [ ] **Step 3: Lancer le test pour vérifier qu'il échoue**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/design/tokens.contrast.test.ts
```

Attendu : ÉCHEC avec `ENOENT: no such file or directory ... tokens.css`

- [ ] **Step 4: Créer les jetons**

Créer `src/design/tokens.css` :

```css
/* Source unique de vérité de la couleur.
   Vérifié par src/design/tokens.contrast.test.ts — ne pas modifier une
   valeur sans relancer ce test. */

:root {
  color-scheme: light;

  --paper: #FAF8F3;
  --surface: #FFFFFF;
  --ink: #12243D;
  --ink-muted: #4A5A70;
  --ink-faint: #7A8798;
  --line: #E2DDD2;
  --blue: #1A3C6E;
  --gold: #C8960C;
  --gold-ink: #7A5E10;

  --success: #1F6B4E;
  --warning: #7A5E10;
  --danger: #A3281E;
  --info: #0D6E6E;

  --radius: 2px;
  --shadow-overlay: 0 8px 24px -8px rgb(18 36 61 / 0.18);
  --duration: 180ms;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}

[data-theme='dark'] {
  color-scheme: dark;

  --paper: #0A0E14;
  --surface: #11161F;
  --ink: #F2EFE9;
  --ink-muted: #A8B0BC;
  --ink-faint: #78828F;
  --line: #222A36;
  --blue: #7FA8DC;
  --gold: #D9AE3E;
  --gold-ink: #D9AE3E;

  --scene: #0A0E14;
  --scene-surface: #11161F;
  --scene-ink: #F2EFE9;

  --success: #4FBF8B;
  --warning: #D9AE3E;
  --danger: #E8776A;
  --info: #4FBDBD;

  --shadow-overlay: 0 8px 24px -8px rgb(0 0 0 / 0.6);
}

/* Le registre « scène » est aussi disponible en mode clair, pour les
   surfaces qui sont sombres par nature : hero, lecteur de cours. */
:root {
  --scene: #0A0E14;
  --scene-surface: #11161F;
  --scene-ink: #F2EFE9;
  --scene-gold: #D9AE3E;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 5: Relancer le test de contraste**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/design/tokens.contrast.test.ts
```

Attendu : tous les tests passent. Si un seuil échoue, **assombrir le jeton fautif** plutôt que baisser le seuil.

- [ ] **Step 6: Créer le fichier de polices**

Créer `src/design/fonts.css` :

```css
/* Polices auto-hébergées via Fontsource — aucune requête réseau tierce.
   Sous-ensembles latin et latin-ext (accents français). */
@import '@fontsource-variable/source-serif-4/index.css';
@import '@fontsource-variable/inter/index.css';
@import '@fontsource/ibm-plex-mono/400.css';
@import '@fontsource/ibm-plex-mono/500.css';
```

- [ ] **Step 7: Relier les jetons à Tailwind**

Remplacer `tailwind.config.js` par :

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1320px' } },
    extend: {
      colors: {
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        ink: { DEFAULT: 'var(--ink)', muted: 'var(--ink-muted)', faint: 'var(--ink-faint)' },
        line: 'var(--line)',
        blue: 'var(--blue)',
        gold: { DEFAULT: 'var(--gold)', ink: 'var(--gold-ink)' },
        scene: { DEFAULT: 'var(--scene)', surface: 'var(--scene-surface)', ink: 'var(--scene-ink)', gold: 'var(--scene-gold)' },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
      },
      fontFamily: {
        serif: ['"Source Serif 4 Variable"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['3.375rem', { lineHeight: '1.05', letterSpacing: '-0.022em' }],
        h1: ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.018em' }],
        h2: ['1.875rem', { lineHeight: '1.18', letterSpacing: '-0.012em' }],
        h3: ['1.375rem', { lineHeight: '1.28' }],
        body: ['1rem', { lineHeight: '1.62' }],
        sm: ['0.875rem', { lineHeight: '1.55' }],
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.22em' }],
      },
      borderRadius: { DEFAULT: 'var(--radius)', sm: 'var(--radius)', md: 'var(--radius)', lg: 'var(--radius)', xl: 'var(--radius)' },
      boxShadow: { overlay: 'var(--shadow-overlay)', none: 'none' },
      transitionTimingFunction: { brand: 'var(--ease)' },
      transitionDuration: { brand: 'var(--duration)' },
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down var(--duration) var(--ease)',
        'accordion-up': 'accordion-up var(--duration) var(--ease)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

- [ ] **Step 8: Nettoyer la feuille de styles globale**

Remplacer intégralement `src/index.css` par :

```css
@import './design/fonts.css';
@import './design/tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { @apply border-line; }

  html { scroll-behavior: smooth; }

  body {
    @apply bg-paper text-ink font-sans text-body;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4 { @apply font-serif font-normal text-balance; }

  /* Focus visible sur les deux registres — jamais d'outline:none sans remplacement */
  :focus-visible {
    outline: 2px solid var(--gold-ink);
    outline-offset: 2px;
  }
}

@layer components {
  .eyebrow {
    @apply font-sans text-eyebrow font-bold uppercase text-gold-ink;
  }
  .rule {
    @apply h-px w-11 bg-gold;
  }
}
```

Tout ce qui a été supprimé de ce fichier — `@import` Google Fonts, `.gradient-*`, `.text-gradient*`, `.glass*`, `.noise`, `.img-overlay*`, `.music-note`, `.skeleton`, les styles de barre de défilement — relève des décisions D4 et D6 du spec.

- [ ] **Step 9: Vérifier que tout tient debout**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/design/tokens.contrast.test.ts
npm run build 2>&1 | tail -20
```

Attendu : tests verts, et la compilation réussit. Elle peut échouer sur des pages héritées qui référencent des classes supprimées (`gradient-hero`, `text-gradient`, `section-pad`) — les remplacer par le jeton équivalent, ou par `bg-scene` pour `gradient-hero`. Ces pages seront de toute façon réécrites aux chantiers 1 à 4.

- [ ] **Step 10: Commit**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
git add -A frontend/
git commit -m "feat: jetons de design, polices auto-hébergées et test de contraste

- tokens.css devient la source unique de vérité de la couleur
- tokens.contrast.test.ts lit ce fichier et vérifie les seuils WCAG AA :
  une valeur ne peut plus être modifiée sans que le test le signale
- Documente par un test que --gold (2,53:1 sur papier) est décoratif
- 3 familles Fontsource auto-hébergées, fin de l'@import Google Fonts
  qui bloquait le rendu ; Playfair Display supprimée (D4)
- Rayon 2 px, aucune ombre décorative hors overlays (D5)
- prefers-reduced-motion respecté globalement"
```

---

## Task 4: Thème clair/sombre sans FOUC

**Files:**
- Create: `src/shell/ThemeProvider.tsx`
- Create: `src/shell/ThemeProvider.test.tsx`
- Create: `src/shell/ThemeToggle.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: les jetons de la tâche 3
- Produces: `<ThemeProvider>` et le hook `useTheme(): { theme: Theme; resolved: 'light' | 'dark'; setTheme: (t: Theme) => void }` où `type Theme = 'light' | 'dark' | 'system'`. Consommés par les tâches 11 et 12.

- [ ] **Step 1: Écrire le test — il doit échouer**

Créer `src/shell/ThemeProvider.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeProvider'

function Probe() {
  const { theme, resolved, setTheme } = useTheme()
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolved}</span>
      <button onClick={() => setTheme('dark')}>sombre</button>
      <button onClick={() => setTheme('light')}>clair</button>
    </>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('démarre en mode système et se résout en clair quand le système est clair', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved')).toHaveTextContent('light')
  })

  it('pose data-theme="dark" sur <html> au passage en sombre', async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'sombre' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
  })

  it('persiste le choix dans localStorage', async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'sombre' }))
    expect(localStorage.getItem('zma-theme')).toBe('dark')
  })

  it('relit le choix persisté au montage', () => {
    localStorage.setItem('zma-theme', 'dark')
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('lève une erreur explicite si useTheme est appelé hors du fournisseur', () => {
    expect(() => render(<Probe />)).toThrow('useTheme doit être utilisé dans un ThemeProvider')
  })
})
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/shell/ThemeProvider.test.tsx
```

Attendu : ÉCHEC — `Failed to resolve import "./ThemeProvider"`

- [ ] **Step 3: Implémenter le fournisseur**

Créer `src/shell/ThemeProvider.tsx` :

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'
type Resolved = 'light' | 'dark'

const STORAGE_KEY = 'zma-theme'

interface ThemeContextValue {
  theme: Theme
  resolved: Resolved
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStored(): Theme {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system'
}

function systemPreference(): Resolved {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStored)
  const [systemResolved, setSystemResolved] = useState<Resolved>(systemPreference)

  // Synchronisation avec un système extérieur à React : autorisé (spec § 7.4)
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemResolved(media.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolved: Resolved = theme === 'system' ? systemResolved : theme

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved)
  }, [resolved])

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }, [])

  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme doit être utilisé dans un ThemeProvider')
  return ctx
}
```

- [ ] **Step 4: Lancer le test pour vérifier qu'il passe**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/shell/ThemeProvider.test.tsx
```

Attendu : `Tests  5 passed (5)`

- [ ] **Step 5: Supprimer le FOUC**

Le fournisseur pose `data-theme` après l'hydratation de React : entre le premier octet et ce moment, une page sombre s'affiche en clair. Un script bloquant dans le `<head>` résout ça.

Remplacer `index.html` par :

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#12243D" />
    <link rel="manifest" href="/manifest.json" />
    <title>ZTF Music Académie — Formation musicale supérieure</title>
    <meta name="description" content="Cinq départements, vingt-six parcours du certificat au doctorat. Les méthodes des grandes académies, enseignées en Afrique." />
    <script>
      // Pose data-theme avant le premier rendu — supprime le flash de thème clair.
      // Doit rester synchrone et en dur : toute dépendance retarderait son exécution.
      (function () {
        try {
          var stored = localStorage.getItem('zma-theme')
          var resolved = (stored === 'light' || stored === 'dark')
            ? stored
            : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          document.documentElement.setAttribute('data-theme', resolved)
        } catch (e) {
          document.documentElement.setAttribute('data-theme', 'light')
        }
      })()
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Créer le sélecteur de thème**

Créer `src/shell/ThemeToggle.tsx` :

```tsx
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { resolved, setTheme } = useTheme()
  const next = resolved === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={next === 'dark' ? 'Activer le thème sombre' : 'Activer le thème clair'}
      className="grid min-h-touch min-w-touch place-items-center rounded border border-line text-ink-muted transition-colors duration-brand ease-brand hover:text-ink"
    >
      {resolved === 'dark' ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  )
}
```

- [ ] **Step 7: Vérifier l'ensemble**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/shell/
npm run typecheck
```

Attendu : tests verts, aucune erreur TypeScript.

- [ ] **Step 8: Commit**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
git add -A frontend/
git commit -m "feat: thème clair/sombre sans FOUC

next-themes était installé depuis le début sans jamais être importé.
Remplacé par un fournisseur adapté à Vite : next-themes gère le FOUC
via le SSR de Next, mécanisme absent d'une SPA.

- Script bloquant dans <head> : data-theme posé avant le premier rendu
- Préférence système suivie en temps réel, choix explicite persisté
- Sélecteur accessible, cible tactile 44 x 44 px"
```

---

## Task 5: Couche HTTP unifiée — AppError, rafraîchissement de session, returnTo

Deux défauts réels sont corrigés ici. **Premièrement**, l'intercepteur actuel ne gère pas le 401 : à l'expiration du JWT, tous les appels échouent en silence et l'utilisateur voit des pages vides. **Deuxièmement**, `POST /auth/login` renvoie un `refreshToken` que `authStore.setToken()` **jette** — il ne conserve que le JWT. Le rafraîchissement de session n'a donc jamais été possible, alors que `POST /auth/refresh` existe côté backend depuis le début.

**Files:**
- Create: `src/lib/http.ts`
- Create: `src/lib/http.test.ts`
- Create: `src/lib/cn.ts`
- Modify: `src/store/authStore.ts`

**Interfaces:**
- Consumes: le harnais MSW de la tâche 2
- Produces:
  - `class AppError extends Error { status: number; code: string; fieldErrors?: Record<string,string> }`
  - `get<T>(url: string, config?: AxiosRequestConfig, schema?: ZodType<T>): Promise<T>`
  - `post<T>(url: string, body?: unknown, schema?: ZodType<T>): Promise<T>`
  - `patch<T>`, `put<T>`, `del<T>` — mêmes signatures
  - `cn(...classes: ClassValue[]): string`
  - `useAuthStore` gagne `refreshToken: string | null` et `setSession(r: AuthResponse): void`

- [ ] **Step 1: Écrire le test — il doit échouer**

Créer `src/lib/http.test.ts` :

```ts
import { http, HttpResponse } from 'msw'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { z } from 'zod'
import { mswServer } from '@/test/msw'
import { AppError, get, post } from './http'
import { useAuthStore } from '@/store/authStore'

const API = 'http://localhost/api/v1'

/** JWT non signé, valide jusqu'en 2099 — suffisant pour authStore qui ne lit que exp/sub/role. */
function fakeJwt(exp = 4102444800): string {
  const payload = btoa(JSON.stringify({ sub: 'etudiant@ztf.cm', role: 'STUDENT', exp }))
  return `header.${payload}.signature`
}

beforeEach(() => {
  useAuthStore.getState().logout()
  localStorage.clear()
})

describe('get', () => {
  it('renvoie la donnée validée par le schéma', async () => {
    mswServer.use(http.get(`${API}/courses`, () => HttpResponse.json([{ id: '1', title: 'Piano' }])))
    const schema = z.array(z.object({ id: z.string(), title: z.string() }))
    await expect(get('/courses', undefined, schema)).resolves.toEqual([{ id: '1', title: 'Piano' }])
  })

  it('lève une AppError si la réponse ne correspond pas au schéma', async () => {
    mswServer.use(http.get(`${API}/courses`, () => HttpResponse.json([{ id: 1 }])))
    const schema = z.array(z.object({ id: z.string(), title: z.string() }))
    await expect(get('/courses', undefined, schema)).rejects.toBeInstanceOf(AppError)
  })

  it('joint le jeton d\'authentification quand la session existe', async () => {
    useAuthStore.getState().setSession({ token: fakeJwt(), refreshToken: 'r1', email: 'e@z.cm', role: 'STUDENT', id: '1', expiresIn: 3600 })
    let seen: string | null = null
    mswServer.use(http.get(`${API}/me`, ({ request }) => {
      seen = request.headers.get('Authorization')
      return HttpResponse.json({ ok: true })
    }))
    await get('/me')
    expect(seen).toBe(`Bearer ${fakeJwt()}`)
  })
})

describe('normalisation des erreurs', () => {
  it('transforme une erreur HTTP en AppError avec son statut', async () => {
    mswServer.use(http.get(`${API}/courses`, () => HttpResponse.json({ message: 'Cours introuvable' }, { status: 404 })))
    await expect(get('/courses')).rejects.toMatchObject({ status: 404, message: 'Cours introuvable' })
  })

  it('remonte les erreurs de champ renvoyées par Spring', async () => {
    mswServer.use(http.post(`${API}/auth/register`, () =>
      HttpResponse.json({ message: 'Validation échouée', fieldErrors: { email: 'Adresse déjà utilisée' } }, { status: 400 }),
    ))
    await expect(post('/auth/register', {})).rejects.toMatchObject({
      status: 400,
      fieldErrors: { email: 'Adresse déjà utilisée' },
    })
  })

  it('donne un message lisible quand le réseau est injoignable', async () => {
    mswServer.use(http.get(`${API}/courses`, () => HttpResponse.error()))
    await expect(get('/courses')).rejects.toMatchObject({ status: 0, code: 'NETWORK' })
  })
})

describe('rafraîchissement de session sur 401', () => {
  it('rafraîchit le jeton puis rejoue la requête une seule fois', async () => {
    useAuthStore.getState().setSession({ token: fakeJwt(1), refreshToken: 'refresh-1', email: 'e@z.cm', role: 'STUDENT', id: '1', expiresIn: 0 })
    let attempts = 0
    mswServer.use(
      http.get(`${API}/enrollments/me`, () => {
        attempts += 1
        return attempts === 1
          ? HttpResponse.json({ message: 'Expired' }, { status: 401 })
          : HttpResponse.json([{ id: 'e1' }])
      }),
      http.post(`${API}/auth/refresh`, () =>
        HttpResponse.json({ token: fakeJwt(), refreshToken: 'refresh-2', email: 'e@z.cm', role: 'STUDENT', id: '1', expiresIn: 3600 }),
      ),
    )

    await expect(get('/enrollments/me')).resolves.toEqual([{ id: 'e1' }])
    expect(attempts).toBe(2)
    expect(useAuthStore.getState().refreshToken).toBe('refresh-2')
  })

  it('déconnecte et mémorise la page en cours quand le rafraîchissement échoue', async () => {
    useAuthStore.getState().setSession({ token: fakeJwt(1), refreshToken: 'perime', email: 'e@z.cm', role: 'STUDENT', id: '1', expiresIn: 0 })
    const onUnauthorized = vi.fn()
    mswServer.use(
      http.get(`${API}/enrollments/me`, () => HttpResponse.json({ message: 'Expired' }, { status: 401 })),
      http.post(`${API}/auth/refresh`, () => HttpResponse.json({ message: 'Invalid' }, { status: 401 })),
    )

    const { setOnUnauthorized } = await import('./http')
    setOnUnauthorized(onUnauthorized)

    await expect(get('/enrollments/me')).rejects.toBeInstanceOf(AppError)
    expect(useAuthStore.getState().token).toBeNull()
    expect(onUnauthorized).toHaveBeenCalledWith({ returnTo: '/' })
  })

  it('ne tente pas de rafraîchir quand aucune session n\'existe', async () => {
    let refreshCalls = 0
    mswServer.use(
      http.get(`${API}/enrollments/me`, () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })),
      http.post(`${API}/auth/refresh`, () => { refreshCalls += 1; return HttpResponse.json({}, { status: 401 }) }),
    )
    await expect(get('/enrollments/me')).rejects.toMatchObject({ status: 401 })
    expect(refreshCalls).toBe(0)
  })
})
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/lib/http.test.ts
```

Attendu : ÉCHEC — `Failed to resolve import "./http"`

- [ ] **Step 3: Étendre le magasin d'authentification pour conserver le refresh token**

Remplacer `src/store/authStore.ts` par :

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '../types'

/** Forme renvoyée par POST /auth/login et POST /auth/refresh (AuthResponse.java). */
export interface AuthResponse {
  token: string
  refreshToken: string
  email: string
  role: UserRole
  id: string
  expiresIn: number
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  email: string | null
  role: UserRole | null

  /** Enregistre une session complète — à privilégier sur setToken. */
  setSession: (response: AuthResponse) => void
  /** Enregistre un JWT seul. Utilisé par la redirection OAuth2, qui ne fournit que ?token=. */
  setToken: (token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

function decodeToken(token: string): { email: string; role: UserRole } | null {
  try {
    const segment = token.split('.')[1]
    if (!segment) return null
    const payload = JSON.parse(atob(segment)) as { sub?: string; role?: UserRole }
    return { email: payload.sub ?? '', role: payload.role ?? 'STUDENT' }
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      email: null,
      role: null,

      setSession: ({ token, refreshToken, email, role }) =>
        set({ token, refreshToken, email, role }),

      setToken: (token: string) => {
        const decoded = decodeToken(token)
        set({ token, email: decoded?.email ?? null, role: decoded?.role ?? 'STUDENT' })
      },

      logout: () => set({ token: null, refreshToken: null, email: null, role: null }),

      isAuthenticated: () => {
        const { token } = get()
        if (!token) return false
        try {
          const segment = token.split('.')[1]
          if (!segment) return false
          const payload = JSON.parse(atob(segment)) as { exp?: number }
          return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now()
        } catch {
          return false
        }
      },
    }),
    {
      name: 'zma-auth',
      partialize: (s) => ({ token: s.token, refreshToken: s.refreshToken, email: s.email, role: s.role }),
    },
  ),
)
```

- [ ] **Step 4: Implémenter la couche HTTP**

Créer `src/lib/cn.ts` :

```ts
import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes))
}
```

Créer `src/lib/http.ts` :

```ts
import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosInstance } from 'axios'
import type { ZodType } from 'zod'
import { useAuthStore } from '@/store/authStore'
import type { AuthResponse } from '@/store/authStore'

/** Forme unique d'erreur dans toute l'application. */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

type UnauthorizedHandler = (context: { returnTo: string }) => void

let onUnauthorized: UnauthorizedHandler = ({ returnTo }) => {
  window.location.assign(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`)
}

/** Permet au routeur (tâche 12) de rediriger sans rechargement complet. */
export function setOnUnauthorized(handler: UnauthorizedHandler): void {
  onUnauthorized = handler
}

interface RetriableConfig extends AxiosRequestConfig {
  _retried?: boolean
}

const client: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

interface ErrorBody {
  message?: string
  code?: string
  fieldErrors?: Record<string, string>
}

function toAppError(error: AxiosError<ErrorBody>): AppError {
  if (!error.response) {
    return new AppError(0, 'NETWORK', 'Connexion impossible. Vérifiez votre réseau et réessayez.')
  }
  const { status, data } = error.response
  return new AppError(
    status,
    data?.code ?? `HTTP_${status}`,
    data?.message ?? 'Une erreur est survenue.',
    data?.fieldErrors,
  )
}

/** Rafraîchit la session. Renvoie true si un nouveau jeton a été obtenu. */
async function refreshSession(): Promise<boolean> {
  const { refreshToken, setSession } = useAuthStore.getState()
  if (!refreshToken) return false
  try {
    const { data } = await axios.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken })
    setSession(data)
    return true
  } catch {
    return false
  }
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorBody>) => {
    const config = error.config as RetriableConfig | undefined
    const isRefreshCall = config?.url?.includes('/auth/refresh') ?? false

    if (error.response?.status === 401 && config && !config._retried && !isRefreshCall) {
      config._retried = true
      if (await refreshSession()) return client(config)

      // Le rafraîchissement a échoué : on sort proprement en mémorisant la page.
      if (useAuthStore.getState().token) {
        useAuthStore.getState().logout()
        onUnauthorized({ returnTo: window.location.pathname })
      }
    }
    throw toAppError(error)
  },
)

async function request<T>(config: AxiosRequestConfig, schema?: ZodType<T>): Promise<T> {
  const { data } = await client.request<unknown>(config)
  if (!schema) return data as T
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new AppError(
      200,
      'SCHEMA_MISMATCH',
      `Réponse inattendue du serveur pour ${config.url ?? 'la requête'}.`,
    )
  }
  return parsed.data
}

export const get = <T>(url: string, config?: AxiosRequestConfig, schema?: ZodType<T>) =>
  request<T>({ ...config, url, method: 'GET' }, schema)

export const post = <T>(url: string, data?: unknown, schema?: ZodType<T>, config?: AxiosRequestConfig) =>
  request<T>({ ...config, url, method: 'POST', data }, schema)

export const put = <T>(url: string, data?: unknown, schema?: ZodType<T>, config?: AxiosRequestConfig) =>
  request<T>({ ...config, url, method: 'PUT', data }, schema)

export const patch = <T>(url: string, data?: unknown, schema?: ZodType<T>, config?: AxiosRequestConfig) =>
  request<T>({ ...config, url, method: 'PATCH', data }, schema)

export const del = <T>(url: string, config?: AxiosRequestConfig, schema?: ZodType<T>) =>
  request<T>({ ...config, url, method: 'DELETE' }, schema)
```

- [ ] **Step 5: Lancer le test pour vérifier qu'il passe**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/lib/http.test.ts
```

Attendu : `Tests  9 passed (9)`

- [ ] **Step 6: Vérifier que le code hérité compile toujours**

`services/api.ts` continue d'utiliser son propre client axios ; il sera démantelé feature par feature aux chantiers 1 à 4. Les deux clients coexistent sans conflit.

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run typecheck && npm run test:run
```

Attendu : aucune erreur, tous les tests verts.

- [ ] **Step 7: Commit**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
git add -A frontend/
git commit -m "feat: couche HTTP unifiée avec rafraîchissement de session

Deux défauts corrigés :
- L'intercepteur ne gérait pas le 401 : à l'expiration du JWT, tous les
  appels échouaient en silence
- POST /auth/login renvoie un refreshToken que authStore jetait. Le
  endpoint POST /auth/refresh existait côté backend depuis le début sans
  jamais pouvoir être appelé

- AppError : forme d'erreur unique, fieldErrors de Spring remontés
- Rafraîchissement puis rejeu de la requête, une seule tentative
- Sortie propre avec returnTo quand le rafraîchissement échoue
- Validation Zod optionnelle à la frontière"
```

---

## Task 6: Primitives d'affichage — Button, Badge, Card, Skeleton

**Files:**
- Create: `src/design/primitives/button.tsx`
- Create: `src/design/primitives/badge.tsx`
- Create: `src/design/primitives/card.tsx`
- Create: `src/design/primitives/skeleton.tsx`
- Create: `src/design/primitives/primitives.test.tsx`
- Create: `src/design/primitives/index.ts`

**Interfaces:**
- Consumes: `cn` (tâche 5), jetons Tailwind (tâche 3)
- Produces, importables depuis `@/design/primitives` :
  - `<Button variant="primary"|"secondary"|"ghost"|"danger" size="sm"|"md"|"lg" asChild?>`
  - `<Badge tone="default"|"gold"|"success"|"warning"|"danger">`
  - `<Card>`, `<CardMedia>`, `<CardBody>`, `<CardFooter>`
  - `<Skeleton className?>`

- [ ] **Step 1: Écrire le test — il doit échouer**

Créer `src/design/primitives/primitives.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect, vi } from 'vitest'
import { Badge, Button, Card, CardBody, CardFooter, CardMedia, Skeleton } from './index'

describe('Button', () => {
  it('rend un vrai bouton accessible par son nom', () => {
    render(<Button>Explorer les formations</Button>)
    expect(screen.getByRole('button', { name: 'Explorer les formations' })).toBeInTheDocument()
  })

  it('déclenche onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Valider</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('respecte la cible tactile minimale de 44 px', () => {
    render(<Button size="md">Valider</Button>)
    expect(screen.getByRole('button').className).toContain('min-h-touch')
  })

  it('ne déclenche rien quand il est désactivé', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Valider</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('rend un lien quand asChild est utilisé', () => {
    render(<Button asChild><a href="/catalogue">Catalogue</a></Button>)
    expect(screen.getByRole('link', { name: 'Catalogue' })).toHaveAttribute('href', '/catalogue')
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = render(<Button>Explorer</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Badge', () => {
  it('affiche son contenu', () => {
    render(<Badge tone="gold">Licence · Semestre 3</Badge>)
    expect(screen.getByText('Licence · Semestre 3')).toBeInTheDocument()
  })

  it('utilise --gold-ink et jamais --gold pour du texte', () => {
    render(<Badge tone="gold">Licence</Badge>)
    const el = screen.getByText('Licence')
    expect(el.className).toContain('text-gold-ink')
    expect(el.className).not.toMatch(/\btext-gold\b/)
  })
})

describe('Card', () => {
  it('se compose par ses sous-parties', () => {
    render(
      <Card>
        <CardMedia><img src="/images/heroBg.jpg" alt="" width={400} height={250} /></CardMedia>
        <CardBody><h3>Piano classique</h3></CardBody>
        <CardFooter><span>18 $</span></CardFooter>
      </Card>,
    )
    expect(screen.getByRole('heading', { name: 'Piano classique' })).toBeInTheDocument()
    expect(screen.getByText('18 $')).toBeInTheDocument()
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = render(<Card><CardBody><h3>Piano</h3></CardBody></Card>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Skeleton', () => {
  it('est masqué aux lecteurs d\'écran', () => {
    render(<Skeleton className="h-4 w-32" />)
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true')
  })
})
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/design/primitives/
```

Attendu : ÉCHEC — `Failed to resolve import "./index"`

- [ ] **Step 3: Implémenter Button**

Créer `src/design/primitives/button.tsx` :

```tsx
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded font-sans font-semibold transition-colors duration-brand ease-brand disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-paper hover:opacity-90',
        secondary: 'border border-ink text-ink hover:bg-ink hover:text-paper',
        ghost: 'text-ink-muted hover:bg-line/50 hover:text-ink',
        danger: 'bg-danger text-paper hover:opacity-90',
      },
      size: {
        sm: 'min-h-touch px-3 text-sm',
        md: 'min-h-touch px-5 text-sm',
        lg: 'min-h-touch px-7 text-body',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : 'button'
    return <Component ref={ref} className={cn(button({ variant, size }), className)} {...props} />
  },
)
Button.displayName = 'Button'
```

- [ ] **Step 4: Implémenter Badge**

Créer `src/design/primitives/badge.tsx` :

```tsx
import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const badge = cva('inline-flex items-center font-sans text-eyebrow font-bold uppercase', {
  variants: {
    tone: {
      default: 'text-ink-muted',
      // --gold mesure 2,53:1 sur fond clair : jamais pour du texte (spec § 5.1)
      gold: 'text-gold-ink',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
    },
  },
  defaultVariants: { tone: 'default' },
})

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, tone, ...props }, ref) => (
  <span ref={ref} className={cn(badge({ tone }), className)} {...props} />
))
Badge.displayName = 'Badge'
```

- [ ] **Step 5: Implémenter Card et Skeleton**

Créer `src/design/primitives/card.tsx` :

```tsx
import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type DivProps = HTMLAttributes<HTMLDivElement>

export const Card = forwardRef<HTMLDivElement, DivProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col border border-line bg-surface', className)} {...props} />
))
Card.displayName = 'Card'

export const CardMedia = forwardRef<HTMLDivElement, DivProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('overflow-hidden', className)} {...props} />
))
CardMedia.displayName = 'CardMedia'

export const CardBody = forwardRef<HTMLDivElement, DivProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex-1 p-4', className)} {...props} />
))
CardBody.displayName = 'CardBody'

export const CardFooter = forwardRef<HTMLDivElement, DivProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-baseline justify-between border-t border-line p-4', className)} {...props} />
))
CardFooter.displayName = 'CardFooter'
```

Créer `src/design/primitives/skeleton.tsx` :

```tsx
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/** Occupe la place finale du contenu : aucun décalage de mise en page au chargement. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-testid="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse bg-line', className)}
      {...props}
    />
  )
}
```

Créer `src/design/primitives/index.ts` :

```ts
export { Button } from './button'
export type { ButtonProps } from './button'
export { Badge } from './badge'
export type { BadgeProps } from './badge'
export { Card, CardMedia, CardBody, CardFooter } from './card'
export { Skeleton } from './skeleton'
```

- [ ] **Step 6: Lancer les tests pour vérifier qu'ils passent**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/design/primitives/
npm run lint
```

Attendu : `Tests  11 passed (11)`, et le lint ne signale aucune erreur sur `src/design/`.

- [ ] **Step 7: Commit**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
git add -A frontend/
git commit -m "feat: primitives d'affichage Button, Badge, Card, Skeleton

- Variantes déclarées par cva, pas de ternaires de classes dans le JSX
- forwardRef sur toutes les primitives, pour que Radix puisse les piloter
- Card par composition plutôt que par props booléens
- Skeleton aria-hidden occupant la place finale : aucun décalage
- Un test vérifie que Badge tone=gold utilise --gold-ink et jamais --gold
- Chaque primitive passe jest-axe"
```

---

## Task 7: Primitives de formulaire accessibles — Field, Input

**Files:**
- Create: `src/design/primitives/field.tsx`
- Create: `src/design/primitives/input.tsx`
- Create: `src/design/primitives/field.test.tsx`
- Modify: `src/design/primitives/index.ts`

**Interfaces:**
- Consumes: `cn` (tâche 5)
- Produces : `<Field name label error? hint? required?>` qui câble automatiquement `htmlFor`, `id`, `aria-invalid`, `aria-describedby` et `role="alert"` sur son enfant ; `<Input>`.

- [ ] **Step 1: Écrire le test — il doit échouer**

Créer `src/design/primitives/field.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { Field, Input } from './index'

describe('Field', () => {
  it('relie le libellé au champ', () => {
    render(<Field name="email" label="Adresse électronique"><Input type="email" /></Field>)
    expect(screen.getByLabelText('Adresse électronique')).toBeInstanceOf(HTMLInputElement)
  })

  it('marque le champ invalide et le relie à son message d\'erreur', () => {
    render(
      <Field name="email" label="Adresse électronique" error="Adresse déjà utilisée">
        <Input type="email" />
      </Field>,
    )
    const input = screen.getByLabelText('Adresse électronique')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Adresse déjà utilisée')
  })

  it('annonce l\'erreur aux lecteurs d\'écran', () => {
    render(<Field name="email" label="Courriel" error="Format invalide"><Input /></Field>)
    expect(screen.getByRole('alert')).toHaveTextContent('Format invalide')
  })

  it('relie l\'indication au champ quand il n\'y a pas d\'erreur', () => {
    render(<Field name="password" label="Mot de passe" hint="Au moins 8 caractères"><Input type="password" /></Field>)
    expect(screen.getByLabelText('Mot de passe')).toHaveAccessibleDescription('Au moins 8 caractères')
  })

  it('signale un champ obligatoire au clavier comme à l\'écran', () => {
    render(<Field name="email" label="Courriel" required><Input /></Field>)
    expect(screen.getByLabelText(/Courriel/)).toBeRequired()
  })

  it('n\'a aucune violation d\'accessibilité, même en erreur', async () => {
    const { container } = render(
      <Field name="email" label="Courriel" error="Format invalide"><Input type="email" /></Field>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/design/primitives/field.test.tsx
```

Attendu : ÉCHEC — `Field` n'est pas exporté par `./index`

- [ ] **Step 3: Implémenter Input**

Créer `src/design/primitives/input.tsx` :

```tsx
import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'min-h-touch w-full rounded border border-line bg-surface px-3 font-sans text-body text-ink',
        'placeholder:text-ink-faint',
        'aria-[invalid=true]:border-danger',
        'disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
```

- [ ] **Step 4: Implémenter Field**

Créer `src/design/primitives/field.tsx` :

```tsx
import { cloneElement, useId } from 'react'
import type { ReactElement } from 'react'
import { cn } from '@/lib/cn'

export interface FieldProps {
  name: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactElement
}

/**
 * Câble l'accessibilité du champ à sa place : htmlFor, id, aria-invalid,
 * aria-describedby et role="alert". Aucun appelant n'a à y penser.
 */
export function Field({ name, label, error, hint, required, className, children }: FieldProps) {
  const generated = useId()
  const inputId = `${name}-${generated}`
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="font-sans text-sm font-medium text-ink">
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-danger">*</span>}
      </label>

      {cloneElement(children, {
        id: inputId,
        name,
        required,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}

      {error ? (
        <p id={errorId} role="alert" className="font-sans text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="font-sans text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 5: Exporter les nouvelles primitives**

Ajouter à `src/design/primitives/index.ts` :

```ts
export { Field } from './field'
export type { FieldProps } from './field'
export { Input } from './input'
```

- [ ] **Step 6: Lancer les tests pour vérifier qu'ils passent**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/design/primitives/
npm run typecheck
```

Attendu : `Tests  17 passed (17)`, aucune erreur TypeScript.

- [ ] **Step 7: Commit**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
git add -A frontend/
git commit -m "feat: primitives de formulaire accessibles par construction

Field câble htmlFor, id, aria-invalid, aria-describedby et role=alert.
L'accessibilité n'est plus à la charge de l'appelant : elle est
structurelle. Vérifié par jest-axe, y compris en état d'erreur."
```

---

## Task 8: Primitives interactives Radix — Dialog et Menu

Radix est installé depuis le début du projet et n'est utilisé nulle part : les menus de `Header.tsx` sont des `<div>` faits main, sans ARIA, sans touche Échap, sans piège de focus. Cette tâche fournit les remplaçants.

**Files:**
- Create: `src/design/primitives/dialog.tsx`
- Create: `src/design/primitives/menu.tsx`
- Create: `src/design/primitives/dialog.test.tsx`
- Modify: `src/design/primitives/index.ts`

**Interfaces:**
- Consumes: `cn` (tâche 5)
- Produces : `<Dialog>`, `<DialogTrigger>`, `<DialogContent title>`, `<DialogClose>` ; `<Menu>`, `<MenuTrigger>`, `<MenuContent>`, `<MenuItem>`. Consommés par la tâche 11.

- [ ] **Step 1: Écrire le test — il doit échouer**

Créer `src/design/primitives/dialog.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Dialog, DialogContent, DialogTrigger, Menu, MenuContent, MenuItem, MenuTrigger } from './index'

describe('Dialog', () => {
  it('s\'ouvre au clic sur son déclencheur', async () => {
    render(
      <Dialog>
        <DialogTrigger>Ouvrir le menu</DialogTrigger>
        <DialogContent title="Navigation">Contenu du tiroir</DialogContent>
      </Dialog>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }))
    expect(screen.getByRole('dialog', { name: 'Navigation' })).toBeInTheDocument()
  })

  it('se ferme avec la touche Échap', async () => {
    render(
      <Dialog>
        <DialogTrigger>Ouvrir</DialogTrigger>
        <DialogContent title="Navigation">Contenu</DialogContent>
      </Dialog>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('expose un bouton de fermeture nommé', async () => {
    render(
      <Dialog>
        <DialogTrigger>Ouvrir</DialogTrigger>
        <DialogContent title="Navigation">Contenu</DialogContent>
      </Dialog>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir' }))
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument()
  })
})

describe('Menu', () => {
  it('s\'ouvre et se navigue au clavier', async () => {
    render(
      <Menu>
        <MenuTrigger>Mon compte</MenuTrigger>
        <MenuContent>
          <MenuItem>Mon espace</MenuItem>
          <MenuItem>Déconnexion</MenuItem>
        </MenuContent>
      </Menu>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Mon compte' }))
    expect(await screen.findByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Mon espace' })).toBeInTheDocument()
  })

  it('porte aria-expanded sur son déclencheur', async () => {
    render(
      <Menu>
        <MenuTrigger>Mon compte</MenuTrigger>
        <MenuContent><MenuItem>Déconnexion</MenuItem></MenuContent>
      </Menu>,
    )
    const trigger = screen.getByRole('button', { name: 'Mon compte' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/design/primitives/dialog.test.tsx
```

Attendu : ÉCHEC — `Dialog` n'est pas exporté par `./index`

- [ ] **Step 3: Implémenter Dialog**

Créer `src/design/primitives/dialog.tsx` :

```tsx
import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

export const Dialog = RadixDialog.Root
export const DialogClose = RadixDialog.Close

export const DialogTrigger = forwardRef<
  ElementRef<typeof RadixDialog.Trigger>,
  ComponentPropsWithoutRef<typeof RadixDialog.Trigger>
>(({ className, ...props }, ref) => (
  <RadixDialog.Trigger ref={ref} className={cn('min-h-touch min-w-touch', className)} {...props} />
))
DialogTrigger.displayName = 'DialogTrigger'

interface DialogContentProps extends ComponentPropsWithoutRef<typeof RadixDialog.Content> {
  /** Nom accessible du dialogue. Obligatoire : sans lui, le dialogue est anonyme. */
  title: string
  /** Masque le titre visuellement tout en le laissant aux lecteurs d'écran. */
  hideTitle?: boolean
  children: ReactNode
}

/**
 * Radix fournit le piège de focus, la fermeture par Échap, le verrouillage
 * du défilement de fond et les attributs ARIA. Rien de tout cela n'est réécrit ici.
 */
export const DialogContent = forwardRef<ElementRef<typeof RadixDialog.Content>, DialogContentProps>(
  ({ className, title, hideTitle = false, children, ...props }, ref) => (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-scene/60" />
      <RadixDialog.Content
        ref={ref}
        className={cn('fixed inset-0 z-50 flex flex-col bg-paper shadow-overlay', className)}
        {...props}
      >
        <div className="flex items-center justify-between border-b border-line p-3">
          <RadixDialog.Title className={cn('font-serif text-h3 text-ink', hideTitle && 'sr-only')}>
            {title}
          </RadixDialog.Title>
          <RadixDialog.Close
            aria-label="Fermer"
            className="grid min-h-touch min-w-touch place-items-center rounded border border-line text-ink-muted"
          >
            <X className="h-4 w-4" aria-hidden />
          </RadixDialog.Close>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  ),
)
DialogContent.displayName = 'DialogContent'
```

- [ ] **Step 4: Implémenter Menu**

Créer `src/design/primitives/menu.tsx` :

```tsx
import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'
import * as RadixMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/cn'

export const Menu = RadixMenu.Root

export const MenuTrigger = forwardRef<
  ElementRef<typeof RadixMenu.Trigger>,
  ComponentPropsWithoutRef<typeof RadixMenu.Trigger>
>(({ className, ...props }, ref) => (
  <RadixMenu.Trigger
    ref={ref}
    className={cn('inline-flex min-h-touch items-center gap-2 rounded px-2 font-sans text-sm text-ink', className)}
    {...props}
  />
))
MenuTrigger.displayName = 'MenuTrigger'

export const MenuContent = forwardRef<
  ElementRef<typeof RadixMenu.Content>,
  ComponentPropsWithoutRef<typeof RadixMenu.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <RadixMenu.Portal>
    <RadixMenu.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn('z-50 min-w-52 border border-line bg-surface p-1 shadow-overlay', className)}
      {...props}
    />
  </RadixMenu.Portal>
))
MenuContent.displayName = 'MenuContent'

export const MenuItem = forwardRef<
  ElementRef<typeof RadixMenu.Item>,
  ComponentPropsWithoutRef<typeof RadixMenu.Item>
>(({ className, ...props }, ref) => (
  <RadixMenu.Item
    ref={ref}
    className={cn(
      'flex min-h-touch cursor-pointer items-center gap-2 rounded px-3 font-sans text-sm text-ink-muted outline-none',
      'data-[highlighted]:bg-line/50 data-[highlighted]:text-ink',
      className,
    )}
    {...props}
  />
))
MenuItem.displayName = 'MenuItem'
```

- [ ] **Step 5: Exporter**

Ajouter à `src/design/primitives/index.ts` :

```ts
export { Dialog, DialogTrigger, DialogContent, DialogClose } from './dialog'
export { Menu, MenuTrigger, MenuContent, MenuItem } from './menu'
```

- [ ] **Step 6: Lancer les tests**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/design/primitives/
```

Attendu : `Tests  22 passed (22)`

- [ ] **Step 7: Commit**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
git add -A frontend/
git commit -m "feat: primitives interactives Dialog et Menu sur Radix

Radix était installé depuis le début sans être utilisé : les menus du
Header sont des <div> faits main, sans ARIA, sans Échap, sans piège de
focus. Ces primitives les remplacent — Radix fournit tout cela.

DialogContent impose un title : un dialogue anonyme est inutilisable
au lecteur d'écran."
```

---

## Task 9: Pipeline images — encodage, manifeste, composant Picture

Aujourd'hui, `src/lib/images.ts` construit des URL vers Pollinations.ai : chaque visiteur déclenche une génération d'image de plusieurs secondes, et les visages changent à chaque rechargement. C'est la première cause du LCP hors budget. Cette tâche met en place le remplacement.

**Files:**
- Create: `scripts/encode-images.mjs`
- Create: `src/design/images/manifest.ts`
- Create: `src/design/primitives/picture.tsx`
- Create: `src/design/primitives/picture.test.tsx`
- Modify: `src/design/primitives/index.ts`
- Modify: `package.json` (script + dépendance)

**Interfaces:**
- Consumes: `cn` (tâche 5)
- Produces :
  - `IMAGES: Record<ImageKey, ImageEntry>` où `ImageEntry = { base: string; width: number; height: number; alt: string; source: 'stock' | 'ztf-pending' }`
  - `<Picture image={IMAGES.heroStage} sizes="100vw" priority?>`

- [ ] **Step 1: Écrire le test — il doit échouer**

Créer `src/design/primitives/picture.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Picture } from './index'
import { IMAGES } from '@/design/images/manifest'

describe('Picture', () => {
  it('déclare les dimensions, ce qui met le CLS à zéro', () => {
    render(<Picture image={IMAGES.heroStage} sizes="100vw" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('width', String(IMAGES.heroStage.width))
    expect(img).toHaveAttribute('height', String(IMAGES.heroStage.height))
  })

  it('propose AVIF puis WebP avant le JPEG de repli', () => {
    const { container } = render(<Picture image={IMAGES.heroStage} sizes="100vw" />)
    const types = Array.from(container.querySelectorAll('source')).map((s) => s.getAttribute('type'))
    expect(types).toEqual(['image/avif', 'image/webp'])
  })

  it('génère un srcset en quatre largeurs', () => {
    const { container } = render(<Picture image={IMAGES.heroStage} sizes="100vw" />)
    const avif = container.querySelector('source[type="image/avif"]')
    expect(avif?.getAttribute('srcset')).toContain('400w')
    expect(avif?.getAttribute('srcset')).toContain('1600w')
  })

  it('charge en différé par défaut', () => {
    render(<Picture image={IMAGES.studioDesk} sizes="400px" />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy')
  })

  it('charge en priorité quand priority est demandé — pour l\'image du LCP', () => {
    render(<Picture image={IMAGES.heroStage} sizes="100vw" priority />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })

  it('reprend le texte alternatif du manifeste', () => {
    render(<Picture image={IMAGES.heroStage} sizes="100vw" />)
    expect(screen.getByRole('img')).toHaveAccessibleName(IMAGES.heroStage.alt)
  })

  it('accepte un alt vide pour une image purement décorative', () => {
    const { container } = render(<Picture image={IMAGES.heroStage} sizes="100vw" alt="" />)
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })
})

describe('manifeste', () => {
  it('marque les emplacements en attente du matériel ZTF', () => {
    const pending = Object.values(IMAGES).filter((i) => i.source === 'ztf-pending')
    expect(pending.length).toBeGreaterThan(0)
  })

  it('donne un texte alternatif non vide à chaque entrée', () => {
    for (const [key, entry] of Object.entries(IMAGES)) {
      expect(entry.alt.length, `alt manquant pour ${key}`).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/design/primitives/picture.test.tsx
```

Attendu : ÉCHEC — `Failed to resolve import "@/design/images/manifest"`

- [ ] **Step 3: Créer le manifeste**

Créer `src/design/images/manifest.ts` :

```ts
/**
 * Inventaire des visuels du site.
 *
 * `source: 'stock'`       — visuel de banque, étalonné, en place.
 * `source: 'ztf-pending'` — emplacement réservé au matériel photo réel de ZTF.
 *                           Tant qu'il est absent, la surface affiche un état
 *                           vide soigné plutôt qu'un visage de banque : un
 *                           portrait acheté ne peut pas illustrer un enseignant
 *                           nommé (spec § 9.2).
 *
 * Direction artistique (spec § 9.2) : le geste et l'instrument priment sur le
 * visage ; lumière dirigée ; aucune pose souriante face caméra.
 *
 * Les fichiers vivent dans public/images/<base>-<largeur>.<avif|webp|jpg>,
 * produits par `npm run images:encode`.
 */

export interface ImageEntry {
  /** Nom de base du fichier, sans largeur ni extension. */
  base: string
  /** Dimensions intrinsèques du plus grand rendu — nécessaires pour le CLS. */
  width: number
  height: number
  alt: string
  source: 'stock' | 'ztf-pending'
}

export const IMAGE_WIDTHS = [400, 800, 1200, 1600] as const

export const IMAGES = {
  heroStage: {
    base: 'hero-stage',
    width: 1600,
    height: 900,
    alt: 'Scène de concert en contre-jour, faisceaux de projecteurs',
    source: 'stock',
  },
  pianoHands: {
    base: 'piano-hands',
    width: 1200,
    height: 750,
    alt: 'Mains sur les touches d\'un piano à queue',
    source: 'stock',
  },
  studioDesk: {
    base: 'studio-desk',
    width: 1200,
    height: 750,
    alt: 'Console de mixage dans un studio d\'enregistrement',
    source: 'stock',
  },
  strings: {
    base: 'strings',
    width: 1200,
    height: 750,
    alt: 'Archets et cordes d\'un pupitre de violons',
    source: 'stock',
  },
  score: {
    base: 'score',
    width: 1200,
    height: 750,
    alt: 'Partition manuscrite et crayon',
    source: 'stock',
  },
  facultyPortrait: {
    base: 'faculty-portrait',
    width: 800,
    height: 800,
    alt: 'Portrait d\'un enseignant de la ZTF Music Académie',
    source: 'ztf-pending',
  },
  campus: {
    base: 'campus',
    width: 1600,
    height: 900,
    alt: 'Locaux de la ZTF Music Académie',
    source: 'ztf-pending',
  },
  graduation: {
    base: 'graduation',
    width: 1600,
    height: 900,
    alt: 'Cérémonie de remise des diplômes de la ZTF Music Académie',
    source: 'ztf-pending',
  },
} as const satisfies Record<string, ImageEntry>

export type ImageKey = keyof typeof IMAGES
```

- [ ] **Step 4: Implémenter Picture**

Créer `src/design/primitives/picture.tsx` :

```tsx
import { IMAGE_WIDTHS } from '@/design/images/manifest'
import type { ImageEntry } from '@/design/images/manifest'
import { cn } from '@/lib/cn'

export interface PictureProps {
  image: ImageEntry
  /** Indication de largeur pour le navigateur, ex. "100vw" ou "(min-width:768px) 400px, 100vw". */
  sizes: string
  /** Réservé à l'image du LCP — une seule par page. */
  priority?: boolean
  /** Remplace le texte du manifeste. Chaîne vide = image décorative. */
  alt?: string
  className?: string
}

function srcSet(base: string, extension: string): string {
  return IMAGE_WIDTHS.map((w) => `/images/${base}-${w}.${extension} ${w}w`).join(', ')
}

export function Picture({ image, sizes, priority = false, alt, className }: PictureProps) {
  const largest = IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1]
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(image.base, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image.base, 'webp')} sizes={sizes} />
      <img
        src={`/images/${image.base}-${largest}.jpg`}
        alt={alt ?? image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className={cn('h-auto max-w-full object-cover', className)}
      />
    </picture>
  )
}
```

Ajouter à `src/design/primitives/index.ts` :

```ts
export { Picture } from './picture'
export type { PictureProps } from './picture'
```

- [ ] **Step 5: Lancer les tests**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/design/primitives/picture.test.tsx
```

Attendu : `Tests  9 passed (9)`

- [ ] **Step 6: Écrire le script d'encodage**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm install -D sharp@^0.33.5
```

Créer `scripts/encode-images.mjs` :

```js
/**
 * Encode les sources de public/images/_source/ vers les 4 largeurs et 3 formats
 * attendus par src/design/primitives/picture.tsx.
 *
 * Applique l'étalonnage commun décrit au spec § 9.2 : légère dominante chaude
 * et contraste homogène. C'est cette étape qui empêche 40 photos de 40
 * photographes de ressembler à un patchwork.
 *
 * Usage : npm run images:encode
 */
import { readdir, mkdir } from 'node:fs/promises'
import { join, parse } from 'node:path'
import sharp from 'sharp'

const SOURCE_DIR = 'public/images/_source'
const OUTPUT_DIR = 'public/images'
const WIDTHS = [400, 800, 1200, 1600]

/** Étalonnage commun — ne pas modifier sans revoir l'ensemble de la photothèque. */
function grade(pipeline) {
  return pipeline
    .modulate({ saturation: 0.92, brightness: 1.02 })
    .tint({ r: 255, g: 250, b: 242 })
    .linear(1.06, -8)
}

await mkdir(OUTPUT_DIR, { recursive: true })
const files = (await readdir(SOURCE_DIR)).filter((f) => /\.(jpe?g|png|tiff?)$/i.test(f))

if (files.length === 0) {
  console.error(`Aucune source dans ${SOURCE_DIR}. Y déposer les originaux nommés d'après manifest.ts (ex. hero-stage.jpg).`)
  process.exit(1)
}

for (const file of files) {
  const { name } = parse(file)
  for (const width of WIDTHS) {
    const base = grade(sharp(join(SOURCE_DIR, file)).resize({ width, withoutEnlargement: true }))
    await base.clone().avif({ quality: 55, effort: 6 }).toFile(join(OUTPUT_DIR, `${name}-${width}.avif`))
    await base.clone().webp({ quality: 72 }).toFile(join(OUTPUT_DIR, `${name}-${width}.webp`))
    await base.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(join(OUTPUT_DIR, `${name}-${width}.jpg`))
  }
  console.log(`✓ ${name} — ${WIDTHS.length * 3} fichiers`)
}
```

Ajouter à `package.json`, dans `"scripts"` :

```json
"images:encode": "node scripts/encode-images.mjs"
```

- [ ] **Step 7: Constituer la photothèque**

Procédure manuelle, à exécuter une fois :

1. Depuis Unsplash ou Pexels, télécharger en pleine résolution une image par entrée `source: 'stock'` du manifeste : `hero-stage`, `piano-hands`, `studio-desk`, `strings`, `score`.
2. Appliquer les critères du spec § 9.2 — le geste et l'instrument priment sur le visage ; lumière dirigée, contre-jour ou lumière de scène ; **rejeter** toute pose souriante face caméra, tout fond blanc de studio, toute mise en scène corporate.
3. Les déposer dans `public/images/_source/`, nommées exactement d'après le champ `base` du manifeste.
4. Encoder et vérifier :

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
mkdir -p public/images/_source
npm run images:encode
ls public/images/hero-stage-*.avif
du -sh public/images
```

Attendu : 4 fichiers AVIF pour `hero-stage`, et un poids total du répertoire inférieur à 6 Mo.

Les entrées `ztf-pending` n'ont pas de fichier : les surfaces concernées affichent un état vide jusqu'à réception du matériel ZTF.

- [ ] **Step 8: Retirer la génération d'images à la volée**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
grep -rln "lib/images" --include=*.tsx src/ || echo "aucune page ne l'importe"
```

`src/lib/images.ts` reste en place tant que les pages héritées l'importent ; il est supprimé au chantier 1, quand l'accueil et le catalogue sont réécrits. La directive `/pollinations/` de `nginx.conf` est retirée au même moment.

- [ ] **Step 9: Commit**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
git add -A frontend/
git commit -m "feat: pipeline images — encodage, manifeste et composant Picture

Remplace la génération d'images à la demande par Pollinations.ai, qui
coûtait plusieurs secondes de LCP par visite et changeait les visages à
chaque rechargement.

- Picture : AVIF puis WebP puis JPEG, srcset 4 largeurs, dimensions
  déclarées (CLS à zéro), priority réservé à l'image du LCP
- manifest.ts : inventaire unique, avec les emplacements réservés au
  matériel photo réel de ZTF marqués ztf-pending
- encode-images.mjs applique l'étalonnage commun"
```

---

## Task 10: Internationalisation

`i18next` figure dans les dépendances depuis le début du projet et n'a jamais été importé. Cette tâche câble le socle en français ; les chaînes sortiront du JSX au fil des chantiers 1 à 4, et l'anglais sera traduit d'un bloc au chantier 5.

**Files:**
- Create: `src/i18n/index.ts`
- Create: `src/i18n/fr.json`
- Create: `src/i18n/i18n.test.ts`
- Modify: `package.json` (dépendance)

**Interfaces:**
- Consumes: rien
- Produces : `i18n` (instance initialisée), le hook `useTranslation()` de `react-i18next`, et les fonctions `formatPrice(amount: number): string`, `formatDate(iso: string): string`, `formatDuration(hours: number): string`.

- [ ] **Step 1: Installer react-i18next**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm install react-i18next@^15.4.0
```

- [ ] **Step 2: Écrire le test — il doit échouer**

Créer `src/i18n/i18n.test.ts` :

```ts
import { describe, it, expect, beforeAll } from 'vitest'
import { i18n, formatDate, formatDuration, formatPrice } from './index'

beforeAll(async () => {
  if (!i18n.isInitialized) await i18n.init()
})

describe('i18n', () => {
  it('démarre en français', () => {
    expect(i18n.language).toBe('fr')
  })

  it('traduit une clé existante', () => {
    expect(i18n.t('nav.catalogue')).toBe('Formations')
  })

  it('renvoie la clé pour une traduction manquante, sans planter', () => {
    expect(i18n.t('cle.qui.nexiste.pas')).toBe('cle.qui.nexiste.pas')
  })

  it('expose les libellés de la navigation mobile', () => {
    expect(i18n.t('nav.mobile.explore')).toBe('Explorer')
    expect(i18n.t('nav.mobile.myCourses')).toBe('Mes cours')
  })

  it('expose les textes de la page 404', () => {
    expect(i18n.t('notFound.title')).toContain('introuvable')
  })
})

describe('formatage', () => {
  it('formate un prix en dollars, à la française', () => {
    // Espace insécable étroit entre le nombre et le symbole en locale fr
    expect(formatPrice(18)).toMatch(/18[\s  ]*\$/)
  })

  it('formate une date en français', () => {
    expect(formatDate('2026-03-14T10:00:00Z')).toContain('mars')
  })

  it('formate une durée en heures', () => {
    expect(formatDuration(42)).toBe('42 h')
  })

  it('formate une durée courte en minutes', () => {
    expect(formatDuration(0.5)).toBe('30 min')
  })
})
```

- [ ] **Step 3: Lancer le test pour vérifier qu'il échoue**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/i18n/
```

Attendu : ÉCHEC — `Failed to resolve import "./index"`

- [ ] **Step 4: Créer les chaînes françaises**

Créer `src/i18n/fr.json` :

```json
{
  "brand": {
    "name": "ZTF Music Académie",
    "tagline": "Établissement d'enseignement supérieur"
  },
  "nav": {
    "catalogue": "Formations",
    "academy": "L'Académie",
    "diplomas": "Diplômes",
    "teachers": "Enseignants",
    "search": "Rechercher un cours, un enseignant…",
    "login": "Connexion",
    "register": "S'inscrire",
    "logout": "Déconnexion",
    "mySpace": "Mon espace",
    "openMenu": "Ouvrir le menu",
    "menu": "Navigation",
    "skipToContent": "Aller au contenu",
    "mobile": {
      "home": "Accueil",
      "explore": "Explorer",
      "myCourses": "Mes cours",
      "profile": "Profil"
    }
  },
  "breadcrumb": {
    "label": "Fil d'Ariane",
    "home": "Accueil"
  },
  "theme": {
    "toDark": "Activer le thème sombre",
    "toLight": "Activer le thème clair"
  },
  "notFound": {
    "title": "Cette page est introuvable",
    "body": "Le lien que vous avez suivi n'existe plus, ou il a été déplacé. Voici par où reprendre.",
    "backHome": "Retour à l'accueil",
    "browseCatalogue": "Parcourir les formations"
  },
  "error": {
    "title": "Une erreur est survenue",
    "retry": "Réessayer",
    "network": "Connexion impossible. Vérifiez votre réseau et réessayez."
  },
  "footer": {
    "trainings": "Formations",
    "academy": "Académie",
    "student": "Étudiant",
    "legal": "Mentions légales",
    "privacy": "Confidentialité",
    "terms": "Conditions générales",
    "rights": "Tous droits réservés"
  },
  "level": {
    "Licence": "Licence",
    "Master": "Master",
    "Doctorat": "Doctorat",
    "Certificat": "Certificat",
    "Atelier": "Atelier"
  }
}
```

- [ ] **Step 5: Initialiser i18next**

Créer `src/i18n/index.ts` :

```ts
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './fr.json'

export const SUPPORTED_LOCALES = ['fr', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

/** Français seul pour l'instant. L'anglais est ajouté au chantier 5. */
void i18next.use(initReactI18next).init({
  resources: { fr: { translation: fr } },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export const i18n = i18next

const locale = (): string => i18next.language || 'fr'

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(locale(), {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`
  return `${Math.round(hours)} h`
}
```

- [ ] **Step 6: Lancer les tests**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/i18n/
```

Attendu : `Tests  9 passed (9)`. Si `formatPrice` échoue, vérifier que l'environnement Node dispose des données de locale complètes (`node -e "console.log(new Intl.NumberFormat('fr',{style:'currency',currency:'USD'}).format(18))"`).

- [ ] **Step 7: Commit**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
git add -A frontend/
git commit -m "feat: socle d'internationalisation

i18next figurait dans les dépendances depuis le début sans jamais être
importé : toutes les chaînes sont en dur. Le socle est câblé en français ;
les chaînes sortiront du JSX au fil des chantiers 1 à 4, l'anglais sera
traduit d'un bloc au chantier 5.

Dates, prix et durées passent par Intl, jamais par du formatage manuel."
```

---

## Task 11: Châssis — navigation desktop, navigation mobile, pied de page, fil d'Ariane

C'est la tâche qui corrige le défaut le plus grave du frontend actuel : le `<nav>` de `Header.tsx` est `hidden md:flex` **sans menu hamburger**. Sur mobile, il n'existe aucune navigation.

**Files:**
- Create: `src/shell/navigation.ts`
- Create: `src/shell/Header.tsx`
- Create: `src/shell/MobileNav.tsx`
- Create: `src/shell/Footer.tsx`
- Create: `src/shell/Breadcrumb.tsx`
- Create: `src/shell/Header.test.tsx`
- Create: `src/shell/Breadcrumb.test.tsx`

**Interfaces:**
- Consumes: primitives (tâches 6–8), `useTheme`/`ThemeToggle` (tâche 4), `useTranslation` (tâche 10), `useAuthStore` (tâche 5)
- Produces : `<Header>`, `<MobileNav>`, `<Footer>`, `<Breadcrumb items={[{label, to?}]}>`, et `DEPARTMENTS`, `LEVELS` depuis `@/shell/navigation`. Consommés par la tâche 12.

- [ ] **Step 1: Écrire le test — il doit échouer**

Créer `src/shell/Header.test.tsx` :

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import { describe, it, expect, beforeEach } from 'vitest'
import { Header } from './Header'
import { ThemeProvider } from './ThemeProvider'
import { useAuthStore } from '@/store/authStore'

function renderHeader() {
  return render(
    <MemoryRouter>
      <ThemeProvider><Header /></ThemeProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuthStore.getState().logout()
  localStorage.clear()
})

describe('Header — visiteur', () => {
  it('affiche les entrées principales', () => {
    renderHeader()
    const nav = screen.getByRole('navigation', { name: /principale/i })
    expect(within(nav).getByRole('button', { name: /Formations/ })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /Enseignants/ })).toBeInTheDocument()
  })

  it('propose Connexion et Inscription', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Connexion' })).toHaveAttribute('href', '/auth/login')
    expect(screen.getByRole('link', { name: "S'inscrire" })).toHaveAttribute('href', '/auth/register')
  })

  it('déploie le menu Formations et pointe vers des catalogues filtrés', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: /Formations/ }))
    const menu = await screen.findByRole('menu')
    const item = within(menu).getByRole('menuitem', { name: /Interprétation/ })
    expect(item).toHaveAttribute('href', '/catalogue?department=Interpr%C3%A9tation')
  })

  it('offre un lien d\'évitement en première position', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Aller au contenu' })).toHaveAttribute('href', '#contenu')
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = renderHeader()
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Header — navigation mobile', () => {
  it('expose un déclencheur de menu, absent du frontend actuel', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: 'Ouvrir le menu' })).toBeInTheDocument()
  })

  it('ouvre un tiroir contenant la navigation complète', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }))
    const drawer = await screen.findByRole('dialog', { name: 'Navigation' })
    expect(within(drawer).getByRole('link', { name: /Interprétation/ })).toBeInTheDocument()
    expect(within(drawer).getByRole('link', { name: 'Connexion' })).toBeInTheDocument()
  })

  it('ferme le tiroir avec la touche Échap', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
```

Créer `src/shell/Breadcrumb.test.tsx` :

```tsx
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { Breadcrumb } from './Breadcrumb'

describe('Breadcrumb', () => {
  it('rend une liste ordonnée dans une navigation nommée', () => {
    render(
      <MemoryRouter>
        <Breadcrumb items={[{ label: 'Formations', to: '/catalogue' }, { label: 'Piano classique' }]} />
      </MemoryRouter>,
    )
    const nav = screen.getByRole('navigation', { name: "Fil d'Ariane" })
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3)
  })

  it('marque la page courante et n\'en fait pas un lien', () => {
    render(
      <MemoryRouter>
        <Breadcrumb items={[{ label: 'Formations', to: '/catalogue' }, { label: 'Piano classique' }]} />
      </MemoryRouter>,
    )
    const current = screen.getByText('Piano classique')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Piano classique' })).not.toBeInTheDocument()
  })

  it('ajoute toujours Accueil en tête', () => {
    render(<MemoryRouter><Breadcrumb items={[{ label: 'Formations' }]} /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Accueil' })).toHaveAttribute('href', '/')
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = render(
      <MemoryRouter><Breadcrumb items={[{ label: 'Formations', to: '/catalogue' }, { label: 'Piano' }]} /></MemoryRouter>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/shell/Header.test.tsx src/shell/Breadcrumb.test.tsx
```

Attendu : ÉCHEC — `Failed to resolve import "./Header"`

- [ ] **Step 3: Décrire la navigation**

Créer `src/shell/navigation.ts` :

```ts
/** Structure du méga-menu. Chaque entrée pointe vers un catalogue filtré et partageable. */

export interface NavEntry {
  label: string
  hint: string
  to: string
}

export const DEPARTMENTS: NavEntry[] = [
  { label: 'Interprétation', hint: 'Piano · Guitare · Jazz · Chant', to: `/catalogue?department=${encodeURIComponent('Interprétation')}` },
  { label: 'Composition', hint: 'Écriture · Orchestration', to: '/catalogue?department=Composition' },
  { label: 'Technologies', hint: 'Production · Studio · Audio', to: '/catalogue?department=Technologies' },
  { label: 'Pédagogie', hint: 'Formation des formateurs', to: `/catalogue?department=${encodeURIComponent('Pédagogie')}` },
  { label: 'Musicologie', hint: 'Patrimoine · Management', to: '/catalogue?department=Musicologie' },
]

export const LEVELS: NavEntry[] = [
  { label: 'Licence', hint: '180 ECTS · 3 ans', to: '/catalogue?level=Licence' },
  { label: 'Master', hint: '120 ECTS · 2 ans', to: '/catalogue?level=Master' },
  { label: 'Doctorat', hint: '3 ans', to: '/catalogue?level=Doctorat' },
  { label: 'Certificat', hint: '8 à 16 semaines', to: '/catalogue?level=Certificat' },
  { label: 'Atelier', hint: 'Court · sans prérequis', to: '/catalogue?level=Atelier' },
]
```

- [ ] **Step 4: Implémenter le fil d'Ariane**

Créer `src/shell/Breadcrumb.tsx` :

```tsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const { t } = useTranslation()
  const all: BreadcrumbItem[] = [{ label: t('breadcrumb.home'), to: '/' }, ...items]

  return (
    <nav aria-label={t('breadcrumb.label')} className="border-b border-line">
      <ol className="container flex flex-wrap items-center gap-1 py-2.5 font-sans text-sm text-ink-muted">
        {all.map((item, index) => {
          const isLast = index === all.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden="true" className="px-1 text-gold-ink">›</span>}
              {isLast || !item.to ? (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'font-medium text-ink' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="hover:text-ink">{item.label}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
```

- [ ] **Step 5: Implémenter le tiroir mobile**

Créer `src/shell/MobileNav.tsx` :

```tsx
import { Menu as MenuIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/design/primitives'
import { DEPARTMENTS, LEVELS } from './navigation'
import { useAuthStore } from '@/store/authStore'

/** Le tiroir que le frontend actuel n'a jamais eu : sur mobile, aucune navigation n'existait. */
export function MobileNav() {
  const { t } = useTranslation()
  const authenticated = useAuthStore((s) => s.isAuthenticated())

  return (
    <Dialog>
      <DialogTrigger
        aria-label={t('nav.openMenu')}
        className="grid place-items-center rounded border border-line text-ink md:hidden"
      >
        <MenuIcon className="h-5 w-5" aria-hidden />
      </DialogTrigger>

      <DialogContent title={t('nav.menu')}>
        <nav aria-label={t('nav.menu')} className="flex h-full flex-col">
          <p className="eyebrow px-4 pt-4">{t('nav.catalogue')}</p>
          <ul>
            {DEPARTMENTS.map((entry) => (
              <li key={entry.label}>
                <DialogClose asChild>
                  <Link to={entry.to} className="flex min-h-touch items-center border-b border-line px-4 text-body text-ink">
                    {entry.label}
                  </Link>
                </DialogClose>
              </li>
            ))}
          </ul>

          <p className="eyebrow px-4 pt-5">{t('nav.diplomas')}</p>
          <ul>
            {LEVELS.map((entry) => (
              <li key={entry.label}>
                <DialogClose asChild>
                  <Link to={entry.to} className="flex min-h-touch items-center border-b border-line px-4 text-body text-ink">
                    {entry.label}
                  </Link>
                </DialogClose>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex gap-2 border-t border-line p-4">
            {authenticated ? (
              <DialogClose asChild>
                <Link to="/dashboard" className="flex min-h-touch flex-1 items-center justify-center rounded bg-ink px-4 font-sans text-sm font-semibold text-paper">
                  {t('nav.mySpace')}
                </Link>
              </DialogClose>
            ) : (
              <>
                <DialogClose asChild>
                  <Link to="/auth/login" className="flex min-h-touch flex-1 items-center justify-center rounded border border-ink px-4 font-sans text-sm font-semibold text-ink">
                    {t('nav.login')}
                  </Link>
                </DialogClose>
                <DialogClose asChild>
                  <Link to="/auth/register" className="flex min-h-touch flex-1 items-center justify-center rounded bg-ink px-4 font-sans text-sm font-semibold text-paper">
                    {t('nav.register')}
                  </Link>
                </DialogClose>
              </>
            )}
          </div>
        </nav>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 6: Implémenter l'en-tête**

Créer `src/shell/Header.tsx` :

```tsx
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/design/primitives'
import { DEPARTMENTS, LEVELS } from './navigation'
import { MobileNav } from './MobileNav'
import { ThemeToggle } from './ThemeToggle'
import { useAuthStore } from '@/store/authStore'

function TrainingsMenu() {
  const { t } = useTranslation()
  return (
    <Menu>
      <MenuTrigger className="font-semibold">
        {t('nav.catalogue')}
        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
      </MenuTrigger>
      <MenuContent className="min-w-80">
        {[...DEPARTMENTS, ...LEVELS].map((entry) => (
          <MenuItem key={entry.label} asChild>
            <Link to={entry.to}>
              <span className="text-ink">{entry.label}</span>
              <span className="ml-auto text-sm text-ink-faint">{entry.hint}</span>
            </Link>
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  )
}

export function Header() {
  const { t } = useTranslation()
  const authenticated = useAuthStore((s) => s.isAuthenticated())

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:text-paper"
      >
        {t('nav.skipToContent')}
      </a>

      <div className="container flex min-h-touch items-center gap-5 py-2">
        <Link to="/" className="shrink-0 font-serif text-h3 leading-none text-ink">
          {t('brand.name')}
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          <TrainingsMenu />
          <Link to="/teachers" className="flex min-h-touch items-center rounded px-3 font-sans text-sm font-semibold text-ink">
            {t('nav.teachers')}
          </Link>
          <Link to="/certificates/verify" className="flex min-h-touch items-center rounded px-3 font-sans text-sm font-semibold text-ink">
            {t('nav.diplomas')}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {authenticated ? (
            <Link to="/dashboard" className="flex min-h-touch items-center rounded bg-ink px-4 font-sans text-sm font-semibold text-paper">
              {t('nav.mySpace')}
            </Link>
          ) : (
            <>
              <Link to="/auth/login" className="hidden min-h-touch items-center rounded border border-ink px-4 font-sans text-sm font-semibold text-ink sm:flex">
                {t('nav.login')}
              </Link>
              <Link to="/auth/register" className="hidden min-h-touch items-center rounded bg-ink px-4 font-sans text-sm font-semibold text-paper sm:flex">
                {t('nav.register')}
              </Link>
            </>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 7: Implémenter le pied de page**

Créer `src/shell/Footer.tsx` :

```tsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEPARTMENTS, LEVELS } from './navigation'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-h3 text-ink">{t('brand.name')}</p>
          <p className="mt-1 font-sans text-sm text-ink-muted">{t('brand.tagline')}</p>
        </div>

        <nav aria-label={t('footer.trainings')}>
          <p className="eyebrow">{t('footer.trainings')}</p>
          <ul className="mt-3 space-y-1.5">
            {DEPARTMENTS.map((entry) => (
              <li key={entry.label}>
                <Link to={entry.to} className="font-sans text-sm text-ink-muted hover:text-ink">{entry.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('nav.diplomas')}>
          <p className="eyebrow">{t('nav.diplomas')}</p>
          <ul className="mt-3 space-y-1.5">
            {LEVELS.map((entry) => (
              <li key={entry.label}>
                <Link to={entry.to} className="font-sans text-sm text-ink-muted hover:text-ink">{entry.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('footer.academy')}>
          <p className="eyebrow">{t('footer.academy')}</p>
          <ul className="mt-3 space-y-1.5">
            <li><Link to="/teachers" className="font-sans text-sm text-ink-muted hover:text-ink">{t('nav.teachers')}</Link></li>
            <li><Link to="/catalogue" className="font-sans text-sm text-ink-muted hover:text-ink">{t('nav.catalogue')}</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <p className="container py-4 font-sans text-sm text-ink-faint">
          © {year} {t('brand.name')} — {t('footer.rights')}
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 8: Lancer les tests**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/shell/
npm run lint
npx eslint src/shell --ext ts,tsx --rule '{"max-lines":["error",{"max":200,"skipBlankLines":true,"skipComments":true}]}'
```

Attendu : `Tests  14 passed (14)`, aucune erreur de lint, aucun fichier de `src/shell` au-delà de 200 lignes.

- [ ] **Step 9: Commit**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
git add -A frontend/
git commit -m "feat: châssis de navigation, avec navigation mobile

Corrige le défaut le plus grave du frontend actuel : le <nav> du Header
est hidden md:flex sans menu hamburger. Sur mobile — terminal principal
de la cible — aucune navigation n'existait.

- Tiroir plein écran sur Dialog Radix : piège de focus, Échap,
  verrouillage du défilement, ARIA
- Méga-menu Formations vers des catalogues filtrés et partageables
- Lien d'évitement en première tabulation
- Fil d'Ariane avec aria-current sur la page courante
- Cibles tactiles 44 x 44 px partout"
```

---

## Task 12: Gabarits, routeur en chargement différé, page 404

**Files:**
- Create: `src/shell/layouts/PublicLayout.tsx`
- Create: `src/shell/layouts/AppLayout.tsx`
- Create: `src/shell/layouts/ImmersiveLayout.tsx`
- Create: `src/shell/layouts/AuthLayout.tsx`
- Create: `src/app/NotFound.tsx`
- Create: `src/app/guards.tsx`
- Create: `src/app/providers.tsx`
- Create: `src/app/router.tsx`
- Create: `src/app/router.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: tout le châssis (tâche 11), `setOnUnauthorized` (tâche 5), `ThemeProvider` (tâche 4), `i18n` (tâche 10)
- Produces : l'application assemblée. Les chantiers 1 à 4 n'auront qu'à remplacer les éléments `element={...}` des routes.

- [ ] **Step 1: Écrire le test — il doit échouer**

Créer `src/app/router.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { axe } from 'jest-axe'
import { NotFound } from './NotFound'
import { RequireAuth } from './guards'
import { ThemeProvider } from '@/shell/ThemeProvider'
import { useAuthStore } from '@/store/authStore'

function wrap(ui: React.ReactNode, initial = '/') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <ThemeProvider>{ui}</ThemeProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuthStore.getState().logout()
  localStorage.clear()
})

describe('NotFound', () => {
  it('explique la situation au lieu de rediriger en silence', () => {
    wrap(<NotFound />)
    expect(screen.getByRole('heading', { name: /introuvable/i })).toBeInTheDocument()
  })

  it('propose au moins deux sorties — exigence Zero Dead Ends du CDC', () => {
    wrap(<NotFound />)
    expect(screen.getByRole('link', { name: /Retour à l'accueil/ })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /Parcourir les formations/ })).toHaveAttribute('href', '/catalogue')
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = wrap(<NotFound />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('RequireAuth', () => {
  it('redirige un visiteur vers la connexion en mémorisant la page demandée', () => {
    wrap(
      <Routes>
        <Route path="/dashboard" element={<RequireAuth><p>Espace privé</p></RequireAuth>} />
        <Route path="/auth/login" element={<p>Page de connexion</p>} />
      </Routes>,
      '/dashboard',
    )
    expect(screen.getByText('Page de connexion')).toBeInTheDocument()
    expect(screen.queryByText('Espace privé')).not.toBeInTheDocument()
  })

  it('laisse passer un utilisateur authentifié', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = `h.${btoa(JSON.stringify({ sub: 'e@z.cm', role: 'STUDENT', exp }))}.s`
    useAuthStore.getState().setSession({ token, refreshToken: 'r', email: 'e@z.cm', role: 'STUDENT', id: '1', expiresIn: 3600 })

    wrap(
      <Routes>
        <Route path="/dashboard" element={<RequireAuth><p>Espace privé</p></RequireAuth>} />
      </Routes>,
      '/dashboard',
    )
    expect(screen.getByText('Espace privé')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/app/router.test.tsx
```

Attendu : ÉCHEC — `Failed to resolve import "./NotFound"`

- [ ] **Step 3: Créer les quatre gabarits**

Créer `src/shell/layouts/PublicLayout.tsx` :

```tsx
import { Outlet } from 'react-router-dom'
import { Header } from '../Header'
import { Footer } from '../Footer'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />
      <main id="contenu" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

Créer `src/shell/layouts/AppLayout.tsx` :

```tsx
import { Outlet } from 'react-router-dom'
import { Header } from '../Header'

/** Dense, sans pied de page marketing : on ne vend rien à quelqu'un déjà inscrit. */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />
      <main id="contenu" className="container flex-1 py-8">
        <Outlet />
      </main>
    </div>
  )
}
```

Créer `src/shell/layouts/ImmersiveLayout.tsx` :

```tsx
import { Link, Outlet } from 'react-router-dom'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Registre sombre. L'interface s'efface derrière le média — mais la sortie
 * reste visible en permanence.
 */
export function ImmersiveLayout() {
  const { t } = useTranslation()
  return (
    <div data-theme="dark" className="flex min-h-screen flex-col bg-scene text-scene-ink">
      <div className="flex min-h-touch items-center justify-between border-b border-line px-4">
        <Link to="/" className="font-serif text-body text-scene-ink">{t('brand.name')}</Link>
        <Link
          to="/my-courses"
          aria-label={t('nav.mobile.myCourses')}
          className="grid min-h-touch min-w-touch place-items-center"
        >
          <X className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <main id="contenu" className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
```

Créer `src/shell/layouts/AuthLayout.tsx` :

```tsx
import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/** Aucune navigation : on ne détourne pas quelqu'un en train de s'inscrire. */
export function AuthLayout() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="container py-5">
        <Link to="/" className="font-serif text-h3 text-ink">{t('brand.name')}</Link>
      </div>
      <main id="contenu" className="container flex flex-1 items-start justify-center py-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Créer la page 404 et les gardes**

Créer `src/app/NotFound.tsx` :

```tsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * Le frontend actuel redirige silencieusement vers l'accueil : l'utilisateur
 * qui suit un lien mort ne comprend pas ce qui s'est passé. Exigence
 * « Zero Dead Ends » du CDC.
 */
export function NotFound() {
  const { t } = useTranslation()
  return (
    <section className="container flex flex-col items-start gap-4 py-20">
      <p className="eyebrow">404</p>
      <h1 className="max-w-2xl font-serif text-h1 text-ink">{t('notFound.title')}</h1>
      <p className="max-w-prose font-sans text-body text-ink-muted">{t('notFound.body')}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        <Link to="/" className="flex min-h-touch items-center rounded bg-ink px-5 font-sans text-sm font-semibold text-paper">
          {t('notFound.backHome')}
        </Link>
        <Link to="/catalogue" className="flex min-h-touch items-center rounded border border-ink px-5 font-sans text-sm font-semibold text-ink">
          {t('notFound.browseCatalogue')}
        </Link>
      </div>
    </section>
  )
}
```

Créer `src/app/guards.tsx` :

```tsx
import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

export function RequireAuth({ children }: { children: ReactNode }) {
  const authenticated = useAuthStore((s) => s.isAuthenticated())
  const location = useLocation()

  if (!authenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth/login?returnTo=${returnTo}`} replace />
  }
  return <>{children}</>
}

export function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const authenticated = useAuthStore((s) => s.isAuthenticated())
  const current = useAuthStore((s) => s.role)
  const location = useLocation()

  if (!authenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth/login?returnTo=${returnTo}`} replace />
  }
  if (current !== role) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
```

- [ ] **Step 5: Créer les fournisseurs et le routeur**

Créer `src/app/providers.tsx` :

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { ThemeProvider } from '@/shell/ThemeProvider'
import { i18n } from '@/i18n'
import { AppError } from '@/lib/http'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // Inutile de réessayer une erreur définitive du client.
      retry: (failureCount, error) => {
        if (error instanceof AppError && error.status >= 400 && error.status < 500) return false
        return failureCount < 2
      },
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>{children}</ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  )
}
```

Créer `src/app/router.tsx` :

```tsx
import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { NotFound } from './NotFound'
import { RequireAuth } from './guards'
import { PublicLayout } from '@/shell/layouts/PublicLayout'
import { AppLayout } from '@/shell/layouts/AppLayout'
import { AuthLayout } from '@/shell/layouts/AuthLayout'
import { ImmersiveLayout } from '@/shell/layouts/ImmersiveLayout'
import { Skeleton } from '@/design/primitives'
import { setOnUnauthorized } from '@/lib/http'

// Chargement différé : l'espace admin ne pèse plus sur la première visite en 3G.
const HomePage = lazy(() => import('@/pages/home/HomePage').then((m) => ({ default: m.HomePage })))
const CataloguePage = lazy(() => import('@/pages/catalogue/CataloguePage').then((m) => ({ default: m.CataloguePage })))
const CourseDetailPage = lazy(() => import('@/pages/course/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const StudentDashboard = lazy(() => import('@/pages/dashboard/StudentDashboard').then((m) => ({ default: m.StudentDashboard })))
const CheckoutPage = lazy(() => import('@/pages/checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const CoursePlayer = lazy(() => import('@/pages/learning/CoursePlayer').then((m) => ({ default: m.CoursePlayer })))
const ChatPage = lazy(() => import('@/pages/chat/ChatPage').then((m) => ({ default: m.ChatPage })))
const TeacherDashboard = lazy(() => import('@/pages/teacher/TeacherDashboard').then((m) => ({ default: m.TeacherDashboard })))
const CourseEditor = lazy(() => import('@/pages/teacher/CourseEditor').then((m) => ({ default: m.CourseEditor })))
const CourseWizard = lazy(() => import('@/components/wizard/CourseWizard').then((m) => ({ default: m.CourseWizard })))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })))

/** Squelette de route — jamais de spinner bloquant (CDC). */
function RouteFallback() {
  return (
    <div className="container space-y-4 py-10">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function AppRoutes() {
  const navigate = useNavigate()

  // Redirige sans rechargement complet quand la session expire.
  useEffect(() => {
    setOnUnauthorized(({ returnTo }) => {
      navigate(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true })
    })
  }, [navigate])

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index path="/" element={<HomePage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/course/:slug" element={<CourseDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          {/* Anciens chemins français — conservés pour ne pas casser les liens */}
          <Route path="/auth/connexion" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/inscription" element={<Navigate to="/auth/register" replace />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<RequireAuth><StudentDashboard /></RequireAuth>} />
          <Route path="/checkout/:courseId" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path="/chat/:courseId" element={<RequireAuth><ChatPage /></RequireAuth>} />
          <Route path="/teacher" element={<RequireAuth><TeacherDashboard /></RequireAuth>} />
          <Route path="/teacher/courses/new" element={<RequireAuth><CourseWizard /></RequireAuth>} />
          <Route path="/teacher/courses/:courseId/edit" element={<RequireAuth><CourseEditor /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          {/* Anciens chemins de l'espace enseignant */}
          <Route path="/enseigner/cours/creer" element={<Navigate to="/teacher/courses/new" replace />} />
        </Route>

        <Route element={<ImmersiveLayout />}>
          <Route path="/learning/:courseId" element={<RequireAuth><CoursePlayer /></RequireAuth>} />
          <Route path="/learning/:courseId/:lessonId" element={<RequireAuth><CoursePlayer /></RequireAuth>} />
        </Route>
      </Routes>
    </Suspense>
  )
}
```

Les routes `/teachers`, `/my-courses`, `/certificates`, `/settings`, `/admin/review`, `/admin/users`, `/admin/finance` et `/certificates/verify/:token` sont ajoutées par les chantiers 1, 2 et 4, en même temps que leurs pages. Elles tombent d'ici là sur la 404, qui propose une sortie — ce qui est le comportement correct.

- [ ] **Step 6: Assembler l'application**

Remplacer `src/App.tsx` par :

```tsx
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './app/router'
import { Providers } from './app/providers'

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppRoutes />
      </Providers>
    </BrowserRouter>
  )
}
```

Remplacer `src/main.tsx` par :

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 7: Lancer les tests et la compilation**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run test:run -- src/app/
npm run typecheck
npm run build 2>&1 | tail -25
```

Attendu : `Tests  5 passed (5)`, aucune erreur TypeScript, et la compilation réussit en produisant **plusieurs fragments JavaScript** (un par route différée) au lieu d'un fichier unique.

**Attention — ne pas casser la connexion Google.** Le `RootLayout` hérité capturait le `?token=` déposé par `OAuth2SuccessHandler.java:66`. En le retirant du routeur, cette logique disparaît : la connexion Google mènerait à `/dashboard?token=…` sans que le jeton soit jamais enregistré. Créer `src/app/OAuthTokenCapture.tsx` :

```tsx
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * OAuth2SuccessHandler.java:66 redirige vers /dashboard?token=<jwt>.
 * Ce composant enregistre le jeton puis nettoie l'URL, pour qu'un JWT ne
 * traîne pas dans l'historique du navigateur ni dans un lien partagé.
 */
export function OAuthTokenCapture() {
  const [params, setParams] = useSearchParams()
  const setToken = useAuthStore((s) => s.setToken)
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (!token) return
    setToken(token)
    const next = new URLSearchParams(params)
    next.delete('token')
    setParams(next, { replace: true })
    navigate('/dashboard', { replace: true })
  }, [params, setParams, setToken, navigate])

  return null
}
```

Puis le monter dans le routeur — il doit être à l'intérieur du `BrowserRouter`, donc dans `AppRoutes`. Ajouter dans `src/app/router.tsx`, juste avant `<Suspense>` :

```tsx
  return (
    <>
      <OAuthTokenCapture />
      <Suspense fallback={<RouteFallback />}>
```

et fermer par `</>` après `</Suspense>`, avec l'import correspondant :

```tsx
import { OAuthTokenCapture } from './OAuthTokenCapture'
```

Enfin, supprimer le gabarit hérité devenu inutilisé :

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
git rm --quiet src/components/layout/RootLayout.tsx src/components/layout/Header.tsx
grep -rn "components/layout" --include=*.tsx src/ || echo "✓ plus aucune référence"
```

- [ ] **Step 8: Vérifier l'application dans un navigateur**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run dev
```

Contrôler à la main :
1. La page d'accueil se charge, l'en-tête affiche la nouvelle typographie serif.
2. **Réduire la fenêtre sous 768 px** : le bouton de menu apparaît, le tiroir s'ouvre, Échap le referme.
3. Basculer le thème : aucun flash au rechargement.
4. Ouvrir `/une-route-qui-nexiste-pas` : la page 404 s'affiche avec ses deux sorties, au lieu d'une redirection silencieuse.
5. Dans l'onglet Réseau, vérifier qu'**aucune requête ne part vers pollinations.ai** depuis les pages refaites.

- [ ] **Step 9: Vérification complète et commit**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run verify
```

Attendu : typecheck, lint et tests tous verts.

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
git add -A frontend/
git commit -m "feat: gabarits, routeur en chargement différé et page 404

- Quatre gabarits au lieu d'un seul container py-8 : la page d'accueil
  n'a plus besoin du hack -mx-8 -mt-8 pour s'en échapper
- Toutes les routes en React.lazy : l'admin ne pèse plus sur la première
  visite en 3G
- Squelette de route, jamais de spinner bloquant
- Vraie page 404 avec deux sorties, au lieu de la redirection silencieuse
  vers l'accueil (Zero Dead Ends)
- Gardes RequireAuth et RequireRole mémorisant la page demandée
- Anciens chemins français conservés en redirection"
```

---

## Task 13: Budget de performance opposable — Lighthouse CI

Le spec fixe LCP < 2,5 s, CLS < 0,1, INP < 200 ms et JS première visite < 180 Ko gzip. Sans vérification automatique, ces chiffres sont un vœu. Cette tâche les rend bloquants.

**Files:**
- Create: `lighthouserc.cjs`
- Create: `.github/workflows/frontend.yml` (à la racine du dépôt, pas dans `frontend/`)
- Modify: `package.json` (script + dépendance)

**Interfaces:**
- Consumes: l'application assemblée de la tâche 12
- Produces: les commandes `npm run lighthouse` et `npm run verify`, exécutées en intégration continue.

- [ ] **Step 1: Installer Lighthouse CI**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm install -D @lhci/cli@^0.14.0
```

- [ ] **Step 2: Mesurer l'état de départ**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run build
npx lhci autorun --collect.staticDistDir=./dist --collect.numberOfRuns=1 --upload.target=temporary-public-storage 2>&1 | tail -20
```

Noter les valeurs obtenues. Elles servent de référence : les seuils ci-dessous ne doivent pas être desserrés pour faire passer la CI.

- [ ] **Step 3: Créer la configuration**

Créer `lighthouserc.cjs` :

```js
/**
 * Budget de performance du spec § 9.1, rendu opposable.
 * Ne pas desserrer un seuil pour faire passer la CI : corriger la régression.
 */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['http://localhost/index.html'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        // Représentatif de la cible : mobile de milieu de gamme sur 3G rapide.
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'unminified-javascript': 'error',
        'uses-responsive-images': 'error',
        'font-display': 'error',
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
}
```

Ajouter à `package.json`, dans `"scripts"` :

```json
"lighthouse": "npm run build && lhci autorun"
```

- [ ] **Step 4: Vérifier localement**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run lighthouse 2>&1 | tail -30
```

Attendu : toutes les assertions passent. Si `categories:accessibility` échoue, corriger l'accessibilité — ce seuil est à 1, sans tolérance : c'est l'exigence WCAG 2.1 AA du CDC.

- [ ] **Step 5: Câbler l'intégration continue**

Créer `.github/workflows/frontend.yml` **à la racine du dépôt** :

```yaml
name: Frontend

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - name: Types, lint et tests
        run: npm run verify
      - name: Couverture
        run: npm run coverage
      - name: Budget de performance
        run: npm run lighthouse
```

- [ ] **Step 6: Vérifier que le workflow est valide**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/frontend.yml')); print('✓ YAML valide')"
```

Attendu : `✓ YAML valide`

- [ ] **Step 7: Commit**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE
git add -A frontend/ .github/
git commit -m "ci: budget de performance et d'accessibilité opposable

Le spec fixe LCP < 2,5 s, CLS < 0,1 et INP < 200 ms. Sans vérification
automatique, ces chiffres restent un vœu.

- Seuil d'accessibilité à 1, sans tolérance : exigence WCAG 2.1 AA du CDC
- Workflow GitHub : types, lint, tests, couverture et Lighthouse"
```

---

## Fin du chantier 0

Le socle est en place. Les chantiers 1 à 5 remplacent les éléments `element={...}` du routeur, page par page, et retirent au fur et à mesure leurs chemins du tableau `LEGACY` de `.eslintrc.cjs`.

**Contrôle final avant de passer au chantier 1 :**

```bash
cd /home/ryzen/ZMA_COURSE_ONLINE/frontend
npm run verify && npm run build && npm run coverage
```

Le chantier est terminé quand ces trois commandes passent et que le contrôle manuel de l'étape 8 de la tâche 12 est concluant — en particulier **la navigation mobile**, qui est la raison d'être de ce chantier.
