import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Conversation, Message } from '../types'

interface ConversationsResponse {
  conversations: Conversation[]
}

interface ConversationDetailResponse {
  conversation: Conversation
  messages: Message[]
}

export function useConversations(enabled = true) {
  return useQuery<ConversationsResponse>({
    queryKey: ['conversations'],
    queryFn: () => api.get<ConversationsResponse>('/conversations').then((r) => r.data),
    enabled,
  })
}

export function useConversation(id: number | string | undefined) {
  return useQuery<ConversationDetailResponse>({
    queryKey: ['conversations', id],
    queryFn: () =>
      api.get<ConversationDetailResponse>(`/conversations/${id}`).then((r) => r.data),
    enabled: !!id,
    refetchInterval: 5000,
  })
}

export function useStartConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (recipientId: number) =>
      api.post<{ conversation: Conversation }>('/conversations', { recipient_id: recipientId }).then((r) => r.data.conversation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useSendMessage(conversationId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: string) =>
      api.post<{ message: Message }>(`/conversations/${conversationId}/messages`, { body }).then((r) => r.data.message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', String(conversationId)] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
