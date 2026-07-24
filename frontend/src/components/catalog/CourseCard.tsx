import { Link } from 'react-router-dom'
import { Clock, Users, Star, ArrowRight, Play } from 'lucide-react'
import { getCourseImage } from '../../lib/images'
import type { Course } from '../../types'

const LEVEL_COLOR: Record<string, string> = {
  'Bachelor\'s': 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  'Master\'s':   'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
  Doctorate:     'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700',
  Certificate:   'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
}

const LEVEL_DOT: Record<string, string> = {
  'Bachelor\'s': 'bg-blue-500',
  'Master\'s':   'bg-purple-500',
  Doctorate:     'bg-rose-500',
  Certificate:   'bg-emerald-500',
}

interface CourseCardProps {
  course: Course
  view?: 'grid' | 'list'
  index?: number
}

export const CourseCard = ({ course, view = 'grid', index = 0 }: CourseCardProps) => {
  const levelClass = LEVEL_COLOR[course.level ?? ''] ?? 'bg-muted text-muted-foreground border-border'
  const levelDot   = LEVEL_DOT[course.level ?? ''] ?? 'bg-muted-foreground'
  const slug       = course.slug ?? course.id ?? 'detail'
  const imgSrc     = getCourseImage(course.title ?? '', course.department ?? '', index)

  if (view === 'list') {
    return (
      <Link to={`/course/${slug}`} className="block group">
        <div className="flex flex-row overflow-hidden rounded-2xl border border-border bg-card hover:shadow-lg hover:border-amber-300/50 transition-all duration-300">
          <div className="relative w-32 sm:w-40 shrink-0 overflow-hidden">
            <img
              src={imgSrc} alt={course.title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).style.background = 'linear-gradient(135deg,#1a3a6e,#06111f)' }}
            />
          </div>
          <div className="flex flex-1 items-center gap-4 p-4">
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${levelClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${levelDot}`} />
                  {course.level ?? 'Course'}
                </span>
                {course.ects && (
                  <span className="text-[10px] text-muted-foreground border border-border rounded-full px-2 py-0.5">
                    {course.ects} ECTS
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {course.shortDescription ?? course.description}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-5 text-xs text-muted-foreground shrink-0">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <strong className="text-foreground">{(course.rating ?? 4.8).toFixed(1)}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {(course.studentsCount ?? 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {course.durationHours ?? 0}h
              </span>
              <span className="font-bold text-foreground text-base">{course.price ?? 0}€</span>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300 text-primary">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/course/${slug}`} className="block group h-full">
      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Bestseller badge */}
        {(course.rating ?? 0) >= 4.9 && (
          <div className="absolute top-3 left-3 z-10 bg-amber-400 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Star className="h-2.5 w-2.5 fill-amber-900" /> Bestseller
          </div>
        )}

        {/* Thumbnail */}
        <div className="relative h-44 overflow-hidden shrink-0">
          <img
            src={imgSrc} alt={course.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => { (e.target as HTMLImageElement).style.background = 'linear-gradient(135deg,#1a3a6e,#06111f)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/10">
            {(course.price ?? 0) === 0 ? 'Free' : `${course.price}€`}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <Play className="h-5 w-5 fill-white text-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${levelClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${levelDot}`} />
              {course.level ?? 'Course'}
            </span>
            {course.ects && (
              <span className="text-[10px] text-muted-foreground border border-border rounded-full px-2 py-0.5">
                {course.ects} ECTS
              </span>
            )}
          </div>

          <h3 className="font-bold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {(course.shortDescription ?? course.description) && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
              {course.shortDescription ?? course.description}
            </p>
          )}

          {course.teacherName && (
            <p className="text-xs text-muted-foreground">
              by <span className="font-semibold text-foreground">{course.teacherName}</span>
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border/60">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <strong className="text-foreground">{(course.rating ?? 4.8).toFixed(1)}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {(course.studentsCount ?? 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="h-3 w-3" /> {course.durationHours ?? 0}h
            </span>
          </div>

          <div className="flex h-9 items-center justify-center rounded-xl bg-primary/5 border border-primary/15 text-primary text-xs font-semibold gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 mt-1">
            View course <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  )
}
