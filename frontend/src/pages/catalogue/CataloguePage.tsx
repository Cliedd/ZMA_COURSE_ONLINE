import { useState, useMemo } from 'react'
import { Search, LayoutGrid, List, Loader2, Music2, SlidersHorizontal } from 'lucide-react'
import { CatalogFilter, type FilterState } from '../../components/catalog/CatalogFilter'
import { CourseCard } from '../../components/catalog/CourseCard'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '../../components/ui/sheet'
import { useCourses } from '../../hooks/useCourses'
import { cn } from '../../lib/utils'
import { IMG } from '../../lib/images'
import type { Course } from '../../types'

const PRICE_RANGES: Record<string, { min?: number; max?: number }> = {
  'Under $150': { max: 150 },
  '$150 – $350':  { min: 150, max: 350 },
  '$350 – $500':  { min: 350, max: 500 },
  'Over $500': { min: 500 },
}

const DEPT_SORT = [
  'Performance & Instrumental Practice',
  'Composition, Writing & Music Theory',
  'Music Technology & Audiovisual Production',
  'Music Education & Teacher Training',
  'Musicology, Heritage & Cultural Management',
]

const DEPT_SHORT: Record<string, string> = {
  'Performance & Instrumental Practice':          'Performance',
  'Composition, Writing & Music Theory':          'Composition',
  'Music Technology & Audiovisual Production':    'Music Technology',
  'Music Education & Teacher Training':           'Music Education',
  'Musicology, Heritage & Cultural Management':   'Musicology',
}

const DEPT_IMGS: Record<string, string> = {
  'Performance & Instrumental Practice':          IMG.piano,
  'Composition, Writing & Music Theory':          IMG.theory,
  'Music Technology & Audiovisual Production':    IMG.studio,
  'Music Education & Teacher Training':           IMG.teaching,
  'Musicology, Heritage & Cultural Management':   IMG.traditional,
}

export const CataloguePage = () => {
  const [search, setSearch]   = useState('')
  const [view, setView]       = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<FilterState>({ departments: [], levels: [], priceRange: null })
  const [mobileFilter, setMobileFilter] = useState(false)

  const { data: courses = [], isLoading } = useCourses()
  const courseList = courses as Course[]

  const filtered = useMemo(() => {
    let list = [...courseList]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        (c.title ?? '').toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        (c.filiere ?? '').toLowerCase().includes(q) ||
        (c.teacherName ?? '').toLowerCase().includes(q)
      )
    }
    if (filters.departments.length > 0) list = list.filter(c => filters.departments.includes(c.department))
    if (filters.levels.length > 0)      list = list.filter(c => filters.levels.includes(c.level))
    if (filters.priceRange) {
      const range = PRICE_RANGES[filters.priceRange]
      if (range) list = list.filter(c => {
        const p = c.price ?? 0
        if (range.min !== undefined && p < range.min) return false
        if (range.max !== undefined && p > range.max) return false
        return true
      })
    }
    return list
  }, [courseList, search, filters])

  const grouped = useMemo(() => {
    if (search.trim() || filters.departments.length > 0 || filters.levels.length > 0 || filters.priceRange) return null
    const map: Record<string, Course[]> = {}
    for (const c of filtered) {
      if (!map[c.department]) map[c.department] = []
      map[c.department].push(c)
    }
    return map
  }, [filtered, search, filters])

  const isFiltering = !!(search.trim() || filters.departments.length || filters.levels.length || filters.priceRange)

  return (
    <div className="-mx-8 -mt-8">

      {/* Hero banner */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        <img
          src={IMG.heroBg} alt="Catalogue ZMA"
          className="w-full h-full object-cover object-center"
          onError={(e) => { (e.target as HTMLImageElement).style.background = 'linear-gradient(135deg,#161320,#0C0A11)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zma-ink/90 via-zma-ink/65 to-zma-ink/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-zma-ink via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-zma-g1/30 bg-zma-g1/10">
            <Music2 className="h-3.5 w-3.5 text-zma-g1" />
            <span className="text-zma-g1 text-xs font-semibold uppercase tracking-widest">Course Catalog</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            {isLoading ? '…' : (
              <><span className="text-zma-g1">{courseList.length}</span> programs available</>
            )}
          </h1>
          <p className="text-white/60 text-sm max-w-md">
            Bachelor's · Master's · Doctorate · Certificate — 5 departments, all specializations
          </p>

          {/* Search in hero */}
          <div className="relative w-full max-w-lg mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search a course, specialization, teacher…"
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zma-g1/50 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs">✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-8 py-8">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground text-base">{filtered.length}</span> courses
              {isFiltering && <span> found</span>}
              {isLoading && <Loader2 className="inline ml-2 h-3.5 w-3.5 animate-spin text-primary" />}
            </p>
            {filters.levels.map(l => (
              <Badge key={l} variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/10"
                onClick={() => setFilters(f => ({ ...f, levels: f.levels.filter(x => x !== l) }))}>
                {l} ✕
              </Badge>
            ))}
            {filters.priceRange && (
              <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/10"
                onClick={() => setFilters(f => ({ ...f, priceRange: null }))}>
                {filters.priceRange} ✕
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex md:hidden items-center gap-2 text-sm border border-border rounded-lg px-3.5 py-2.5 min-h-[44px] hover:bg-muted transition-colors relative"
              onClick={() => setMobileFilter(true)}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {(filters.departments.length + filters.levels.length + (filters.priceRange ? 1 : 0)) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                  {filters.departments.length + filters.levels.length + (filters.priceRange ? 1 : 0)}
                </span>
              )}
            </button>
            <div className="flex border border-border rounded-xl overflow-hidden">
              <button onClick={() => setView('grid')}
                className={cn("p-3 min-h-[44px] min-w-[44px] transition-colors", view === 'grid' ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground')}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setView('list')}
                className={cn("p-3 min-h-[44px] min-w-[44px] transition-colors", view === 'list' ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground')}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar — desktop only, inline */}
          <div className="hidden md:block shrink-0">
            <CatalogFilter filters={filters} onChange={setFilters} />
          </div>

          {/* Filters — mobile slide-up sheet */}
          <Sheet open={mobileFilter} onOpenChange={setMobileFilter}>
            <SheetContent side="bottom" className="flex flex-col p-0 overflow-hidden">
              <SheetTitle className="sr-only">Filters</SheetTitle>
              <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
                <CatalogFilter filters={filters} onChange={setFilters} />
              </div>
              <div className="p-4 pb-safe border-t border-border bg-background">
                <Button className="w-full" size="lg" onClick={() => setMobileFilter(false)}>
                  Show {filtered.length} course{filtered.length === 1 ? '' : 's'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Courses */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">Loading programs…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">No courses found</h3>
                  <p className="text-muted-foreground text-sm mt-1">Try a different search term or adjust your filters.</p>
                </div>
                <button
                  onClick={() => { setSearch(''); setFilters({ departments: [], levels: [], priceRange: null }) }}
                  className="text-sm text-primary underline-offset-2 hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : grouped ? (
              <div className="space-y-12">
                {DEPT_SORT.filter(d => grouped[d]?.length).map(dept => (
                  <section key={dept}>
                    <div className="flex items-center gap-4 mb-5 pb-4 border-b border-border">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={DEPT_IMGS[dept] ?? IMG.concert} alt={dept}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.background = '#161320' }}
                        />
                      </div>
                      <div>
                        <h2 className="text-base font-bold">{DEPT_SHORT[dept] ?? dept}</h2>
                        <p className="text-xs text-muted-foreground">{dept} · {grouped[dept].length} course{grouped[dept].length > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className={cn(
                      view === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                        : 'flex flex-col gap-3'
                    )}>
                      {grouped[dept].map((c, ci) => (
                        <CourseCard key={c.id} course={c} view={view} index={ci} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className={cn(
                view === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'flex flex-col gap-3'
              )}>
                {filtered.map((c, ci) => (
                  <CourseCard key={c.id} course={c} view={view} index={ci} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
