export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  platform_admin: boolean
  organizations: OrganizationMembership[]
  created_at: string
}

export interface Organization {
  id: number
  name: string
  description: string | null
  mission: string | null
  category: OrganizationCategory
  website: string | null
  contact_email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  status: 'pending' | 'active' | 'inactive'
  verified: boolean
  member_count: number
  open_opportunity_count: number
  created_at: string
}

export interface OrganizationMembership {
  id: number
  user_id: number
  user_name: string
  user_email: string
  role: 'admin' | 'member'
  joined_at: string | null
}

export interface EngagementOpportunity {
  id: number
  title: string
  description: string | null
  opportunity_type: OpportunityType
  status: 'open' | 'closed' | 'filled'
  remote: boolean
  start_date: string | null
  end_date: string | null
  requirements: string | null
  contact_email: string | null
  organization: { id: number; name: string }
  created_at: string
}

export type OrganizationCategory =
  | 'food_bank'
  | 'shelter'
  | 'healthcare'
  | 'education'
  | 'housing'
  | 'mental_health'
  | 'youth_services'
  | 'other'

export type OpportunityType =
  | 'volunteer'
  | 'partnership'
  | 'funding'
  | 'mentorship'
  | 'resource_sharing'

export interface PaginationMeta {
  current_page: number
  total_pages: number
  total_count: number
  per_page: number
}

export interface ApiError {
  error?: string
  errors?: string[]
}
