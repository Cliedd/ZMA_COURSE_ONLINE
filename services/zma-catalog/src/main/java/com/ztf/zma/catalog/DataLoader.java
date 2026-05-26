package com.ztf.zma.catalog;

import com.ztf.zma.catalog.domain.Course;
import com.ztf.zma.catalog.repository.CourseRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

/**
 * Seeds the course catalog on first startup (when the table is empty).
 * Data sourced from: ZTF Music Académie — Contenu des Cours v2025.
 */
@Configuration
public class DataLoader {

    @Bean
    public ApplicationRunner seedCourses(CourseRepository repo) {
        return args -> {
            if (repo.count() > 0) return;
            repo.saveAll(buildCourseList());
            System.out.println("[ZMA] Catalog seeded with " + repo.count() + " courses.");
        };
    }

    private List<Course> buildCourseList() {
        List<Course> list = new ArrayList<>();
        int gi = 0; // gradientIndex cycles 0-9

        // ── D1 · F1 — Musique Classique et Contemporaine ─────────────────────

        list.add(course(gi++,
                "licence-interpretation-instrumentale",
                "Licence Interprétation Instrumentale",
                "Interprétation et Pratique Instrumentale",
                "Musique Classique et Contemporaine",
                "Licence", 180, 450.0, 320, 4.9, 180,
                "Prof. Emmanuel Mbarga",
                "Formez-vous aux standards des meilleures académies mondiales. Technique instrumentale selon les méthodes Czerny, Kreutzer, Arban et Taffanel-Gaubert. Répertoire baroque, classique, romantique jusqu'à la création contemporaine.",
                "Maîtrise complète de la technique instrumentale|Répertoire de Bach à Bartók|Pratique d'orchestre et de musique de chambre|Solfège et harmonie tonale avancée|Préparation aux concours internationaux|Récital de Licence de 50 minutes",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Tronc Commun & Fondamentaux\",\"lessons\":[\"Solfège rythmique et mélodique intensif\",\"Harmonie tonale : triades, 7e de dominante\",\"Histoire de la musique occidentale (origines–XIXe)\",\"Histoire des musiques africaines (introduction)\",\"Anglais musical\",\"Cours individuel instrument : technique fondamentale\",\"Orchestre de chambre — tutti et pupitres\"]},{\"id\":\"s2\",\"title\":\"S3-S4 — Perfectionnement\",\"lessons\":[\"Répertoire soliste : sonates, concertos romantiques\",\"Travail stylistique approfondi\",\"Déchiffrage avancé\",\"Musique de chambre (2 à 5 musiciens)\",\"Harmonie avancée : 7e degrés, 9e, altérations\",\"Introduction au contrepoint\",\"Initiation au jazz et aux musiques africaines\"]},{\"id\":\"s3\",\"title\":\"S5-S6 — Niveau Récital & Professionnalisation\",\"lessons\":[\"Cours individuel 2h/semaine — niveau concours\",\"Préparation du récital de Licence (50 min)\",\"Stage en orchestre ou ensemble professionnel\",\"Masterclasse internationale\",\"Enregistrement studio\",\"Droit du spectacle et méthodologie\"]}]",
                "Musicien d'orchestre|Musicien de chambre|Soliste|Accompagnateur|Enseignant en conservatoire"
        ));

        list.add(course(gi++,
                "master-interpretation-recherche-artistique",
                "Master Interprétation et Recherche Artistique",
                "Interprétation et Pratique Instrumentale",
                "Musique Classique et Contemporaine",
                "Master", 120, 360.0, 95, 4.9, 120,
                "Prof. Pauline Essomba",
                "Cours individuel 2h/semaine avec maître reconnu. Répertoire soliste mondial, analyse historique de l'interprétation, pratiques d'ensemble avancées du XXe–XXIe siècle. Mémoire de recherche artistique.",
                "Répertoire soliste de niveau international|Analyse de l'interprétation historiquement informée|Pratiques d'ensemble contemporaines|Esthétique et recherche artistique|Mémoire de 40–60 pages|Récital de Master (65–75 min)",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Perfectionnement & Esthétique\",\"lessons\":[\"Cours individuel 2h/semaine avec maître reconnu\",\"Répertoire soliste : Beethoven, Brahms, Bartók, Ligeti\",\"Pratiques d'ensemble avancées (XXe–XXIe siècle)\",\"Esthétique : Bartók, Messiaen, Ligeti, Dutilleux, Nono\",\"Interprétation historiquement informée (HIP)\",\"Séminaire : l'artiste africain dans le dialogue mondial\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Projet Artistique & Insertion\",\"lessons\":[\"Récital de Master (65–75 minutes) devant jury international\",\"Enregistrement professionnel d'un programme complet\",\"Mémoire de recherche artistique (40–60 pages)\",\"Soutenance publique\",\"Droit du spectacle et contrats d'artiste\",\"Stratégie de carrière internationale\"]}]",
                "Soliste de concert|Chef d'ensemble|Enseignant en académie supérieure|Artiste résident"
        ));

        // ── D1 · F2 — Jazz et Musiques Actuelles ─────────────────────────────

        list.add(course(gi++,
                "licence-jazz-musiques-improvisees",
                "Licence Jazz et Musiques Improvisées",
                "Interprétation et Pratique Instrumentale",
                "Jazz et Musiques Actuelles",
                "Licence", 180, 450.0, 410, 4.8, 180,
                "Prof. Richard Abanda",
                "Méthodes jazz de référence mondiale : David Baker, Jerry Coker, Mark Levine. Harmonie jazz, modes, approche bebop, post-bop. Histoire du jazz des origines africaines au jazz contemporain. Big band et petits combos.",
                "Harmonie jazz complète (accords 7e, extensions, voicings)|Modes et approche bebop|Improvisation sur tous types de grilles|Arrangement pour petites formations|Ear training jazz — transcription des grands solistes|Histoire du jazz : New Orleans → Swing → Bebop → Fusion",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Fondamentaux Jazz\",\"lessons\":[\"Harmonie jazz : accords Maj7, m7, 7, m7b5, dim7\",\"Extensions et voicings au piano\",\"Ear training : transcription des grands solistes\",\"Rythme et groove : Afro-cubain, bossa, swing, funk\",\"Big band : jeu en section\",\"Atelier improvisation guidée sur grilles ii-V-I\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Développement & Bebop\",\"lessons\":[\"Modes : dorien, mixolydien, lydien, altéré, diminué\",\"Approche bebop : échelles, ornements, articulation Charlie Parker\",\"Post-bop : Coltrane changes, free jazz encadré\",\"Arrangement pour trio, quartet, quintet\",\"Composition de standards originaux\",\"Histoire du jazz — des origines africaines au jazz contemporain\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Scène Internationale & Studio\",\"lessons\":[\"Instrument au niveau scène internationale\",\"Composition et programme original de 50 min\",\"Enregistrement studio EP jazz (4–6 titres)\",\"Miles Davis, Bill Evans, Coltrane, Abdullah Ibrahim, Richard Bona\",\"Concert de fin de cycle devant jury professionnel\",\"Stage en club, festival ou avec artiste professionnel\"]}]",
                "Musicien de jazz (scène, studio, big band)|Arrangeur|Compositeur|Instrumentiste polyvalent"
        ));

        list.add(course(gi++,
                "master-jazz-performance-direction-ensemble",
                "Master Jazz Performance et Direction d'Ensemble",
                "Interprétation et Pratique Instrumentale",
                "Jazz et Musiques Actuelles",
                "Master", 120, 360.0, 87, 4.9, 120,
                "Prof. Richard Abanda",
                "Cours instrumental très haut niveau. Composition et arrangement pour grands ensembles (10–20 musiciens). Orchestrations de référence : Ellington, Basie, Maria Schneider, Ibrahim. Production d'un album studio complet.",
                "Composition pour big band (10–20 musiciens)|Écriture avancée : polyphonie jazz, contrepoint jazz|Orchestrations : Ellington, Basie, Maria Schneider|Production d'un album complet|Direction artistique|Stratégie de diffusion internationale",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Composition & Orchestration\",\"lessons\":[\"Cours instrumental 2h/semaine très haut niveau\",\"Composition pour grands ensembles (10–20 musiciens)\",\"Polyphonie jazz, contrepoint jazz\",\"Orchestrations : Ellington, Basie, Maria Schneider, Ibrahim\",\"Esthétique du jazz contemporain et racines africaines\",\"Analyse et transcription des grandes œuvres\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Album & Carrière\",\"lessons\":[\"Production d'un album studio complet (10–12 titres)\",\"Direction artistique complète\",\"Mémoire artistique sur la démarche créatrice\",\"Concert de Master devant jury international\",\"Labels indépendants et plateformes de streaming\",\"Stratégie de tournées internationales\"]}]",
                "Soliste de jazz international|Directeur de big band|Compositeur-arrangeur|Producteur artistique jazz"
        ));

        // ── D1 · F3 — Musiques Africaines ────────────────────────────────────

        list.add(course(gi++,
                "licence-musiques-africaines-percussions",
                "Licence Musiques Africaines et Percussions",
                "Interprétation et Pratique Instrumentale",
                "Musiques Africaines, Tradition et Création Contemporaine",
                "Licence", 180, 450.0, 520, 4.9, 180,
                "Prof. Thierry Ndombi",
                "La filière centrale de l'identité ZMA. Djembé, balafon, kora, ngoni, sanza, tam-tam enseignés avec la même rigueur que le classique occidental. Polyrythmie, collectage de terrain, fusion afro-contemporaine. Suivez les traces de Richard Bona, Youssou N'Dour, Angélique Kidjo.",
                "Maîtrise instrumentale d'un instrument africain au choix|Polyrythmie complexe (3 contre 4, 5 contre 4)|Collectage de terrain avec maître traditionnel|Organologie africaine|Fusion afro-contemporaine|Histoire des musiques africaines (des royaumes à nos jours)",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Instrument & Histoire\",\"lessons\":[\"Instrument principal : djembé, balafon, kora, ngoni ou sanza\",\"Rythmes fondamentaux : cellules rythmiques, ostinatos, polyrythmie 2 voix\",\"Chant traditionnel africain : polyphonie d'Afrique centrale\",\"Histoire des musiques africaines : Afrique centrale, occidentale, orientale\",\"Solfège et harmonie (tronc commun)\",\"Pratique chorale\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Perfectionnement & Terrain\",\"lessons\":[\"Polyrythmie complexe (3 contre 4, 5 contre 4, hoquets)\",\"Collectage de terrain : village ou maître traditionnel reconnu\",\"Organologie africaine : classification, facture instrumentale\",\"Transcription des musiques orales (ethnomusicologie appliquée)\",\"Atelier fusion afro-contemporaine\",\"Danse associée aux rythmes étudiés\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Concert & Création\",\"lessons\":[\"Instrument niveau concours international\",\"Récital de Licence (50 min) : traditionnel + création originale\",\"Composition d'une œuvre fusionnant tradition africaine et esthétiques mondiales\",\"Enregistrement studio\",\"Stage en festival international de world music\",\"Mémoire sur un répertoire africain spécifique\"]}]",
                "Musicien de scène internationale (world music, fusion)|Artiste résident|Enseignant d'instruments africains|Chef d'ensemble|Musicien de studio"
        ));

        list.add(course(gi++,
                "master-interpretation-afro-contemporaine",
                "Master Interprétation Afro-Contemporaine et Création Originale",
                "Interprétation et Pratique Instrumentale",
                "Musiques Africaines, Tradition et Création Contemporaine",
                "Master", 120, 360.0, 72, 4.9, 120,
                "Prof. Thierry Ndombi",
                "Cours individuel de très haut niveau avec master teacher reconnu. Composition pour grands ensembles afro-contemporains. Analyse des artistes africains de rayonnement international : Richard Bona, Youssou N'Dour, Angélique Kidjo, Rokia Traoré.",
                "Interprétation niveau scène internationale|Composition pour grands ensembles afro-contemporains|Analyse des trajectoires des grands artistes africains|Production discographique world music|Album ou EP enregistré en studio professionnel|Positionnement dans le marché musical mondial",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Très Haut Niveau & Composition\",\"lessons\":[\"Cours individuel avec master teacher reconnu\",\"Composition pour 10–20 musiciens (africains + occidentaux)\",\"Séminaire : l'artiste africain dans le paysage du XXIe siècle\",\"Richard Bona, Youssou N'Dour, Angélique Kidjo, Rokia Traoré\",\"Fatoumata Diawara : trajectoires et stratégies artistiques\",\"Atelier de production discographique world music\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Récital & Album\",\"lessons\":[\"Récital de Master (70 min) devant jury international\",\"Production d'un album ou EP en studio professionnel\",\"Mémoire artistique (40 pages) : démarche créatrice\",\"Concert national ou international en festival\",\"Distribution et stratégie de carrière\"]}]",
                "Artiste de renommée internationale|Compositeur-arrangeur world music|Directeur artistique d'ensemble afro-contemporain|Producteur discographique"
        ));

        // ── D1 · F4 — Chant et Art Vocal ─────────────────────────────────────

        list.add(course(gi++,
                "licence-chant-techniques-vocales",
                "Licence Chant et Techniques Vocales",
                "Interprétation et Pratique Instrumentale",
                "Chant et Art Vocal",
                "Licence", 180, 450.0, 280, 4.8, 180,
                "Prof. Céline Biyong",
                "Technique Bel Canto — standard ZMA pour l'enseignement vocal. Anatomie de la voix, appui diaphragmatique, placement vocal, diction (français, italien, anglais, langues africaines). Répertoire lyrique, mélodie française, lied, spiritual, chanson africaine élaborée.",
                "Technique vocale Bel Canto complète|Gestion du souffle et placement vocal|Diction : français, italien, anglais, Ewondo, Duala, Lingala|Répertoire lyrique international|Micro-technique et chant amplifié|Coaching avec pianiste-accompagnateur professionnel",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Technique Vocale Fondamentale\",\"lessons\":[\"Anatomie et physiologie de la voix (larynx, cordes vocales)\",\"Gestion du souffle : appui diaphragmatique, colonne d'air\",\"Placement vocal : résonateurs du masque, vibrato\",\"Diction : français (AFI), italien (Bel Canto), anglais, langues africaines\",\"Piano complémentaire obligatoire\",\"Initiation : mélodie française, lied, spiritual, chanson africaine\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Perfectionnement & Scène\",\"lessons\":[\"Répertoire classique : Fauré, Duparc, Ravel, Schubert, Schumann\",\"Interprétation et expression scénique : gestuelle, présence\",\"Micro-technique : chant amplifié vs acoustique\",\"Introduction aux rôles d'opéra\",\"Coaching avec pianiste-accompagnateur professionnel\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Récital International\",\"lessons\":[\"Cours individuel 2h/semaine — niveau récital international\",\"Récital de Licence (50 min) : au moins 3 esthétiques\",\"Masterclasses avec chanteurs internationaux invités\",\"Stage en production : concert, studio, spectacle musical\",\"Auditions et préparation du dossier artistique\"]}]",
                "Chanteur soliste (lyrique, jazz vocal, contemporain)|Choriste professionnel|Chanteur de studio|Enseignant de chant"
        ));

        list.add(course(gi++,
                "master-chant-lyrique-opera",
                "Master Chant Lyrique, Art Vocal et Opéra",
                "Interprétation et Pratique Instrumentale",
                "Chant et Art Vocal",
                "Master", 120, 360.0, 45, 4.9, 120,
                "Prof. Céline Biyong",
                "Coaching d'opéra avec metteur en scène. Répertoire : Mozart, Verdi, Puccini, Debussy, Britten. Grands chanteurs africains : Jessye Norman, Leontyne Price, Angélique Kidjo. Rôle complet dans une production devant public réel.",
                "Rôles d'opéra : Mozart, Verdi, Puccini, Britten|Coaching musical + mise en scène|Grands chanteurs africains : Jessye Norman, Angélique Kidjo|Enregistrement studio discographique|Récital de Master (60 min) devant jury international|Stratégie de carrière lyrique internationale",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Opéra & Grands Maîtres\",\"lessons\":[\"Cours individuel 2h/semaine avec maître chanteur international\",\"Coaching opéra : coach musical + metteur en scène\",\"Mozart (Nozze di Figaro, Don Giovanni), Verdi, Puccini\",\"Debussy (Pelléas), Britten, Janáček\",\"Jessye Norman, Leontyne Price, Angélique Kidjo, Rokia Traoré\",\"Analyse vocale : écoute comparée des grands enregistrements\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Production & Carrière\",\"lessons\":[\"Rôle complet dans une production d'opéra devant public réel\",\"Récital de Master (60 min) devant jury international\",\"Enregistrement studio (récital discographique)\",\"Mémoire (40 pages) : rôle, compositeur ou art vocal contemporain\",\"Stratégie de carrière lyrique internationale\"]}]",
                "Soliste lyrique international|Chanteur d'opéra|Récitaliste (mélodie, lied)|Directeur de chœur professionnel"
        ));

        // ── D2 · F1 — Composition et Orchestration ───────────────────────────

        list.add(course(gi++,
                "licence-composition-ecriture-musicale",
                "Licence Composition et Écriture Musicale",
                "Composition, Écriture et Théorie Musicale",
                "Composition et Orchestration",
                "Licence", 180, 420.0, 180, 4.8, 160,
                "Prof. Marc Akono",
                "Harmonie tonale complète, contrepoint, analyse des formes musicales. Orchestration des familles d'instruments. Écriture modale et pentatonique africaine. Informatique musicale (Sibelius, MuseScore). Composition de bande originale de court-métrage.",
                "Harmonie tonale complète (triades, 7e, 9e, altérations, modulations)|Contrepoint : bicinium et cantus firmus|Orchestration : cordes, vents, percussions|Écriture modale et pentatonique africaine|Sibelius ou MuseScore — notation musicale professionnelle|Composition pour ensemble de chambre (12–18 min)",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Écriture Fondamentale\",\"lessons\":[\"Harmonie tonale complète : modulations, altérations\",\"Contrepoint : bicinium et cantus firmus strict puis libre\",\"Analyse : invention, fugue, sonate, rondo\",\"Formation auditive : solfège et dictée harmonique\",\"Initiation à la composition libre\",\"Histoire des formes musicales africaines et occidentales\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Orchestration & Informatique\",\"lessons\":[\"Composition pour piano, instrument+piano, trio\",\"Orchestration des cordes : harmoniques, sul ponticello, pizzicato\",\"Orchestration des vents et percussions\",\"Écriture modale et pentatonique africaine\",\"Sibelius ou MuseScore (obligatoire)\",\"Atelier de création hebdomadaire : pièces jouées en séance\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Concert & Professionnalisation\",\"lessons\":[\"Composition d'une œuvre de 12–18 min pour ensemble ou orchestre\",\"Présentation en concert\",\"Bande originale d'un court-métrage (partenariat réalisateur local)\",\"Stage auprès d'un compositeur professionnel\",\"Mémoire d'analyse : œuvre orchestrale ou africaine majeure\"]}]",
                "Compositeur pour ensemble et orchestre|Arrangeur pour artistes et studios|Compositeur de musiques de films africains|Chef de production musicale"
        ));

        list.add(course(gi++,
                "master-composition-creation-musicale",
                "Master Composition et Création Musicale",
                "Composition, Écriture et Théorie Musicale",
                "Composition et Orchestration",
                "Master", 120, 360.0, 55, 4.8, 110,
                "Prof. Marc Akono",
                "Composition pour orchestre et grands ensembles. Techniques contemporaines : sons multiphoniques, micro-intervalles, clusters, spectralisme. Électroacoustique. Écriture pour le cinéma et les séries. Enregistrement avec orchestre ou ensemble professionnel.",
                "Composition pour orchestre (150+ instruments)|Techniques étendues : multiphoniques, micro-intervalles, spectralisme|Électroacoustique : composition acousmatique et musique mixte|Écriture pour cinéma, TV et séries|Enregistrement avec orchestre professionnel|Mémoire de composition (50 pages)",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Orchestre & Électroacoustique\",\"lessons\":[\"Composition pour orchestre et grands ensembles\",\"Techniques étendues : sons multiphoniques, micro-intervalles, clusters\",\"Électroacoustique : composition acousmatique\",\"Musique mixte : instruments + live electronics\",\"Séminaire d'esthétique musicale\",\"Écriture pour cinéma, TV et séries africaines\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Production Audiovisuelle\",\"lessons\":[\"Composition bande originale d'une production réelle\",\"Enregistrement avec orchestre ou ensemble professionnel\",\"Mémoire de composition (50 pages)\",\"Présentation devant jury professionnel\",\"Compositeurs, directeurs artistiques, producteurs\"]}]",
                "Compositeur de renommée internationale|Compositeur pour le cinéma et l'audiovisuel|Directeur musical de production"
        ));

        list.add(course(gi++,
                "master-composition-musique-image",
                "Master Composition de Musique à l'Image",
                "Composition, Écriture et Théorie Musicale",
                "Composition pour l'Image et les Médias",
                "Master", 120, 360.0, 68, 4.8, 110,
                "Prof. Hervé Billong",
                "Analyse des grandes bandes originales : Herrmann, Williams, Zimmer, Morricone, et compositeurs africains pour le cinéma africain. Synchronisation musicale, sound design, Foley musical. Production d'une BO complète en partenariat avec une école de cinéma.",
                "Analyse des grandes BO : Herrmann, Williams, Zimmer, Morricone|Synchronisation musicale : spotting, temp tracks, click track|Sound design : ambiances, effets, Foley musical|Ateliers avec réalisateurs africains et internationaux|Logiciels : Logic Pro, Cubase, Sibelius|Mémoire sur l'identité sonore du cinéma africain",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Cinéma & Sound Design\",\"lessons\":[\"Grandes BO : Herrmann, Williams, Zimmer, Morricone, Ola Onabule\",\"Synchronisation : spotting session, temp tracks, calage image-son\",\"Sound design : ambiances, effets, Foley musical\",\"Ateliers avec réalisateurs africains et internationaux\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Production d'une BO Réelle\",\"lessons\":[\"Composition complète d'une BO (court ou long-métrage)\",\"Partenariat avec une école de cinéma ou producteur africain\",\"Enregistrement avec orchestre en studio\",\"Mémoire sur l'identité sonore du cinéma africain contemporain\",\"Soutenance devant jury professionnel\"]}]",
                "Compositeur de bandes originales|Sound designer|Directeur musical de productions audiovisuelles"
        ));

        // ── D3 · F1 — Ingénierie Sonore et Production ────────────────────────

        list.add(course(gi++,
                "licence-techniques-son-production",
                "Licence Techniques du Son et Production Musicale",
                "Technologies Musicales et Production Audiovisuelle",
                "Ingénierie Sonore et Production Musicale",
                "Licence", 180, 420.0, 310, 4.8, 170,
                "Prof. Patrick Engolo",
                "Standards Abbey Road, SAE Institute, Berklee. Pro Tools (référence industrie), Logic Pro, consoles SSL et Neve. Prise de son multipiste, percussions africaines (djembé, kora, balafon). Mixage, compression, réverbération. Production d'un EP de 4–6 titres.",
                "Acoustique physique et psychoacoustique|Pro Tools et Logic Pro — niveau professionnel|Prise de son multipiste (voix, instruments, percussions africaines)|Mixage : EQ, compression, effets, stem mixing|Captation live d'un concert (façade et retours)|Production d'un EP de 4–6 titres incluant musiques africaines",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Acoustique & DAW\",\"lessons\":[\"Acoustique physique : propagation, réflexion, diffraction\",\"Psychoacoustique : masquage, localisation, Fletcher-Munson\",\"Électronique audio : composants, câbles, connecteurs XLR/TRS\",\"Consoles SSL, Neve, API, Yamaha\",\"Prise de son stéréo : XY, AB, ORTF, Mid-Side, Blumlein\",\"Introduction Pro Tools, Logic Pro, Reaper\",\"Solfège et formation auditive (obligatoire)\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Multipiste & Mixage\",\"lessons\":[\"Prise de son multipiste : voix, guitare, piano, cuivres, cordes, batterie\",\"Percussions africaines : djembé, kora, balafon (techniques spécifiques)\",\"Mixage : balance, panoramique, EQ paramétrique, Pultec\",\"Compression : FET, VCA, tube, optique\",\"Réverbération, délai, chorus, phaser\",\"Maintenance et dépannage du matériel audio\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Studio & Live\",\"lessons\":[\"Production EP de 4–6 titres (dont un titre musiques africaines)\",\"Enregistrement, mixage, livraison master\",\"Stage en studio professionnel (minimum 4 semaines)\",\"Captation live d'un concert (setup, façade, retours)\",\"Post-production son pour la vidéo (dialogue, ADR, Foley)\"]}]",
                "Ingénieur du son (studio, live, broadcast)|Technicien sonorisation|Assistant réalisateur|Monteur son pour film et vidéo"
        ));

        list.add(course(gi++,
                "master-production-mixage-postproduction",
                "Master Production Musicale Avancée, Mixage et Post-Production",
                "Technologies Musicales et Production Audiovisuelle",
                "Ingénierie Sonore et Production Musicale",
                "Master", 120, 360.0, 88, 4.9, 120,
                "Prof. Patrick Engolo",
                "Prise de son orchestrale et symphonique. Mixage professionnel avancé : stem mixing, référencing. Mastering numérique : loudness LUFS (Spotify -14, YouTube -13, Apple Music -16). Mixage immersif 5.1 et binaural. Production d'un album complet de A à Z.",
                "Prise de son orchestrale (Decca Tree, multi-micros)|Mastering LUFS : Spotify -14, YouTube -13, Apple Music -16|Mixage immersif 5.1 et binaural|Sound design pour publicité, cinéma, jeux vidéo|Post-production film : dialogue editing, ADR, Foley|Production d'un album complet de A à Z",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Mixage Avancé & Mastering\",\"lessons\":[\"Prise de son orchestrale : placement micros, stéréophonie, ambiance\",\"Mixage professionnel : stem mixing, référencing AVANTONE/NS10\",\"Mastering LUFS : Spotify -14, YouTube -13, Apple Music -16, Tidal -14\",\"True Peak, codecs (MP3, AAC, FLAC, WAV) et leurs artefacts\",\"Mixage immersif 5.1 et binaural pour casque\",\"Sound design pour publicité, cinéma et jeux vidéo\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Album Complet & Post-Production Film\",\"lessons\":[\"Production d'un album de A à Z : enregistrement, direction artistique\",\"Mixage, mastering, livraison aux distributeurs\",\"Post-production film africain : dialogue editing, ADR, bruitage Foley\",\"Mixage final 5.1\",\"Mémoire (50 pages) : analyse technique d'une production africaine mondiale\"]}]",
                "Ingénieur du son de référence|Producteur exécutif|Mixeur et masteriseur professionnel|Sound designer pour cinéma"
        ));

        // ── D3 · F2 — Audiovisuel et Médias ──────────────────────────────────

        list.add(course(gi++,
                "licence-audiovisuel-broadcast",
                "Licence Audiovisuel et Broadcast",
                "Technologies Musicales et Production Audiovisuelle",
                "Audiovisuel et Médias Numériques",
                "Licence", 180, 390.0, 195, 4.7, 160,
                "Prof. Jules Ekwalla",
                "Production vidéo, éclairage, post-production (Premiere Pro, DaVinci Resolve). ProTools pour la post-production. Régie TV et radio. Diffusion en direct (OBS, Wirecast, YouTube Live). Captation de concerts multi-caméra.",
                "Production vidéo : caméras, éclairage, cadrage|Post-production son et image : Premiere Pro, DaVinci Resolve|Régie TV et radio : workflow broadcast, HD, 4K, SDI|Captation de concerts multi-caméra|Diffusion en direct : YouTube Live, Facebook, RTMP|Production d'un magazine culturel musical complet",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Production Vidéo & Régie\",\"lessons\":[\"Production vidéo : caméras, éclairage, composition du cadre\",\"Post-production son et image : Premiere Pro, DaVinci Resolve\",\"ProTools pour la post-production\",\"Régie TV et radio : workflow broadcast, HD, 4K, SDI\",\"Introduction au streaming live (OBS, Wirecast)\",\"Acoustique appliquée à la production audiovisuelle\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Multi-Caméra & Diffusion\",\"lessons\":[\"Captation concerts et événements : setup multi-caméra\",\"Montage multicaméra : synchronisation, cut rythmique\",\"Diffusion en direct : YouTube Live, Facebook, RTMP\",\"Formats vidéo professionnels (H.264, H.265, ProRes, DNxHD)\",\"Étalonnage son et image\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Magazine Culturel & Stage\",\"lessons\":[\"Production d'un magazine culturel musical complet\",\"Présentation d'artistes, reportages, concerts\",\"Stage en télévision, web TV ou agence de production\",\"Mémoire : enjeux du broadcast musical en Afrique\"]}]",
                "Technicien son pour TV, radio et web|Réalisateur audiovisuel musical|Technicien broadcast|Opérateur régie télévision"
        ));

        list.add(course(gi++,
                "master-postproduction-sound-design",
                "Master Post-Production et Sound Design",
                "Technologies Musicales et Production Audiovisuelle",
                "Audiovisuel et Médias Numériques",
                "Master", 120, 360.0, 60, 4.8, 110,
                "Prof. Jules Ekwalla",
                "Design sonore pour le cinéma africain et international. Édition dialogue avancée, ADR, Foley. Supervision musicale d'un projet audiovisuel. Mémoire sur l'identité sonore d'une œuvre cinématographique africaine majeure.",
                "Design sonore pour le cinéma africain et international|Édition dialogue avancée : nettoyage, ADR|Bruitage Foley : technique, enregistrement, synchronisation|Supervision musicale : choix de la musique, droits, synchronisation|Mémoire sur l'identité sonore du cinéma africain|Projet de création sonore pour film ou documentaire réel",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Sound Design Cinéma\",\"lessons\":[\"Design sonore : analyse des identités sonores des grands films africains\",\"Édition dialogue avancée : nettoyage, ADR (Automated Dialogue Replacement)\",\"Bruitage Foley : technique, enregistrement, synchronisation\",\"Mixage final : structure, étapes, standards cinéma\",\"Ateliers avec sound designers professionnels\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Projet & Supervision\",\"lessons\":[\"Création sonore pour film ou documentaire réel\",\"Supervision musicale (choix de la musique, droits, synchronisation)\",\"Mémoire sur l'identité sonore d'une œuvre cinématographique africaine\"]}]",
                "Sound designer pour le cinéma africain et international|Directeur technique de post-production|Superviseur musical de film"
        ));

        // ── D4 · F1 — Pédagogie Musicale ─────────────────────────────────────

        list.add(course(gi++,
                "licence-pedagogie-musicale",
                "Licence Pédagogie Musicale",
                "Pédagogie Musicale et Formation des Formateurs",
                "Enseignement Musical — Tous niveaux et contextes",
                "Licence", 180, 390.0, 240, 4.7, 160,
                "Prof. Anne-Marie Fouda",
                "Méthodes pédagogiques de référence mondiale : Kodály, Orff, Dalcroze et leurs adaptations au contexte africain. Psychologie du développement (Piaget, Vygotsky). Didactique instrumentale. Stage en école de musique. Création de matériel pédagogique adapté.",
                "Méthodes Kodály, Orff, Dalcroze adaptées au contexte africain|Psychologie du développement : Piaget, Vygotsky|Didactique instrumentale : enseigner un geste technique|Éveil musical et répertoire pour enfants africains|Stage d'observation et prise en charge supervisée|Conception de matériel pédagogique avec peu de ressources",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Fondements Pédagogiques\",\"lessons\":[\"Méthodes : Kodály (syllabes rythmiques), Orff (percussions), Dalcroze (rythmique)\",\"Adaptations au contexte africain\",\"Psychologie du développement : Piaget, Vygotsky\",\"Psychologie de l'adulte apprenant\",\"Didactique instrumentale : décomposer un geste technique\",\"Pratique musicale personnelle (obligatoire)\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Méthodes Actives & Stage\",\"lessons\":[\"Éveil musical : répertoire pour 3–7 ans, jeux musicaux, comptines\",\"Formation auditive : enseigner progressivement\",\"Pédagogie de groupe : gestion de classe, différenciation\",\"Stage d'observation en école de musique (3 semaines)\",\"Création de matériel pédagogique adapté\",\"Numérique et pédagogie musicale\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Stage Long & Projet\",\"lessons\":[\"Stage long (8 semaines) : prise en charge complète sous supervision\",\"Projet pédagogique original : école de village, centre communautaire\",\"Mémoire professionnel : analyse réflexive du stage\"]}]",
                "Professeur d'instrument ou de chant|Enseignant en conservatoire|Animateur musical|Chef de chœur scolaire|Responsable pédagogique"
        ));

        list.add(course(gi++,
                "master-didactique-transmission-musicale",
                "Master Didactique et Transmission Musicale",
                "Pédagogie Musicale et Formation des Formateurs",
                "Enseignement Musical — Tous niveaux et contextes",
                "Master", 120, 320.0, 65, 4.8, 100,
                "Prof. Anne-Marie Fouda",
                "Pédagogie de la création musicale. Enseignement spécialisé : jeunes enfants (0–6 ans), adultes débutants, personnes en situation de handicap. Ingénierie de formation : concevoir un cursus complet. Le master organise lui-même une session de formation de 2 jours.",
                "Pédagogie de la création : improvisation et composition chez l'élève|Enseignement spécialisé : 0-6 ans, adultes, situation de handicap|Ingénierie de formation : concevoir un cursus complet|Mémoire de recherche pédagogique (50 pages)|Animation de séminaires pour enseignants en activité|Recherche en pédagogie musicale",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Pédagogie Avancée\",\"lessons\":[\"Pédagogie de la création : guider improvisation et composition\",\"Enseignement spécialisé : jeunes enfants 0–6 ans\",\"Adultes débutants et personnes en situation de handicap\",\"Ingénierie de formation : objectifs, progressions, évaluations\",\"Recherche en pédagogie musicale : méthodologie\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Recherche & Formation\",\"lessons\":[\"Mémoire de recherche pédagogique (50 pages)\",\"Stage de direction pédagogique en institution\",\"Animation d'un séminaire de 2 jours pour enseignants en activité\"]}]",
                "Directeur pédagogique d'institution musicale|Formateur de formateurs|Chercheur en pédagogie musicale|Conseiller pédagogique pour ONG ou ministère"
        ));

        // ── D5 · F1 — Musicologie ─────────────────────────────────────────────

        list.add(course(gi++,
                "licence-musicologie-patrimoine",
                "Licence Musicologie et Patrimoine Musical Africain",
                "Musicologie, Patrimoine et Management Culturel",
                "Musicologie et Recherche sur les Patrimoines",
                "Licence", 180, 390.0, 175, 4.7, 150,
                "Prof. Didier Manga",
                "Histoire des musiques africaines des royaumes précoloniaux à aujourd'hui. Ethnomusicologie : Charles Seeger, John Blacking, Simha Arom. Organologie africaine (Hornbostel-Sachs). Archives sonores numériques : Phonogrammarchiv, ILAM, UNESCO.",
                "Histoire des musiques africaines (royaumes précoloniaux à aujourd'hui)|Ethnomusicologie : Seeger, Blacking, Simha Arom|Organologie africaine : classification Hornbostel-Sachs|Informatique musicale : Sonic Visualiser, bases de données audio|Archives nationales, Berlin Phonogramm-Archiv, collections UNESCO|Analyse musicale et écriture analytique",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Histoire & Ethnomusicologie\",\"lessons\":[\"Histoire des musiques africaines : empires du Mali et du Ghana\",\"Musiques de cours royales Beti et Bamiléké, musiques sacrées\",\"Impact de la colonisation, indépendances et modernisation\",\"Introduction à l'ethnomusicologie : définition, histoire, grands auteurs\",\"Analyse musicale : méthodes et écriture analytique\",\"Paléographie et sources historiques\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Organologie & Archives\",\"lessons\":[\"Ethnomusicologie : musique et culture, identité, langage\",\"Organologie africaine : Hornbostel-Sachs, géographie des instruments\",\"Esthétique musicale et philosophie de l'art en Afrique\",\"Sonic Visualiser, Ethnochord, bases de données audio\",\"Archives : Phonogrammarchiv Vienne, ILAM, UNESCO, MINAC\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Mémoire & Stage\",\"lessons\":[\"Mémoire de recherche (40 pages) sur un sujet de musicologie africaine\",\"Stage en médiathèque, musée ou centre de recherche\",\"Séminaire thématique sur un genre ou répertoire africain spécifique\"]}]",
                "Archiviste musical|Médiateur culturel|Journaliste musical|Documentaliste|Assistant de recherche en institution culturelle"
        ));

        list.add(course(gi++,
                "master-ethnomusicologie-patrimoine",
                "Master Ethnomusicologie et Conservation du Patrimoine Immatériel",
                "Musicologie, Patrimoine et Management Culturel",
                "Musicologie et Recherche sur les Patrimoines",
                "Master", 120, 320.0, 42, 4.8, 100,
                "Prof. Didier Manga",
                "Méthodes de terrain : enregistrement in situ, conventions avec les communautés, éthique. Conservation du patrimoine immatériel (convention UNESCO 2003). Propriété intellectuelle des musiques traditionnelles (OAPI). Concert de restitution + enregistrement discographique du répertoire collecté.",
                "Méthodes de terrain : enquête, enregistrement in situ, éthique|Conservation du patrimoine immatériel (UNESCO 2003)|Transcription et analyse des musiques orales|Propriété intellectuelle : OAPI, droits des communautés|Mémoire ethnomusicologique (60 pages) + enregistrements de terrain|Concert de restitution scénique du répertoire collecté",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Terrain & Conservation\",\"lessons\":[\"Méthodes de terrain : protocoles, enregistrement, conventions\",\"Éthique de la recherche et retour aux communautés\",\"Transcription des musiques orales (Western notation adaptée)\",\"Conservation du patrimoine : convention UNESCO 2003\",\"Documentation numérique et constitution de corpus sonores\",\"Enjeux de la propriété intellectuelle : OAPI, droits des communautés\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Mémoire & Restitution\",\"lessons\":[\"Mémoire ethnomusicologique (60 pages) avec enregistrements\",\"Transcriptions, analyse et recommandations\",\"Concert de restitution présentant le répertoire collecté\",\"Enregistrement discographique du répertoire collecté\"]}]",
                "Ethnomusicologue de terrain|Chercheur en institution culturelle|Conseiller UNESCO/OIF|Directeur de centre culturel"
        ));

        // ── D5 · F2 — Management Culturel ────────────────────────────────────

        list.add(course(gi++,
                "master-management-arts-industries-culturelles",
                "Master Management des Arts et Industries Culturelles en Afrique",
                "Musicologie, Patrimoine et Management Culturel",
                "Management Culturel et Music Business Africain",
                "Master", 120, 360.0, 145, 4.8, 100,
                "Prof. Sophie Nkengue",
                "L'industrie musicale africaine a besoin de professionnels du music business. Droits d'auteur (SOCAM, OAPI, BSIC), distribution streaming africaine (Boomplay, Audiomack, Africori), booking de tournées, contrats discographiques. Stage obligatoire 3 mois en structure culturelle.",
                "Droit d'auteur africain : SOCAM, OAPI, BSIC|Distribution numérique : Boomplay, Audiomack, Spotify Africa, Africori|Contrats discographiques et de management|Production de spectacles : budget, logistique, sécurité|Levée de fonds culturels : OIF, Union Africaine, fondations|Études de cas : Maison Mère, Storm360, Def Jam Africa",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Droit & Production\",\"lessons\":[\"Économie de la culture en Afrique : marché musical CEMAC, Afrique de l'Ouest\",\"Droit d'auteur : SOCAM, OAPI, BSIC, droits voisins\",\"Contrats discographiques : avances, royalties, exclusivités\",\"Production de spectacles : budget, régie, logistique, sécurité\",\"Marketing culturel : positionnement, identité, relations presse, booking\"]},{\"id\":\"s8b\",\"title\":\"S8-S9 — Distribution Numérique & Financement\",\"lessons\":[\"Boomplay (leader Afrique), Audiomack, Spotify for Artists Africa\",\"Agrégateurs africains : Africori, Believe Music Africa, DistroKid\",\"Monétisation YouTube : Content ID, YouTube Partner Program\",\"TikTok, Instagram Reels, Facebook (Afrique) pour l'industrie musicale\",\"Gestion de projet culturel : festival ou tournée de A à Z\",\"Levée de fonds : OIF, Union Africaine, mécénat d'entreprise\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Études de Cas & Stage\",\"lessons\":[\"Succès et échecs : Maison Mère Cameroun, Storm360 Nigeria, Def Jam Africa\",\"Stage en structure culturelle (3 mois min.)\",\"Mémoire professionnel (50 pages) : stratégie de développement d'un artiste\",\"Présentation devant jury professionnel (artistes, managers, investisseurs)\"]}]",
                "Manager d'artiste|Directeur de label indépendant|Bookeur de tournées africaines|Responsable droits d'auteur|Producteur de spectacles|Directeur de salle de concert"
        ));

        // ── Doctorats ─────────────────────────────────────────────────────────

        list.add(course(gi++,
                "doctorat-pratique-artistique-dma",
                "Doctorat en Pratique Artistique (DMA)",
                "Interprétation et Pratique Instrumentale",
                "Musique Classique et Contemporaine",
                "Doctorat", 180, 600.0, 12, 5.0, 300,
                "Prof. Emmanuel Mbarga",
                "3 ans. Cours individuels de niveau virtuose (2h/semaine min.). Séminaires de recherche-création. Au minimum 3 récitals/concerts publics par an. Thèse artistique + mémoire 80 pages. Enseignement supervisé en Licence 1 (3h/semaine). Participation à des colloques internationaux.",
                "Niveau virtuose — cours 2h/semaine avec master teacher international|Séminaires de recherche-création|3 récitals publics par an minimum|Thèse artistique + mémoire 80 pages|Enseignement supervisé (3h/semaine)|Communication dans des colloques internationaux",
                "[{\"id\":\"yr1\",\"title\":\"Année 1 — Recherche & Performance\",\"lessons\":[\"Cours individuels 2h/semaine niveau virtuose\",\"Séminaires de recherche-création\",\"1er récital public de recherche\",\"Enseignement supervisé Licence 1 (3h/semaine)\"]},{\"id\":\"yr2\",\"title\":\"Année 2 — Création & Diffusion\",\"lessons\":[\"Récitals 2 et 3 de l'année\",\"Communication en colloque international\",\"Avancement de la thèse artistique\",\"Enregistrements documentés\"]},{\"id\":\"yr3\",\"title\":\"Année 3 — Thèse & Soutenance\",\"lessons\":[\"Finalisation de la thèse artistique (80 pages min.)\",\"Récital de soutenance\",\"Soutenance devant jury international\"]}]",
                "Chercheur-artiste de renommée internationale|Professeur en académie supérieure|Directeur artistique d'institution"
        ));

        list.add(course(gi++,
                "doctorat-musicologie-phd",
                "Doctorat Musicologie — Ph.D",
                "Musicologie, Patrimoine et Management Culturel",
                "Musicologie et Recherche sur les Patrimoines",
                "Doctorat", 180, 600.0, 8, 5.0, 300,
                "Prof. Didier Manga",
                "3 ans. Thèse de 250 pages minimum sur un sujet original de musicologie africaine. Au minimum 2 publications dans des revues à comité de lecture. 60h/an d'enseignement supervisé en Licence. Participation à 2 colloques internationaux. Soutenance devant jury international.",
                "Thèse de 250 pages sur musicologie africaine originale|Publications dans des revues à comité de lecture|60h/an d'enseignement en Licence|Participation à 2 colloques internationaux minimum|Soutenance devant jury international (2 membres extérieurs à la ZMA)|Formation de niveau chercheur-expert",
                "[{\"id\":\"yr1\",\"title\":\"Année 1 — Cadrage & Recherche\",\"lessons\":[\"Définition du sujet de thèse\",\"Revue de littérature exhaustive\",\"Séminaires de méthodologie de la recherche\",\"1er terrain de recherche\",\"Enseignement supervisé Licence (20h)\"]},{\"id\":\"yr2\",\"title\":\"Année 2 — Terrain & Publications\",\"lessons\":[\"2e terrain de recherche approfondi\",\"Rédaction et soumission d'un article\",\"Communication dans un colloque international\",\"Avancement de la thèse (100+ pages)\"]},{\"id\":\"yr3\",\"title\":\"Année 3 — Rédaction & Soutenance\",\"lessons\":[\"Finalisation de la thèse (250 pages min.)\",\"2e publication scientifique\",\"2e colloque international\",\"Soutenance publique devant jury international\"]}]",
                "Enseignant-chercheur universitaire|Expert international du patrimoine musical africain|Directeur de recherche"
        ));

        // ── Certifications ────────────────────────────────────────────────────

        list.add(course(gi++,
                "certificat-perfectionnement-instrumental",
                "Certificat Perfectionnement Instrumental",
                "Interprétation et Pratique Instrumentale",
                "Musique Classique et Contemporaine",
                "Certificat", 30, 150.0, 185, 4.8, 60,
                "Prof. Emmanuel Mbarga",
                "6 mois. Cours instrumental intensif 6h/semaine. Pratique d'orchestre et de chambre. Masterclasses avec artistes invités africains et internationaux. Jury de fin devant panel professionnel.",
                "Cours instrumental intensif 6h/semaine|Pratique d'orchestre et de chambre|Masterclasses avec artistes africains et internationaux|Jury de fin devant panel professionnel",
                "[{\"id\":\"c1\",\"title\":\"Programme Intensif 6 mois\",\"lessons\":[\"Cours instrumental 6h/semaine\",\"Orchestre et musique de chambre\",\"Masterclasses avec artistes invités\",\"Jury de fin de certificat\"]}]",
                "Perfectionnement pour musiciens avancés|Préparation à l'entrée en Licence"
        ));

        list.add(course(gi++,
                "certificat-jazz-arrangement",
                "Certificat Jazz et Arrangement",
                "Interprétation et Pratique Instrumentale",
                "Jazz et Musiques Actuelles",
                "Certificat", 30, 150.0, 210, 4.7, 60,
                "Prof. Richard Abanda",
                "3 mois. Écriture pour petites formations jazz (trio à quintet). Techniques d'orchestration jazz. Transcription des grands maîtres. Atelier de composition original. Concert de restitution public.",
                "Écriture pour trio, quartet, quintet jazz|Orchestration jazz : polyphonie, contrepoint|Transcription des grands maîtres (Ellington, Davis, Evans)|Composition originale|Concert de restitution public",
                "[{\"id\":\"c1\",\"title\":\"Programme 3 mois\",\"lessons\":[\"Écriture pour petites formations jazz\",\"Techniques d'orchestration jazz\",\"Transcription des grands maîtres\",\"Atelier de composition original\",\"Concert de restitution public\"]}]",
                "Arrangeur jazz|Compositeur pour petits ensembles"
        ));

        list.add(course(gi++,
                "certificat-instruments-africains",
                "Certificat Instruments Africains — Pratique et Répertoire",
                "Interprétation et Pratique Instrumentale",
                "Musiques Africaines, Tradition et Création Contemporaine",
                "Certificat", 30, 150.0, 320, 4.8, 60,
                "Prof. Thierry Ndombi",
                "3 mois. Technique intensive sur l'instrument choisi (djembé, kora, balafon, ngoni ou sanza). Répertoire de concert niveau intermédiaire. Pratique d'ensemble polyrythmique. Jury final public.",
                "Technique intensive : djembé, kora, balafon, ngoni ou sanza|Répertoire de concert niveau intermédiaire|Pratique d'ensemble polyrythmique|Jury final public",
                "[{\"id\":\"c1\",\"title\":\"Programme 3 mois\",\"lessons\":[\"Technique intensive sur instrument choisi\",\"Répertoire de concert niveau intermédiaire\",\"Pratique d'ensemble polyrythmique\",\"Jury final public\"]}]",
                "Musicien de world music|Animateur culturel"
        ));

        list.add(course(gi++,
                "certificat-technique-vocale",
                "Certificat Technique Vocale",
                "Interprétation et Pratique Instrumentale",
                "Chant et Art Vocal",
                "Certificat", 30, 150.0, 280, 4.8, 60,
                "Prof. Céline Biyong",
                "3 mois. Physiologie de la voix. Technique Bel Canto fondamentale. Gestion du souffle. Diction française et italienne. Répertoire pour chorales et ensembles vocaux. Cours individuels hebdomadaires + pratique collective.",
                "Physiologie de la voix — Bel Canto fondamental|Gestion du souffle et diction|Diction française et italienne|Répertoire pour chorales et ensembles vocaux|Cours individuels hebdomadaires",
                "[{\"id\":\"c1\",\"title\":\"Programme 3 mois\",\"lessons\":[\"Physiologie de la voix\",\"Technique Bel Canto fondamentale\",\"Gestion du souffle\",\"Diction française et italienne\",\"Répertoire chorales et ensembles vocaux\"]}]",
                "Chanteur de chorale professionnelle|Enseignant de chant débutant"
        ));

        list.add(course(gi++,
                "certificat-orchestration",
                "Certificat Orchestration",
                "Composition, Écriture et Théorie Musicale",
                "Composition et Orchestration",
                "Certificat", 30, 150.0, 155, 4.7, 55,
                "Prof. Marc Akono",
                "3 mois. Techniques d'orchestration pour petits et grands effectifs. Transcription et arrangement. Les partitions orchestrées sont jouées par les étudiants instrumentistes. Rendu final : arrangement d'une œuvre africaine pour orchestre de chambre.",
                "Orchestration pour petits et grands effectifs|Transcription et arrangement|Partitions jouées en séance par les instrumentistes|Rendu final : arrangement d'une œuvre africaine",
                "[{\"id\":\"c1\",\"title\":\"Programme 3 mois\",\"lessons\":[\"Techniques d'orchestration\",\"Transcription et arrangement\",\"Atelier : partitions jouées en séance\",\"Rendu final : arrangement œuvre africaine pour orchestre de chambre\"]}]",
                "Arrangeur|Assistant compositeur"
        ));

        list.add(course(gi++,
                "certificat-musique-film-sound-design",
                "Certificat Musique de Film et Sound Design",
                "Composition, Écriture et Théorie Musicale",
                "Composition pour l'Image et les Médias",
                "Certificat", 60, 250.0, 98, 4.8, 100,
                "Prof. Hervé Billong",
                "6 mois. Analyse approfondie de bandes originales africaines et internationales. Techniques de composition pour l'image. Sound design et bruitage. Logiciels : Logic Pro + Cubase + Sibelius. Projet final : BO complète d'une séquence filmique réelle.",
                "Analyse de BO africaines et internationales|Composition pour l'image|Sound design et bruitage|Logic Pro + Cubase + Sibelius|Projet final : BO complète d'une séquence filmique réelle",
                "[{\"id\":\"c1\",\"title\":\"Programme 6 mois\",\"lessons\":[\"Analyse approfondie de BO africaines et internationales\",\"Techniques de composition pour l'image\",\"Sound design et bruitage\",\"Logic Pro + Cubase + Sibelius\",\"Projet final : BO d'une séquence filmique réelle\"]}]",
                "Compositeur de BO indépendant|Sound designer|Producteur audiovisuel"
        ));

        list.add(course(gi++,
                "certificat-home-studio-professionnel",
                "Certificat Home Studio Professionnel",
                "Technologies Musicales et Production Audiovisuelle",
                "Ingénierie Sonore et Production Musicale",
                "Certificat", 30, 120.0, 445, 4.7, 60,
                "Prof. Patrick Engolo",
                "3 mois. Configuration d'un studio home aux standards professionnels (budget réaliste). Traitement acoustique minimal efficace. Enregistrement et mixage en autonomie. Chaîne mastering pour livraison streaming. Techniques des grands producteurs indépendants.",
                "Configuration studio home (budget réaliste)|Traitement acoustique minimal efficace|Enregistrement et mixage en autonomie complète|Mastering pour livraison streaming|Techniques des grands producteurs indépendants",
                "[{\"id\":\"c1\",\"title\":\"Programme 3 mois\",\"lessons\":[\"Configuration d'un home studio aux standards pro\",\"Traitement acoustique minimal efficace\",\"Enregistrement et mixage en autonomie\",\"Chaîne mastering pour livraison streaming\",\"Techniques des producteurs indépendants\"]}]",
                "Producteur indépendant|Artiste autoproducteur"
        ));

        list.add(course(gi++,
                "certificat-mastering-streaming",
                "Certificat Mastering et Préparation pour le Streaming",
                "Technologies Musicales et Production Audiovisuelle",
                "Ingénierie Sonore et Production Musicale",
                "Certificat", 20, 100.0, 280, 4.8, 40,
                "Prof. Patrick Engolo",
                "2 mois. Mastering numérique professionnel. Standards LUFS par plateforme (Spotify, Apple Music, YouTube, Tidal). Formats de livraison maîtres. Écoute critique sur systèmes de référence. Livraison via agrégateurs numériques.",
                "Mastering numérique professionnel|Standards LUFS : Spotify -14, YouTube -13, Apple Music -16, Tidal -14|Formats de livraison maîtres (WAV, FLAC, MP3, AAC)|Écoute critique sur systèmes de référence|Livraison via agrégateurs numériques",
                "[{\"id\":\"c1\",\"title\":\"Programme 2 mois\",\"lessons\":[\"Mastering numérique professionnel\",\"Standards LUFS par plateforme\",\"Formats de livraison maîtres\",\"Retouche et finalisation\",\"Écoute critique — systèmes de référence\",\"Livraison via agrégateurs\"]}]",
                "Masteriseur indépendant|Ingénieur du son autoproducteur"
        ));

        list.add(course(gi++,
                "certificat-gestion-carriere-artistique",
                "Certificat Gestion de Carrière Artistique à l'Ère du Numérique",
                "Musicologie, Patrimoine et Management Culturel",
                "Management Culturel et Music Business Africain",
                "Certificat", 30, 150.0, 390, 4.8, 60,
                "Prof. Sophie Nkengue",
                "3 mois. Stratégie d'artiste indépendant. Droits d'auteur SOCAM/OAPI (bases pratiques). Distribution streaming : Boomplay, Audiomack, Spotify. Communication digitale et réseaux sociaux. Booking de concerts locaux. Contrats types de management.",
                "Stratégie d'artiste indépendant|Droits d'auteur SOCAM/OAPI (bases pratiques)|Distribution : Boomplay, Audiomack, Spotify Africa|Communication digitale et réseaux sociaux|Booking de concerts locaux|Contrats types de management et de cession",
                "[{\"id\":\"c1\",\"title\":\"Programme 3 mois\",\"lessons\":[\"Stratégie d'artiste indépendant\",\"Droits d'auteur SOCAM/OAPI\",\"Distribution streaming africaine\",\"Communication digitale et réseaux sociaux\",\"Booking de concerts locaux\",\"Contrats types de management\"]}]",
                "Artiste indépendant|Auto-manager|Jeune manager d'artiste"
        ));

        list.add(course(gi++,
                "certificat-eveil-musical-enfants",
                "Certificat Éveil Musical et Initiation (0–12 ans)",
                "Pédagogie Musicale et Formation des Formateurs",
                "Enseignement Musical — Tous niveaux et contextes",
                "Certificat", 30, 120.0, 195, 4.7, 55,
                "Prof. Anne-Marie Fouda",
                "3 mois. Répertoire pour jeunes enfants africains. Jeux musicaux corporels et instrumentaux. Comptines et chants traditionnels adaptés. Techniques de classe nombreuse. Création d'ateliers avec peu de matériel. Stage pratique en école maternelle.",
                "Répertoire pour jeunes enfants africains (0–12 ans)|Jeux musicaux corporels et instrumentaux|Comptines et chants traditionnels adaptés|Techniques de classe nombreuse|Création d'ateliers avec peu de matériel|Stage pratique en école maternelle ou primaire",
                "[{\"id\":\"c1\",\"title\":\"Programme 3 mois\",\"lessons\":[\"Répertoire pour jeunes enfants africains\",\"Jeux musicaux corporels et instrumentaux\",\"Comptines et chants traditionnels adaptés\",\"Techniques de classe nombreuse\",\"Création d'ateliers avec peu de matériel\",\"Stage pratique en école maternelle\"]}]",
                "Animateur musical scolaire|Educateur de jeunes enfants|Responsable d'atelier musical"
        ));

        return list;
    }

    private Course course(int gi, String slug, String title, String department, String filiere,
                          String level, int ects, double price, int students, double rating,
                          int duration, String teacher, String description, String skillsPipe,
                          String curriculumJson, String debouches) {
        Course c = new Course();
        c.setSlug(slug);
        c.setTitle(title);
        c.setDepartment(department);
        c.setFiliere(filiere);
        c.setLevel(level);
        c.setEcts(ects);
        c.setPrice(price);
        c.setStudentsCount(students);
        c.setRating(rating);
        c.setDurationHours(duration);
        c.setTeacherName(teacher);
        c.setDescription(description);
        c.setShortDescription(description.length() > 120 ? description.substring(0, 117) + "..." : description);
        c.setGradientIndex(gi % 10);
        // Convert pipe-separated skills to JSON array
        String[] skills = skillsPipe.split("\\|");
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < skills.length; i++) {
            sb.append("\"").append(skills[i].replace("\"", "\\\"")).append("\"");
            if (i < skills.length - 1) sb.append(",");
        }
        sb.append("]");
        c.setSkillsJson(sb.toString());
        c.setCurriculumJson(curriculumJson);
        c.setDebouches(debouches);
        return c;
    }
}
