import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { ClientProfile, ClientApplication } from '../types'

interface ProfilesResponse {
  client_profiles: ClientProfile[]
}

interface ApplicationsResponse {
  applications: ClientApplication[]
}

export function useClientProfiles(enabled = true) {
  return useQuery<ProfilesResponse>({
    queryKey: ['client-profiles'],
    queryFn: () => api.get<ProfilesResponse>('/client_profiles').then((r) => r.data),
    enabled,
  })
}

export function useClientProfile(id: number | undefined) {
  return useQuery<{ client_profile: ClientProfile }>({
    queryKey: ['client-profiles', id],
    queryFn: () => api.get<{ client_profile: ClientProfile }>(`/client_profiles/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateClientProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ClientProfile>) =>
      api.post<{ client_profile: ClientProfile }>('/client_profiles', { client_profile: data }).then((r) => r.data.client_profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] })
    },
  })
}

export function useUpdateClientProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<ClientProfile>) =>
      api.patch<{ client_profile: ClientProfile }>(`/client_profiles/${id}`, { client_profile: data }).then((r) => r.data.client_profile),
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ['client-profiles', profile.id] })
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] })
    },
  })
}

export function useClientApplications(clientProfileId: number | undefined) {
  return useQuery<ApplicationsResponse>({
    queryKey: ['client-applications', clientProfileId],
    queryFn: () =>
      api.get<ApplicationsResponse>(`/client_profiles/${clientProfileId}/applications`).then((r) => r.data),
    enabled: !!clientProfileId,
  })
}

export function useApplyOnBehalf(clientProfileId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ programId, message }: { programId: number; message?: string }) =>
      api
        .post<{ application: ClientApplication }>(`/client_profiles/${clientProfileId}/applications`, {
          application: { program_id: programId, message },
        })
        .then((r) => r.data.application),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-applications', clientProfileId] })
    },
  })
}
