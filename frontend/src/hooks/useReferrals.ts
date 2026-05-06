import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Referral } from '../types'

interface ReferralsResponse {
  referrals: Referral[]
}

export function useMyReferrals() {
  return useQuery<ReferralsResponse>({
    queryKey: ['my-referrals'],
    queryFn: () => api.get<ReferralsResponse>('/my/referrals').then((r) => r.data),
  })
}

export function useOrgReferrals(orgId: number | string) {
  return useQuery<ReferralsResponse>({
    queryKey: ['referrals', orgId],
    queryFn: () =>
      api.get<ReferralsResponse>(`/organizations/${orgId}/referrals`).then((r) => r.data),
    enabled: !!orgId,
  })
}

export function useSendReferral(orgId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      referred_user_email?: string
      referred_user_id?: number
      message?: string
      target_type?: string
      target_id?: number
    }) =>
      api.post<{ referral: Referral }>(`/organizations/${orgId}/referrals`, data).then((r) => r.data.referral),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals', orgId] })
    },
  })
}

export function useUpdateReferral() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'accepted' | 'declined' }) =>
      api.patch<{ referral: Referral }>(`/referrals/${id}`, { status }).then((r) => r.data.referral),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-referrals'] })
    },
  })
}
