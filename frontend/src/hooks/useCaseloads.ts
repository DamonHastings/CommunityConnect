import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export interface CaseloadClient {
  id: number
  name: string
  email: string
  profile_type: string
  city: string | null
  state: string | null
}

export interface Caseload {
  id: number
  status: 'active' | 'closed'
  notes: string | null
  created_at: string
  client: CaseloadClient
}

interface CaseloadsResponse {
  caseloads: Caseload[]
}

export function useCaseloads(enabled = true) {
  return useQuery<CaseloadsResponse>({
    queryKey: ['caseloads'],
    queryFn: () => api.get<CaseloadsResponse>('/caseloads').then((r) => r.data),
    enabled,
  })
}

export function useAddToCaseload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ clientId, notes }: { clientId: number; notes?: string }) =>
      api.post('/caseloads', { client_id: clientId, notes }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['caseloads'] }),
  })
}

export function useUpdateCaseload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; status?: string; notes?: string }) =>
      api.patch(`/caseloads/${id}`, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['caseloads'] }),
  })
}

export function useRemoveFromCaseload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/caseloads/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['caseloads'] }),
  })
}
