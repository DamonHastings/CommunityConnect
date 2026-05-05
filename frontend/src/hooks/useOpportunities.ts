import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { EngagementOpportunity, PaginationMeta } from '../types'

interface OpportunityFilters {
  type?: string
  status?: string
  remote?: boolean
  organization_id?: number | string
  page?: number
}

interface OpportunitiesResponse {
  opportunities: EngagementOpportunity[]
  meta: PaginationMeta
}

export function useOpportunities(filters: OpportunityFilters = {}) {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
      )
      const res = await api.get<OpportunitiesResponse>('/opportunities', { params })
      return res.data
    },
  })
}

export function useOrganizationOpportunities(orgId: number | string) {
  return useQuery({
    queryKey: ['opportunities', 'org', orgId],
    queryFn: async () => {
      const res = await api.get<OpportunitiesResponse>(`/organizations/${orgId}/opportunities`)
      return res.data
    },
    enabled: !!orgId,
  })
}

export function useOpportunity(id: number | string) {
  return useQuery({
    queryKey: ['opportunities', id],
    queryFn: async () => {
      const res = await api.get<{ opportunity: EngagementOpportunity }>(`/opportunities/${id}`)
      return res.data.opportunity
    },
    enabled: !!id,
  })
}

export function useCreateOpportunity(orgId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<EngagementOpportunity>) => {
      const res = await api.post<{ opportunity: EngagementOpportunity }>(
        `/organizations/${orgId}/opportunities`,
        { opportunity: data }
      )
      return res.data.opportunity
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
    },
  })
}

export function useUpdateOpportunity(id: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<EngagementOpportunity>) => {
      const res = await api.patch<{ opportunity: EngagementOpportunity }>(
        `/opportunities/${id}`,
        { opportunity: data }
      )
      return res.data.opportunity
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
    },
  })
}
