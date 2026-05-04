import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { ProgramOrganization } from '../types'

interface ProgramOrgsResponse {
  organizations: ProgramOrganization[]
}

export function useProgramOrganizations(programId: number | string) {
  return useQuery<ProgramOrgsResponse>({
    queryKey: ['program_organizations', programId],
    queryFn: () =>
      api.get<ProgramOrgsResponse>(`/programs/${programId}/organizations`).then((r) => r.data),
    enabled: !!programId,
  })
}

export function useAddProgramOrganization(programId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ organization_id, role }: { organization_id: number; role?: string }) =>
      api.post(`/programs/${programId}/organizations`, { organization_id, role }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program_organizations', programId] })
      queryClient.invalidateQueries({ queryKey: ['programs', programId] })
    },
  })
}

export function useRemoveProgramOrganization(programId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orgId: number) =>
      api.delete(`/programs/${programId}/organizations/${orgId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program_organizations', programId] })
      queryClient.invalidateQueries({ queryKey: ['programs', programId] })
    },
  })
}
