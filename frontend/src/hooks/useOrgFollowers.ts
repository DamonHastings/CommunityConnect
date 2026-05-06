import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export function useFollowOrganization() {
  const queryClient = useQueryClient()
  const { updateUser } = useAuth()
  return useMutation({
    mutationFn: (organizationId: number) =>
      api.post('/org_followers', { organization_id: organizationId }).then((r) => r.data),
    onSuccess: (_data, organizationId) => {
      updateUser((u) => ({
        ...u,
        followed_org_ids: [...(u.followed_org_ids ?? []), organizationId],
      }))
      queryClient.invalidateQueries({ queryKey: ['organization'] })
    },
  })
}

export function useUnfollowOrganization() {
  const queryClient = useQueryClient()
  const { updateUser } = useAuth()
  return useMutation({
    mutationFn: (organizationId: number) =>
      api.delete(`/org_followers/${organizationId}`).then((r) => r.data),
    onSuccess: (_data, organizationId) => {
      updateUser((u) => ({
        ...u,
        followed_org_ids: (u.followed_org_ids ?? []).filter((id) => id !== organizationId),
      }))
      queryClient.invalidateQueries({ queryKey: ['organization'] })
    },
  })
}
