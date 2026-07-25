# Chantier 2 — Parcours étudiant (FSD)

**Date** : 2026-07-25
**Branche** : `chantier-2-parcours-etudiant` (depuis `chantier-1-vitrine`)
**Architecture** : Feature-Sliced Design · palette sobre navy+papier+or (mémoires FSD + branding)

## Objectif

Le parcours complet de l'étudiant : s'inscrire, se connecter, acheter un cours, suivre sa
progression, apprendre dans le lecteur, obtenir ses certificats, gérer son compte. Registre
clair partout, sauf le lecteur (registre scène, gabarit Immersive).

## Contrats backend (vérifiés)

- **auth** (zma-auth) : `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh`,
  `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, `GET /auth/me`.
- **enrollment** (zma-enrollment) : `GET /enrollments/me`, `/enrollments/check?courseId=`,
  `/enrollments/course/{id}`, `PATCH /enrollments/{id}/progress`, `/{id}/lessons`,
  `GET /certificates/me`.
- **payment** (zma-payment) : `POST /payments/checkout`, `PATCH /payments/{id}/confirm`,
  `GET /payments/me`, `/payments/check?courseId=`.

## Découpage FSD

**entities/**
- `entities/enrollment/` — schema (Enrollment, Certificate), api, hooks (`useMyEnrollments`,
  `useEnrollmentCheck`, `useUpdateProgress` mutation optimiste + clés de cache, `useMyCertificates`).
- `entities/payment/` — schema (Payment), api (checkout, confirm, checkPaid), hooks.

**features/**
- `features/auth-form/` — `LoginForm`, `RegisterForm` (React Hook Form + Zod, `shared/ui` Field/Input,
  fieldErrors Spring remontés, OAuth Google via lien `/oauth2/authorization/google`).
- `features/enroll-course/` — bouton d'achat → checkout → confirmation → accès. Mutation +
  invalidation des clés enrollment.
- `features/lesson-progress/` — marque une leçon terminée, sauvegarde auto (PATCH progress).

**widgets/**
- `widgets/course-player/` — lecteur vidéo (HTML5 `<video>` d'abord ; Video.js/HLS différé si
  besoin réel), sidebar syllabus avec statut, onglets (vidéo/ressources/notes/Q&R).
- `widgets/progress-summary/` — carte de progression (barre, streak, prochaine leçon).

**pages/** (remplacent les héritées)
- `pages/auth/login`, `pages/auth/register` — gabarit Auth, sans navigation.
- `pages/checkout` — récap cours + prix + code promo + paiement (simulation confirm).
- `pages/dashboard` — tableau de bord étudiant : reprendre, progression, recommandations.
- `pages/my-courses` — grille de mes inscriptions + progression.
- `pages/learning` — lecteur de cours (gabarit Immersive, sombre).
- `pages/certificates` — mes certificats (numéro, QR, cours).
- `pages/settings` — onglets profil / sécurité / notifications / préférences (thème, économiseur
  de données, taille de police).

**app/** — routeur : remplacer les pages héritées par les FSD ; retirer de LEGACY au fur et à mesure.

## Ordre d'exécution

1. entities/enrollment + entities/payment (TDD, MSW).
2. features/auth-form + pages/auth (login, register). ← point de contrôle visuel.
3. features/enroll-course + pages/checkout.
4. pages/dashboard + widgets/progress-summary + pages/my-courses.
5. widgets/course-player + features/lesson-progress + pages/learning (Immersive).
6. pages/certificates + pages/settings.
7. Câblage routeur, suppression pages héritées, retrait LEGACY, verify+build+coverage+lighthouse, push.

## Contraintes (actives en CI)

Frontières FSD, plafond 200 lignes, palette sobre navy+papier+or (3 couleurs), zéro `any`,
cibles 44 px, i18n, primitives shared/ui, tests + jest-axe, budget Lighthouse (accessibilité=1).
Ne PAS reproduire le bug rules-of-hooks des anciens dashboards à la réécriture — retirer alors
leur override ESLint ciblé.

## Points de contrôle

Après l'étape 2 (auth visible) puis l'étape 5 (lecteur), montrer au porteur du projet.
