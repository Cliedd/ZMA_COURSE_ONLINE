# Chantier 1 — La vitrine (FSD)

**Date** : 2026-07-25
**Branche** : `chantier-1-vitrine` (depuis `chantier-0.5-fsd`)
**Architecture** : Feature-Sliced Design (voir `frontend-architecture-is-fsd` en mémoire)
**Spec de référence visuelle** : `docs/superpowers/specs/2026-07-24-refonte-frontend-design.md`

## Objectif

Construire les 5 pages publiques que voient les collaborateurs, en FSD natif, sur de
vraies données API. Registre clair « éditorial » (couture sombre unique sur le hero de
l'accueil). C'est la première fois que l'effet visible arrive.

## Contrat backend (vérifié)

- `GET /api/v1/courses?department=&level=&q=&page=&size=` → `Page<Course>` (`{ content: Course[], totalElements, ... }`)
- `GET /api/v1/courses/slug/{slug}` → `Course`
- `GET /api/v1/courses/{id}/reviews?page=&size=` → `Page<Review>`
- `Course` : `id, slug, title, description, shortDescription, price, level, department, filiere, ects, teacherName, teacherEmail, studentsCount, rating, durationHours, gradientIndex, lessonCount, skillsJson, curriculumJson, debouches, published, sections[]`
- **Pas de service enseignant** : l'entité `teacher` est dérivée en agrégeant les cours par `teacherEmail`.

## Découpage FSD

**entities/**
- `entities/course/` — `model/course.schema.ts` (Zod + `z.infer`), `api/courseApi.ts` (list, getBySlug, reviews), `model/queryKeys.ts`, `model/hooks.ts` (`useCourses`, `useCourse`, `useCourseReviews`), `lib/parseCourse.ts` (skillsJson/curriculumJson → objets), `index.ts`
- `entities/teacher/` — `model/teacher.schema.ts`, `api/teacherApi.ts` (dérive la liste distincte + le profil depuis courseApi), `model/hooks.ts` (`useTeachers`, `useTeacher`), `index.ts`

**features/**
- `features/catalog-filters/` — état des filtres dans l'URL (`useSearchParams`) : department, level, prix, note, aperçu gratuit. `ui/FilterBar`, `model/useCatalogFilters`.
- `features/catalog-search/` — champ de recherche → param `q`.

**widgets/**
- `widgets/course-card/` — `CourseCard` (Picture + niveau eyebrow + titre serif + prof + prix serif + note). Registre clair.
- `widgets/course-grid/` — grille + squelettes de chargement + état vide « Zero Dead Ends » (nomme le filtre, propose de le retirer).

**pages/** (remplacent les pages héritées)
- `pages/home/` — hero sombre (couture unique) + départements + formations phares (note ≥ 4,5) + section « Pourquoi ZMA » + CTA. Preuve sociale par chiffres réels (pas de témoignages inventés).
- `pages/catalogue/` — fil d'Ariane + titre + FilterBar + CourseGrid + défilement infini/pagination.
- `pages/course-detail/` — CourseHero + « 3 choses que vous apprendrez » au-dessus de la ligne de flottaison + syllabus (Accordion) + BuyButton + avis.
- `pages/teachers/` — grille des enseignants (dérivés), état vide si photo `ztf-pending`.
- `pages/teacher-profile/` — bio + grille de ses cours + note agrégée.

**app/** — `router.tsx` : remplacer les imports lazy hérités (home, catalogue, course) par les pages FSD ; ajouter `/teachers`, `/teachers/:username`. Supprimer les pages héritées correspondantes et retirer leurs chemins de `LEGACY` (.eslintrc).

## Ordre d'exécution

1. **entities/course** (schéma, api, hooks, parse) — TDD, MSW. Aucune décision visuelle.
2. **entities/teacher** (dérivé) — TDD.
3. **widgets/course-card + course-grid** — TDD (rendu, état vide, squelette).
4. **pages/home** — assemble hero + départements + formations phares + CTA. **← point de contrôle visuel : montrer avant de continuer.**
5. **features/catalog-filters + catalog-search** + **pages/catalogue**.
6. **pages/course-detail**.
7. **pages/teachers + pages/teacher-profile**.
8. Câblage routeur, suppression pages héritées, retrait de LEGACY, verify + build + coverage + Lighthouse.

## Contraintes (héritées, actives en CI)

Frontières FSD, plafond 200 lignes, zéro couleur en dur, zéro `any`, cibles 44 px, jetons
sémantiques, primitives `shared/ui`, i18n pour toute chaîne, images via `Picture`/manifeste,
tests + jest-axe, budget Lighthouse (accessibilité = 1).

## Point de contrôle

Après l'étape 4 (accueil visible), lancer `npm run dev`, capturer l'accueil, le soumettre au
porteur du projet AVANT de construire les 4 autres pages — pour valider la direction sur la
vraie page, pas sur une maquette.
