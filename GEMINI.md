# GEMINI.md - Contexte Permanent du Projet ZMA Course Online

Ce fichier rassemble le contexte permanent, les règles projet, l'architecture et l'historique des décisions (dont les mémoires de Claude et les spécifications de ZMA Course Online).

---

## 1. Vue d'ensemble du Projet

**ZMA Course Online** est une plateforme e-learning (cours en ligne) moderne et évolutive s'appuyant sur une architecture microservices robuste côté backend et une application monopage (SPA) côté frontend.

- **Nom du projet** : ZMA Course Online (`zma-parent`)
- **Cahier des Charges** : `ZMA_CDC_Fonctionnel_v3.pdf`
- **Organisme / Group ID** : `com.ztf.zma`

---

## 2. Architecture Technique & Technologies

### Backend (Java / Spring Boot)
- **Java** : Version 21
- **Framework** : Spring Boot 3.2.5
- **Gestionnaire de dépendances** : Maven Multi-module (`pom.xml` parent)
- **Base de Données** : PostgreSQL 16 (Schémas dédiés et isolés par service)
- **Cache & Invalidation** : Redis 7
- **Actuator** : Monitoring d'état de santé (`/actuator/health`) sur chaque service

### Frontend (React / TypeScript)
- **Framework UI** : React 18 avec Vite 5 & TypeScript 5
- **Architecture Frontend** : Feature-Sliced Design (FSD) (`app` > `pages` > `widgets` > `features` > `entities` > `shared`)
- **Styling** : Tailwind CSS, Radix UI primitives, Framer Motion, Lucide React
- **Gestion d'état & Data Fetching** : Zustand, TanStack Query (React Query)
- **Validation & Formulaires** : React Hook Form, Zod
- **Tests** : Vitest, Testing Library, JSDOM, MSW

---

## 3. Cartographie des Microservices Backend

Le backend regroupe **8 microservices** configurés sous le dossier `services/` et orchestrés dans `docker-compose.yml` :

| Microservice | Dossier | Port par défaut | Description & Responsabilité | Schéma DB |
| :--- | :--- | :--- | :--- | :--- |
| **`zma-gateway`** | `services/zma-gateway` | `8080` | API Gateway principal / Point d'entrée unique | N/A |
| **`zma-auth`** | `services/zma-auth` | `8081` | Authentification (JWT, OAuth2 Google, Redis tokens) | `auth` |
| **`zma-users`** | `services/zma-users` | `8082` | Gestion des utilisateurs, profils & rôles | `users` |
| **`zma-catalog`** | `services/zma-catalog` | `8083` | Catalogue des cours, catégories, modules & leçons | `catalog` |
| **`zma-media`** | `services/zma-media` | `8084` | Gestion du stockage et du streaming des vidéos/fichiers | `media` |
| **`zma-enrollment`** | `services/zma-enrollment` | `8085` | Inscriptions aux cours, suivi de la progression | `enrollment` |
| **`zma-payment`** | `services/zma-payment` | `8086` | Paiements, commandes, facturation et paiements sécurisés | `payment` |
| **`zma-community`** | `services/zma-community` | `8087` | Forums de discussion, commentaires et entraide | `community` |

---

## 4. Base de Données & Isolation

La base de données PostgreSQL unique utilise le script `init-db.sql` au premier démarrage pour isoler les schémas applicatifs attribués à l'utilisateur `zma_admin` (`POSTGRES_DB: zma_db`) :
- `CREATE SCHEMA IF NOT EXISTS auth;`
- `CREATE SCHEMA IF NOT EXISTS users;`
- `CREATE SCHEMA IF NOT EXISTS catalog;`
- `CREATE SCHEMA IF NOT EXISTS media;`
- `CREATE SCHEMA IF NOT EXISTS enrollment;`
- `CREATE SCHEMA IF NOT EXISTS payment;`
- `CREATE SCHEMA IF NOT EXISTS community;`

---

## 5. Commandes Principales

### Backend (Maven)
- Compiler l'ensemble du projet parent :
  ```bash
  mvn clean install
  ```
- Lancer les tests backend :
  ```bash
  mvn test
  ```

### Frontend (`frontend/`)
- Démarrer le serveur de dev :
  ```bash
  npm run dev
  ```
- Vérification complète (Typecheck + Lint + Tests) :
  ```bash
  npm run verify
  ```
- Compiler pour la production :
  ```bash
  npm run build
  ```
- Exécuter les tests Vitest :
  ```bash
  npm run test:run
  ```

### Docker & Infrastructure
- Lancer toute l'infrastructure et les microservices :
  ```bash
  docker-compose up -d --build
  ```
- Vérifier le statut des conteneurs :
  ```bash
  docker-compose ps
  ```

---

## 6. Mémoire & Décisions Stratégiques de Claude (Intégralité)

### 6.1. Positionnement et Marque Sobre (`branding-sober-palette-and-positioning`)
- **Positionnement (hero / accroche)** :
  - Retirer « Afrique » de l'eyebrow (« Établissement d'enseignement supérieur », sans « · Afrique »).
  - Titre : « Former les musiciens **d'excellence** de demain, sans rien céder sur l'exigence ». Lead par l'excellence universelle.
  - La page de sélection des cours (catalogue) est cadrée comme une **« Boutique de cours »** — le registre commerçant est acceptable là où l'on meut des achats, pas sur le branding institutionnel.
- **Palette (Couleurs de MARQUE réelles)** :
  - Bleu marque `--blue #0050A0` (logo), encre/texte `--ink #0A2540` (bleu profond), accent orange `--accent #E07000` (logo) ; `--accent-ink #964900` pour l'orange lisible en texte. Papier `--paper/--surface`, neutres bleutés.
  - Registre scène sombre : `#0A1526` (noir bleuté), accent orange vif `#F09010`.
  - Jetons renommés `gold` -> `accent` (l'ancien or est devenu l'orange de marque).
  - Toujours 2 couleurs + neutres, PAS de multicolore. Le logo réel (`public/brand/ztf-logo.png`) est utilisé dans l'en-tête.

### 6.2. Architecture Frontend FSD (`frontend-architecture-is-fsd`)
- Le frontend adopte **Feature-Sliced Design (FSD)** pour faciliter la maintenance et éviter les erreurs.
- **Couches FSD (import strictement descendant)** : `app` › `pages` › `widgets` › `features` › `entities` › `shared`. Slices par domaine, chaque slice expose un `index.ts` public.
- **Correspondance de structure** :
  - `app/` (router, providers, guards, ErrorBoundary, OAuthTokenCapture) -> reste `app/` ; layouts -> `app/layouts/` ; styles -> `app/styles/`
  - `design/primitives/` -> `shared/ui/`
  - `lib/http.ts` -> `shared/api/` ; `lib/cn.ts` -> `shared/lib/`
  - `i18n/` -> `shared/config/i18n/` ; `shell/navigation.ts` -> `shared/config/`
  - theme (ThemeProvider + useTheme + ThemeToggle) -> `shared/theme/`
  - `shell/Header, MobileNav, Footer, Breadcrumb` -> `widgets/`
  - `store/authStore` -> `entities/session/`
- Garde-fou ESLint `import/no-restricted-paths` configuré pour la hiérarchie FSD.

### 6.3. Exigences de Build Netlify (`netlify-build-requirements`)
- Le frontend se déploie sur Netlify (`CMCI-ORG/ZmaOnline` / `Cliedd/ZMA_COURSE_ONLINE`) sur **Node 20**.
- **Package-lock.json** : Le `package-lock.json` n'est pas versionné (gitignoré), l'installation se fait par `npm install` (pas `npm ci`) avec `.npmrc` `legacy-peer-deps=true`.
- **Causes d'échec corrigées** :
  1. `tsc -b` retiré du script build -> remplacé par `tsc --noEmit && vite build`.
  2. peer dependency : `@testing-library/dom` ajouté en devDependency pour assurer `tsc --noEmit`.
- **Config Netlify (`netlify.toml`)** : `base=frontend`, `command=npm run build`, `publish=dist`, `NODE_VERSION=20`, `NPM_FLAGS=--legacy-peer-deps`, redirect SPA `/* -> /index.html 200`.

### 6.4. Gestion des Crédits d'Utilisation (`usage-credits-are-a-real-constraint`)
- Ne pas lancer de longues exécutions autonomes non supervisées sans annoncer le coût et demander l'accord.
- Privilégier les modèles efficients et regrouper les sous-agents/tâches au lieu de multiplier les appels inutiles.
