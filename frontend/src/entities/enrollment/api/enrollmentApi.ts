import { z } from 'zod'
import { get, patch } from '@/shared/api/http'
import { enrollmentSchema, certificateSchema, enrollCheckSchema, certificateVerificationSchema } from '../model/enrollment.schema'
import type { Enrollment, Certificate, CertificateVerification } from '../model/enrollment.schema'

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

  /** Public — aucune session requise. 404 si le numéro est inconnu (voir CertificateController). */
  verifyCertificate: (certNumber: string): Promise<CertificateVerification> =>
    get(`/certificates/verify/${encodeURIComponent(certNumber)}`, undefined, certificateVerificationSchema),
}
