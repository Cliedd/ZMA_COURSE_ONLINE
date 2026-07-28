import { useRef, useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Send, ChevronLeft, Loader2, MessageSquare, Lock, Users, Circle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import { cn } from '../../lib/utils'
import { useCourse } from '../../hooks/useCourses'
import { useIsEnrolled, useMyEnrollments } from '../../hooks/useEnrollment'
import {
  useChatRoom, useChatMessages, useCreateOrGetRoom, useTeacherChatRooms,
  useChatConnectionStatus, useChatTyping, useNotifyTyping, useSendMessage,
} from '../../hooks/useChat'
import { useAuthStore } from '@/entities/session'
import type { ChatMessage } from '../../types'

function ConnectionDot({ status }: { status: 'connecting' | 'connected' | 'disconnected' }) {
  const color = status === 'connected' ? 'text-emerald-500' : status === 'connecting' ? 'text-amber-500' : 'text-muted-foreground'
  const label = status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting…' : 'Offline'
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <Circle className={cn('h-2 w-2 fill-current', color)} />
      {label}
    </span>
  )
}

/** Left sidebar — one entry per course chat the user has access to, ChatGPT-conversation-list style. */
function ChatSidebar({ activeCourseId }: { activeCourseId?: string }) {
  const { role } = useAuthStore()
  const isTeacher = role === 'TEACHER'
  const { data: teacherRooms = [] } = useTeacherChatRooms()
  const { data: enrollments = [] } = useMyEnrollments()

  const items = isTeacher
    ? teacherRooms.map(r => ({ courseId: r.courseId, title: r.courseName }))
    : enrollments.map(e => ({ courseId: e.courseId, title: e.courseTitle }))

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-muted/30 md:flex">
      <div className="px-4 py-3.5 border-b border-border">
        <p className="text-sm font-semibold">Conversations</p>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {items.length === 0 ? (
          <p className="px-4 py-3 text-xs text-muted-foreground">
            {isTeacher ? 'No course chats yet.' : 'Enroll in a course to start chatting.'}
          </p>
        ) : (
          items.map(item => (
            <Link
              key={item.courseId}
              to={`/chat/${item.courseId}`}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm truncate transition-colors',
                item.courseId === activeCourseId
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
              <span className="truncate">{item.title}</span>
            </Link>
          ))
        )}
      </div>
    </aside>
  )
}

export const ChatPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { email, role, isAuthenticated } = useAuthStore()

  const { data: course } = useCourse(courseId ?? '')
  const { data: enrollCheck, isLoading: enrollLoading } = useIsEnrolled(courseId ?? '')
  const { data: room, isLoading: roomLoading, refetch: refetchRoom } = useChatRoom(courseId ?? '')
  const createOrGetRoom = useCreateOrGetRoom()

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: messages = [] } = useChatMessages(room?.id)
  const connectionStatus = useChatConnectionStatus()
  const typers = useChatTyping(room?.id)
  const notifyTyping = useNotifyTyping(room?.id)
  const sendMessage = useSendMessage(room?.id)

  // Teacher auto-creates room when entering chat
  useEffect(() => {
    if (!roomLoading && !room && role === 'TEACHER' && course && email) {
      createOrGetRoom.mutate({
        courseId: course.id,
        courseName: course.title,
        createdByEmail: email,
      }, {
        onSuccess: () => refetchRoom(),
      })
    }
  }, [roomLoading, room, role, course, email])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (!isAuthenticated()) {
    navigate('/auth/connexion')
    return null
  }

  const isTeacher = role === 'TEACHER'
  const isEnrolled = enrollCheck?.enrolled ?? false
  const hasAccess = isTeacher || isEnrolled

  if (!enrollLoading && !roomLoading && !hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <Lock className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Restricted access</h2>
          <p className="text-muted-foreground mt-1 text-sm">You need to be enrolled in this course to access the chat.</p>
        </div>
        {course && (
          <Link to={`/checkout/${course.id}`}>
            <Button>Enroll in course</Button>
          </Link>
        )}
      </div>
    )
  }

  const handleSend = () => {
    const content = input.trim()
    if (!content || !room) return
    sendMessage.mutate(content)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const loading = enrollLoading || roomLoading
  const typingLabel = typers.length === 0 ? null
    : typers.length === 1 ? `${typers[0]} is typing…`
    : `${typers.join(', ')} are typing…`

  return (
    <div className="-mx-8 -my-8 flex h-screen bg-background overflow-hidden">
      <ChatSidebar activeCourseId={courseId} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border px-6 py-3 glass shrink-0">
          <Link to={isTeacher ? '/teacher' : '/dashboard'} className="md:hidden">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8 px-2.5">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4 md:hidden" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MessageSquare className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm font-semibold truncate">{course?.title ?? 'Loading...'}</p>
            {room && <Badge variant="outline" className="text-[10px] ml-1">Active chat</Badge>}
          </div>
          <ConnectionDot status={connectionStatus} />
          {isTeacher && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Users className="h-3 w-3" /> Teacher
            </Badge>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !room ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No chat available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isTeacher
                    ? 'Create the chat for this course to start the discussion.'
                    : "The teacher hasn't created a chat for this course yet."}
                </p>
              </div>
              {isTeacher && course && (
                <Button
                  onClick={() => createOrGetRoom.mutate({
                    courseId: course.id,
                    courseName: course.title,
                    createdByEmail: email ?? '',
                  }, { onSuccess: () => refetchRoom() })}
                  disabled={createOrGetRoom.isPending}
                >
                  {createOrGetRoom.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create chat'}
                </Button>
              )}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">No messages yet</p>
              <p className="text-sm text-muted-foreground">Be the first to write something!</p>
            </div>
          ) : (
            messages.map((msg: ChatMessage) => {
              const isMe = msg.senderEmail === email
              return (
                <div
                  key={msg.id}
                  className={cn('flex gap-3', isMe ? 'flex-row-reverse' : 'flex-row')}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                      {msg.senderName?.slice(0, 2).toUpperCase() ?? '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn('max-w-[70%] space-y-1', isMe ? 'items-end' : 'items-start', 'flex flex-col')}>
                    <div className={cn(
                      'flex items-center gap-2 text-xs text-muted-foreground',
                      isMe ? 'flex-row-reverse' : 'flex-row'
                    )}>
                      <span className="font-medium">{msg.senderName}</span>
                      <span>{new Date(msg.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.editedAt && <span className="italic">edited</span>}
                    </div>
                    <div className={cn(
                      'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted text-foreground rounded-tl-sm'
                    )}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          {typingLabel && (
            <p className="pl-11 text-xs italic text-muted-foreground animate-pulse">{typingLabel}</p>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {room && (
          <div className="border-t border-border p-4 glass shrink-0">
            <div className="flex items-end gap-3 max-w-4xl mx-auto">
              <Avatar className="h-8 w-8 shrink-0 mb-0.5">
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                  {email?.slice(0, 2).toUpperCase() ?? 'ZM'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <textarea
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] max-h-32"
                  placeholder="Write a message..."
                  rows={1}
                  value={input}
                  onChange={e => { setInput(e.target.value); notifyTyping(e.target.value) }}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className={cn(
                    'absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                    input.trim()
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                  onClick={handleSend}
                  disabled={!input.trim() || sendMessage.isPending}
                >
                  {sendMessage.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-2">
              Press Enter to send · Shift+Enter for a new line
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
