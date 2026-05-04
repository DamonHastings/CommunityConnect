import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Organization, PaginationMeta } from '../types'

interface OrganizationFilters {
  q?: string
  category?: string
  org_type?: string
  city?: string
  state?: string
  page?: number
  featured?: boolean
}

interface OrganizationsResponse {
  organizations: Organization[]
  meta: PaginationMeta
}

export function useOrganizations(filters: OrganizationFilters = {}) {
  return useQuery({
    queryKey: ['organizations', filters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
      )
      const res = await api.get<OrganizationsResponse>('/organizations', { params })
      return res.data
    },
  })
}

export function useOrganization(id: number | string) {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: async () => {
      const res = await api.get<{ organization: Organization }>(`/organizations/${id}`)
      return res.data.organization
    },
    enabled: !!id,
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Organization>) => {
      const res = await api.post<{ organization: Organization }>('/organizations', { organization: data })
      return res.data.organization
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

export function useUpdateOrganization(id: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Organization>) => {
      const res = await api.patch<{ organization: Organization }>(`/organizations/${id}`, { organization: data })
      return res.data.organization
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.setQueryData(['organizations', id], updated)
    },
  })
}
