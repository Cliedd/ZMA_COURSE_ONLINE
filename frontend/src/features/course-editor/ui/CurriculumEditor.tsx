import { useState } from 'react'
import { Input, Button } from '@/shared/ui'
import type { CurriculumSection, CurriculumLesson } from '@/entities/course'
import { LessonMediaUpload } from './LessonMediaUpload'

function makeSectionId(): string {
  return `s${Date.now()}${Math.round(Math.random() * 1000)}`
}

interface SectionRowProps {
  section: CurriculumSection
  onRename: (title: string) => void
  onRemove: () => void
  onAddLesson: (lesson: string) => void
  onRemoveLesson: (index: number) => void
  onChangeLesson: (index: number, lesson: CurriculumLesson) => void
}

/** Une section du programme : titre, liste de leçons, ajout/retrait local. */
function SectionRow({ section, onRename, onRemove, onAddLesson, onRemoveLesson, onChangeLesson }: SectionRowProps) {
  const [lessonDraft, setLessonDraft] = useState('')

  const addLesson = () => {
    const value = lessonDraft.trim()
    if (!value) return
    onAddLesson(value)
    setLessonDraft('')
  }

  return (
    <li className="border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <Input
          value={section.title}
          onChange={(e) => onRename(e.target.value)}
          placeholder="Titre de la section"
          aria-label="Titre de la section"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Supprimer la section"
          className="inline-flex min-h-touch items-center px-2 font-sans text-sm text-danger"
        >
          ✕
        </button>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {section.lessons.map((lesson, index) => (
          <li key={`${lesson.title}-${index}`} className="flex flex-col gap-2 border-t border-line pt-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-sans text-sm text-ink">{lesson.title}</span>
            <div className="flex items-center gap-2">
              <LessonMediaUpload lesson={lesson} onChange={(next) => onChangeLesson(index, next)} />
              <button
                type="button"
                onClick={() => onRemoveLesson(index)}
                aria-label="Supprimer la leçon"
                className="inline-flex min-h-touch items-center px-2 font-sans text-sm text-danger"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-2">
        <Input
          value={lessonDraft}
          onChange={(e) => setLessonDraft(e.target.value)}
          placeholder="Nouvelle leçon"
          aria-label="Nouvelle leçon"
        />
        <Button type="button" variant="secondary" size="sm" onClick={addLesson}>
          + Leçon
        </Button>
      </div>
    </li>
  )
}

/** Éditeur du programme d'un cours : sections et leçons, contrôlé par `sections`/`onChange`. */
export function CurriculumEditor({ sections, onChange }: { sections: CurriculumSection[]; onChange: (sections: CurriculumSection[]) => void }) {
  const addSection = () => {
    onChange([...sections, { id: makeSectionId(), title: '', lessons: [] }])
  }

  const renameSection = (id: string, title: string) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, title } : s)))
  }

  const removeSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id))
  }

  const addLesson = (id: string, title: string) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, lessons: [...s.lessons, { title }] } : s)))
  }

  const removeLesson = (id: string, index: number) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, lessons: s.lessons.filter((_, i) => i !== index) } : s)))
  }

  const changeLesson = (id: string, index: number, lesson: CurriculumLesson) => {
    onChange(
      sections.map((s) =>
        s.id === id ? { ...s, lessons: s.lessons.map((l, i) => (i === index ? lesson : l)) } : s,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-h3 text-ink">Programme du cours</h2>
        <Button type="button" variant="secondary" size="sm" onClick={addSection}>
          + Section
        </Button>
      </div>

      {sections.length === 0 && (
        <p className="font-sans text-sm text-ink-muted">Aucune section pour l'instant.</p>
      )}

      <ul className="flex flex-col gap-4">
        {sections.map((section) => (
          <SectionRow
            key={section.id}
            section={section}
            onRename={(title) => renameSection(section.id, title)}
            onRemove={() => removeSection(section.id)}
            onAddLesson={(lesson) => addLesson(section.id, lesson)}
            onRemoveLesson={(index) => removeLesson(section.id, index)}
            onChangeLesson={(index, lesson) => changeLesson(section.id, index, lesson)}
          />
        ))}
      </ul>
    </div>
  )
}
