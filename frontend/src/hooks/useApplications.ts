import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { ServiceApplication } from '../types'

interface ApplicationsResponse {
  applications: ServiceApplication[]
}

export function useMyApplications() {
  return useQuery<ApplicationsResponse>({
    queryKey: ['my-applications'],
    queryFn: () => api.get<ApplicationsResponse>('/my/applications').then((r) => r.data),
  })
}

export function useOpportunityApplications(opportunityId: number | undefined) {
  return useQuery<ApplicationsResponse>({
    queryKey: ['opportunity-applications', opportunityId],
    queryFn: () =>
      api.get<ApplicationsResponse>(`/opportunities/${opportunityId}/applications`).then((r) => r.data),
    enabled: !!opportunityId,
  })
}

export function useApply(opportunityId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ message, applicant_org_id }: { message?: string; applicant_org_id?: number }) =>
      api.post<{ application: ServiceApplication }>(`/opportunities/${opportunityId}/applications`, {
        application: { message, applicant_org_id },
      }).then((r) => r.data.application),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity', String(opportunityId)] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
    },
  })
}

export function useUpdateApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status?: string; notes?: string }) =>
      api.patch<{ application: ServiceApplication }>(`/applications/${id}`, {
        application: { status, notes },
      }).then((r) => r.data.application),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      queryClient.invalidateQueries({ queryKey: ['opportunity-applications'] })
      queryClient.invalidateQueries({ queryKey: ['opportunity', String(variables.id)] })
    },
  })
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, opportunityId }: { id: number; opportunityId: number }) =>
      api.delete<{ application: ServiceApplication }>(`/applications/${id}`).then((r) => r.data.application),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['opportunity', String(variables.opportunityId)] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
    },
  })
}
