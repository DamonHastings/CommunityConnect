import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Cohort } from '../types'

interface CohortsResponse {
  cohorts: Cohort[]
}

export function useCohorts(programId: number | undefined) {
  return useQuery<CohortsResponse>({
    queryKey: ['cohorts', programId],
    queryFn: () => api.get<CohortsResponse>(`/programs/${programId}/cohorts`).then((r) => r.data),
    enabled: !!programId,
  })
}

export function useCreateCohort(programId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; starts_on?: string; ends_on?: string; notes?: string }) =>
      api.post<{ cohort: Cohort }>(`/programs/${programId}/cohorts`, { cohort: data }).then((r) => r.data.cohort),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts', programId] })
    },
  })
}

export function useAddCohortMember(cohortId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) =>
      api.post<{ cohort: Cohort }>(`/cohorts/${cohortId}/memberships`, { user_id: userId }).then((r) => r.data.cohort),
    onSuccess: (_data, _variables, _context) => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] })
    },
  })
}

export function useRemoveCohortMember(cohortId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) =>
      api.delete<{ cohort: Cohort }>(`/cohorts/${cohortId}/memberships/${userId}`).then((r) => r.data.cohort),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] })
    },
  })
}
