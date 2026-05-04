import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Program, PaginationMeta } from '../types'

interface ProgramFilters {
  type?: string
  organization_id?: number | string
  remote?: boolean
  page?: number
}

interface ProgramsResponse {
  programs: Program[]
  meta: PaginationMeta
}

export function usePrograms(filters: ProgramFilters = {}) {
  return useQuery({
    queryKey: ['programs', filters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
      )
      const res = await api.get<ProgramsResponse>('/programs', { params })
      return res.data
    },
  })
}

export function useOrganizationPrograms(orgId: number | string) {
  return useQuery({
    queryKey: ['programs', 'org', orgId],
    queryFn: async () => {
      const res = await api.get<ProgramsResponse>(`/organizations/${orgId}/programs`)
      return res.data
    },
    enabled: !!orgId,
  })
}

export function useProgram(id: number | string | undefined) {
  return useQuery({
    queryKey: ['programs', id],
    queryFn: async () => {
      const res = await api.get<{ program: Program }>(`/programs/${id}`)
      return res.data.program
    },
    enabled: !!id,
  })
}

export function useCreateProgram(orgId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Program>) => {
      const res = await api.post<{ program: Program }>(
        `/organizations/${orgId}/programs`,
        { program: data }
      )
      return res.data.program
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
    },
  })
}

export function useUpdateProgram(id: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Program>) => {
      const res = await api.patch<{ program: Program }>(
        `/programs/${id}`,
        { program: data }
      )
      return res.data.program
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
    },
  })
}

export function useDeleteProgram() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/programs/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
    },
  })
}
