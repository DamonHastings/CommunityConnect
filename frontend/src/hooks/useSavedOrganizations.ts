import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
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
  return useMutation({
    mutationFn: (organizationId: number) =>
      api.post('/saved_organizations', { organization_id: organizationId }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-organizations'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useUnsaveOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (organizationId: number) =>
      api.delete(`/saved_organizations/${organizationId}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-organizations'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}
