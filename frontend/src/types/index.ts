// ─── Catalog ──────────────────────────────────────────────────────────────────

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface CurriculumLesson {
  title: string;
  mediaId?: string;
}

export interface CurriculumSection {
  id: string;
  title: string;
  lessons: (string | CurriculumLesson)[];
}

export type CourseStatus = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'REVISION_NEEDED' | 'PUBLISHED' | 'ARCHIVED';

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  level: 'Bachelor\'s' | 'Master\'s' | 'Doctorate' | 'Certificate';
  department: string;
  filiere: string;
  ects: number | null;
  teacherName: string;
  teacherEmail: string;
  studentsCount: number;
  rating: number;
  durationHours: number;
  gradientIndex: number;
  skillsJson: string;
  curriculumJson: string;
  debouches: string;
  status: CourseStatus;
  reviewComment: string | null;
  sections: Section[];
}

export interface CourseRequest {
  title: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  level?: string;
  department?: string;
  filiere?: string;
  ects?: number;
  teacherName?: string;
  studentsCount?: number;
  rating?: number;
  durationHours?: number;
  gradientIndex?: number;
  skillsJson?: string;
  curriculumJson?: string;
  debouches?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ─── Enrollment ───────────────────────────────────────────────────────────────

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  courseLevel: string;
  progress: number;
  completedLessonsJson: string;
  enrolledAt: string;
}

export interface EnrollRequest {
  studentId: string;
  courseId: string;
  courseTitle?: string;
  courseLevel?: string;
}

export interface EnrollCheckResult {
  enrolled: boolean;
  enrollmentId: string | null;
}

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  certNumber: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Payment {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface CheckoutRequest {
  studentId: string;
  courseId: string;
  amount: number;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatRoom {
  id: string;
  courseId: string;
  courseName: string;
  createdByEmail: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderEmail: string;
  senderName: string;
  content: string;
  sentAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
  /** Non-null when this message is a reply within a thread */
  parentMessageId?: string | null;
  /** References a file uploaded via zma-media's presign flow */
  attachmentMediaId?: string | null;
  /** e.g. "image"/"audio"/"file" */
  attachmentType?: string | null;
}

export interface ChatRoomRequest {
  courseId: string;
  courseName: string;
  createdByEmail: string;
}

export interface ChatMessageRequest {
  senderEmail: string;
  senderName: string;
  content?: string;
  parentMessageId?: string;
  attachmentMediaId?: string;
  attachmentType?: string;
}

/** Room-wide broadcast payload after a reaction toggle */
export interface ReactionSummary {
  messageId: string;
  counts: Record<string, number>;
  reactors: Record<string, string[]>;
}

// ─── Community ────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  userId: string;
  lessonId: string;
  content: string;
  createdAt: string;
}

export interface CommentRequest {
  userId: string;
  lessonId: string;
  content: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─── Media ────────────────────────────────────────────────────────────────────

export type MediaStatus = 'UPLOADING' | 'READY' | 'ERROR';

export interface Media {
  id: string;
  fileName: string;
  size: number;
  s3Key: string;
  status: MediaStatus;
}

export interface PresignResponse {
  mediaId: string;
  uploadUrl: string;
  s3Key: string;
  expiresInSeconds: number;
}

// ─── API Errors ───────────────────────────────────────────────────────────────

export interface ApiError {
  timestamp: string;
  status: number;
  message: string;
}
