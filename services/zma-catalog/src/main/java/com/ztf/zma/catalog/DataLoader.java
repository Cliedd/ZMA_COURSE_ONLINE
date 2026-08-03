package com.ztf.zma.catalog;

import com.ztf.zma.catalog.domain.Course;
import com.ztf.zma.catalog.domain.CourseStatus;
import com.ztf.zma.catalog.repository.CourseRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

/**
 * Seeds the course catalog on first startup (when the table is empty).
 * Data sourced from: ZTF Music Académie — Course Content v2025.
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

        // ── D1 · F1 — Classical & Contemporary Music ─────────────────────

        list.add(course(gi++,
                "licence-interpretation-instrumentale",
                "Bachelor's in Instrumental Performance",
                "Performance & Instrumental Practice",
                "Classical & Contemporary Music",
                "Bachelor's", 180, 450.0, 320, 4.9, 180,
                "Prof. Emmanuel Mbarga",
                "Train to the standards of the world's finest academies. Instrumental technique through the Czerny, Kreutzer, Arban, and Taffanel-Gaubert methods. Repertoire spanning Baroque, Classical, and Romantic works through contemporary creation.",
                "Complete mastery of instrumental technique|Repertoire from Bach to Bartók|Orchestral and chamber music practice|Advanced ear training and tonal harmony|Preparation for international competitions|50-minute Bachelor's recital",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Core Curriculum & Fundamentals\",\"lessons\":[\"Intensive rhythmic and melodic ear training\",\"Tonal harmony: triads, dominant 7th chords\",\"History of Western music (origins–19th century)\",\"History of world music traditions (introduction)\",\"Musical English\",\"Individual instrument lessons: foundational technique\",\"Chamber orchestra — tutti and sectionals\"]},{\"id\":\"s2\",\"title\":\"S3-S4 — Advanced Study\",\"lessons\":[\"Solo repertoire: Romantic sonatas and concertos\",\"In-depth stylistic study\",\"Advanced sight-reading\",\"Chamber music (2 to 5 musicians)\",\"Advanced harmony: 7th chords, 9ths, alterations\",\"Introduction to counterpoint\",\"Introduction to jazz and world music traditions\"]},{\"id\":\"s3\",\"title\":\"S5-S6 — Recital Level & Professional Development\",\"lessons\":[\"Individual lessons, 2h/week — competition level\",\"Preparing the 50-minute Bachelor's recital\",\"Internship with a professional orchestra or ensemble\",\"International masterclass\",\"Studio recording\",\"Performing arts law and methodology\"]}]",
                "Orchestral musician|Chamber musician|Soloist|Accompanist|Conservatory teacher"
        ));

        list.add(course(gi++,
                "master-interpretation-recherche-artistique",
                "Master's in Performance & Artistic Research",
                "Performance & Instrumental Practice",
                "Classical & Contemporary Music",
                "Master's", 120, 360.0, 95, 4.9, 120,
                "Prof. Pauline Essomba",
                "Individual lessons, 2h/week, with a renowned master teacher. World solo repertoire, historical performance analysis, advanced 20th–21st century ensemble practice. Artistic research thesis.",
                "International-level solo repertoire|Historically informed performance analysis|Contemporary ensemble practice|Aesthetics and artistic research|40–60 page thesis|Master's recital (65–75 min)",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Advanced Study & Aesthetics\",\"lessons\":[\"Individual lessons, 2h/week, with a renowned master teacher\",\"Solo repertoire: Beethoven, Brahms, Bartók, Ligeti\",\"Advanced 20th–21st century ensemble practice\",\"Aesthetics: Bartók, Messiaen, Ligeti, Dutilleux, Nono\",\"Historically informed performance (HIP)\",\"Seminar: the global artist in cross-cultural dialogue\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Artistic Project & Career Entry\",\"lessons\":[\"Master's recital (65–75 minutes) before an international jury\",\"Professional recording of a full program\",\"Artistic research thesis (40–60 pages)\",\"Public defense\",\"Performing arts law and artist contracts\",\"International career strategy\"]}]",
                "Concert soloist|Ensemble director|Higher academy teacher|Artist in residence"
        ));

        // ── D1 · F2 — Jazz & Contemporary Music ─────────────────────────────

        list.add(course(gi++,
                "licence-jazz-musiques-improvisees",
                "Bachelor's in Jazz & Improvised Music",
                "Performance & Instrumental Practice",
                "Jazz & Contemporary Music",
                "Bachelor's", 180, 450.0, 410, 4.8, 180,
                "Prof. Richard Abanda",
                "World-reference jazz methods: David Baker, Jerry Coker, Mark Levine. Jazz harmony, modes, bebop and post-bop approaches. History of jazz from its origins to contemporary jazz. Big band and small combos.",
                "Complete jazz harmony (7th chords, extensions, voicings)|Modes and bebop approach|Improvisation over all chord changes|Arranging for small ensembles|Jazz ear training — transcribing great soloists|History of jazz: New Orleans → Swing → Bebop → Fusion",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Jazz Fundamentals\",\"lessons\":[\"Jazz harmony: Maj7, m7, 7, m7b5, dim7 chords\",\"Extensions and voicings at the piano\",\"Ear training: transcribing great soloists\",\"Rhythm and groove: Afro-Cuban, bossa, swing, funk\",\"Big band: playing in section\",\"Guided improvisation workshop on ii-V-I changes\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Development & Bebop\",\"lessons\":[\"Modes: Dorian, Mixolydian, Lydian, altered, diminished\",\"Bebop approach: scales, ornaments, Charlie Parker articulation\",\"Post-bop: Coltrane changes, guided free jazz\",\"Arranging for trio, quartet, quintet\",\"Composing original standards\",\"History of jazz — from its roots to contemporary jazz\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — International Stage & Studio\",\"lessons\":[\"Instrument at international stage level\",\"Composing an original 50-minute program\",\"Studio recording of a jazz EP (4–6 tracks)\",\"Miles Davis, Bill Evans, Coltrane, Abdullah Ibrahim, Richard Bona\",\"End-of-cycle concert before a professional jury\",\"Internship at a club, festival, or with a professional artist\"]}]",
                "Jazz musician (stage, studio, big band)|Arranger|Composer|Versatile instrumentalist"
        ));

        list.add(course(gi++,
                "master-jazz-performance-direction-ensemble",
                "Master's in Jazz Performance & Ensemble Direction",
                "Performance & Instrumental Practice",
                "Jazz & Contemporary Music",
                "Master's", 120, 360.0, 87, 4.9, 120,
                "Prof. Richard Abanda",
                "Elite-level instrumental lessons. Composition and arranging for large ensembles (10–20 musicians). Reference orchestrations: Ellington, Basie, Maria Schneider, Ibrahim. Production of a full studio album.",
                "Composing for big band (10–20 musicians)|Advanced writing: jazz polyphony, jazz counterpoint|Orchestrations: Ellington, Basie, Maria Schneider|Producing a complete album|Artistic direction|International distribution strategy",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Composition & Orchestration\",\"lessons\":[\"Elite-level instrumental lessons, 2h/week\",\"Composing for large ensembles (10–20 musicians)\",\"Jazz polyphony, jazz counterpoint\",\"Orchestrations: Ellington, Basie, Maria Schneider, Ibrahim\",\"Aesthetics of contemporary jazz and its global roots\",\"Analysis and transcription of major works\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Album & Career\",\"lessons\":[\"Producing a complete studio album (10–12 tracks)\",\"Full artistic direction\",\"Artistic thesis on the creative process\",\"Master's concert before an international jury\",\"Independent labels and streaming platforms\",\"International touring strategy\"]}]",
                "International jazz soloist|Big band director|Composer-arranger|Jazz artistic producer"
        ));

        // ── D1 · F3 — World Percussion & Global Traditions ────────────

        list.add(course(gi++,
                "licence-percussion-musiques-du-monde",
                "Bachelor's in World Percussion & Global Music Traditions",
                "Performance & Instrumental Practice",
                "World Music, Tradition & Contemporary Creation",
                "Bachelor's", 180, 450.0, 520, 4.9, 180,
                "Prof. Thierry Ndombi",
                "The program at the heart of ZMA's identity. Djembe, balafon, kora, ngoni, sanza, and talking drum taught with the same rigor as Western classical music. Polyrhythm, field collection, global fusion. Follow in the footsteps of internationally acclaimed virtuoso musicians on these instruments.",
                "Instrumental mastery of a traditional world instrument of your choice|Complex polyrhythm (3 against 4, 5 against 4)|Field collection with a traditional master|World instrument organology|Global fusion|History of world music (from ancient kingdoms to today)",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Instrument & History\",\"lessons\":[\"Primary instrument: djembe, balafon, kora, ngoni, or sanza\",\"Fundamental rhythms: rhythmic cells, ostinatos, 2-voice polyrhythm\",\"Traditional vocal technique: Central African polyphony\",\"History of world music traditions: Central, West, and East Africa\",\"Ear training and harmony (core curriculum)\",\"Choral practice\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Advanced Study & Fieldwork\",\"lessons\":[\"Complex polyrhythm (3 against 4, 5 against 4, hocketing)\",\"Field collection: village or recognized traditional master\",\"World instrument organology: classification, instrument making\",\"Transcribing oral music traditions (applied ethnomusicology)\",\"Global fusion workshop\",\"Dance associated with the rhythms studied\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Concert & Creation\",\"lessons\":[\"Instrument at international competition level\",\"Bachelor's recital (50 min): traditional repertoire + original creation\",\"Composing a work fusing traditional roots with global aesthetics\",\"Studio recording\",\"Internship at an international world music festival\",\"Thesis on a specific world-music repertoire\"]}]",
                "International stage musician (world music, fusion)|Artist in residence|Teacher of world instruments|Ensemble director|Studio musician"
        ));

        list.add(course(gi++,
                "master-interpretation-fusion-mondiale",
                "Master's in Global Fusion Performance & Original Creation",
                "Performance & Instrumental Practice",
                "World Music, Tradition & Contemporary Creation",
                "Master's", 120, 360.0, 72, 4.9, 120,
                "Prof. Thierry Ndombi",
                "Elite individual lessons with a renowned master teacher. Composing for large global fusion ensembles. Analysis of internationally acclaimed world-music artists: Richard Bona, Youssou N'Dour, Angélique Kidjo, Rokia Traoré.",
                "International stage-level performance|Composing for large global fusion ensembles|Analysis of great world-music artists' career paths|World music record production|Album or EP recorded in a professional studio|Positioning in the global music market",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Elite Level & Composition\",\"lessons\":[\"Individual lessons with a renowned master teacher\",\"Composing for 10–20 musicians (world instruments + Western)\",\"Seminar: the global artist in the 21st-century landscape\",\"Richard Bona, Youssou N'Dour, Angélique Kidjo, Rokia Traoré\",\"Fatoumata Diawara: career paths and artistic strategy\",\"World music record production workshop\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Recital & Album\",\"lessons\":[\"Master's recital (70 min) before an international jury\",\"Producing an album or EP in a professional studio\",\"Artistic thesis (40 pages): the creative process\",\"National or international festival concert\",\"Distribution and career strategy\"]}]",
                "Internationally renowned artist|World music composer-arranger|Artistic director of a global fusion ensemble|Record producer"
        ));

        // ── D1 · F4 — Voice & Vocal Arts ─────────────────────────────────────

        list.add(course(gi++,
                "licence-chant-techniques-vocales",
                "Bachelor's in Voice & Vocal Technique",
                "Performance & Instrumental Practice",
                "Voice & Vocal Arts",
                "Bachelor's", 180, 450.0, 280, 4.8, 180,
                "Prof. Céline Biyong",
                "Bel canto technique — ZMA's standard for vocal training. Voice anatomy, diaphragmatic support, vocal placement, diction (French, Italian, English, and other world languages). Opera repertoire, French art song, lied, spirituals, and elaborate world-music song.",
                "Complete bel canto vocal technique|Breath management and vocal placement|Diction: French, Italian, English, Ewondo, Duala, Lingala|International opera repertoire|Microphone technique and amplified singing|Coaching with a professional accompanist pianist",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Fundamental Vocal Technique\",\"lessons\":[\"Anatomy and physiology of the voice (larynx, vocal cords)\",\"Breath management: diaphragmatic support, air column\",\"Vocal placement: mask resonators, vibrato\",\"Diction: French (IPA), Italian (bel canto), English, and other world languages\",\"Compulsory supplementary piano\",\"Introduction: French art song, lied, spiritual, world-music song\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Advanced Study & Stage\",\"lessons\":[\"Classical repertoire: Fauré, Duparc, Ravel, Schubert, Schumann\",\"Performance and stage expression: gesture, presence\",\"Microphone technique: amplified vs. acoustic singing\",\"Introduction to opera roles\",\"Coaching with a professional accompanist pianist\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — International Recital\",\"lessons\":[\"Individual lessons, 2h/week — international recital level\",\"Bachelor's recital (50 min): at least 3 styles\",\"Masterclasses with visiting international singers\",\"Production internship: concert, studio, musical theater\",\"Auditions and artistic portfolio preparation\"]}]",
                "Solo singer (opera, jazz vocals, contemporary)|Professional choir singer|Studio singer|Voice teacher"
        ));

        list.add(course(gi++,
                "master-chant-lyrique-opera",
                "Master's in Opera Singing & Vocal Arts",
                "Performance & Instrumental Practice",
                "Voice & Vocal Arts",
                "Master's", 120, 360.0, 45, 4.9, 120,
                "Prof. Céline Biyong",
                "Opera coaching with a stage director. Repertoire: Mozart, Verdi, Puccini, Debussy, Britten. Celebrated singers: Jessye Norman, Leontyne Price, Angélique Kidjo. A full role in a production before a live audience.",
                "Opera roles: Mozart, Verdi, Puccini, Britten|Musical coaching + stage direction|Celebrated singers: Jessye Norman, Angélique Kidjo|Studio recording session|Master's recital (60 min) before an international jury|International opera career strategy",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Opera & Great Masters\",\"lessons\":[\"Individual lessons, 2h/week, with an international master singer\",\"Opera coaching: musical coach + stage director\",\"Mozart (Le Nozze di Figaro, Don Giovanni), Verdi, Puccini\",\"Debussy (Pelléas), Britten, Janáček\",\"Jessye Norman, Leontyne Price, Angélique Kidjo, Rokia Traoré\",\"Vocal analysis: comparative listening to great recordings\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Production & Career\",\"lessons\":[\"A full role in an opera production before a live audience\",\"Master's recital (60 min) before an international jury\",\"Studio recording (recital album)\",\"Thesis (40 pages): a role, composer, or contemporary vocal art\",\"International opera career strategy\"]}]",
                "International opera soloist|Opera singer|Recitalist (art song, lied)|Professional choir director"
        ));

        // ── D2 · F1 — Composition & Orchestration ───────────────────────────

        list.add(course(gi++,
                "licence-composition-ecriture-musicale",
                "Bachelor's in Composition & Music Writing",
                "Composition, Writing & Music Theory",
                "Composition & Orchestration",
                "Bachelor's", 180, 420.0, 180, 4.8, 160,
                "Prof. Marc Akono",
                "Complete tonal harmony, counterpoint, analysis of musical forms. Orchestration across instrument families. Modal and world pentatonic writing. Music notation software (Sibelius, MuseScore). Composing a short-film score.",
                "Complete tonal harmony (triads, 7ths, 9ths, alterations, modulations)|Counterpoint: bicinium and cantus firmus|Orchestration: strings, winds, percussion|Modal and world pentatonic writing|Sibelius or MuseScore — professional music notation|Composing for chamber ensemble (12–18 min)",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Fundamental Writing\",\"lessons\":[\"Complete tonal harmony: modulations, alterations\",\"Counterpoint: strict then free bicinium and cantus firmus\",\"Analysis: invention, fugue, sonata, rondo\",\"Ear training: solfège and harmonic dictation\",\"Introduction to free composition\",\"History of world and Western musical forms\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Orchestration & Notation Software\",\"lessons\":[\"Composing for piano, instrument+piano, trio\",\"String orchestration: harmonics, sul ponticello, pizzicato\",\"Wind and percussion orchestration\",\"Modal and world pentatonic writing\",\"Sibelius or MuseScore (compulsory)\",\"Weekly composition workshop: pieces performed in class\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Concert & Professional Development\",\"lessons\":[\"Composing a 12–18 minute work for ensemble or orchestra\",\"Concert performance\",\"Short-film score (in partnership with a local filmmaker)\",\"Internship with a professional composer\",\"Analytical thesis: a major orchestral or world-music work\"]}]",
                "Composer for ensemble and orchestra|Arranger for artists and studios|Composer for international film|Music production manager"
        ));

        list.add(course(gi++,
                "master-composition-creation-musicale",
                "Master's in Composition & Musical Creation",
                "Composition, Writing & Music Theory",
                "Composition & Orchestration",
                "Master's", 120, 360.0, 55, 4.8, 110,
                "Prof. Marc Akono",
                "Composing for orchestra and large ensembles. Contemporary techniques: multiphonics, microtones, clusters, spectralism. Electroacoustic music. Writing for film and television. Recording with a professional orchestra or ensemble.",
                "Composing for orchestra (150+ instruments)|Extended techniques: multiphonics, microtones, spectralism|Electroacoustic music: acousmatic composition and mixed music|Writing for film, TV, and series|Recording with a professional orchestra|Composition thesis (50 pages)",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Orchestra & Electroacoustic Music\",\"lessons\":[\"Composing for orchestra and large ensembles\",\"Extended techniques: multiphonics, microtones, clusters\",\"Electroacoustic music: acousmatic composition\",\"Mixed music: instruments + live electronics\",\"Musical aesthetics seminar\",\"Writing for international film, TV, and series\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Audiovisual Production\",\"lessons\":[\"Composing the score for a real production\",\"Recording with a professional orchestra or ensemble\",\"Composition thesis (50 pages)\",\"Presentation before a professional jury\",\"Composers, artistic directors, producers\"]}]",
                "Internationally renowned composer|Composer for film and media|Music director for productions"
        ));

        list.add(course(gi++,
                "master-composition-musique-image",
                "Master's in Film & Media Composition",
                "Composition, Writing & Music Theory",
                "Composition for Picture & Media",
                "Master's", 120, 360.0, 68, 4.8, 110,
                "Prof. Hervé Billong",
                "Analysis of great film scores: Herrmann, Williams, Zimmer, Morricone, and celebrated composers from around the world. Music synchronization, sound design, musical Foley. Producing a complete score in partnership with a film school.",
                "Analysis of great film scores: Herrmann, Williams, Zimmer, Morricone|Music synchronization: spotting, temp tracks, click track|Sound design: ambiances, effects, musical Foley|Workshops with international filmmakers|Software: Logic Pro, Cubase, Sibelius|Thesis on the sonic identity of world cinema",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Cinema & Sound Design\",\"lessons\":[\"Great film scores: Herrmann, Williams, Zimmer, Morricone, Ola Onabule\",\"Synchronization: spotting sessions, temp tracks, picture-sound sync\",\"Sound design: ambiances, effects, musical Foley\",\"Workshops with international filmmakers\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Producing a Real Film Score\",\"lessons\":[\"Composing a complete score (short or feature film)\",\"Partnership with a film school or international producer\",\"Studio recording with an orchestra\",\"Thesis on the sonic identity of contemporary world cinema\",\"Defense before a professional jury\"]}]",
                "Film score composer|Sound designer|Music director for media productions"
        ));

        // ── D3 · F1 — Sound Engineering & Production ────────────────────────

        list.add(course(gi++,
                "licence-techniques-son-production",
                "Bachelor's in Sound Engineering & Music Production",
                "Music Technology & Audiovisual Production",
                "Sound Engineering & Music Production",
                "Bachelor's", 180, 420.0, 310, 4.8, 170,
                "Prof. Patrick Engolo",
                "Abbey Road, SAE Institute, and Berklee standards. Pro Tools (industry standard), Logic Pro, SSL and Neve consoles. Multitrack recording, world percussion (djembe, kora, balafon). Mixing, compression, reverb. Producing a 4–6 track EP.",
                "Physical acoustics and psychoacoustics|Pro Tools and Logic Pro — professional level|Multitrack recording (voice, instruments, world percussion)|Mixing: EQ, compression, effects, stem mixing|Live concert capture (front-of-house and monitors)|Producing a 4–6 track EP featuring world music",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Acoustics & DAW\",\"lessons\":[\"Physical acoustics: propagation, reflection, diffraction\",\"Psychoacoustics: masking, localization, Fletcher-Munson\",\"Audio electronics: components, cables, XLR/TRS connectors\",\"SSL, Neve, API, Yamaha consoles\",\"Stereo miking: XY, AB, ORTF, Mid-Side, Blumlein\",\"Introduction to Pro Tools, Logic Pro, Reaper\",\"Ear training (compulsory)\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Multitrack Recording & Mixing\",\"lessons\":[\"Multitrack recording: voice, guitar, piano, brass, strings, drums\",\"World percussion: djembe, kora, balafon (specific techniques)\",\"Mixing: balance, panning, parametric EQ, Pultec\",\"Compression: FET, VCA, tube, optical\",\"Reverb, delay, chorus, phaser\",\"Audio equipment maintenance and troubleshooting\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Studio & Live\",\"lessons\":[\"Producing a 4–6 track EP (including one world-music track)\",\"Recording, mixing, master delivery\",\"Internship at a professional studio (minimum 4 weeks)\",\"Live concert capture (setup, front-of-house, monitors)\",\"Sound post-production for video (dialogue, ADR, Foley)\"]}]",
                "Sound engineer (studio, live, broadcast)|PA/sound technician|Assistant director|Sound editor for film and video"
        ));

        list.add(course(gi++,
                "master-production-mixage-postproduction",
                "Master's in Advanced Music Production, Mixing & Post-Production",
                "Music Technology & Audiovisual Production",
                "Sound Engineering & Music Production",
                "Master's", 120, 360.0, 88, 4.9, 120,
                "Prof. Patrick Engolo",
                "Orchestral and symphonic recording. Advanced professional mixing: stem mixing, referencing. Digital mastering: LUFS loudness (Spotify -14, YouTube -13, Apple Music -16). Immersive 5.1 and binaural mixing. Producing a complete album from A to Z.",
                "Orchestral recording (Decca Tree, multi-mic setups)|LUFS mastering: Spotify -14, YouTube -13, Apple Music -16|Immersive 5.1 and binaural mixing|Sound design for advertising, film, video games|Film post-production: dialogue editing, ADR, Foley|Producing a complete album from A to Z",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Advanced Mixing & Mastering\",\"lessons\":[\"Orchestral recording: mic placement, stereophony, ambience\",\"Professional mixing: stem mixing, AVANTONE/NS10 referencing\",\"LUFS mastering: Spotify -14, YouTube -13, Apple Music -16, Tidal -14\",\"True Peak, codecs (MP3, AAC, FLAC, WAV) and their artifacts\",\"Immersive 5.1 and binaural mixing for headphones\",\"Sound design for advertising, film, and video games\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Complete Album & Film Post-Production\",\"lessons\":[\"Producing an album from A to Z: recording, artistic direction\",\"Mixing, mastering, delivery to distributors\",\"International film post-production: dialogue editing, ADR, Foley\",\"Final 5.1 mix\",\"Thesis (50 pages): technical analysis of a globally released production\"]}]",
                "Leading sound engineer|Executive producer|Professional mixing and mastering engineer|Sound designer for film"
        ));

        // ── D3 · F2 — Audiovisual & Media ──────────────────────────────────

        list.add(course(gi++,
                "licence-audiovisuel-broadcast",
                "Bachelor's in Audiovisual & Broadcast",
                "Music Technology & Audiovisual Production",
                "Audiovisual & Digital Media",
                "Bachelor's", 180, 390.0, 195, 4.7, 160,
                "Prof. Jules Ekwalla",
                "Video production, lighting, post-production (Premiere Pro, DaVinci Resolve). Pro Tools for post-production. TV and radio control rooms. Live streaming (OBS, Wirecast, YouTube Live). Multi-camera concert capture.",
                "Video production: cameras, lighting, framing|Sound and picture post-production: Premiere Pro, DaVinci Resolve|TV and radio control rooms: broadcast workflow, HD, 4K, SDI|Multi-camera concert capture|Live streaming: YouTube Live, Facebook, RTMP|Producing a complete music culture magazine show",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Video Production & Control Room\",\"lessons\":[\"Video production: cameras, lighting, frame composition\",\"Sound and picture post-production: Premiere Pro, DaVinci Resolve\",\"Pro Tools for post-production\",\"TV and radio control rooms: broadcast workflow, HD, 4K, SDI\",\"Introduction to live streaming (OBS, Wirecast)\",\"Acoustics applied to audiovisual production\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Multi-Camera & Streaming\",\"lessons\":[\"Concert and event capture: multi-camera setup\",\"Multi-camera editing: syncing, rhythmic cutting\",\"Live streaming: YouTube Live, Facebook, RTMP\",\"Professional video formats (H.264, H.265, ProRes, DNxHD)\",\"Sound and color grading\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Culture Magazine & Internship\",\"lessons\":[\"Producing a complete music culture magazine show\",\"Artist profiles, reports, concerts\",\"Internship in television, web TV, or a production agency\",\"Thesis: challenges of music broadcasting worldwide\"]}]",
                "Sound technician for TV, radio, and web|Music audiovisual director|Broadcast technician|Television control room operator"
        ));

        list.add(course(gi++,
                "master-postproduction-sound-design",
                "Master's in Post-Production & Sound Design",
                "Music Technology & Audiovisual Production",
                "Audiovisual & Digital Media",
                "Master's", 120, 360.0, 60, 4.8, 110,
                "Prof. Jules Ekwalla",
                "Sound design for international cinema. Advanced dialogue editing, ADR, Foley. Music supervision for a media project. Thesis on the sonic identity of a major world-cinema film.",
                "Sound design for international cinema|Advanced dialogue editing: cleanup, ADR|Foley: technique, recording, synchronization|Music supervision: music selection, rights, synchronization|Thesis on the sonic identity of world cinema|Sound design project for a real film or documentary",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Cinema Sound Design\",\"lessons\":[\"Sound design: analyzing the sonic identities of great international films\",\"Advanced dialogue editing: cleanup, ADR (Automated Dialogue Replacement)\",\"Foley: technique, recording, synchronization\",\"Final mix: structure, stages, cinema standards\",\"Workshops with professional sound designers\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Project & Supervision\",\"lessons\":[\"Sound design for a real film or documentary\",\"Music supervision (music selection, rights, synchronization)\",\"Thesis on the sonic identity of a major world-cinema film\"]}]",
                "Sound designer for international cinema|Technical director of post-production|Film music supervisor"
        ));

        // ── D4 · F1 — Music Education ─────────────────────────────────────

        list.add(course(gi++,
                "licence-pedagogie-musicale",
                "Bachelor's in Music Education",
                "Music Education & Teacher Training",
                "Music Teaching — All Levels & Settings",
                "Bachelor's", 180, 390.0, 240, 4.7, 160,
                "Prof. Anne-Marie Fouda",
                "World-reference teaching methods: Kodály, Orff, Dalcroze, and their adaptation to diverse global contexts. Developmental psychology (Piaget, Vygotsky). Instrumental teaching methods. Internship at a music school. Creating adapted teaching materials.",
                "Kodály, Orff, and Dalcroze methods adapted to diverse global contexts|Developmental psychology: Piaget, Vygotsky|Instrumental teaching methods: teaching technical movement|Musical awakening and repertoire for young children|Observation internship and supervised teaching practice|Designing teaching materials with limited resources",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — Teaching Foundations\",\"lessons\":[\"Methods: Kodály (rhythmic syllables), Orff (percussion), Dalcroze (eurhythmics)\",\"Adaptations to diverse global contexts\",\"Developmental psychology: Piaget, Vygotsky\",\"Psychology of the adult learner\",\"Instrumental teaching methods: breaking down technical movement\",\"Personal musical practice (compulsory)\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Active Methods & Internship\",\"lessons\":[\"Musical awakening: repertoire for ages 3–7, musical games, nursery rhymes\",\"Ear training: teaching it progressively\",\"Group teaching: classroom management, differentiation\",\"Observation internship at a music school (3 weeks)\",\"Creating adapted teaching materials\",\"Digital tools in music education\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Extended Internship & Project\",\"lessons\":[\"Extended internship (8 weeks): full supervised teaching practice\",\"Original teaching project: village school, community center\",\"Professional thesis: reflective analysis of the internship\"]}]",
                "Instrument or voice teacher|Conservatory teacher|Music facilitator|School choir director|Head of education"
        ));

        list.add(course(gi++,
                "master-didactique-transmission-musicale",
                "Master's in Music Didactics & Transmission",
                "Music Education & Teacher Training",
                "Music Teaching — All Levels & Settings",
                "Master's", 120, 320.0, 65, 4.8, 100,
                "Prof. Anne-Marie Fouda",
                "Pedagogy of musical creation. Specialized teaching: young children (0–6), beginner adults, people with disabilities. Training design: building a complete curriculum. Master's students run their own 2-day training session.",
                "Pedagogy of creation: improvisation and composition for students|Specialized teaching: ages 0–6, adults, disabilities|Training design: building a complete curriculum|Educational research thesis (50 pages)|Running seminars for practicing teachers|Research in music education",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Advanced Pedagogy\",\"lessons\":[\"Pedagogy of creation: guiding improvisation and composition\",\"Specialized teaching: young children ages 0–6\",\"Beginner adults and people with disabilities\",\"Training design: objectives, progressions, assessments\",\"Research in music education: methodology\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Research & Training\",\"lessons\":[\"Educational research thesis (50 pages)\",\"Educational leadership internship at an institution\",\"Running a 2-day seminar for practicing teachers\"]}]",
                "Head of education at a music institution|Trainer of trainers|Researcher in music education|Education advisor for NGOs or ministries"
        ));

        // ── D5 · F1 — Musicology ─────────────────────────────────────────────

        list.add(course(gi++,
                "licence-musicologie-patrimoine",
                "Bachelor's in Musicology & World Musical Heritage",
                "Musicology, Heritage & Cultural Management",
                "Musicology & Heritage Research",
                "Bachelor's", 180, 390.0, 175, 4.7, 150,
                "Prof. Didier Manga",
                "History of world music traditions from ancient civilizations to today. Ethnomusicology: Charles Seeger, John Blacking, Simha Arom. World instrument organology (Hornbostel-Sachs). Digital sound archives: Phonogrammarchiv, ILAM, UNESCO.",
                "History of world music traditions (ancient civilizations to today)|Ethnomusicology: Seeger, Blacking, Simha Arom|World instrument organology: Hornbostel-Sachs classification|Music software: Sonic Visualiser, audio databases|National archives, Berlin Phonogramm-Archiv, UNESCO collections|Musical analysis and analytical writing",
                "[{\"id\":\"s1\",\"title\":\"S1-S2 — History & Ethnomusicology\",\"lessons\":[\"History of world music: the Mali and Ghana empires\",\"Beti and Bamileke royal court music, sacred music\",\"The impact of colonization, independence, and modernization\",\"Introduction to ethnomusicology: definitions, history, key thinkers\",\"Musical analysis: methods and analytical writing\",\"Paleography and historical sources\"]},{\"id\":\"s3\",\"title\":\"S3-S4 — Organology & Archives\",\"lessons\":[\"Ethnomusicology: music and culture, identity, language\",\"World instrument organology: Hornbostel-Sachs, geography of instruments\",\"Musical aesthetics and philosophy of art across world traditions\",\"Sonic Visualiser, Ethnochord, audio databases\",\"Archives: Vienna Phonogrammarchiv, ILAM, UNESCO, MINAC\"]},{\"id\":\"s5\",\"title\":\"S5-S6 — Thesis & Internship\",\"lessons\":[\"Research thesis (40 pages) on a topic in world musicology\",\"Internship at a media library, museum, or research center\",\"Thematic seminar on a specific world-music genre or repertoire\"]}]",
                "Music archivist|Cultural mediator|Music journalist|Archivist/librarian|Research assistant at a cultural institution"
        ));

        list.add(course(gi++,
                "master-ethnomusicologie-patrimoine",
                "Master's in Ethnomusicology & Intangible Heritage Conservation",
                "Musicology, Heritage & Cultural Management",
                "Musicology & Heritage Research",
                "Master's", 120, 320.0, 42, 4.8, 100,
                "Prof. Didier Manga",
                "Fieldwork methods: on-site recording, community agreements, ethics. Intangible heritage conservation (2003 UNESCO Convention). Intellectual property for traditional music (OAPI). A restitution concert plus a recording of the collected repertoire.",
                "Fieldwork methods: survey, on-site recording, ethics|Intangible heritage conservation (2003 UNESCO Convention)|Transcription and analysis of oral music traditions|Intellectual property: OAPI, community rights|Ethnomusicology thesis (60 pages) + field recordings|Stage restitution concert of the collected repertoire",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Fieldwork & Conservation\",\"lessons\":[\"Fieldwork methods: protocols, recording, agreements\",\"Research ethics and giving back to communities\",\"Transcribing oral music traditions (adapted Western notation)\",\"Heritage conservation: the 2003 UNESCO Convention\",\"Digital documentation and building sound corpora\",\"Intellectual property issues: OAPI, community rights\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Thesis & Restitution\",\"lessons\":[\"Ethnomusicology thesis (60 pages) with recordings\",\"Transcriptions, analysis, and recommendations\",\"Restitution concert presenting the collected repertoire\",\"Recording the collected repertoire\"]}]",
                "Field ethnomusicologist|Researcher at a cultural institution|UNESCO/OIF advisor|Cultural center director"
        ));

        // ── D5 · F2 — Cultural Management ────────────────────────────────────

        list.add(course(gi++,
                "master-management-arts-industries-culturelles",
                "Master's in Arts & Cultural Industries Management",
                "Musicology, Heritage & Cultural Management",
                "Cultural Management & Global Music Business",
                "Master's", 120, 360.0, 145, 4.8, 100,
                "Prof. Sophie Nkengue",
                "The global music industry needs skilled music-business professionals. Copyright (SOCAM, OAPI, BSIC), global streaming distribution (Boomplay, Audiomack, Africori), tour booking, record contracts. Mandatory 3-month internship at a cultural organization.",
                "International copyright law: SOCAM, OAPI, BSIC|Digital distribution: Boomplay, Audiomack, Spotify, Africori|Record and management contracts|Live event production: budgeting, logistics, security|Cultural fundraising: OIF, international unions, foundations|Case studies: Maison Mère, Storm360, Def Jam",
                "[{\"id\":\"s7\",\"title\":\"S7-S8 — Law & Production\",\"lessons\":[\"The global economics of music: regional and international markets\",\"Copyright law: SOCAM, OAPI, BSIC, neighboring rights\",\"Record contracts: advances, royalties, exclusivity\",\"Live event production: budgeting, stage management, logistics, security\",\"Cultural marketing: positioning, identity, press relations, booking\"]},{\"id\":\"s8b\",\"title\":\"S8-S9 — Digital Distribution & Funding\",\"lessons\":[\"Boomplay, Audiomack, Spotify for Artists\",\"Global aggregators: Africori, Believe Music, DistroKid\",\"YouTube monetization: Content ID, YouTube Partner Program\",\"TikTok, Instagram Reels, Facebook for the music industry\",\"Cultural project management: a festival or tour from A to Z\",\"Fundraising: OIF, international unions, corporate sponsorship\"]},{\"id\":\"s9\",\"title\":\"S9-S10 — Case Studies & Internship\",\"lessons\":[\"Successes and failures: Maison Mère, Storm360, Def Jam\",\"Internship at a cultural organization (3 months min.)\",\"Professional thesis (50 pages): an artist development strategy\",\"Presentation before a professional jury (artists, managers, investors)\"]}]",
                "Artist manager|Independent label director|International tour booker|Copyright manager|Live event producer|Concert venue director"
        ));

        // ── Doctorates ─────────────────────────────────────────────────────────

        list.add(course(gi++,
                "doctorat-pratique-artistique-dma",
                "Doctorate in Artistic Practice (DMA)",
                "Performance & Instrumental Practice",
                "Classical & Contemporary Music",
                "Doctorate", 180, 600.0, 12, 5.0, 300,
                "Prof. Emmanuel Mbarga",
                "3 years. Virtuoso-level individual lessons (2h/week min.). Research-creation seminars. At least 3 public recitals/concerts per year. Artistic thesis + 80-page dissertation. Supervised teaching in first-year Bachelor's (3h/week). Participation in international conferences.",
                "Virtuoso level — 2h/week lessons with an international master teacher|Research-creation seminars|At least 3 public recitals per year|Artistic thesis + 80-page dissertation|Supervised teaching (3h/week)|Presenting at international conferences",
                "[{\"id\":\"yr1\",\"title\":\"Year 1 — Research & Performance\",\"lessons\":[\"Individual lessons, 2h/week, virtuoso level\",\"Research-creation seminars\",\"First public research recital\",\"Supervised teaching, first-year Bachelor's (3h/week)\"]},{\"id\":\"yr2\",\"title\":\"Year 2 — Creation & Dissemination\",\"lessons\":[\"Recitals 2 and 3 of the year\",\"Presenting at an international conference\",\"Progress on the artistic thesis\",\"Documented recordings\"]},{\"id\":\"yr3\",\"title\":\"Year 3 — Thesis & Defense\",\"lessons\":[\"Finalizing the artistic thesis (80 pages min.)\",\"Defense recital\",\"Defense before an international jury\"]}]",
                "Internationally renowned artist-researcher|Higher academy professor|Artistic director of an institution"
        ));

        list.add(course(gi++,
                "doctorat-musicologie-phd",
                "Doctorate in Musicology — Ph.D",
                "Musicology, Heritage & Cultural Management",
                "Musicology & Heritage Research",
                "Doctorate", 180, 600.0, 8, 5.0, 300,
                "Prof. Didier Manga",
                "3 years. A 250-page-minimum dissertation on an original topic in world musicology. At least 2 publications in peer-reviewed journals. 60h/year of supervised undergraduate teaching. Participation in 2 international conferences. Defense before an international jury.",
                "250-page dissertation on original world musicology research|Publications in peer-reviewed journals|60h/year of undergraduate teaching|At least 2 international conferences|Defense before an international jury (2 members external to ZMA)|Expert-researcher level training",
                "[{\"id\":\"yr1\",\"title\":\"Year 1 — Scoping & Research\",\"lessons\":[\"Defining the dissertation topic\",\"Comprehensive literature review\",\"Research methodology seminars\",\"First research fieldwork\",\"Supervised undergraduate teaching (20h)\"]},{\"id\":\"yr2\",\"title\":\"Year 2 — Fieldwork & Publications\",\"lessons\":[\"Second, in-depth research fieldwork\",\"Writing and submitting an article\",\"Presenting at an international conference\",\"Dissertation progress (100+ pages)\"]},{\"id\":\"yr3\",\"title\":\"Year 3 — Writing & Defense\",\"lessons\":[\"Finalizing the dissertation (250 pages min.)\",\"Second scientific publication\",\"Second international conference\",\"Public defense before an international jury\"]}]",
                "University professor-researcher|International expert in world musical heritage|Research director"
        ));

        // ── Certificates ────────────────────────────────────────────────────

        list.add(course(gi++,
                "certificat-perfectionnement-instrumental",
                "Certificate in Instrumental Advancement",
                "Performance & Instrumental Practice",
                "Classical & Contemporary Music",
                "Certificate", 30, 150.0, 185, 4.8, 60,
                "Prof. Emmanuel Mbarga",
                "6 months. Intensive instrumental lessons, 6h/week. Orchestral and chamber practice. Masterclasses with visiting international artists. Final jury before a professional panel.",
                "Intensive instrumental lessons, 6h/week|Orchestral and chamber practice|Masterclasses with international artists|Final jury before a professional panel",
                "[{\"id\":\"c1\",\"title\":\"6-Month Intensive Program\",\"lessons\":[\"Instrumental lessons, 6h/week\",\"Orchestra and chamber music\",\"Masterclasses with guest artists\",\"Final certificate jury\"]}]",
                "Advancement for experienced musicians|Preparation for Bachelor's-level entry"
        ));

        list.add(course(gi++,
                "certificat-jazz-arrangement",
                "Certificate in Jazz & Arranging",
                "Performance & Instrumental Practice",
                "Jazz & Contemporary Music",
                "Certificate", 30, 150.0, 210, 4.7, 60,
                "Prof. Richard Abanda",
                "3 months. Writing for small jazz ensembles (trio to quintet). Jazz orchestration techniques. Transcribing the great masters. Original composition workshop. Public showcase concert.",
                "Writing for jazz trio, quartet, quintet|Jazz orchestration: polyphony, counterpoint|Transcribing the great masters (Ellington, Davis, Evans)|Original composition|Public showcase concert",
                "[{\"id\":\"c1\",\"title\":\"3-Month Program\",\"lessons\":[\"Writing for small jazz ensembles\",\"Jazz orchestration techniques\",\"Transcribing the great masters\",\"Original composition workshop\",\"Public showcase concert\"]}]",
                "Jazz arranger|Composer for small ensembles"
        ));

        list.add(course(gi++,
                "certificat-instruments-du-monde",
                "Certificate in World Instruments — Practice & Repertoire",
                "Performance & Instrumental Practice",
                "World Music, Tradition & Contemporary Creation",
                "Certificate", 30, 150.0, 320, 4.8, 60,
                "Prof. Thierry Ndombi",
                "3 months. Intensive technique on your chosen instrument (djembe, kora, balafon, ngoni, or sanza). Intermediate-level concert repertoire. Polyrhythmic ensemble practice. Public final jury.",
                "Intensive technique: djembe, kora, balafon, ngoni, or sanza|Intermediate-level concert repertoire|Polyrhythmic ensemble practice|Public final jury",
                "[{\"id\":\"c1\",\"title\":\"3-Month Program\",\"lessons\":[\"Intensive technique on your chosen instrument\",\"Intermediate-level concert repertoire\",\"Polyrhythmic ensemble practice\",\"Public final jury\"]}]",
                "World music musician|Cultural facilitator"
        ));

        list.add(course(gi++,
                "certificat-technique-vocale",
                "Certificate in Vocal Technique",
                "Performance & Instrumental Practice",
                "Voice & Vocal Arts",
                "Certificate", 30, 150.0, 280, 4.8, 60,
                "Prof. Céline Biyong",
                "3 months. Voice physiology. Fundamental bel canto technique. Breath management. French and Italian diction. Repertoire for choirs and vocal ensembles. Weekly individual lessons + group practice.",
                "Voice physiology — fundamental bel canto|Breath management and diction|French and Italian diction|Repertoire for choirs and vocal ensembles|Weekly individual lessons",
                "[{\"id\":\"c1\",\"title\":\"3-Month Program\",\"lessons\":[\"Voice physiology\",\"Fundamental bel canto technique\",\"Breath management\",\"French and Italian diction\",\"Repertoire for choirs and vocal ensembles\"]}]",
                "Professional choir singer|Beginner voice teacher"
        ));

        list.add(course(gi++,
                "certificat-orchestration",
                "Certificate in Orchestration",
                "Composition, Writing & Music Theory",
                "Composition & Orchestration",
                "Certificate", 30, 150.0, 155, 4.7, 55,
                "Prof. Marc Akono",
                "3 months. Orchestration techniques for small and large ensembles. Transcription and arranging. Orchestrated scores are performed by instrumentalist students. Final project: arranging a traditional work for chamber orchestra.",
                "Orchestration for small and large ensembles|Transcription and arranging|Scores performed in class by instrumentalists|Final project: arranging a traditional work",
                "[{\"id\":\"c1\",\"title\":\"3-Month Program\",\"lessons\":[\"Orchestration techniques\",\"Transcription and arranging\",\"Workshop: scores performed in class\",\"Final project: arranging a traditional work for chamber orchestra\"]}]",
                "Arranger|Assistant composer"
        ));

        list.add(course(gi++,
                "certificat-musique-film-sound-design",
                "Certificate in Film Music & Sound Design",
                "Composition, Writing & Music Theory",
                "Composition for Picture & Media",
                "Certificate", 60, 250.0, 98, 4.8, 100,
                "Prof. Hervé Billong",
                "6 months. In-depth analysis of celebrated international film scores. Composition techniques for picture. Sound design and Foley. Software: Logic Pro + Cubase + Sibelius. Final project: a complete score for a real film sequence.",
                "Analysis of celebrated international film scores|Composition for picture|Sound design and Foley|Logic Pro + Cubase + Sibelius|Final project: a complete score for a real film sequence",
                "[{\"id\":\"c1\",\"title\":\"6-Month Program\",\"lessons\":[\"In-depth analysis of celebrated international film scores\",\"Composition techniques for picture\",\"Sound design and Foley\",\"Logic Pro + Cubase + Sibelius\",\"Final project: a score for a real film sequence\"]}]",
                "Independent film composer|Sound designer|Media producer"
        ));

        list.add(course(gi++,
                "certificat-home-studio-professionnel",
                "Certificate in Professional Home Studio",
                "Music Technology & Audiovisual Production",
                "Sound Engineering & Music Production",
                "Certificate", 30, 120.0, 445, 4.7, 60,
                "Prof. Patrick Engolo",
                "3 months. Setting up a home studio to professional standards (on a realistic budget). Minimal, effective acoustic treatment. Independent recording and mixing. A mastering chain for streaming delivery. Techniques of great independent producers.",
                "Home studio setup (realistic budget)|Minimal, effective acoustic treatment|Fully independent recording and mixing|Mastering for streaming delivery|Techniques of great independent producers",
                "[{\"id\":\"c1\",\"title\":\"3-Month Program\",\"lessons\":[\"Setting up a home studio to professional standards\",\"Minimal, effective acoustic treatment\",\"Independent recording and mixing\",\"Mastering chain for streaming delivery\",\"Techniques of independent producers\"]}]",
                "Independent producer|Self-producing artist"
        ));

        list.add(course(gi++,
                "certificat-mastering-streaming",
                "Certificate in Mastering & Streaming Preparation",
                "Music Technology & Audiovisual Production",
                "Sound Engineering & Music Production",
                "Certificate", 20, 100.0, 280, 4.8, 40,
                "Prof. Patrick Engolo",
                "2 months. Professional digital mastering. Platform-specific LUFS standards (Spotify, Apple Music, YouTube, Tidal). Master delivery formats. Critical listening on reference systems. Delivery via digital aggregators.",
                "Professional digital mastering|LUFS standards: Spotify -14, YouTube -13, Apple Music -16, Tidal -14|Master delivery formats (WAV, FLAC, MP3, AAC)|Critical listening on reference systems|Delivery via digital aggregators",
                "[{\"id\":\"c1\",\"title\":\"2-Month Program\",\"lessons\":[\"Professional digital mastering\",\"Platform-specific LUFS standards\",\"Master delivery formats\",\"Touch-ups and finalizing\",\"Critical listening — reference systems\",\"Delivery via aggregators\"]}]",
                "Independent mastering engineer|Self-producing sound engineer"
        ));

        list.add(course(gi++,
                "certificat-gestion-carriere-artistique",
                "Certificate in Artist Career Management in the Digital Age",
                "Musicology, Heritage & Cultural Management",
                "Cultural Management & Global Music Business",
                "Certificate", 30, 150.0, 390, 4.8, 60,
                "Prof. Sophie Nkengue",
                "3 months. Independent artist strategy. SOCAM/OAPI copyright basics. Streaming distribution: Boomplay, Audiomack, Spotify. Digital and social media communication. Booking local concerts. Standard management contracts.",
                "Independent artist strategy|SOCAM/OAPI copyright basics|Distribution: Boomplay, Audiomack, Spotify|Digital and social media communication|Booking local concerts|Standard management and licensing contracts",
                "[{\"id\":\"c1\",\"title\":\"3-Month Program\",\"lessons\":[\"Independent artist strategy\",\"SOCAM/OAPI copyright\",\"global streaming distribution\",\"Digital and social media communication\",\"Booking local concerts\",\"Standard management contracts\"]}]",
                "Independent artist|Self-managed artist|Emerging artist manager"
        ));

        list.add(course(gi++,
                "certificat-eveil-musical-enfants",
                "Certificate in Musical Awakening & Introduction (Ages 0–12)",
                "Music Education & Teacher Training",
                "Music Teaching — All Levels & Settings",
                "Certificate", 30, 120.0, 195, 4.7, 55,
                "Prof. Anne-Marie Fouda",
                "3 months. Repertoire for young children. Body-percussion and instrumental musical games. Adapted nursery rhymes and traditional songs. Large-class techniques. Creating workshops with limited materials. Practical internship at a preschool.",
                "Repertoire for young children (ages 0–12)|Body-percussion and instrumental musical games|Adapted nursery rhymes and traditional songs|Large-class techniques|Creating workshops with limited materials|Practical internship at a preschool or elementary school",
                "[{\"id\":\"c1\",\"title\":\"3-Month Program\",\"lessons\":[\"Repertoire for young children\",\"Body-percussion and instrumental musical games\",\"Adapted nursery rhymes and traditional songs\",\"Large-class techniques\",\"Creating workshops with limited materials\",\"Practical internship at a preschool\"]}]",
                "School music facilitator|Early childhood educator|Music workshop coordinator"
        ));

        return list;
    }

    private Course course(int gi, String slug, String title, String department, String filiere,
                          String level, int ects, double price, int students, double rating,
                          int duration, String teacher, String description, String skillsPipe,
                          String curriculumJson, String debouches) {
        Course c = new Course();
        c.setStatus(CourseStatus.PUBLISHED);
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
