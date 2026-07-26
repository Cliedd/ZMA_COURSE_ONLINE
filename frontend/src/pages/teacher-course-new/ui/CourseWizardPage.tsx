import { Breadcrumb } from '@/widgets/breadcrumb'
import { CourseWizard } from '@/features/course-wizard'

/** Page de création de cours : fil d'Ariane + assistant multi-étapes. */
export function CourseWizardPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: 'Mes cours', to: '/teacher/courses' }, { label: 'Nouveau cours' }]} />
      <div className="container py-8">
        <CourseWizard />
      </div>
    </div>
  )
}
