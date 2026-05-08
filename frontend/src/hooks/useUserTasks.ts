import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { UserTask } from '../types'

interface TasksResponse {
  tasks: UserTask[]
}

export function useUserTasks(enabled = true) {
  return useQuery<TasksResponse>({
    queryKey: ['user-tasks'],
    queryFn: () => api.get<TasksResponse>('/my/tasks').then((r) => r.data),
    enabled,
  })
}

export function useCreateUserTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; notes?: string; due_date?: string; source_type?: string; source_id?: number }) =>
      api.post<{ task: UserTask }>('/tasks', { task: data }).then((r) => r.data.task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tasks'] })
    },
  })
}

export function useUpdateUserTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; title?: string; notes?: string; due_date?: string; completed?: boolean }) =>
      api.patch<{ task: UserTask }>(`/tasks/${id}`, { task: data }).then((r) => r.data.task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tasks'] })
    },
  })
}

export function useDeleteUserTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tasks'] })
    },
  })
}
