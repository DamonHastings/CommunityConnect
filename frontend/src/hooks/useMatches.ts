import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import type { Organization, EngagementOpportunity } from '../types'

interface MatchesResponse {
  has_intake: boolean
  needs_categories: string[]
  organizations: Organization[]
  opportunities: EngagementOpportunity[]
}

export function useMatches(enabled: boolean) {
  return useQuery<MatchesResponse>({
    queryKey: ['matches'],
    queryFn: () => api.get<MatchesResponse>('/matches').then((r) => r.data),
    enabled,
  })
}
