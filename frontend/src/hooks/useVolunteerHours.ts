import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export interface VolunteerHour {
  id: number
  hours: number
  date: string
  notes: string | null
  created_at: string
}

interface HoursResponse {
  hours: VolunteerHour[]
  total_hours: number
}

export function useVolunteerHours(applicationId: number, enabled = true) {
  return useQuery<HoursResponse>({
    queryKey: ['volunteer-hours', applicationId],
    queryFn: () =>
      api.get<HoursResponse>(`/my_applications/${applicationId}/volunteer_hours`).then((r) => r.data),
    enabled,
  })
}

export function useLogHours(applicationId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { hours: number; date: string; notes?: string }) =>
      api.post(`/my_applications/${applicationId}/volunteer_hours`, { volunteer_hour: data }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['volunteer-hours', applicationId] }),
  })
}

export function useDeleteHours(applicationId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (hourId: number) =>
      api.delete(`/my_applications/${applicationId}/volunteer_hours/${hourId}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['volunteer-hours', applicationId] }),
  })
}
