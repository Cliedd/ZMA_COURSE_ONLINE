# Refonte du frontend ZMA Course Online — Spécification de design

**Date** : 2026-07-24
**Statut** : validé section par section, en attente de revue finale
**Référence** : `ZMA_CDC_Fonctionnel_v3.pdf` (25 p.)

---

## 1. Problème

Le frontend actuel (7 755 lignes, 50 fichiers) est rejeté par l'équipe. Trois griefs, formulés
par le porteur du projet :

1. **Générique** — le visuel ne dit rien de ZTF ni de la musique ; il ressemble à n'importe quel SaaS.
2. **On se perd** — navigation et hiérarchie illisibles.
3. **Pas assez académique** — une institution délivrant Licence, Master et Doctorat n'inspire pas confiance.

L'audit du code confirme et explique ces griefs :

| Exigence du CDC | État constaté |
|---|---|
| Palette bleu #1A3C6E + or #C8960C via jetons CSS | Jetons définis puis contournés : `amber-500`, `#06111f`, `blue-900`, `purple-900`, `rose-900`, `emerald-800` en dur |
| Typographie auto-hébergée (Fontsource) | Playfair Display via `@import` Google Fonts — requête bloquant le rendu — et `style={{fontFamily}}` recopié 8 fois |
| Dark mode natif sans FOUC | `next-themes` installé, jamais importé. Aucun provider, aucun sélecteur |
| i18n FR/EN (i18next) | `i18next` installé, jamais importé. Tous les textes en dur |
| WCAG 2.1 AA via Radix | Menus déroulants faits main en `<div>` : aucun ARIA, aucune touche Échap, aucun piège de focus — alors que `@radix-ui/react-dropdown-menu` est déjà installé |
| Mobile-first, 3G, WebP | Images générées **à la demande** par Pollinations.ai à chaque visite |
| Squelettes, « aucun spinner bloquant » | Spinners bloquants (`Loader2`) |
| « Zero Dead Ends » | `path="*"` redirige silencieusement vers `/`. Aucune page 404 |
| 19 routes cartographiées | 13 implémentées, nommées en anglais (`/course`, `/learning`, `/dashboard`) |

**Le défaut le plus grave**, invisible en desktop : le `<nav>` de `Header.tsx` est `hidden md:flex`
**sans menu hamburger**. Sur mobile — terminal principal de la cible africaine — il n'existe
aucune navigation.

S'y ajoutent `CourseEditor.tsx` à 1 432 lignes, et le hack `-mx-8 -mt-8` par lequel `HomePage`
s'échappe de force du conteneur imposé par l'unique gabarit.

---

## 2. Objectifs et critères de succès

| Objectif | Critère vérifiable |
|---|---|
| Identité propre à ZTF | Zéro couleur ni police hors jetons — vérifié par le linter |
| Navigation lisible | Toute formation atteignable en ≤ 2 clics depuis n'importe quelle page ; navigation mobile complète |
| Crédibilité institutionnelle | Diplôme vérifiable publiquement ; équipe pédagogique et enseignants présentés |
| Performance sur 3G | LCP < 2,5 s · CLS < 0,1 · INP < 200 ms · JS première visite < 180 Ko gzip |
| Accessibilité | WCAG 2.1 AA, vérifié par `jest-axe` sur chaque page |
| Maintenabilité | Aucun fichier > 200 lignes ; couverture de tests ≥ 75 % |

---

## 3. Périmètre

**Inclus** — les 19 routes du CDC, plus `/teachers` (20ᵉ route, ajoutée), plus les 2 routes
existantes absentes de la cartographie du CDC (`/checkout/:courseId`, `/chat/:courseId`),
plus une véritable page 404 — soit 23 routes, détaillées au § 11. Plus les endpoints Spring
manquants (voir § 10, chantier 4).

**Exclu** — refonte des services backend existants ; migration MongoDB (V2 du CDC) ;
langues autres que FR et EN ; React Big Calendar (reporté, voir § 4).

---

## 4. Décisions actées, y compris les écarts au CDC

| # | Décision | Justification |
|---|---|---|
| D1 | Deux registres visuels : **clair éditorial** et **sombre scène** | Choix du porteur de projet parmi trois directions présentées |
| D2 | **Le registre suit le mode d'attention** : clair là où l'on décide et travaille, sombre là où l'on regarde et écoute. Une page ne change de registre **qu'une fois**, à la couture hero → corps | Sans règle, l'alternance reproduit l'incohérence actuelle (6 changements de registre sur la seule page d'accueil) |
| D3 | **Georgia → Source Serif 4** *(écart au CDC)* | Georgia n'existe pas sur Fontsource, donc n'est pas auto-hébergeable — alors que le CDC exige l'auto-hébergement. Sur Android elle retombe en fonte système |
| D4 | **Playfair Display supprimée** | Signature typographique la plus reconnaissable des templates gratuits ; cause directe du grief n° 1 |
| D5 | **Rayon 8/12 px → 2 px** *(écart au CDC)* | Les valeurs du CDC sont les défauts de shadcn/ui, c'est-à-dire l'apparence commune à tous |
| D6 | **Magic UI supprimé intégralement** (9 composants) *(écart au CDC)* | Le CDC le justifie par « l'effet premium niveau MasterClass » ; or MasterClass n'a ni particules, ni bouton scintillant, ni texte à dégradé animé. Ces effets sont la signature des templates |
| D7 | **Images réelles libres de droit**, casting varié, étalonnées, figées dans le dépôt. **Zéro génération IA** | Décision du porteur de projet. Les images générées à la volée changent de visage à chaque rechargement et coûtent plusieurs secondes de LCP |
| D8 | **Section témoignages retirée** ; preuve sociale par chiffres réels d'API | Les 3 témoignages actuels sont fictifs. Y associer le visage d'une personne réelle et identifiable poserait un problème de droit à l'image |
| D9 | **`/teachers` ajoutée en 20ᵉ route** | Le CDC prévoit la fiche d'un enseignant sans page d'index. Manque réel pour une institution mettant en avant ses enseignants |
| D10 | **FID → INP < 200 ms** *(écart au CDC)* | Google a retiré le FID des Core Web Vitals en mars 2024 |
| D11 | **React Big Calendar reporté** *(écart au CDC)* | Aucune des 20 routes ne comporte de planning de sessions live |
| D12 | **Backend inclus** : les endpoints manquants seront écrits | Choix du porteur de projet |
| D13 | **Routes conservées en anglais** *(écart au CDC)* | Choix du porteur de projet. Le CDC (partie VIII) prescrit des chemins français. Le maintien en anglais évite un renommage à risque : `OAuth2SuccessHandler.java:66` redirige en dur vers `/dashboard?token=…`, et cette route ne doit pas bouger |
| D14 | **Visuels de banque en attendant le matériel réel de ZTF** | Le matériel photo de l'académie sera fourni ultérieurement. D'ici là, exigence de sérieux et de professionnalisme absolus sur les visuels de substitution (voir § 9.2) |

---

## 5. Système de design

### 5.1 Couleur

Registre clair (« papier ») :

| Jeton | Valeur | Contraste sur `--paper` | Usage |
|---|---|---|---|
| `--paper` | `#FAF8F3` | — | Fond de page |
| `--surface` | `#FFFFFF` | — | Cartes, champs |
| `--ink` | `#12243D` | 14,71:1 | Texte principal |
| `--ink-muted` | `#4A5A70` | 6,62:1 | Texte secondaire |
| `--ink-faint` | `#7A8798` | 3,44:1 | **Gros texte uniquement** (≥ 24 px normal ou ≥ 18,66 px gras) et bordures |
| `--line` | `#E2DDD2` | — | Filets, séparateurs |
| `--blue` | `#1A3C6E` | 10,33:1 | Liens, éléments interactifs (CDC) |
| `--gold` | `#C8960C` | **2,53:1** | **Décoratif uniquement** — voir la règle ci-dessous |
| `--gold-ink` | `#7A5E10` | 5,76:1 | Or lisible : eyebrows, libellés, icônes porteuses de sens |

**Règle de l'or sur fond clair.** L'or de marque `#C8960C` mesure 2,53:1 sur `--paper` et
2,68:1 sur `--surface`. Il échoue le seuil du texte normal (4,5:1), celui du gros texte (3:1)
**et** celui des éléments d'interface non textuels (WCAG 1.4.11, 3:1). Sur fond clair il est
donc réservé aux **filets, séparateurs et aplats de fond** — jamais à du texte, jamais à une
icône porteuse de sens. Tout ce qui doit être lu ou compris utilise `--gold-ink` (5,76:1 sur
papier, 6,11:1 sur blanc). Sur fond sombre, `#C8960C` mesure 7,21:1 et n'a aucune restriction.

Registre sombre (« scène ») :

| Jeton | Valeur | Contraste sur `--scene` | Usage |
|---|---|---|---|
| `--scene` | `#0A0E14` | — | Fond |
| `--scene-surface` | `#11161F` | — | Cartes, panneaux |
| `--scene-ink` | `#F2EFE9` | 16,85:1 | Texte |
| `--gold` | `#D9AE3E` | 9,28:1 | Accent en mode sombre, sans restriction |

États fonctionnels, tous vérifiés AA sur `--paper` : `--success #1F6B4E` (6,05:1) ·
`--warning #7A5E10` (5,76:1) · `--danger #A3281E` (6,87:1) · `--info #0D6E6E` (5,70:1, teal du CDC).

Tous les ratios de ce paragraphe et des deux tableaux ci-dessus ont été **calculés**, pas estimés.
Le contrôle est rejoué en CI : toute nouvelle paire de jetons doit passer le seuil correspondant
à son usage avant d'être introduite.

**Règle** : aucun composant n'écrit jamais un hexadécimal ni un nom de palette Tailwind.
Uniquement des jetons sémantiques, résolus différemment selon le thème. C'est ce qui fait
exister le mode sombre sans dupliquer un seul composant.

**Interdits, supprimés du code** : `amber-*`, `purple-*`, `rose-*`, `emerald-*`, `violet-*`,
`pink-*`, `blue-900/700`, `#06111f`, `.gradient-gold`, `.gradient-orange`, `.text-gradient`,
`.text-gradient-gold`.

### 5.2 Typographie

Trois familles, auto-hébergées via Fontsource, sous-ensemble latin + latin-ext :

- **Source Serif 4** — titres, **noms de cours, prix et chiffres**
- **Inter** — libellés, boutons, formulaires, données denses
- **IBM Plex Mono** — références : numéros de certificat, codes ECTS, identifiants

**Décision différenciante** : le serif porte aussi les chiffres et les prix. Un SaaS met tout
en sans-serif ; une publication met ses chiffres en serif. Cette inversion fait basculer la
lecture de « application » vers « institution ».

Échelle : display 54/1.05 (−.022em) · h1 40/1.1 · h2 30/1.18 · h3 22/1.28 · body 16/1.62 ·
small 14/1.55 · eyebrow 11 Inter 700 uppercase +.22em · mono 13.
Corps minimum 16 px sur mobile (CDC).

### 5.3 Géométrie, ombres, mouvement

- **Rayon 2 px.** L'angle net est un code d'imprimé ; l'angle très arrondi un code d'application.
- **Aucune ombre décorative.** Deux ombres dans tout le système, réservées aux surfaces qui
  flottent réellement (menus, dialogues). Ailleurs, les filets de 1 px séparent.
- **Grille de 4 px** — 4, 8, 12, 16, 24, 32, 48, 64, 96 (CDC).
- **Mouvement** : 150–250 ms, ease-out, uniquement sur changement d'état.
  `prefers-reduced-motion` respecté.

---

## 6. Architecture du code

Passage d'une organisation par type de fichier à une organisation par domaine métier :

```
src/
├─ app/            router (lazy) · providers · guards
├─ design/         tokens.css · fonts.css · primitives/
├─ shell/          Header + MobileNav · Footer · Breadcrumb · ThemeToggle · layouts/
├─ features/       catalog · course · auth · enrollment · learning · payment
│                  community · media · teaching · admin · account
│                  └─ chacune : api.ts · schema.ts · hooks.ts · components/ · pages/
├─ lib/            http.ts · images.ts · format.ts · cn.ts
└─ i18n/           fr.json · en.json
```

**Dépendances à sens unique** : `features → shell → design → lib`. Une primitive ne connaît
jamais un cours, un paiement ni un utilisateur.

**Cinq règles**

1. Une feature n'importe jamais l'intérieur d'une autre ; les échanges passent par son `index.ts`.
2. Plafond de **200 lignes par fichier**.
3. Une page assemble, elle ne calcule pas.
4. `services/api.ts` éclate en 8 tranches, une par feature.
5. Ce qui doit être dans l'URL y est — filtres, pagination, onglets via `useSearchParams`.

**Répartition de l'état** : serveur → TanStack Query exclusivement · client → Zustand pour
quatre choses seulement (session, thème, préférences, langue) · formulaires → React Hook Form
+ Zod · navigation → URL.

---

## 7. Conventions d'ingénierie

### 7.1 Couche HTTP

Un seul module parle réseau (`lib/http.ts`). Il expose une classe d'erreur unique
`AppError { status, code, message, fieldErrors? }`. Sur 401 : une tentative de refresh, rejeu
de la requête, sinon déconnexion propre avec `returnTo` pour ramener l'utilisateur là où il
était. *(Aujourd'hui : aucune gestion du 401 — à l'expiration du jeton, tous les appels
échouent en silence.)*

### 7.2 Validation à la frontière

Les schémas Zod sont la source unique de vérité : ils produisent les types (`z.infer`) **et**
valident les réponses d'API. *(Aujourd'hui `HomePage` écrit `allCourses as Course[]` — une
assertion qui affirme au compilateur ce que rien ne vérifie.)*

### 7.3 Clés de cache

Une fabrique typée par feature (`courseKeys.all / lists() / list(f) / details() / detail(slug)`),
qui rend l'invalidation juste plutôt que devinée et supprime la classe de bugs
« j'ai payé mais mon tableau de bord ne se met pas à jour ».

### 7.4 Hooks

Un hook, une préoccupation. Pas d'état dérivé en `useState` + `useEffect`. `useEffect` réservé
à la synchronisation avec un système extérieur à React. **Jamais de `useEffect` pour charger
des données.** Les deux `useEffect` de `Header.tsx` (clic extérieur, scroll) disparaissent : le
premier devient un `DropdownMenu` Radix — qui apporte clavier, Échap, piège de focus et ARIA —
le second un hook `useScrolled()`.

### 7.5 Composants

Composition plutôt qu'avalanche de props booléens. Variantes déclarées par `cva`. `forwardRef`
sur toute primitive. Zéro `style={{ }}` en ligne pour ce qui est thémable.

### 7.6 Formulaires

Schéma Zod → type et validation. Un composant `<Field>` câble automatiquement `label htmlFor`,
`aria-invalid`, `aria-describedby` et `role="alert"`. Les `fieldErrors` renvoyés par Spring
sont réinjectés sur le champ concerné.

### 7.7 Tests

Vitest + Testing Library + MSW + `jest-axe`. On teste le comportement, jamais l'implémentation.
Couverture ≥ 75 % (CDC). *(Aujourd'hui : aucune infrastructure de test.)*

### 7.8 Ce qui rend ces conventions inviolables

Des conventions écrites se dégradent ; des conventions outillées non. En CI, bloquant :

| Règle | Effet |
|---|---|
| `import/no-restricted-paths` | Le sens des dépendances devient une erreur de compilation |
| `max-lines: 200` | `CourseEditor.tsx` ne peut plus repartir à 1 432 lignes |
| `no-restricted-syntax` (couleurs) | Hexadécimaux et classes de palette Tailwind interdits dans le JSX — **le retour du chaos chromatique devient mécaniquement impossible** |
| `react-hooks/exhaustive-deps` | En erreur, pas en avertissement |
| `tsc --noEmit` strict + `noUncheckedIndexedAccess` | Zéro `any` (CDC) |
| Lighthouse CI | Budget de performance opposable |

---

## 8. Châssis et navigation

### 8.1 Navigation

**Desktop** — trois entrées (`Formations`, `L'Académie`, `Diplômes`) plus une recherche visible.
Le menu Formations se déploie sur deux axes : par département (5) et par niveau (5). Chaque
entrée pointe vers une **URL de catalogue filtrée et partageable**
(`/catalogue?department=interpretation&level=licence` — paramètres en anglais, conformément à
D13 et à l'usage déjà en place dans `HomePage` et `RootLayout`).

**Mobile** — tiroir plein écran (`Dialog` Radix : piège de focus, Échap, verrouillage du
défilement, ARIA) ; une fois connecté, **barre basse à quatre onglets** (Accueil, Explorer,
Mes cours, Profil). Cibles tactiles 44 × 44 px, corps 16 px (CDC).

**Fil d'Ariane** sur toutes les pages sauf l'accueil et le lecteur — où il prend la forme
`Cours › Section › Leçon` exigée par le CDC.

### 8.2 Quatre gabarits

| Gabarit | Registre | Routes |
|---|---|---|
| `PublicLayout` | Clair | accueil, catalogue, fiche cours, enseignants, profil enseignant, vérification |
| `AppLayout` | Clair, dense, sans pied de page marketing | tableaux de bord, mes cours, certificats, paramètres, enseigner, admin |
| `ImmersiveLayout` | Sombre | lecteur de cours |
| `AuthLayout` | Clair, **zéro navigation** | connexion, inscription |

*(Aujourd'hui : un seul gabarit `container py-8` pour tout, d'où le `-mx-8 -mt-8` de la page
d'accueil.)*

### 8.3 Zero Dead Ends

404 réelle avec recherche, départements et cours récents · catalogue sans résultat nommant le
filtre responsable et proposant de le retirer · tableau de bord vide proposant un premier pas ·
erreur réseau avec bouton Réessayer sans perte d'état.

---

## 9. Qualité

### 9.1 Budget de performance (bloquant en CI)

LCP < 2,5 s · CLS < 0,1 · INP < 200 ms · JS première visite < 180 Ko gzip · polices < 90 Ko.

Leviers : découpage par route en `React.lazy` (les 11 pages sont aujourd'hui importées en bloc) ·
polices auto-hébergées, sous-ensemble, `preload` sur les deux graisses du hero (l'`@import`
Google Fonts actuel bloque le rendu) · dimensions déclarées sur toutes les images · chargement
des bibliothèques lourdes (Video.js, HLS.js, Wavesurfer, React-PDF, Tiptap, dnd-kit, Recharts)
**uniquement sur la route qui les utilise**.

### 9.2 Pipeline images

1. Sélection — Unsplash / Pexels, usage commercial, ~40 visuels, casting varié
2. **Étalonnage commun** — recadrage en ratios fixes, dominante chaude et contraste homogènes
   (l'étape qui empêche l'effet patchwork)
3. Encodage — AVIF + WebP + JPEG de secours, 4 largeurs (400/800/1200/1600)
4. Livraison — `<picture>` + `srcset`/`sizes`, dimensions déclarées, `lazy` sauf le hero
5. Versionné dans le dépôt ; le proxy `/pollinations/` disparaît de nginx

**Standard de direction artistique** (D14). Le matériel photo réel de ZTF sera fourni plus tard ;
les visuels de substitution doivent d'ici là tenir un niveau institutionnel, sans exception :

- **Le geste et l'instrument priment sur le visage.** Mains sur un clavier, archet, table de
  mixage, partition. Plus intemporel, plus élégant, et cela évite le catalogue de portraits qui
  trahit immédiatement la banque d'images.
- **Aucun visage identifiable en position d'engagement institutionnel.** Un portrait de banque
  ne peut jamais illustrer un enseignant nommé, un étudiant diplômé ou un témoignage. Ces
  emplacements affichent un état vide soigné jusqu'à réception du matériel ZTF.
- **Lumière dirigée, jamais de flash frontal ni de fond blanc de studio générique.** Contre-jour,
  lumière de scène, lumière naturelle latérale.
- **Rejet systématique** des poses souriantes face caméra, des mises en scène « corporate » et
  des images à filigrane ou à cadrage publicitaire.
- **Emplacements du matériel réel documentés** dans le code (`design/images/manifest.ts`), avec
  ratio, usage et légende attendus — pour que la substitution ultérieure soit un remplacement de
  fichiers, pas une reprise de mise en page.

### 9.3 Accessibilité WCAG 2.1 AA

Contrastes calculés et rejoués en CI (d'où l'existence de `--gold-ink` et la restriction de
`--gold` au décoratif sur fond clair, § 5.1) · navigation clavier complète via Radix ·
focus visible 2 px sur les deux thèmes · lien d'évitement · repères et hiérarchie de titres ·
régions live pour toasts, progression et sauvegarde auto · sous-titres `.vtt` · zoom 200 % ·
cibles 44 × 44 px · `prefers-reduced-motion` · taille de police ajustable 14/16/18 px persistée ·
`jest-axe` sur chaque page.

### 9.4 Contexte africain

Mode économiseur de données (réglage explicite et détection via `navigator.connection`) :
images basse définition, vidéo 360p, autoplay coupé · squelettes partout, spinner nulle part ·
défilement infini sur le catalogue · PWA installable avec leçons récentes hors ligne et
resynchronisation de la progression · rien ne bloque sur le réseau au premier rendu.

### 9.5 Internationalisation

Socle i18next câblé dès le chantier 0, français seul. Les chaînes sortent du JSX au fur et à
mesure des refontes. L'anglais est traduit d'un bloc au chantier 5. Dates, prix et durées via
`Intl`. Direction `rtl` prévue dans les jetons, non activée.

---

## 10. Découpage en chantiers

Approche retenue : **noyau minimal, puis vitrine, puis élargissement**. Chaque chantier est
livrable et testable séparément ; chacun donne lieu à son propre plan d'implémentation.

| # | Chantier | Contenu |
|---|---|---|
| **0** | **Socle** | Jetons, 3 polices auto-hébergées, thème clair/sombre sans FOUC, 4 gabarits, en-tête avec **navigation mobile**, pied de page, 404, fil d'Ariane, primitives Radix, pipeline images, i18n câblé, routes `lazy`, `lib/http.ts`, ESLint architectural, Vitest + MSW + jest-axe, Lighthouse CI |
| **1** | **Vitrine** | Accueil · Catalogue · Fiche cours · Enseignants · Profil enseignant |
| **2** | **Parcours étudiant** | Connexion · Inscription · Paiement · Tableau de bord · Mes cours · Lecteur · Certificats · Paramètres |
| **3** | **Espace enseignant** | Tableau de bord · Création de cours · Éditeur (éclatement des 1 432 lignes) |
| **4** | **Admin et backend** | Vue d'ensemble · Validation · Utilisateurs · Finances · Vérification de certificat, **plus les endpoints Spring manquants** |
| **5** | **Finitions** | Traduction anglaise · PWA · audit d'accessibilité · budget de performance |

Le chantier 0 est délibérément incomplet : on ne conçoit pas un composant tant qu'une page
ne le réclame pas. Il grandit au contact des pages réelles.

---

## 11. Inventaire des routes

Les chemins restent en anglais (D13), contrairement à la partie VIII du CDC. Les routes
existantes ne bougent pas ; les routes manquantes sont créées selon la même convention.
`/dashboard` est **gelée** : `OAuth2SuccessHandler.java:66` y redirige en dur.

| Route | Page | Accès | Gabarit | Chantier | État |
|---|---|---|---|---|---|
| `/` | Accueil | Public | Public | 1 | existe |
| `/catalogue` | Catalogue | Public | Public | 1 | existe |
| `/course/:slug` | Détail cours | Public | Public | 1 | existe |
| `/teachers` | Équipe pédagogique | Public | Public | 1 | **nouveau** (D9) |
| `/teachers/:username` | Profil enseignant | Public | Public | 1 | **nouveau** |
| `/certificates/verify/:token` | Vérification certificat | Public | Public | 4 | **nouveau** |
| `/auth/login` | Connexion | Visiteur | Auth | 2 | renommée depuis `/auth/connexion` |
| `/auth/register` | Inscription | Visiteur | Auth | 2 | renommée depuis `/auth/inscription` |
| `/checkout/:courseId` | Paiement | Étudiant | App | 2 | existe |
| `/learning/:courseId/:lessonId` | Lecteur de cours | Acheteur | Immersive | 2 | existe, `:lessonId` ajouté (CDC) |
| `/dashboard` | Tableau de bord étudiant | Étudiant | App | 2 | existe — **gelée (OAuth2)** |
| `/my-courses` | Mes cours | Étudiant | App | 2 | **nouveau** |
| `/certificates` | Mes certificats | Étudiant | App | 2 | **nouveau** |
| `/settings` | Paramètres du compte | Connecté | App | 2 | **nouveau** |
| `/chat/:courseId` | Messagerie de cours | Acheteur | App | 2 | existe |
| `/teacher` | Tableau de bord enseignant | Enseignant | App | 3 | existe |
| `/teacher/courses/new` | Créer un cours | Enseignant | App | 3 | renommée depuis `/enseigner/cours/creer` |
| `/teacher/courses/:id/edit` | Éditer un cours | Enseignant | App | 3 | renommée depuis `/teacher/cours/:courseId` |
| `/admin` | Vue d'ensemble | Admin | App | 4 | existe |
| `/admin/review` | File de validation | Admin | App | 4 | **nouveau** |
| `/admin/users` | Gestion des utilisateurs | Admin | App | 4 | **nouveau** |
| `/admin/finance` | Finances | Admin | App | 4 | **nouveau** |
| `*` | 404 | Public | Public | 0 | **nouveau** |

Quatre routes seulement changent de chemin — les trois françaises restantes et l'éditeur, pour
tenir la convention anglaise. Elles conservent une redirection depuis leur ancien chemin.

---

## 12. Risques

| Risque | Portée | Atténuation |
|---|---|---|
| Le matériel photo réel de ZTF tarde à arriver | Le grief « pas sérieux » n'est qu'à moitié réglé | Standard de direction artistique strict sur les visuels de substitution (§ 9.2) ; emplacements du matériel réel décrits dans `design/images/manifest.ts` pour que la substitution soit un simple remplacement de fichiers |
| Les endpoints admin manquants sont plus lourds que prévu | Chantier 4 | Chantier 4 placé en dernier avant les finitions ; les 3 écrans admin ne sont vus par aucun des critiques |
| La direction sombre fatigue sur les écrans denses | Chantiers 2 et 3 | La règle D2 confine le sombre au lecteur et au mode sombre optionnel ; les tableaux de bord restent clairs |
| Volume total du chantier | Ensemble | Chantiers indépendants et livrables ; arrêt possible après le chantier 1 avec un gain déjà réel |
| Les écarts au CDC doivent être répercutés dans le document officiel | Gouvernance | Les 6 écarts (D3, D5, D6, D9, D10, D11) sont listés au § 4 pour report dans le CDC v4 |

---

## 13. Étape suivante

Plan d'implémentation du **chantier 0**, via `superpowers:writing-plans`.
