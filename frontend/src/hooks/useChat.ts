import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../services/api';
import { useAuthStore } from '@/entities/session';
import { chatSocket, type ConnectionStatus, type TypingEvent } from '../lib/chatSocket';
import type { ChatRoomRequest, ChatMessage } from '../types';

export function useChatRoom(courseId: string) {
  return useQuery({
    queryKey: ['chat-room', courseId],
    queryFn: () => chatApi.getRoomByCourse(courseId),
    enabled: !!courseId,
    retry: false,
  });
}

export function useTeacherChatRooms() {
  const email = useAuthStore(s => s.email);
  return useQuery({
    queryKey: ['chat-rooms-teacher', email],
    queryFn: () => chatApi.getTeacherRooms(email!),
    enabled: !!email,
  });
}

export function useCreateOrGetRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChatRoomRequest) => chatApi.createOrGetRoom(data),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['chat-room', room.courseId] });
      queryClient.invalidateQueries({ queryKey: ['chat-rooms-teacher'] });
    },
  });
}

/**
 * Fetches history once via REST, then keeps the list live via the WS
 * subscription — no more polling. Edits/deletes arrive as the same message
 * id over the wire and replace the existing entry in place.
 */
export function useChatMessages(roomId: string | undefined) {
  const queryClient = useQueryClient();
  const token = useAuthStore(s => s.token);

  const query = useQuery({
    queryKey: ['chat-messages', roomId],
    queryFn: () => chatApi.getMessages(roomId!, 0, 100).then((res: unknown) =>
      // Backend returns Page<ChatMessage> — extract content array
      Array.isArray(res) ? res as ChatMessage[] : ((res as { content?: ChatMessage[] })?.content ?? [])
    ),
    enabled: !!roomId,
  });

  useEffect(() => {
    if (!roomId || !token) return;
    const unsubscribe = chatSocket.subscribeToRoom(roomId, token, (incoming) => {
      queryClient.setQueryData<ChatMessage[]>(['chat-messages', roomId], (prev = []) => {
        const idx = prev.findIndex(m => m.id === incoming.id);
        if (idx === -1) return [...prev, incoming];
        const next = [...prev];
        next[idx] = incoming;
        return next;
      });
    });
    return unsubscribe;
  }, [roomId, token, queryClient]);

  return query;
}

/** Connection status of the shared chat WebSocket. */
export function useChatConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  useEffect(() => chatSocket.onStatusChange(setStatus), []);
  return status;
}

/** Who's currently typing in a room, auto-expiring 3s after their last event. */
export function useChatTyping(roomId: string | undefined) {
  const token = useAuthStore(s => s.token);
  const email = useAuthStore(s => s.email);
  const [typers, setTypers] = useState<Map<string, string>>(new Map());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!roomId || !token) return;
    const unsubscribe = chatSocket.subscribeToTyping(roomId, token, (evt: TypingEvent) => {
      if (evt.senderEmail === email) return;
      setTypers(prev => new Map(prev).set(evt.senderEmail, evt.senderName));
      clearTimeout(timers.current.get(evt.senderEmail));
      timers.current.set(evt.senderEmail, setTimeout(() => {
        setTypers(prev => {
          const next = new Map(prev);
          next.delete(evt.senderEmail);
          return next;
        });
      }, 3000));
    });
    return () => {
      unsubscribe();
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    };
  }, [roomId, token, email]);

  return Array.from(typers.values());
}

export function useNotifyTyping(roomId: string | undefined) {
  const senderName = useAuthStore(s => s.email)?.split('@')[0] ?? 'Someone';
  return (content: string) => {
    if (roomId && content.trim()) chatSocket.sendTyping(roomId, senderName);
  };
}

/**
 * Sends over the live socket when connected — the backend broadcasts the
 * saved message back to every subscriber, including us. Falls back to REST
 * (which also broadcasts server-side) if the socket hasn't finished its
 * handshake yet, so the first message right after opening the page isn't lost.
 */
export function useSendMessage(roomId: string | undefined) {
  const email = useAuthStore(s => s.email);
  const status = useChatConnectionStatus();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!roomId || !email) throw new Error('Not ready');
      const senderName = email.split('@')[0] ?? email;
      if (status === 'connected') {
        chatSocket.send(roomId, senderName, content);
      } else {
        await chatApi.sendMessage(roomId, { senderEmail: email, senderName, content });
      }
    },
  });
}
