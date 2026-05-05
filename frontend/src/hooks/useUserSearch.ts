import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface UserSearchResult {
  id: number
  name: string
  email: string
}

interface UserSearchResponse {
  users: UserSearchResult[]
}

export function useUserSearch(query: string) {
  return useQuery<UserSearchResponse>({
    queryKey: ['user-search', query],
    queryFn: () => api.get('/users/search', { params: { q: query } }).then((r) => r.data),
    enabled: query.length >= 2,
    staleTime: 10_000,
  })
}
