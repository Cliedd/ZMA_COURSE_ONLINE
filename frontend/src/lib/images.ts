/**
 * AI-generated images via Pollinations.ai, proxied through nginx (/pollinations/).
 * nginx caches each image on first request (30 days), so subsequent loads are instant.
 * Smaller dimensions = faster generation. seed keeps images consistent.
 */

const P = (prompt: string, w: number, h: number, seed: number) =>
  `/pollinations/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${seed}&model=flux`

export const IMG = {
  // ── HERO (reduced to 800x480 for faster generation) ───────────────────────
  hero: P(
    "professional woman vocalist singing passionately on stage, dramatic spotlight, concert hall, elegant dress, microphone, cinematic lighting, photorealistic",
    800, 480, 101
  ),
  heroBg: P(
    "grand concert hall orchestra performance, musicians on stage, dramatic warm lighting, aerial view, photorealistic cinematic",
    800, 480, 202
  ),

  // ── DEPARTMENT / SECTION BACKGROUNDS (600x400) ────────────────────────────
  piano: P(
    "young talented man playing grand piano in luxurious music academy, fingers on keys, warm golden lighting, photorealistic portrait",
    600, 400, 301
  ),
  guitar: P(
    "passionate musician playing acoustic guitar, close up hands strumming, warm sunset light, bokeh background, photorealistic",
    600, 400, 302
  ),
  jazz: P(
    "jazz band performing live, saxophone player, double bass, drummer, stage lights, night club atmosphere, photorealistic cinematic",
    600, 400, 303
  ),
  orchestra: P(
    "full symphony orchestra performing on stage, conductor leading, violins cellos brass section, concert hall, photorealistic",
    600, 400, 304
  ),
  violin: P(
    "elegant woman violinist performing, close up portrait, concert lighting, serious expression, classical music, photorealistic",
    600, 400, 305
  ),
  drums: P(
    "energetic percussionist playing traditional djembe drums, outdoor festival, photorealistic",
    600, 400, 306
  ),
  studio: P(
    "music producer in professional recording studio, mixing console, headphones around neck, computer screens, focused expression, photorealistic",
    600, 400, 307
  ),
  singing: P(
    "woman singing confidently in vocal training class, music academy, teacher watching, microphone stand, photorealistic",
    600, 400, 308
  ),
  theory: P(
    "music student writing musical notation on chalkboard, music theory class, staff notation, photorealistic",
    600, 400, 309
  ),
  teaching: P(
    "music teacher giving piano lesson to young student, one on one class, music academy, warm lighting, photorealistic",
    600, 400, 310
  ),
  traditional: P(
    "musicians playing traditional instruments kora balafon ngoni, outdoor setting, photorealistic",
    600, 400, 311
  ),
  concert: P(
    "spectacular live music concert, artist performing on big stage, crowd cheering, stage lights beams, photorealistic cinematic",
    600, 400, 312
  ),

  // ── GALLERY STRIP (portrait format, 400x500) ──────────────────────────────
  g1: P(
    "young woman playing saxophone, music academy hallway, photorealistic portrait",
    400, 500, 401
  ),
  g2: P(
    "boy learning guitar from teacher, music class, photorealistic portrait",
    400, 500, 402
  ),
  g3: P(
    "woman singing on stage spotlight, emotional performance, photorealistic portrait",
    400, 500, 403
  ),
  g4: P(
    "man playing upright double bass jazz musician, photorealistic portrait",
    400, 500, 404
  ),
  g5: P(
    "music students group rehearsal classroom, diverse instruments, photorealistic",
    400, 500, 405
  ),
  g6: P(
    "female pianist performing recital, concert grand piano, formal attire, photorealistic",
    400, 500, 406
  ),

  // ── TESTIMONIAL PORTRAITS (150x150) ──────────────────────────────────────
  face1: P(
    "professional headshot smiling young woman music student, natural light, photorealistic portrait",
    150, 150, 501
  ),
  face2: P(
    "professional headshot smiling young man music producer student, photorealistic portrait",
    150, 150, 502
  ),
  face3: P(
    "professional headshot smiling woman classical music student, photorealistic portrait",
    150, 150, 503
  ),

  // ── COURSE CARD THUMBNAILS (400x250) ─────────────────────────────────────
  card_piano: P(
    "close up hands on piano keys, warm golden light, music academy, photorealistic",
    400, 250, 601
  ),
  card_guitar: P(
    "guitarist fingerpicking acoustic guitar close up, bokeh, photorealistic",
    400, 250, 602
  ),
  card_voice: P(
    "woman vocalist practicing singing, microphone, music studio, photorealistic",
    400, 250, 603
  ),
  card_drums: P(
    "drummer playing drum kit, action shot, stage light, photorealistic",
    400, 250, 604
  ),
  card_studio: P(
    "music producer recording studio headphones mixing, photorealistic",
    400, 250, 605
  ),
  card_jazz: P(
    "jazz saxophone close up musician playing, stage lighting, photorealistic",
    400, 250, 606
  ),
  card_orchestra: P(
    "violins bows orchestra string section musicians, concert hall, photorealistic",
    400, 250, 607
  ),
  card_theory: P(
    "musical score sheet music notes close up, pencil writing, photorealistic",
    400, 250, 608
  ),
  card_traditional: P(
    "traditional kora instrument close up hands playing, photorealistic",
    400, 250, 609
  ),
  card_bass: P(
    "bassist playing electric bass close up, studio session, photorealistic",
    400, 250, 610
  ),
  card_teaching: P(
    "music teacher pointing at score with student, photorealistic",
    400, 250, 611
  ),
  card_culture: P(
    "world music cultural performance, colorful instruments gathering, photorealistic",
    400, 250, 612
  ),
}

/**
 * Returns the best matching AI image URL for a course based on title/department keywords.
 */
export function getCourseImage(title: string, department: string, index: number): string {
  const t = (title + " " + department).toLowerCase()

  if (t.includes("piano") || t.includes("keyboard"))                    return IMG.card_piano
  if (t.includes("guitar"))                                             return IMG.card_guitar
  if (t.includes("voice") || t.includes("vocal") || t.includes("choir") || t.includes("singing")) return IMG.card_voice
  if (t.includes("percussion") || t.includes("drum") || t.includes("djembe")) return IMG.card_drums
  if (t.includes("studio") || t.includes("production") || t.includes("audio") || t.includes("recording") || t.includes("sound engineering")) return IMG.card_studio
  if (t.includes("jazz"))                                                return IMG.card_jazz
  if (t.includes("orchestr") || t.includes("symphon"))                  return IMG.card_orchestra
  if (t.includes("compos") || t.includes("writing") || t.includes("harmon") || t.includes("theory")) return IMG.card_theory
  if (t.includes("world") || t.includes("tradition") || t.includes("kora") || t.includes("balafon")) return IMG.card_traditional
  if (t.includes("bass"))                                               return IMG.card_bass
  if (t.includes("pedagog") || t.includes("teach") || t.includes("education")) return IMG.card_teaching
  if (t.includes("musicolog") || t.includes("heritage") || t.includes("manag") || t.includes("ethno")) return IMG.card_culture

  // Fallback cycle
  const fallbacks = [
    IMG.card_piano, IMG.card_jazz, IMG.card_orchestra,
    IMG.card_voice, IMG.card_guitar, IMG.card_studio,
    IMG.card_traditional, IMG.card_theory,
  ]
  return fallbacks[index % fallbacks.length]!
}
