import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { ChatRoomRequest, ChatMessageRequest } from '../types';

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

/** Polls messages every 3 seconds via React Query */
export function useChatMessages(roomId: string | undefined) {
  return useQuery({
    queryKey: ['chat-messages', roomId],
    queryFn: () => chatApi.getMessages(roomId!, 0, 100).then((res: any) =>
      // Backend returns Page<ChatMessage> — extract content array
      Array.isArray(res) ? res : (res?.content ?? [])
    ),
    enabled: !!roomId,
    refetchInterval: 3000,
    // Keep previous data while refetching to avoid flicker
    placeholderData: (prev: any) => prev,
  });
}

export function useSendMessage(roomId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChatMessageRequest) => chatApi.sendMessage(roomId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', roomId] });
    },
  });
}
