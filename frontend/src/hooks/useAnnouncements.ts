import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Announcement } from '../types'

interface AnnouncementsResponse {
  announcements: Announcement[]
}

export function useOrgAnnouncements(orgId: number | string) {
  return useQuery<AnnouncementsResponse>({
    queryKey: ['announcements', orgId],
    queryFn: () => api.get<AnnouncementsResponse>(`/organizations/${orgId}/announcements`).then((r) => r.data),
    enabled: !!orgId,
  })
}

export function useCreateAnnouncement(orgId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ title, body, publish }: { title: string; body: string; publish?: boolean }) =>
      api.post<{ announcement: Announcement }>(`/organizations/${orgId}/announcements`, {
        announcement: { title, body, publish: publish ? '1' : undefined },
      }).then((r) => r.data.announcement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', orgId] })
    },
  })
}

export function useDeleteAnnouncement(orgId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/organizations/${orgId}/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', orgId] })
    },
  })
}
