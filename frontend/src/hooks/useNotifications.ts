import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Notification } from '../types'

interface NotificationsResponse {
  notifications: Notification[]
  unread_count: number
}

export function useNotifications(enabled = true) {
  return useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: () => api.get<NotificationsResponse>('/notifications').then((r) => r.data),
    enabled,
    refetchInterval: 30_000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.patch(`/notifications/${id}`, {}).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.patch('/notifications/read_all', {}).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
