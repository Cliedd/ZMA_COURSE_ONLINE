import { Link } from 'react-router-dom'
import {
  ArrowRight, Star, Users, BookOpen, Award, Music2, Mic,
  Headphones, GraduationCap, Globe2, TrendingUp, CheckCircle2, Quote
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { CourseCard } from '../../components/catalog/CourseCard'
import { useCourses } from '../../hooks/useCourses'
import { IMG } from '../../lib/images'
import type { Course } from '../../types'

const DEPARTMENTS = [
  {
    icon: Music2, title: 'Interprétation', subtitle: 'Piano · Guitare · Jazz · Chant',
    desc: 'Technique internationale + identité musicale.',
    color: 'from-blue-900 to-blue-700',
  },
  {
    icon: Music2, title: 'Composition', subtitle: 'Écriture · Orchestration',
    desc: 'Composition pour l\'image, arrangement orchestral.',
    color: 'from-amber-800 to-orange-700',
  },
  {
    icon: Headphones, title: 'Technologies', subtitle: 'Production · Studio · Audio',
    desc: 'MAO, mixage, mastering, sound design.',
    color: 'from-emerald-800 to-teal-700',
  },
  {
    icon: GraduationCap, title: 'Pédagogie', subtitle: 'Formation des formateurs',
    desc: 'Former les futurs enseignants de musique.',
    color: 'from-purple-900 to-violet-700',
  },
  {
    icon: Globe2, title: 'Musicologie', subtitle: 'Patrimoine · Management',
    desc: 'Ethnomusicologie, management culturel africain.',
    color: 'from-rose-900 to-pink-700',
  },
]

const TESTIMONIALS = [
  { name: 'Amara Diallo', role: 'Pianiste, Dakar', text: 'ZMA a transformé ma technique. Les méthodes internationales combinées à notre héritage sont uniques.', stars: 5, img: IMG.face1 },
  { name: 'Kofi Mensah', role: 'Producteur, Accra', text: 'Le département Technologies m\'a donné toutes les bases pour ouvrir mon studio à Accra. Recommandé à 100%.', stars: 5, img: IMG.face2 },
  { name: 'Fatou Sow', role: 'Violoniste, Abidjan', text: 'La qualité des enseignants est exceptionnelle. J\'ai obtenu ma Licence avec mention et décroché une bourse à Paris.', stars: 5, img: IMG.face3 },
]

const WHY = [
  { icon: Award, title: 'Exigence internationale', desc: 'Méthodes Czerny, Arban, Berklee. Les standards de Paris, Londres et Boston.', n: '01' },
  { icon: Globe2, title: 'Identité musicale', desc: 'Chaque étudiant maîtrise les standards mondiaux ET développe une identité musicale.', n: '02' },
  { icon: TrendingUp, title: 'Professionnalisation dès L2', desc: 'Stages, enregistrements en studio, diffusion publique dès la 2e année.', n: '03' },
]

export const HomePage = () => {
  const { data: allCourses = [] } = useCourses()

  const featured = (allCourses as Course[])
    .filter((c: Course) => (c.rating ?? 0) >= 4.5)
    .slice(0, 3)

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative -mx-8 -mt-8 h-[88vh] min-h-[560px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMG.hero}
            alt="ZTF Music Académie"
            className="w-full h-full object-cover object-top"
            onError={(e) => { (e.target as HTMLImageElement).style.background = 'linear-gradient(135deg,#1a3a6e,#06111f)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06111f]/90 via-[#06111f]/70 to-[#06111f]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06111f]/80 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 text-xs font-semibold uppercase tracking-widest">
              ZTF Music Académie — Excellence · Afrique
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
            Former les musiciens<br />
            <span className="text-amber-400">africains</span> de demain.
          </h1>

          <p className="text-lg text-white/70 mb-10 max-w-xl leading-relaxed">
            5 départements · 10 filières · 26 parcours Licence / Master / Doctorat.
            Les méthodes des grandes académies mondiales, l'âme musicale.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/catalogue">
              <Button size="lg" className="gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-8">
                <BookOpen className="h-4 w-4" /> Explorer les formations
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/inscription">
              <Button size="lg" variant="outline" className="gap-2 border-white/25 bg-white/10 text-white hover:bg-white/20 px-8">
                <Mic className="h-4 w-4" /> Commencer gratuitement
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-6 mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-white/70 text-sm ml-1">4.9/5 · 1 000+ étudiants</span>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Certifications reconnues
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Accès immédiat
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative py-16 bg-[#06111f] overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img src={IMG.concert} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#06111f]/80" />
        </div>
        <div className="relative container mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: '1 000+', label: 'Étudiants actifs', icon: Users },
              { val: '40+',    label: 'Formations',       icon: BookOpen },
              { val: '5',      label: 'Départements',     icon: Music2 },
              { val: '180',    label: 'Crédits ECTS',     icon: Award },
            ].map(({ val, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 mb-1">
                  <Icon className="h-5 w-5 text-amber-400" />
                </div>
                <p className="text-4xl md:text-5xl font-bold text-white">{val}</p>
                <p className="text-white/50 text-sm font-medium uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPARTMENTS ── */}
      <section className="py-20 container mx-auto px-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-xs tracking-widest uppercase">Nos départements</Badge>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            5 filières d'excellence
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Chaque département est conçu pour former des professionnels de haut niveau tout en valorisant l'identité musicale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {DEPARTMENTS.map(({ icon: Icon, title, subtitle, desc, color }) => (
            <Link key={title} to={`/catalogue?department=${encodeURIComponent(title)}`}>
              <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 h-52 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 cursor-pointer`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{title}</h3>
                  <p className="text-white/60 text-xs mt-0.5">{subtitle}</p>
                  <p className="text-white/50 text-xs mt-2 leading-relaxed line-clamp-2">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED COURSES ── */}
      {featured.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <Badge variant="outline" className="mb-3 text-xs tracking-widest uppercase">À la une</Badge>
                <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Formations phares
                </h2>
              </div>
              <Link to="/catalogue">
                <Button variant="outline" className="gap-2 hidden md:flex">
                  Voir tout le catalogue <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((c: Course, i: number) => (
                <CourseCard key={c.id} course={c} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHY ZMA ── */}
      <section className="py-20 container mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="outline" className="mb-4 text-xs tracking-widest uppercase">Pourquoi ZMA</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Une académie unique en son genre
            </h2>
            <div className="space-y-6">
              {WHY.map(({ icon: Icon, title, desc, n }) => (
                <div key={n} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono mb-0.5">{n}</p>
                    <h3 className="font-semibold text-sm mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/catalogue" className="inline-block mt-8">
              <Button className="gap-2">
                Explorer les formations <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden">
            <img
              src={IMG.orchestra}
              alt="Orchestre ZMA"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.background = 'linear-gradient(135deg,#1a3a6e,#06111f)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold text-sm">Orchestre Symphonique ZMA</p>
                <p className="text-white/60 text-xs mt-0.5">Plus de 1000 musiciens.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-[#06111f]">
        <div className="container mx-auto px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 text-xs tracking-widest uppercase bg-amber-400/20 text-amber-300 border-amber-400/30">Témoignages</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ce que disent nos étudiants
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, stars, img }) => (
              <div key={name} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/8 transition-colors">
                <Quote className="h-6 w-6 text-amber-400 mb-4 opacity-60" />
                <p className="text-white/75 text-sm leading-relaxed mb-5">{text}</p>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full overflow-hidden bg-white/10 shrink-0">
                    <img
                      src={img}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.background = '#1a3a6e' }}
                    />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{name}</p>
                    <p className="text-white/50 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 container mx-auto px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
            Prêt à commencer votre voyage musical ?
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Rejoignez plus de 1 000 musiciens qui se forment aux standards internationaux.
            Première leçon gratuite. Aucune carte requise.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth/inscription">
              <Button size="lg" className="gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-10">
                Commencer gratuitement <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/catalogue">
              <Button size="lg" variant="outline" className="gap-2 px-10">
                Voir le catalogue
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
