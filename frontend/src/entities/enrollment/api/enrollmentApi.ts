import { z } from 'zod'
import { get, patch } from '@/shared/api/http'
import { enrollmentSchema, certificateSchema, enrollCheckSchema } from '../model/enrollment.schema'
import type { Enrollment, Certificate } from '../model/enrollment.schema'

export const enrollmentApi = {
  getMine: (): Promise<Enrollment[]> =>
    get('/enrollments/me', undefined, z.array(enrollmentSchema)),

  check: (courseId: string) =>
    get('/enrollments/check', { params: { courseId } }, enrollCheckSchema),

  updateProgress: (id: string, progress: number): Promise<Enrollment> =>
    patch(`/enrollments/${id}/progress`, progress, enrollmentSchema),

  updateLessons: (id: string, completedLessonsJson: string): Promise<Enrollment> =>
    patch(`/enrollments/${id}/lessons`, { completedLessonsJson }, enrollmentSchema),

  getCertificates: (): Promise<Certificate[]> =>
    get('/certificates/me', undefined, z.array(certificateSchema)),
}
