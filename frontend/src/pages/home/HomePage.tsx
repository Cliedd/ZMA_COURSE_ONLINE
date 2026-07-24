import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { BlurFade } from '../../components/magicui/blur-fade'
import { Marquee } from '../../components/magicui/marquee'
import { cn } from '../../lib/utils'

// ─── Sprite host — exact defs from the reference file (gradients, grain filter, 8 motif symbols) ──

const SPRITE_DEFS = `<defs>
<linearGradient id="gr0" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2647E8"/><stop offset=".55" stop-color="#5C1039"/><stop offset="1" stop-color="#C42E86"/></linearGradient>
<linearGradient id="gr1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8371C"/><stop offset=".55" stop-color="#6B4A02"/><stop offset="1" stop-color="#E0A012"/></linearGradient>
<linearGradient id="gr2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C42E86"/><stop offset=".55" stop-color="#053B29"/><stop offset="1" stop-color="#0E9F6E"/></linearGradient>
<linearGradient id="gr3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E0A012"/><stop offset=".55" stop-color="#0C0A11"/><stop offset="1" stop-color="#3A3348"/></linearGradient>
<linearGradient id="gr4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0E9F6E"/><stop offset=".55" stop-color="#0B1B6E"/><stop offset="1" stop-color="#2647E8"/></linearGradient>
<linearGradient id="gr5" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A3348"/><stop offset=".55" stop-color="#6E1206"/><stop offset="1" stop-color="#E8371C"/></linearGradient>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3"/><feColorMatrix type="saturate" values="0"/></filter>
<symbol id="m-keys" viewBox="0 0 800 1000"><rect x="3" y="0" width="44" height="1000" fill="#fff" opacity="0.07" rx="4"/><rect x="53" y="0" width="44" height="620" fill="#fff" opacity="0.17" rx="4"/><rect x="103" y="0" width="44" height="1000" fill="#fff" opacity="0.07" rx="4"/><rect x="153" y="0" width="44" height="1000" fill="#fff" opacity="0.07" rx="4"/><rect x="203" y="0" width="44" height="620" fill="#fff" opacity="0.17" rx="4"/><rect x="253" y="0" width="44" height="1000" fill="#fff" opacity="0.07" rx="4"/><rect x="303" y="0" width="44" height="1000" fill="#fff" opacity="0.07" rx="4"/><rect x="353" y="0" width="44" height="1000" fill="#fff" opacity="0.07" rx="4"/><rect x="403" y="0" width="44" height="620" fill="#fff" opacity="0.17" rx="4"/><rect x="453" y="0" width="44" height="1000" fill="#fff" opacity="0.07" rx="4"/><rect x="503" y="0" width="44" height="1000" fill="#fff" opacity="0.07" rx="4"/><rect x="553" y="0" width="44" height="620" fill="#fff" opacity="0.17" rx="4"/><rect x="603" y="0" width="44" height="1000" fill="#fff" opacity="0.07" rx="4"/><rect x="653" y="0" width="44" height="1000" fill="#fff" opacity="0.07" rx="4"/><rect x="703" y="0" width="44" height="1000" fill="#fff" opacity="0.07" rx="4"/><rect x="753" y="0" width="44" height="620" fill="#fff" opacity="0.17" rx="4"/></symbol>
<symbol id="m-wave" viewBox="0 0 800 1000"><rect x="8" y="417" width="10" height="165" rx="5" fill="#fff" opacity="0.12"/><rect x="26" y="414" width="10" height="173" rx="5" fill="#fff" opacity="0.33"/><rect x="44" y="336" width="10" height="327" rx="5" fill="#fff" opacity="0.41"/><rect x="62" y="336" width="10" height="328" rx="5" fill="#fff" opacity="0.18"/><rect x="80" y="211" width="10" height="578" rx="5" fill="#fff" opacity="0.41"/><rect x="98" y="196" width="10" height="607" rx="5" fill="#fff" opacity="0.35"/><rect x="116" y="157" width="10" height="687" rx="5" fill="#fff" opacity="0.37"/><rect x="134" y="142" width="10" height="716" rx="5" fill="#fff" opacity="0.38"/><rect x="152" y="191" width="10" height="617" rx="5" fill="#fff" opacity="0.29"/><rect x="170" y="268" width="10" height="465" rx="5" fill="#fff" opacity="0.18"/><rect x="188" y="215" width="10" height="569" rx="5" fill="#fff" opacity="0.36"/><rect x="206" y="332" width="10" height="337" rx="5" fill="#fff" opacity="0.15"/><rect x="224" y="356" width="10" height="288" rx="5" fill="#fff" opacity="0.20"/><rect x="242" y="390" width="10" height="220" rx="5" fill="#fff" opacity="0.32"/><rect x="260" y="431" width="10" height="137" rx="5" fill="#fff" opacity="0.14"/><rect x="278" y="355" width="10" height="291" rx="5" fill="#fff" opacity="0.38"/><rect x="296" y="282" width="10" height="436" rx="5" fill="#fff" opacity="0.41"/><rect x="314" y="326" width="10" height="347" rx="5" fill="#fff" opacity="0.13"/><rect x="332" y="288" width="10" height="424" rx="5" fill="#fff" opacity="0.16"/><rect x="350" y="172" width="10" height="656" rx="5" fill="#fff" opacity="0.35"/><rect x="368" y="209" width="10" height="583" rx="5" fill="#fff" opacity="0.26"/><rect x="386" y="194" width="10" height="613" rx="5" fill="#fff" opacity="0.29"/><rect x="404" y="219" width="10" height="561" rx="5" fill="#fff" opacity="0.27"/><rect x="422" y="206" width="10" height="587" rx="5" fill="#fff" opacity="0.36"/><rect x="440" y="313" width="10" height="374" rx="5" fill="#fff" opacity="0.18"/><rect x="458" y="332" width="10" height="336" rx="5" fill="#fff" opacity="0.26"/><rect x="476" y="381" width="10" height="238" rx="5" fill="#fff" opacity="0.30"/><rect x="494" y="439" width="10" height="122" rx="5" fill="#fff" opacity="0.35"/><rect x="512" y="399" width="10" height="201" rx="5" fill="#fff" opacity="0.14"/><rect x="530" y="317" width="10" height="365" rx="5" fill="#fff" opacity="0.32"/><rect x="548" y="263" width="10" height="474" rx="5" fill="#fff" opacity="0.33"/><rect x="566" y="228" width="10" height="544" rx="5" fill="#fff" opacity="0.31"/><rect x="584" y="252" width="10" height="497" rx="5" fill="#fff" opacity="0.20"/><rect x="602" y="263" width="10" height="475" rx="5" fill="#fff" opacity="0.16"/><rect x="620" y="149" width="10" height="702" rx="5" fill="#fff" opacity="0.37"/><rect x="638" y="263" width="10" height="474" rx="5" fill="#fff" opacity="0.17"/><rect x="656" y="277" width="10" height="445" rx="5" fill="#fff" opacity="0.18"/><rect x="674" y="262" width="10" height="476" rx="5" fill="#fff" opacity="0.31"/><rect x="692" y="306" width="10" height="387" rx="5" fill="#fff" opacity="0.33"/><rect x="710" y="353" width="10" height="293" rx="5" fill="#fff" opacity="0.41"/><rect x="728" y="432" width="10" height="135" rx="5" fill="#fff" opacity="0.16"/><rect x="746" y="385" width="10" height="230" rx="5" fill="#fff" opacity="0.35"/><rect x="764" y="320" width="10" height="360" rx="5" fill="#fff" opacity="0.36"/><rect x="782" y="315" width="10" height="369" rx="5" fill="#fff" opacity="0.20"/></symbol>
<symbol id="m-rhythm" viewBox="0 0 800 1000"><circle cx="400" cy="500" r="496" fill="none" stroke="#fff" stroke-width="3.3" opacity="0.31"/><circle cx="400" cy="500" r="434" fill="none" stroke="#fff" stroke-width="4.5" opacity="0.29"/><circle cx="400" cy="500" r="372" fill="none" stroke="#fff" stroke-width="4.4" opacity="0.26"/><circle cx="400" cy="500" r="310" fill="none" stroke="#fff" stroke-width="4.0" opacity="0.23"/><circle cx="400" cy="500" r="248" fill="none" stroke="#fff" stroke-width="4.9" opacity="0.20"/><circle cx="400" cy="500" r="186" fill="none" stroke="#fff" stroke-width="1.8" opacity="0.17"/><circle cx="400" cy="500" r="124" fill="none" stroke="#fff" stroke-width="4.9" opacity="0.15"/><circle cx="400" cy="500" r="62" fill="none" stroke="#fff" stroke-width="3.8" opacity="0.12"/><circle cx="400" cy="500" r="42" fill="#fff" opacity=".3"/></symbol>
<symbol id="m-strings" viewBox="0 0 800 1000"><path d="M0 110 Q400 35 800 110" fill="none" stroke="#fff" stroke-width="1.0" opacity="0.14"/><path d="M0 205 Q400 236 800 205" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.17"/><path d="M0 300 Q400 371 800 300" fill="none" stroke="#fff" stroke-width="2.0" opacity="0.20"/><path d="M0 395 Q400 350 800 395" fill="none" stroke="#fff" stroke-width="2.5" opacity="0.23"/><path d="M0 490 Q400 561 800 490" fill="none" stroke="#fff" stroke-width="3.0" opacity="0.26"/><path d="M0 585 Q400 624 800 585" fill="none" stroke="#fff" stroke-width="3.5" opacity="0.29"/><path d="M0 680 Q400 732 800 680" fill="none" stroke="#fff" stroke-width="4.0" opacity="0.32"/><path d="M0 775 Q400 830 800 775" fill="none" stroke="#fff" stroke-width="4.5" opacity="0.35"/><path d="M0 870 Q400 882 800 870" fill="none" stroke="#fff" stroke-width="5.0" opacity="0.38"/></symbol>
<symbol id="m-choir" viewBox="0 0 800 1000"><line x1="490" y1="500" x2="650" y2="500" stroke="#fff" stroke-width="1.0" opacity="0.10"/><line x1="487" y1="522" x2="932" y2="631" stroke="#fff" stroke-width="4.5" opacity="0.28"/><line x1="480" y1="542" x2="984" y2="806" stroke="#fff" stroke-width="5.9" opacity="0.35"/><line x1="467" y1="560" x2="650" y2="722" stroke="#fff" stroke-width="2.0" opacity="0.15"/><line x1="451" y1="574" x2="775" y2="1043" stroke="#fff" stroke-width="5.9" opacity="0.35"/><line x1="432" y1="584" x2="601" y2="1031" stroke="#fff" stroke-width="4.8" opacity="0.30"/><line x1="411" y1="589" x2="473" y2="1100" stroke="#fff" stroke-width="5.2" opacity="0.32"/><line x1="389" y1="589" x2="326" y2="1109" stroke="#fff" stroke-width="5.3" opacity="0.33"/><line x1="368" y1="584" x2="225" y2="962" stroke="#fff" stroke-width="3.9" opacity="0.25"/><line x1="349" y1="574" x2="214" y2="770" stroke="#fff" stroke-width="1.9" opacity="0.15"/><line x1="333" y1="560" x2="-35" y2="885" stroke="#fff" stroke-width="4.9" opacity="0.31"/><line x1="320" y1="542" x2="142" y2="635" stroke="#fff" stroke-width="1.5" opacity="0.13"/><line x1="313" y1="522" x2="47" y2="587" stroke="#fff" stroke-width="2.4" opacity="0.17"/><line x1="310" y1="500" x2="-132" y2="500" stroke="#fff" stroke-width="4.4" opacity="0.27"/><line x1="313" y1="478" x2="127" y2="433" stroke="#fff" stroke-width="1.4" opacity="0.12"/><line x1="320" y1="458" x2="-148" y2="212" stroke="#fff" stroke-width="5.4" opacity="0.33"/><line x1="333" y1="440" x2="-91" y2="65" stroke="#fff" stroke-width="5.8" opacity="0.35"/><line x1="349" y1="426" x2="252" y2="286" stroke="#fff" stroke-width="1.1" opacity="0.11"/><line x1="368" y1="416" x2="292" y2="216" stroke="#fff" stroke-width="1.6" opacity="0.13"/><line x1="389" y1="411" x2="331" y2="-70" stroke="#fff" stroke-width="4.9" opacity="0.30"/><line x1="411" y1="411" x2="453" y2="63" stroke="#fff" stroke-width="3.3" opacity="0.22"/><line x1="432" y1="416" x2="572" y2="48" stroke="#fff" stroke-width="3.8" opacity="0.24"/><line x1="451" y1="426" x2="658" y2="126" stroke="#fff" stroke-width="3.4" opacity="0.23"/><line x1="467" y1="440" x2="837" y2="113" stroke="#fff" stroke-width="5.0" opacity="0.31"/><line x1="480" y1="458" x2="702" y2="342" stroke="#fff" stroke-width="2.1" opacity="0.16"/><line x1="487" y1="478" x2="839" y2="392" stroke="#fff" stroke-width="3.4" opacity="0.23"/><circle cx="400" cy="500" r="70" fill="#fff" opacity=".26"/></symbol>
<symbol id="m-stage" viewBox="0 0 800 1000"><polygon points="110,0 156,0 300,1000 -30,1000" fill="#fff" opacity="0.05"/><polygon points="210,0 256,0 400,1000 70,1000" fill="#fff" opacity="0.13"/><polygon points="310,0 356,0 500,1000 170,1000" fill="#fff" opacity="0.16"/><polygon points="410,0 456,0 600,1000 270,1000" fill="#fff" opacity="0.07"/><polygon points="510,0 556,0 700,1000 370,1000" fill="#fff" opacity="0.16"/><polygon points="610,0 656,0 800,1000 470,1000" fill="#fff" opacity="0.13"/><polygon points="710,0 756,0 900,1000 570,1000" fill="#fff" opacity="0.14"/></symbol>
<symbol id="m-voice" viewBox="0 0 800 1000"><path d="M90 250 Q150 500 90 750" fill="none" stroke="#fff" stroke-width="2" opacity="0.30"/><path d="M710 250 Q650 500 710 750" fill="none" stroke="#fff" stroke-width="2" opacity="0.30"/><path d="M130 250 Q190 500 130 750" fill="none" stroke="#fff" stroke-width="3" opacity="0.27"/><path d="M670 250 Q610 500 670 750" fill="none" stroke="#fff" stroke-width="3" opacity="0.27"/><path d="M170 250 Q230 500 170 750" fill="none" stroke="#fff" stroke-width="4" opacity="0.24"/><path d="M630 250 Q570 500 630 750" fill="none" stroke="#fff" stroke-width="4" opacity="0.24"/><path d="M210 250 Q270 500 210 750" fill="none" stroke="#fff" stroke-width="5" opacity="0.21"/><path d="M590 250 Q530 500 590 750" fill="none" stroke="#fff" stroke-width="5" opacity="0.21"/><path d="M250 250 Q310 500 250 750" fill="none" stroke="#fff" stroke-width="6" opacity="0.18"/><path d="M550 250 Q490 500 550 750" fill="none" stroke="#fff" stroke-width="6" opacity="0.18"/><path d="M290 250 Q350 500 290 750" fill="none" stroke="#fff" stroke-width="7" opacity="0.15"/><path d="M510 250 Q450 500 510 750" fill="none" stroke="#fff" stroke-width="7" opacity="0.15"/><path d="M330 250 Q390 500 330 750" fill="none" stroke="#fff" stroke-width="8" opacity="0.12"/><path d="M470 250 Q410 500 470 750" fill="none" stroke="#fff" stroke-width="8" opacity="0.12"/><circle cx="400" cy="500" r="78" fill="#fff" opacity=".24"/></symbol>
<symbol id="m-portrait" viewBox="0 0 800 1000"><circle cx="400" cy="410" r="158" fill="#fff" opacity=".22"/><path d="M120 1000C150 700 250 620 400 620s250 80 280 380Z" fill="#fff" opacity=".18"/><circle cx="400" cy="410" r="190" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.120"/><circle cx="400" cy="410" r="248" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.102"/><circle cx="400" cy="410" r="306" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.084"/><circle cx="400" cy="410" r="364" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.066"/><circle cx="400" cy="410" r="422" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.048"/></symbol>
</defs>`

function SpriteHost() {
  return <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true" dangerouslySetInnerHTML={{ __html: SPRITE_DEFS }} />
}

// ─── Art — one artwork slot (gradient + line-art motif + grain), matching the reference's .ph/.art ──

function Art({ gradient, motif, className = '' }: { gradient: string; motif: string; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-zma-coal', className)}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="800" height="1000" fill={`url(#${gradient})`} />
        <use href={`#${motif}`} />
        <rect width="800" height="1000" filter="url(#grain)" opacity=".13" />
      </svg>
    </div>
  )
}

function Photo({ src, alt, className = '', position = '50% 50%' }: { src: string; alt: string; className?: string; position?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-zma-coal', className)}>
      <img src={src} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position }} />
    </div>
  )
}

function Logo({ className = '' }: { className?: string }) {
  return <img src={IMG.logo} alt="ZTF Music Academy" className={cn('h-16 w-auto object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,.55)]', className)} />
}

// ─── Btn — pill CTA with lift, shadow and a diagonal shine sweep on hover ──

function Btn({ children, href = '#', to, variant = 'solid', color = '#E0A012', textColor, hoverText = '#ffffff', size = 'md', className = '' }: {
  children: React.ReactNode; href?: string; to?: string; variant?: 'solid' | 'outline'; color?: string; textColor?: string; hoverText?: string; size?: 'md' | 'lg'; className?: string
}) {
  const outline = variant === 'outline'
  const cls = cn(
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-sans font-bold transition-all duration-300 ease-out',
    size === 'lg' ? 'px-9 py-4 text-[0.95rem]' : 'px-6 py-2.5 text-sm',
    'hover:-translate-y-1 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.5)] active:translate-y-0 active:shadow-none active:scale-[0.98]',
    outline
      ? 'border-2 border-[var(--btn-c)] text-[var(--btn-c)] bg-transparent hover:bg-[var(--btn-c)] hover:text-[var(--btn-ht)]'
      : 'bg-[var(--btn-c)] text-[var(--btn-tc)] border-2 border-transparent',
    className,
  )
  const style = { '--btn-c': color, '--btn-tc': textColor ?? (outline ? color : '#0C0A11'), '--btn-ht': hoverText } as React.CSSProperties
  const content = (
    <>
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 ease-out group-hover:translate-x-full"
        style={{ background: 'linear-gradient(100deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%)' }}
      />
    </>
  )
  if (to) return <Link to={to} className={cls} style={style}>{content}</Link>
  return <a href={href} className={cls} style={style}>{content}</a>
}

// ─── Data ───────────────────────────────────────────────────────────────────

const ACCENT_HEX = { f1: '#2647E8', f2: '#E8371C', f3: '#C42E86', g1: '#E0A012', g2: '#0E9F6E' } as const
type Accent = keyof typeof ACCENT_HEX
const ACCENT_RGB: Record<Accent, string> = {
  f1: '38,71,232', f2: '232,55,28', f3: '196,46,134', g1: '224,160,18', g2: '14,159,110',
}

// Real photos + logo, scraped from ztfmusic.com/fr/ and served from public/images/ztf
const IMG = {
  logo: '/images/ztf/logo.png',
  hero1: '/images/ztf/gallery-ear.jpg',
  hero2: '/images/ztf/hero-2.jpg',
  hero3: '/images/ztf/hero-3.jpg',
  aboutLarge: '/images/ztf/about-large.jpg',
  aboutSmall: '/images/ztf/about-small.jpg',
  levelBeginner: '/images/ztf/gallery-creativity.jpg',
  levelIntermediate: '/images/ztf/level-intermediate.jpg',
  levelAdvanced: '/images/ztf/level-advanced.jpg',
  courseDrums: '/images/ztf/course-drums.jpg',
  courseGuitar: '/images/ztf/course-guitar.jpg',
  courseBass: '/images/ztf/course-bass.jpg',
  audienceChildren: '/images/ztf/level-advanced.jpg',
  audienceTeens: '/images/ztf/feature-2.jpg',
  audienceAdults: '/images/ztf/gallery-creativity.jpg',
  audiencePrivate: '/images/ztf/level-intermediate.jpg',
  coursePiano: '/images/ztf/course-piano.jpg',
  whyChooseUs: '/images/ztf/feature-1.jpg',
  feature1: '/images/ztf/feature-1.jpg',
  feature2: '/images/ztf/feature-2.jpg',
  galleryEar: '/images/ztf/gallery-ear.jpg',
  galleryCreativity: '/images/ztf/gallery-creativity.jpg',
}

const STATS: { value: string; label: string; accent: Accent }[] = [
  { value: '100+', label: 'Students trained', accent: 'f1' },
  { value: '10+', label: 'Qualified instructors', accent: 'f2' },
  { value: '20+', label: 'Projects completed', accent: 'g1' },
  { value: '10+', label: 'Years of experience', accent: 'g2' },
]

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'levels', label: 'Levels' },
  { id: 'faculties', label: 'Faculties' },
  { id: 'courses', label: 'Courses' },
  { id: 'teachers', label: 'Teachers' },
  { id: 'faq', label: 'FAQ' },
]

const H_LG = 'font-sans font-black leading-[1.02] tracking-[-0.04em] text-[clamp(2.1rem,4.6vw,3.9rem)]'

const DISCIPLINES: { label: string; accent: Accent }[] = [
  { label: 'Piano, keyboard & organ', accent: 'f1' },
  { label: 'Voice & vocal pedagogy', accent: 'f2' },
  { label: 'Drums & percussion', accent: 'f3' },
  { label: 'Sound engineering', accent: 'g2' },
  { label: 'Worship & praise', accent: 'g1' },
  { label: 'Strings', accent: 'f1' },
  { label: 'Composition & arrangement', accent: 'f2' },
]

const LEVELS = [
  { n: '01', name: 'Beginner', accent: 'f1' as Accent, img: IMG.levelBeginner, meta: 'Early beginner & beginner entry',
    desc: 'Introduction to the instrument, musical basics, reading, rhythm, posture and spiritual foundations.' },
  { n: '02', name: 'Intermediate', accent: 'f2' as Accent, img: IMG.levelIntermediate, meta: 'Requires beginner completion',
    desc: 'Technical development, harmony, accompaniment, playing in a group, and a sense of ministry.' },
  { n: '03', name: 'Advanced', accent: 'g1' as Accent, img: IMG.levelAdvanced, meta: 'Leads to performance & ministry roles',
    desc: 'Instrumental mastery, interpretation, improvisation, musical leadership, and service in the Church and on stage.' },
]

const FACULTIES: { code: string; name: string; sub: string; faculty: string; accent: Accent }[] = [
  { code: '01', name: 'Piano, Keyboard & Organ', sub: 'Piano · Organ · Keyboard', faculty: 'Music faculty', accent: 'f1' },
  { code: '02', name: 'Voice & Vocal Pedagogy', sub: 'Singing · Vocal technique · Choral', faculty: 'Song & AV faculty', accent: 'f2' },
  { code: '03', name: 'Drums & Percussion', sub: 'Drums · Congas · Marimba · Xylophone', faculty: 'Music faculty', accent: 'f3' },
  { code: '04', name: 'Strings', sub: 'Guitar · Bass guitar · Violin · Harp · Banjo', faculty: 'Music faculty', accent: 'f1' },
  { code: '05', name: 'Sound Engineering', sub: 'Live sound · Studio sound · Recording', faculty: 'Music faculty', accent: 'g2' },
  { code: '06', name: 'Brass & Woodwind', sub: 'Trumpet · Tuba · Saxophone · Clarinet · Flute', faculty: 'Music faculty', accent: 'f2' },
  { code: '07', name: 'Composition & Conducting', sub: 'Composition · Arrangement · Conducting', faculty: 'Music faculty', accent: 'g1' },
  { code: '08', name: 'Video & Broadcast', sub: 'Video recording · Editing & broadcasting', faculty: 'Song & AV faculty', accent: 'f3' },
  { code: '09', name: 'Dance & Theatre', sub: 'Dance · Theatre · Stagecraft', faculty: 'Dance & Theatre faculty', accent: 'f3' },
]

const COURSES = [
  { title: 'Drums for Beginners', teacher: 'Joel Mbida', cat: 'Drums & Percussion', accent: 'f3' as Accent, img: IMG.courseDrums, flag: 'Beginner', foot: ['Coming soon', 'Beginner'] },
  { title: 'Acoustic Guitar', teacher: 'Njimafo Guerin', cat: 'Strings', accent: 'f1' as Accent, img: IMG.courseGuitar, flag: 'Beginner', foot: ['Coming soon', 'Beginner'] },
  { title: 'Bass Guitar', teacher: 'Njimafo Guerin', cat: 'Strings', accent: 'f1' as Accent, img: IMG.courseBass, flag: 'Beginner', foot: ['Coming soon', 'Beginner'] },
  { title: 'Piano for Beginners', teacher: 'Joel Ebounlo', cat: 'Piano, Keyboard & Organ', accent: 'g1' as Accent, img: IMG.coursePiano, flag: '5 videos live', foot: ['5 videos', 'Beginner'] },
]

const AUDIENCES: { title: string; desc: string; accent: Accent; img: string }[] = [
  { title: 'Children', accent: 'f1', img: IMG.audienceChildren, desc: 'Playful, foundational lessons that wake up an interest in music very early.' },
  { title: 'Teenagers', accent: 'f2', img: IMG.audienceTeens, desc: 'Build skill and confidence through creative exploration and group playing.' },
  { title: 'Adults', accent: 'g2', img: IMG.audienceAdults, desc: 'Refine your technique, express your passion, and keep progressing musically.' },
  { title: 'Private lessons', accent: 'f3', img: IMG.audiencePrivate, desc: 'Tailored teaching for personalised, targeted progress at your own pace.' },
]

const INSTRUMENT_ACCENTS: Accent[] = ['f1', 'f2', 'f3', 'g1', 'g2']
const INSTRUMENTS = [
  'Piano', 'Organ', 'Guitar', 'Bass guitar', 'Drums', 'Congas', 'Marimba', 'Xylophone',
  'Violin', 'Harp', 'Banjo', 'Saxophone', 'Trumpet', 'Tuba', 'Clarinet', 'Flutes',
  'Vocal pedagogy', 'Composition', 'Conducting', 'Live sound setting',
  'Studio sound setting', 'Video recording', 'Video editing & broadcasting',
]

const FACILITIES: { title: string; desc: string; accent: Accent; icon: React.ReactNode }[] = [
  { title: 'Free equipment', accent: 'f1', desc: 'Start with high quality gear, available to you at no extra cost.', icon: <path d="M20 7h-9M14 17H5M17 3l3 4-3 4M7 13l-3 4 3 4" /> },
  { title: 'High technology', accent: 'f2', desc: 'Advanced tools and digital platforms suited to modern music teaching.', icon: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></> },
  { title: 'Music studio', accent: 'g2', desc: 'Create, rehearse and record in acoustically treated professional studios.', icon: <><path d="M12 2v14M8 6v6M16 6v6M4 10v2M20 10v2" /><circle cx="12" cy="19" r="3" /></> },
  { title: 'Expert mentors', accent: 'g1', desc: 'Learn from experienced mentors committed to guiding your musical path.', icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></> },
]

const TEACHERS = [
  { name: 'Dieudonné Mougnol', role: 'Sound Engineer', accent: 'g2' as Accent, gradient: 'gr1' },
  { name: 'Joel Mbida', role: 'Drums & Percussion', accent: 'f3' as Accent, gradient: 'gr2' },
  { name: 'Joel Ebounlo', role: 'Piano Teacher', accent: 'g1' as Accent, gradient: 'gr3' },
  { name: 'Njimafo Guerin', role: 'Bass & Theory', accent: 'f1' as Accent, gradient: 'gr4' },
]

const GALLERY_PHOTOS = [
  IMG.hero1, IMG.hero2, IMG.hero3, IMG.aboutLarge, IMG.aboutSmall,
  IMG.levelBeginner, IMG.levelIntermediate, IMG.levelAdvanced,
  IMG.feature1, IMG.feature2, IMG.galleryEar, IMG.galleryCreativity,
  IMG.whyChooseUs, IMG.courseDrums, IMG.courseGuitar, IMG.courseBass, IMG.coursePiano,
]
const GALLERY_A = Array.from({ length: 16 }, (_, i) => GALLERY_PHOTOS[i % GALLERY_PHOTOS.length])
const GALLERY_B = Array.from({ length: 16 }, (_, i) => GALLERY_PHOTOS[(i + 8) % GALLERY_PHOTOS.length])

// Translated from the real FAQ at ztfmusic.com/fr/faqs/ (20 total there; curated selection for the homepage)
const FAQS = [
  { q: 'What kind of training does ZTF Music Academy offer?', a: 'Our training covers music and instruments, singing and composition, taught through accelerated, hands-on courses.' },
  { q: 'What instruments can I learn at ZMA?', a: 'String instruments (guitar, bass guitar, violin…), wind instruments (trumpet, saxophone, trombone…), keyboard instruments (piano, organ, accordion…), and drums and percussion.' },
  { q: 'Do I need musical knowledge before enrolling?', a: 'No musical prerequisite is required to join any of our courses.' },
  { q: 'How long do training sessions last?', a: 'Course length varies by need: from 1 week for the shortest, up to 3 years for the most complete curricula.' },
  { q: 'What levels are offered?', a: 'We offer six levels: pre-beginner, beginner, pre-intermediate, intermediate, pre-advanced and advanced.' },
  { q: 'Is there a difference between online and in-person training?', a: 'The content is exactly the same — only the physical presence of an instructor changes.' },
  { q: 'Can I follow several courses at the same time?', a: 'Yes. Our platform lets you follow several courses in parallel.' },
  { q: 'Are the courses only focused on Christian music?', a: 'Our courses aim to train musicians in the service of God, but the techniques taught apply to any style.' },
  { q: 'How do I register for a training session?', a: 'Registration is done through our app, on our website, or by contacting our team directly.' },
  { q: 'Does ZMA operate outside Belgium?', a: 'ZMA now operates in France, the UK, Cameroon, Ivory Coast, Germany and Canada, and continues to expand.' },
]

const FOOTER_LEARN = [
  { label: 'About us', href: '#about' }, { label: 'Programmes', href: '#levels' },
  { label: 'All courses', href: '#courses' }, { label: 'Our team', href: '#teachers' },
  { label: 'Achievements', href: '#' },
]
const FOOTER_SUPPORT = [
  { label: 'FAQ', href: '#faq' }, { label: 'Resources', href: '#' },
  { label: 'Register', href: '#' }, { label: 'WhatsApp us', href: '#' },
]

// ─── Small building blocks ──────────────────────────────────────────────────

const Eyebrow = ({ children, accent = '#E8371C', className = '', center = false }: { children: React.ReactNode; accent?: string; className?: string; center?: boolean }) => (
  <p className={cn('font-mono text-[11px] font-bold tracking-[0.25em] uppercase flex items-center gap-3 mb-4', center && 'justify-center', className)} style={{ color: accent }}>
    <span className="w-6 h-[2px]" style={{ background: accent }} />
    {children}
  </p>
)

const Icon24 = ({ children, className = '', strokeWidth = 2 }: { children: React.ReactNode; className?: string; strokeWidth?: number }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>{children}</svg>
)

export const HomePage = () => {
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="overflow-x-hidden bg-zma-paper text-zma-ink">
      <SpriteHost />

      {/* ── NAV — logo + auth stand free, only the link cluster is glass ── */}
      <nav className="fixed top-4 inset-x-4 sm:top-6 sm:inset-x-6 lg:inset-x-10 z-[300]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
          <a href="#" aria-label="ZMA Course Online" className="relative shrink-0">
            <span className="absolute -inset-5 -z-10 rounded-full bg-black/45 blur-2xl" aria-hidden="true" />
            <Logo className={cn('transition-[height] duration-300 drop-shadow-[0_4px_22px_rgba(0,0,0,.85)]', stuck ? 'h-16' : 'h-28')} />
          </a>

          <div
            className={cn(
              'hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.07] backdrop-blur-2xl shadow-[0_8px_40px_-8px_rgba(0,0,0,.6)] transition-[padding] duration-300',
              stuck ? 'px-2 py-1.5' : 'px-2.5 py-2'
            )}
          >
            {NAV_LINKS.map(({ id, label }) => (
              <a key={id} href={`#${id}`} className="px-4 py-2 rounded-full text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200">
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link to="/auth/connexion" className="hidden sm:inline-block font-sans font-bold text-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.6)] hover:text-zma-g1 transition-colors">Sign in</Link>
            <Btn to="/auth/inscription" color={ACCENT_HEX.f2}>Register</Btn>
          </div>
        </div>
      </nav>

      {/* ── HERO — cinematic full-bleed photo, glass panel, ambient glow, film grain ── */}
      <header className="relative overflow-hidden bg-zma-ink min-h-[100svh] flex items-center">
        <Photo
          src={IMG.hero3}
          alt="ZTF Music Academy worship choir performing"
          position="30% 30%"
          className="absolute inset-0 animate-kenburns"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(12,10,17,.78) 0%, rgba(12,10,17,.4) 42%, rgba(12,10,17,.88) 100%)' }} />

        <div className="absolute top-24 left-10 w-[480px] h-[480px] rounded-full blur-[130px] opacity-[.22] pointer-events-none" style={{ background: ACCENT_HEX.f1 }} />
        <div className="absolute -bottom-40 -right-24 w-[560px] h-[560px] rounded-full blur-[150px] opacity-[.24] pointer-events-none" style={{ background: ACCENT_HEX.f3 }} />
        <div className="absolute top-1/3 right-[18%] w-[360px] h-[360px] rounded-full blur-[120px] opacity-[.18] pointer-events-none" style={{ background: ACCENT_HEX.g1 }} />

        <svg className="absolute inset-0 w-full h-full opacity-[.05] mix-blend-overlay pointer-events-none" aria-hidden="true">
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        <div className="absolute inset-x-0 top-0 h-40 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,.55), transparent)' }} />

        <div className="relative z-10 max-w-[1360px] mx-auto w-full px-6 lg:px-10 pt-44 pb-16">
          <div className="max-w-xl rounded-[32px] border border-white/10 bg-white/[0.07] backdrop-blur-2xl shadow-[0_24px_70px_-20px_rgba(0,0,0,.75)] p-8 sm:p-10 lg:p-11">
            <Eyebrow accent="#E8371C" className="text-white">ZTF Music Academy · Since 2018</Eyebrow>
            <h1 className="font-sans font-black text-white leading-[0.96] tracking-[-0.04em] text-[clamp(2.2rem,4.2vw,3.7rem)]">
              Music as <span className="font-serif italic font-normal text-zma-g1">ministry</span>,<br />taught properly.
            </h1>
            <p className="mt-4 text-base text-white/65 leading-relaxed">
              ZTF Music Academy trains musicians with the discipline of a real conservatory
              and the heart of a ministry. Real faculty, structured levels and accelerated
              courses, all built to prepare you to serve the Church through excellence.
            </p>
            <div className="mt-7">
              <Btn href="#courses" color={ACCENT_HEX.g1} size="lg">Browse courses</Btn>
            </div>

            <div className="flex items-center gap-8 mt-8 pt-6 border-t border-white/10">
              {[{ v: '100+', l: 'Students' }, { v: '10+', l: 'Instructors' }, { v: '10+', l: 'Years' }].map(s => (
                <div key={s.l}>
                  <div className="font-sans font-extrabold text-xl text-white tracking-tight">{s.v}</div>
                  <div className="font-mono text-[9px] tracking-widest uppercase text-white/40 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── MARQUEE ── */}
      <div className="bg-zma-ink border-t border-white/10 overflow-hidden">
        <Marquee pauseOnHover className="[--duration:42s]">
          {DISCIPLINES.map((d, i) => (
            <a
              key={i}
              href="#"
              className="shrink-0 flex items-center gap-2.5 font-sans font-bold text-sm text-white px-6 py-4 hover:bg-white/[0.09] transition-colors"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ACCENT_HEX[d.accent] }} />
              {d.label}
            </a>
          ))}
        </Marquee>
      </div>

      {/* ── ABOUT ── */}
      <section id="about" className="py-24 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <BlurFade inView className="relative pb-14 pr-12">
            <Photo src={IMG.aboutLarge} alt="ZTF Music Academy classroom" className="rounded-sm aspect-[4/5]" />
            <Photo src={IMG.aboutSmall} alt="ZTF Music Academy students" className="absolute right-0 bottom-0 w-[56%] aspect-square rounded-sm border-8 border-white shadow-xl" />
            <div className="absolute left-[-14px] top-[26px] bg-zma-g1 text-zma-ink px-5 py-3.5 rounded-sm shadow-lg">
              <b className="font-sans font-extrabold text-2xl leading-none block tracking-tight">2018</b>
              <span className="font-mono text-[10px] tracking-widest uppercase block mt-1">Teaching since</span>
            </div>
          </BlurFade>
          <BlurFade inView delay={0.1}>
            <Eyebrow accent="#2647E8">About us</Eyebrow>
            <h2 className={cn(H_LG, 'mb-5')}>
              Rooted in <span className="font-serif italic font-normal">faith</span>,<br />built for excellence.
            </h2>
            <p className="text-zma-ash leading-relaxed mb-7">
              ZTF Music Academy is a Christian music training institution built on
              excellence, artistic passion and the service of God through music.
              Founded on solid biblical values, the academy exists to form competent,
              inspired and committed musicians able to serve effectively in the Church,
              in ministry and in the music industry.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {[
                { label: 'Professional instructors', accent: 'f1' as Accent },
                { label: 'Develop your talent', accent: 'f2' as Accent },
                { label: 'Music as ministry', accent: 'g1' as Accent },
                { label: 'Opportunities & performance', accent: 'f3' as Accent },
              ].map(({ label, accent }) => (
                <li key={label} className="flex items-start gap-2.5 text-sm font-medium">
                  <span className="w-5 h-5 rounded-full shrink-0 grid place-items-center text-white text-[10px] mt-0.5" style={{ background: ACCENT_HEX[accent] }}>✓</span>
                  {label}
                </li>
              ))}
            </ul>
            <Btn href="#" variant="outline" color="#0C0A11">Read more about the academy</Btn>
          </BlurFade>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="border-y border-zma-line bg-zma-sand">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-zma-line px-8">
          {STATS.map((s, i) => (
            <BlurFade key={s.label} inView delay={i * 0.06} className="py-10 px-6 text-center">
              <div className="font-sans font-extrabold text-4xl md:text-5xl tracking-tight" style={{ color: ACCENT_HEX[s.accent] }}>{s.value}</div>
              <div className="font-mono text-[11px] tracking-widest uppercase text-zma-ash mt-2">{s.label}</div>
            </BlurFade>
          ))}
        </div>
      </div>

      {/* ── LEVELS ── */}
      <section id="levels" className="py-24 px-8 bg-zma-sand">
        <div className="max-w-6xl mx-auto">
          <BlurFade inView className="max-w-2xl mb-12">
            <Eyebrow accent="#E8371C">Our programme</Eyebrow>
            <h2 className={cn(H_LG, 'mb-4')}>
              Programmes <span className="font-serif italic font-normal">by level</span>.
            </h2>
            <p className="text-zma-ash leading-relaxed max-w-xl">
              Tailored programmes that carry students through every stage of their musical
              development, building solid technique, creativity and confidence in performance.
            </p>
          </BlurFade>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {LEVELS.map((lv, i) => (
              <BlurFade key={lv.n} inView delay={i * 0.08}>
                <article className="bg-white rounded-sm overflow-hidden h-full flex flex-col hover:-translate-y-1.5 transition-transform duration-300 shadow-sm hover:shadow-xl">
                  <Photo src={lv.img} alt={lv.name} className="aspect-[16/10]" />
                  <div className="h-1.5" style={{ background: ACCENT_HEX[lv.accent] }} />
                  <div className="p-6 flex flex-col flex-1">
                    <p className="font-mono text-[11px] font-bold tracking-widest uppercase mb-2.5" style={{ color: ACCENT_HEX[lv.accent] }}>
                      Level {lv.n} · {lv.name}
                    </p>
                    <h3 className="font-sans font-extrabold text-xl tracking-tight mb-2.5">{lv.name}</h3>
                    <p className="text-sm text-zma-ash leading-relaxed mb-4">{lv.desc}</p>
                    <p className="mt-auto pt-3.5 border-t border-zma-line font-mono text-[11px] text-zma-ash">{lv.meta}</p>
                  </div>
                </article>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── FACULTIES ── */}
      <section id="faculties" className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <BlurFade inView className="max-w-2xl mb-9">
            <Eyebrow accent="#C42E86">Our courses</Eyebrow>
            <h2 className={cn(H_LG, 'mb-4')}>
              Three faculties.<br />Nine <span className="font-serif italic font-normal">departments</span>.
            </h2>
            <p className="text-zma-ash leading-relaxed">
              ZTF Music Academy trains across several families of instruments and disciplines.
              Pick a department and the catalogue filters to it.
            </p>
          </BlurFade>
          <div className="border-t-2 border-zma-ink">
            {FACULTIES.map(f => {
              const accent = ACCENT_HEX[f.accent]
              return (
                <a
                  key={f.code}
                  href="#courses"
                  className="group relative z-0 grid grid-cols-[48px_1fr_auto] sm:grid-cols-[64px_1fr_auto] items-center gap-4 sm:gap-6 py-6 px-2 border-b border-zma-ink/10 overflow-hidden transition-[padding] duration-300 hover:pl-6"
                >
                  <span className="absolute inset-0 -z-10 scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100" style={{ background: accent }} />
                  <span className="font-mono text-xs font-bold transition-colors group-hover:text-white" style={{ color: accent }}>{f.code}</span>
                  <span>
                    <span className="font-sans font-extrabold text-lg sm:text-2xl tracking-tight leading-tight block transition-colors group-hover:text-white">{f.name}</span>
                    <span className="text-sm text-zma-ash mt-1 block transition-colors group-hover:text-white/90">{f.sub}</span>
                  </span>
                  <span className="font-mono text-xs text-zma-ash whitespace-nowrap flex items-center gap-3 transition-colors group-hover:text-white/90">
                    {f.faculty} <span className="inline-block transition-transform group-hover:translate-x-2">→</span>
                  </span>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── COURSES ── */}
      <section id="courses" className="py-24 px-8 bg-zma-sand">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
            <BlurFade inView>
              <Eyebrow accent="#E0A012">Open for registration</Eyebrow>
              <h2 className={H_LG}>Courses running now</h2>
            </BlurFade>
            <Btn href="#" variant="outline" color="#0C0A11">See the full catalogue</Btn>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COURSES.map((c, i) => {
              const accent = ACCENT_HEX[c.accent]
              return (
                <BlurFade key={c.title} inView delay={i * 0.08}>
                  <article className="bg-white rounded-sm overflow-hidden h-full flex flex-col hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-xl">
                    <div className="relative">
                      <Photo src={c.img} alt={c.title} className="aspect-[4/3]" />
                      <span className="absolute top-0 left-0 text-white font-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-1.5" style={{ background: accent }}>{c.flag}</span>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: accent }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                        {c.cat}
                      </div>
                      <h3 className="font-sans font-extrabold text-lg leading-tight tracking-tight mb-1.5">{c.title}</h3>
                      <p className="text-sm text-zma-ash mb-4">{c.teacher}</p>
                      <div className="mt-auto pt-3.5 border-t border-zma-line flex items-center justify-between font-mono text-[11px] text-zma-ash">
                        <span>{c.foot[0]}</span>
                        <span>{c.foot[1]}</span>
                      </div>
                    </div>
                  </article>
                </BlurFade>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── AUDIENCES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map(({ img, accent, title, desc }) => (
          <div key={title} className="group relative overflow-hidden min-h-[320px] flex flex-col justify-end p-8 text-white">
            <Photo src={img} alt={title} className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
            <div className="absolute inset-0" style={{ background: ACCENT_HEX[accent], opacity: 0.14, mixBlendMode: 'multiply' }} />
            <span className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full shadow" style={{ background: ACCENT_HEX[accent] }} />
            <h3 className="relative font-sans font-extrabold text-2xl tracking-tight leading-none">{title}</h3>
            <p className="relative text-sm text-white/85 mt-3 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* ── INSTRUMENTS ── */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <BlurFade inView className="mb-8">
            <Eyebrow accent="#2647E8">What you can study</Eyebrow>
            <h2 className={H_LG}>
              Twenty-three instruments<br />and <span className="font-serif italic font-normal">disciplines</span>.
            </h2>
          </BlurFade>
          <div className="flex flex-wrap gap-2.5">
            {INSTRUMENTS.map((name, i) => {
              const accent = ACCENT_HEX[INSTRUMENT_ACCENTS[i % INSTRUMENT_ACCENTS.length]]
              return (
                <span
                  key={name}
                  className="font-sans font-semibold text-sm px-5 py-2.5 rounded-full border-[1.6px] border-zma-line hover:text-white hover:border-transparent hover:-translate-y-0.5 transition-all cursor-pointer"
                  onMouseEnter={e => (e.currentTarget.style.background = accent)}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  {name}
                </span>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FACILITIES ── */}
      <section className="relative overflow-hidden bg-zma-ink text-white py-24 px-8">
        <Photo src={IMG.whyChooseUs} alt="" className="absolute inset-0 opacity-[.55]" />
        <div className="absolute inset-0 z-[2]" style={{ background: 'linear-gradient(100deg, rgba(12,10,17,.94) 10%, rgba(12,10,17,.7))' }} />
        <div className="relative z-[4] max-w-6xl mx-auto">
          <BlurFade inView className="max-w-md mb-12">
            <Eyebrow accent="#E8371C" className="text-white">Why choose us</Eyebrow>
            <h2 className={cn(H_LG, 'max-w-sm')}>
              The best facilities<br />for <span className="font-serif italic font-normal">learning</span>.
            </h2>
          </BlurFade>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/15">
            {FACILITIES.map(({ icon, title, desc, accent }, i) => (
              <BlurFade key={title} inView delay={i * 0.08} className="bg-zma-ink p-8">
                <div className="w-[38px] h-[38px] rounded-sm grid place-items-center mb-4" style={{ background: `rgba(${ACCENT_RGB[accent]},.22)`, color: ACCENT_HEX[accent] }}>
                  <Icon24 className="h-[19px] w-[19px]">{icon}</Icon24>
                </div>
                <h3 className="font-sans font-extrabold text-lg tracking-tight mb-2">{title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{desc}</p>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEACHERS ── */}
      <section id="teachers" className="py-24 px-8 bg-zma-sand">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-end mb-10">
            <BlurFade inView>
              <Eyebrow accent="#E8371C">Our team</Eyebrow>
              <h2 className={H_LG}>
                Your teachers<br />and <span className="font-serif italic font-normal">artists</span>.
              </h2>
            </BlurFade>
            <BlurFade inView delay={0.08}>
              <p className="text-zma-ash leading-relaxed">
                Teachers are selected on recommendation, for their human qualities, their teaching
                ability and the way their subject completes the academy's catalogue.
              </p>
            </BlurFade>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEACHERS.map((t, i) => (
              <BlurFade key={t.name} inView delay={i * 0.08}>
                <article className="bg-white rounded-sm overflow-hidden hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-xl">
                  <Art gradient={t.gradient} motif="m-portrait" className="aspect-square" />
                  <div className="h-[5px]" style={{ background: ACCENT_HEX[t.accent] }} />
                  <div className="p-5">
                    <h3 className="font-sans font-extrabold text-base tracking-tight mb-1">{t.name}</h3>
                    <p className="font-mono text-[10px] font-bold tracking-widest uppercase" style={{ color: ACCENT_HEX[t.accent] }}>{t.role}</p>
                  </div>
                </article>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="relative min-h-[500px] flex items-center overflow-hidden bg-zma-ink">
        <Photo src={IMG.feature2} alt="" className="absolute inset-0" />
        <div className="absolute inset-0 z-[2]" style={{ background: 'linear-gradient(100deg, rgba(12,10,17,.95) 8%, rgba(12,10,17,.66) 52%, rgba(12,10,17,.3))' }} />
        <div className="relative z-[5] max-w-3xl px-8 py-20 text-white">
          <span className="block font-serif italic leading-[0.55] mb-3.5" style={{ fontSize: '5rem', color: '#E0A012' }}>&#8220;</span>
          <p className="font-sans font-bold text-2xl md:text-3xl leading-snug tracking-tight mb-6">
            In every performance, our students echo a heritage of passion, unity and musical
            storytelling that connects the generations.
          </p>
          <p className="font-mono text-xs tracking-widest text-white/70 uppercase">ZTF Music Academy · Voices that inspire our culture</p>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <div className="bg-white py-2 space-y-3 overflow-hidden" aria-hidden="true">
        <Marquee className="[--duration:58s] [--gap:12px]">
          {GALLERY_A.map((src, i) => <Photo key={i} src={src} alt="" className="w-[280px] h-[190px] rounded-sm shrink-0" />)}
        </Marquee>
        <Marquee reverse className="[--duration:66s] [--gap:12px]">
          {GALLERY_B.map((src, i) => <Photo key={i} src={src} alt="" className="w-[280px] h-[190px] rounded-sm shrink-0" />)}
        </Marquee>
      </div>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-8 bg-zma-sand">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
          <BlurFade inView>
            <Eyebrow accent="#2647E8">Before you ask</Eyebrow>
            <h2 className={cn(H_LG, 'mb-4')}>
              Questions we<br />get <span className="font-serif italic font-normal">a lot</span>.
            </h2>
            <p className="text-zma-ash leading-relaxed">Anything else, message us on WhatsApp. We answer 24 hours a day, seven days a week.</p>
          </BlurFade>
          <div className="border-t-2 border-zma-ink">
            {FAQS.map((f, i) => (
              <details key={f.q} className="group border-b border-zma-ink/10" open={i === 0}>
                <summary className="list-none flex items-start justify-between gap-4 py-5 cursor-pointer font-sans font-extrabold text-base tracking-tight hover:text-zma-f1 transition-colors">
                  {f.q}
                  <Plus className="h-4 w-4 shrink-0 mt-1 transition-transform duration-300 group-open:rotate-45 text-zma-f1" />
                </summary>
                <p className="text-sm text-zma-ash leading-relaxed pb-5">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative min-h-[520px] flex items-center text-center overflow-hidden bg-zma-ink">
        <Photo src={IMG.aboutLarge} alt="" className="absolute inset-0" />
        <div className="absolute inset-0 z-[2] bg-zma-ink/80" />
        <div className="absolute inset-0 z-[3]" style={{ background: 'radial-gradient(46% 52% at 16% 26%, rgba(224,160,18,.36), transparent 62%), radial-gradient(46% 52% at 84% 74%, rgba(38,71,232,.36), transparent 62%)' }} />
        <div className="relative z-[5] w-full px-8 py-20 text-white">
          <div className="max-w-2xl mx-auto">
            <Eyebrow accent="#E8371C" className="text-white" center>Join the programme</Eyebrow>
            <h2 className={cn(H_LG, 'mb-4')}>
              Learn music from the<br />fundamentals <span className="font-serif italic font-normal">up</span>.
            </h2>
            <p className="text-white/70 leading-relaxed mb-8 max-w-xl mx-auto">
              Build a solid musical foundation through guided teaching in theory, technique and
              performance. Begin your path toward musical mastery with determination and passion.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Btn href="#" color={ACCENT_HEX.g1} size="lg">Register now</Btn>
              <Btn href="#" variant="outline" color="#ffffff" hoverText="#0C0A11" size="lg">Talk to us on WhatsApp</Btn>
            </div>
            <p className="mt-6 font-mono text-[11px] tracking-widest text-white/55">
              Open 24/7, Monday to Sunday · ztfmusic@academydemusic.com
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-zma-coal text-white/[.64] pt-[68px] pb-8 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.1fr] gap-10 pb-9 border-b border-white/[.13]">
            <div>
              <a href="#" aria-label="ZMA Course Online"><Logo className="h-20" /></a>
              <p className="text-[0.92rem] leading-[1.7] max-w-[26rem] mt-4">
                ZTF Music Academy (ZMA) is a music and worship school offering accelerated courses, usually lasting between one and two weeks.
              </p>
              <div className="flex gap-2.5 mt-4">
                <a href="https://www.facebook.com/ZTFMusic" aria-label="Facebook" className="w-[34px] h-[34px] rounded-sm border border-white/[.22] grid place-items-center hover:bg-zma-f2 hover:border-zma-f2 hover:text-white transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" /></svg>
                </a>
                <a href="https://www.instagram.com/ztfmusic" aria-label="Instagram" className="w-[34px] h-[34px] rounded-sm border border-white/[.22] grid place-items-center hover:bg-zma-f2 hover:border-zma-f2 hover:text-white transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>
                </a>
                <a href="https://www.youtube.com/@ztfmusic" aria-label="YouTube" className="w-[34px] h-[34px] rounded-sm border border-white/[.22] grid place-items-center hover:bg-zma-f2 hover:border-zma-f2 hover:text-white transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2s-.2-1.4-.8-2c-.7-.8-1.5-.8-1.9-.9C16.3 4.1 12 4.1 12 4.1s-4.3 0-6.9.2c-.4.1-1.2.1-1.9.9-.6.6-.8 2-.8 2S2.2 8.8 2.2 10.5v1.6c0 1.6.2 3.3.2 3.3s.2 1.4.8 2c.7.8 1.7.7 2.1.8 1.5.1 6.7.2 6.7.2s4.3 0 6.9-.2c.4-.1 1.2-.1 1.9-.9.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.6c0-1.7-.2-3.3-.2-3.3zM10 14.6V8.9l5.5 2.9-5.5 2.8z" /></svg>
                </a>
                <a href="https://www.tiktok.com/@ztfmusic" aria-label="TikTok" className="w-[34px] h-[34px] rounded-sm border border-white/[.22] grid place-items-center hover:bg-zma-f2 hover:border-zma-f2 hover:text-white transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.4 2.1 1.7 3.6 3.9 3.8v2.6c-1.4.1-2.7-.3-3.9-1.1v5.4c0 3.6-2.8 6.3-6.2 6.3-2.2 0-4.2-1.2-5.2-3.1-1.6-3 .5-7.1 4.2-7.4.5 0 1 0 1.5.1v2.8c-1.9-.6-3.5.8-3.2 2.5.2 1.1 1.2 1.9 2.4 1.8 1.4-.1 2.3-1.2 2.3-2.6V3H16z" /></svg>
                </a>
              </div>
            </div>
            <div>
              <h5 className="font-mono text-[.62rem] tracking-[.16em] uppercase mb-4 font-bold text-zma-f2">Learn</h5>
              <ul className="space-y-2.5">
                {FOOTER_LEARN.map(l => <li key={l.label}><a href={l.href} className="text-[.9rem] hover:text-white transition-colors">{l.label}</a></li>)}
              </ul>
            </div>
            <div>
              <h5 className="font-mono text-[.62rem] tracking-[.16em] uppercase mb-4 font-bold text-zma-f1">Support</h5>
              <ul className="space-y-2.5">
                {FOOTER_SUPPORT.map(l => <li key={l.label}><a href={l.href} className="text-[.9rem] hover:text-white transition-colors">{l.label}</a></li>)}
              </ul>
            </div>
            <div>
              <h5 className="font-mono text-[.62rem] tracking-[.16em] uppercase mb-4 font-bold text-zma-g1">Contact</h5>
              <ul className="space-y-2.5 text-[.9rem]">
                <li><a href="tel:+352661700892" className="hover:text-white transition-colors">+352 661 700 892</a></li>
                <li><a href="mailto:ztfmusic@academydemusic.com" className="hover:text-white transition-colors">ztfmusic@academydemusic.com</a></li>
                <li>Rue de la Cavantine 16<br />1080 Molenbeek-Saint-Jean<br />Belgium</li>
                <li>Open 24/7, Monday to Sunday</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-5 pt-6 font-mono text-[.67rem] tracking-[.06em]">
            <p>© 2026 ZTF Music Academy. All rights reserved.</p>
            <p>ZMA Course Online</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
