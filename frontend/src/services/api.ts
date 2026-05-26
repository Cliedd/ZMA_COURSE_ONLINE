import axios from 'axios';
import type {
  Course, CourseRequest,
  LoginRequest, RegisterRequest,
  Enrollment, EnrollRequest, EnrollCheckResult, Certificate,
  Payment,
  ChatRoom, ChatMessage, ChatRoomRequest, ChatMessageRequest,
  Comment, CommentRequest, Notification,
  PresignResponse, Media,
} from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('zma-auth');
  if (raw) {
    try {
      const { state } = JSON.parse(raw);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    } catch { /* ignore */ }
  }
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: RegisterRequest) =>
    api.post('/auth/register', data).then(r => r.data),
  login: (data: LoginRequest) =>
    api.post('/auth/login', data).then(r => r.data),
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const courseApi = {
  getAll: (params?: { department?: string; level?: string; q?: string; page?: number; size?: number }) =>
    api.get('/courses', { params }).then(r =>
      Array.isArray(r.data) ? r.data : (r.data?.content ?? [])
    ),
  getAllAdmin: (params?: { page?: number; size?: number }) =>
    api.get('/courses/admin/all', { params }).then(r =>
      Array.isArray(r.data) ? r.data : (r.data?.content ?? [])
    ),
  getById: (id: string) =>
    api.get<Course>(`/courses/${id}`).then(r => r.data),
  getBySlug: (slug: string) =>
    api.get<Course>(`/courses/slug/${slug}`).then(r => r.data),
  getByTeacher: (email: string) =>
    api.get<Course[]>(`/courses/teacher/${encodeURIComponent(email)}`).then(r => r.data),
  getStats: (id: string) =>
    api.get(`/courses/${id}/stats`).then(r => r.data),
  getCurriculum: (id: string) =>
    api.get(`/courses/${id}/curriculum`).then(r => r.data),
  getReviews: (id: string, page = 0, size = 20) =>
    api.get(`/courses/${id}/reviews`, { params: { page, size } }).then(r => r.data),
  addReview: (id: string, rating: number, comment: string) =>
    api.post(`/courses/${id}/reviews`, { rating, comment }).then(r => r.data),
  create: (data: CourseRequest) =>
    api.post<Course>('/courses', data).then(r => r.data),
  update: (id: string, data: CourseRequest) =>
    api.put<Course>(`/courses/${id}`, data).then(r => r.data),
  publish: (id: string, published: boolean) =>
    api.patch<Course>(`/courses/${id}/publish`, null, { params: { published } }).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/courses/${id}`),
};

// ─── Enrollment ───────────────────────────────────────────────────────────────
export const enrollmentApi = {
  enroll: (data: EnrollRequest) =>
    api.post<Enrollment>('/enrollments', data).then(r => r.data),
  /** Enrollments of the currently authenticated user */
  getMine: () =>
    api.get<Enrollment[]>('/enrollments/me').then(r => r.data),
  checkEnrollment: (courseId: string) =>
    api.get<EnrollCheckResult>('/enrollments/check', { params: { courseId } }).then(r => r.data),
  getByCourse: (courseId: string) =>
    api.get<Enrollment[]>(`/enrollments/course/${courseId}`).then(r => r.data),
  updateProgress: (id: string, progress: number) =>
    api.patch<Enrollment>(`/enrollments/${id}/progress`, progress).then(r => r.data),
  updateLessons: (id: string, completedLessonsJson: string) =>
    api.patch<Enrollment>(`/enrollments/${id}/lessons`, { completedLessonsJson }).then(r => r.data),
  unenroll: (id: string) =>
    api.delete(`/enrollments/${id}`),
  getCertificates: () =>
    api.get<Certificate[]>('/certificates/me').then(r => r.data),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentApi = {
  /** Initiates checkout — price is fetched from catalog server-side */
  checkout: (courseId: string, promoCode?: string) =>
    api.post<Payment>('/payments/checkout', { courseId, promoCode }).then(r => r.data),
  /** Confirm a pending payment (dev/simulation) */
  confirm: (id: string) =>
    api.patch<Payment>(`/payments/${id}/confirm`).then(r => r.data),
  /** Payment history of the currently authenticated user */
  getMine: () =>
    api.get<Payment[]>('/payments/me').then(r => r.data),
  checkPaid: (courseId: string) =>
    api.get<{ paid: boolean }>('/payments/check', { params: { courseId } }).then(r => r.data),
};

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const chatApi = {
  createOrGetRoom: (data: ChatRoomRequest) =>
    api.post<ChatRoom>('/community/rooms', data).then(r => r.data),
  getRoomByCourse: (courseId: string) =>
    api.get<ChatRoom>(`/community/rooms/course/${encodeURIComponent(courseId)}`).then(r => r.data),
  getTeacherRooms: (email: string) =>
    api.get<ChatRoom[]>(`/community/rooms/teacher/${encodeURIComponent(email)}`).then(r => r.data),
  sendMessage: (roomId: string, data: ChatMessageRequest) =>
    api.post<ChatMessage>(`/community/rooms/${roomId}/messages`, data).then(r => r.data),
  getMessages: (roomId: string, page = 0, size = 50) =>
    api.get(`/community/rooms/${roomId}/messages`, { params: { page, size } }).then(r => r.data),
  editMessage: (roomId: string, messageId: string, content: string) =>
    api.patch<ChatMessage>(`/community/rooms/${roomId}/messages/${messageId}`, { content }).then(r => r.data),
  deleteMessage: (roomId: string, messageId: string) =>
    api.delete(`/community/rooms/${roomId}/messages/${messageId}`),
};

// ─── Community (comments) ─────────────────────────────────────────────────────
export const commentApi = {
  addComment: (data: CommentRequest) =>
    api.post<Comment>('/community/comments', data).then(r => r.data),
  getByLesson: (lessonId: string, page = 0, size = 20) =>
    api.get(`/community/comments/lesson/${lessonId}`, { params: { page, size } }).then(r => r.data),
  /** userId no longer needed — identity comes from JWT */
  delete: (commentId: string) =>
    api.delete(`/community/comments/${commentId}`),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationApi = {
  /** userId no longer needed — identity comes from JWT */
  getAll: () =>
    api.get<Notification[]>('/notifications').then(r => r.data),
  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count').then(r => r.data.count),
  markAsRead: (id: string) =>
    api.patch<Notification>(`/notifications/${id}/read`).then(r => r.data),
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
};

// ─── Media ────────────────────────────────────────────────────────────────────
export const mediaApi = {
  requestUpload: (fileName: string, contentType: string, sizeBytes: number) =>
    api.post<PresignResponse>('/media/presign', { fileName, contentType, sizeBytes }).then(r => r.data),
  confirmUpload: (mediaId: string) =>
    api.patch<Media>(`/media/${mediaId}/confirm`).then(r => r.data),
  getById: (id: string) =>
    api.get<Media>(`/media/${id}`).then(r => r.data),
  getDownloadUrl: (id: string) =>
    api.get<{ url: string }>(`/media/${id}/url`).then(r => r.data.url),
  attach: (id: string, courseId?: string, lessonId?: string) =>
    api.patch<Media>(`/media/${id}/attach`, { courseId, lessonId }).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/media/${id}`),
  list: (params?: { courseId?: string; lessonId?: string }) =>
    api.get<Media[]>('/media', { params }).then(r => r.data),
};

export default api;
