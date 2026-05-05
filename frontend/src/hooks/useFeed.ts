import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export type FeedTag = 'yours' | 'your_org' | 'partner' | null

export interface FeedItem {
  type: 'new_opportunity' | 'new_program' | 'announcement' | 'application_update' | 'partner_request' | 'referral'
  id: string
  title: string
  body: string | null
  org_name: string
  org_id: number | null
  url: string
  tag: FeedTag
  created_at: string
}

interface FeedResponse {
  feed: FeedItem[]
}

export function useFeed(enabled = true) {
  return useQuery<FeedResponse>({
    queryKey: ['feed'],
    queryFn: () => api.get('/feed').then(r => r.data),
    enabled,
    staleTime: 60_000,
  })
}
