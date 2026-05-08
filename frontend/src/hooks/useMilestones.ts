import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { ProgramMilestone } from '../types'

interface MilestonesResponse {
  milestones: ProgramMilestone[]
}

export function useMilestones(programId: number | undefined) {
  return useQuery<MilestonesResponse>({
    queryKey: ['milestones', programId],
    queryFn: () => api.get<MilestonesResponse>(`/programs/${programId}/milestones`).then((r) => r.data),
    enabled: !!programId,
  })
}

export function useCreateMilestone(programId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; description?: string; due_date?: string; position?: number }) =>
      api.post<{ milestone: ProgramMilestone }>(`/programs/${programId}/milestones`, { milestone: data }).then((r) => r.data.milestone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', programId] })
    },
  })
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; title?: string; description?: string; due_date?: string; position?: number }) =>
      api.patch<{ milestone: ProgramMilestone }>(`/milestones/${id}`, { milestone: data }).then((r) => r.data.milestone),
    onSuccess: (milestone) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', milestone.program_id] })
    },
  })
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, programId }: { id: number; programId: number }) =>
      api.delete(`/milestones/${id}`).then(() => programId),
    onSuccess: (programId) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', programId] })
    },
  })
}

export function useCompleteMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (milestoneId: number) =>
      api.post(`/milestones/${milestoneId}/completions`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] })
    },
  })
}

export function useUncompleteMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ milestoneId, completionId }: { milestoneId: number; completionId: number }) =>
      api.delete(`/milestones/${milestoneId}/completions/${completionId}`).then(() => milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] })
    },
  })
}
