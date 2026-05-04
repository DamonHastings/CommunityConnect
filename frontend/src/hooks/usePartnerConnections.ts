import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { PartnerConnection } from '../types'

interface ConnectionsResponse {
  partner_connections: PartnerConnection[]
}

export function useOrgConnections(orgId: number | string, status?: string) {
  return useQuery<ConnectionsResponse>({
    queryKey: ['partner_connections', orgId, status],
    queryFn: () =>
      api.get<ConnectionsResponse>(`/organizations/${orgId}/partner_connections`, {
        params: status ? { status } : undefined,
      }).then((r) => r.data),
    enabled: !!orgId,
  })
}

export function useSendConnectionRequest(orgId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ target_org_id, message }: { target_org_id: number; message?: string }) =>
      api.post<{ partner_connection: PartnerConnection }>(
        `/organizations/${orgId}/partner_connections`,
        { target_org_id, message }
      ).then((r) => r.data.partner_connection),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner_connections'] })
    },
  })
}

export function useUpdateConnectionRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'accepted' | 'declined' }) =>
      api.patch<{ partner_connection: PartnerConnection }>(
        `/partner_connections/${id}`,
        { status }
      ).then((r) => r.data.partner_connection),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner_connections'] })
    },
  })
}

export function useCancelConnectionRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/partner_connections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner_connections'] })
    },
  })
}
