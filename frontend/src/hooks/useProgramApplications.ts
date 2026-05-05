import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { ProgramApplication } from '../types'

interface ApplicationsResponse {
  applications: ProgramApplication[]
}

export function useMyProgramApplications() {
  return useQuery<ApplicationsResponse>({
    queryKey: ['my-program-applications'],
    queryFn: () => api.get<ApplicationsResponse>('/my/program_applications').then((r) => r.data),
  })
}

export function useProgramApplications(programId: number | undefined) {
  return useQuery<ApplicationsResponse>({
    queryKey: ['program-applications', programId],
    queryFn: () =>
      api.get<ApplicationsResponse>(`/programs/${programId}/applications`).then((r) => r.data),
    enabled: !!programId,
  })
}

export function useApplyToProgram(programId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (message: string) =>
      api
        .post<{ application: ProgramApplication }>(`/programs/${programId}/applications`, {
          application: { message },
        })
        .then((r) => r.data.application),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs', String(programId)] })
      queryClient.invalidateQueries({ queryKey: ['my-program-applications'] })
    },
  })
}

export function useUpdateProgramApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status?: string; notes?: string }) =>
      api
        .patch<{ application: ProgramApplication }>(`/program_applications/${id}`, {
          application: { status, notes },
        })
        .then((r) => r.data.application),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-program-applications'] })
      queryClient.invalidateQueries({ queryKey: ['program-applications'] })
    },
  })
}

export function useWithdrawProgramApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, programId: _programId }: { id: number; programId: number }) =>
      api
        .delete<{ application: ProgramApplication }>(`/program_applications/${id}`)
        .then((r) => r.data.application),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['programs', String(variables.programId)] })
      queryClient.invalidateQueries({ queryKey: ['my-program-applications'] })
    },
  })
}
