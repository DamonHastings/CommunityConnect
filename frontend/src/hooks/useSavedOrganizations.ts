import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { Organization } from '../types'

interface SavedOrgsResponse {
  organizations: Organization[]
}

export function useSavedOrganizations() {
  return useQuery<SavedOrgsResponse>({
    queryKey: ['saved-organizations'],
    queryFn: () => api.get<SavedOrgsResponse>('/saved_organizations').then((r) => r.data),
  })
}

export function useSaveOrganization() {
  const queryClient = useQueryClient()
  const { updateUser } = useAuth()
  return useMutation({
    mutationFn: (organizationId: number) =>
      api.post('/saved_organizations', { organization_id: organizationId }).then((r) => r.data),
    onSuccess: (_data, organizationId) => {
      updateUser((u) => ({
        ...u,
        saved_org_ids: [...(u.saved_org_ids ?? []), organizationId],
      }))
      queryClient.invalidateQueries({ queryKey: ['saved-organizations'] })
    },
  })
}

export function useUnsaveOrganization() {
  const queryClient = useQueryClient()
  const { updateUser } = useAuth()
  return useMutation({
    mutationFn: (organizationId: number) =>
      api.delete(`/saved_organizations/${organizationId}`).then((r) => r.data),
    onSuccess: (_data, organizationId) => {
      updateUser((u) => ({
        ...u,
        saved_org_ids: (u.saved_org_ids ?? []).filter((id) => id !== organizationId),
      }))
      queryClient.invalidateQueries({ queryKey: ['saved-organizations'] })
    },
  })
}
