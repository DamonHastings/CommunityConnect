export type ProfileType =
  | 'individual_seeker'
  | 'individual_professional'
  | 'community_org'
  | 'business_service_provider'
  | 'volunteer'
  | 'resource_navigator'

export interface UserOrganization {
  id: number
  name: string
  role: 'admin' | 'member'
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  platform_admin: boolean
  profile_type: ProfileType
  bio: string | null
  phone: string | null
  city: string | null
  state: string | null
  website: string | null
  availability: string | null
  specialty: string | null
  communities_served: string[]
  services_offered: string[]
  services_needed: string[]
  organizations: UserOrganization[]
  created_at: string
  intake_completed?: boolean | null
  saved_org_ids?: number[]
}

export type HousingStatus =
  | 'stable'
  | 'at_risk'
  | 'transitional'
  | 'experiencing_homelessness'
  | 'prefer_not_to_say'

export type EmploymentStatus =
  | 'employed_full_time'
  | 'employed_part_time'
  | 'unemployed_seeking'
  | 'unemployed_not_seeking'
  | 'self_employed'
  | 'unable_to_work'

export type IntakeUrgency = 'immediate' | 'within_weeks' | 'within_months' | 'ongoing'

export interface IntakeResponse {
  id: number
  user_id: number
  housing_status: HousingStatus
  employment_status: EmploymentStatus
  needs_categories: string[]
  urgency: IntakeUrgency
  goals: string | null
  barriers: string | null
  preferred_contact: string | null
  created_at: string
  updated_at: string
}

export interface IntakeFormData {
  housing_status: HousingStatus
  employment_status: EmploymentStatus
  needs_categories: string[]
  urgency: IntakeUrgency
  goals: string
  barriers: string
  preferred_contact: string
}

export type OrgType = 'nonprofit' | 'business' | 'school' | 'foundation'

export interface Organization {
  id: number
  name: string
  description: string | null
  mission: string | null
  category: OrganizationCategory
  org_type: OrgType
  featured: boolean
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
  primary_admin: { id: number; name: string } | null
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

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

export interface ServiceApplication {
  id: number
  status: ApplicationStatus
  message: string | null
  notes: string | null
  applicant: { id: number; name: string; email: string }
  applicant_org: { id: number; name: string } | null
  opportunity: {
    id: number
    title: string
    organization: { id: number; name: string }
  }
  created_at: string
  updated_at: string
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
  funding_amount: number | null
  eligibility: string | null
  organization: { id: number; name: string; city: string | null; state: string | null }
  created_at: string
  my_application?: { id: number; status: ApplicationStatus } | null
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

export type ProgramType =
  | 'mentorship'
  | 'workshop'
  | 'summer_program'
  | 'tutoring'
  | 'job_training'
  | 'volunteer'
  | 'community_event'
  | 'other'

export type ProgramStatus = 'draft' | 'published' | 'active' | 'completed' | 'cancelled'

export interface ProgramOrganization {
  id: number
  name: string
  role: 'owner' | 'partner'
}

export interface Program {
  id: number
  title: string
  description: string | null
  goals: string | null
  program_type: ProgramType
  status: ProgramStatus
  capacity: number | null
  city: string | null
  state: string | null
  remote: boolean
  application_opens_at: string | null
  application_closes_at: string | null
  starts_on: string | null
  ends_on: string | null
  contact_email: string | null
  organization: { id: number; name: string }
  organizations?: ProgramOrganization[]
  applications_open: boolean
  my_application?: { id: number; status: ApplicationStatus } | null
  created_at: string
}

export interface ProgramApplication {
  id: number
  status: ApplicationStatus
  message: string | null
  notes: string | null
  applicant: { id: number; name: string; email: string }
  program: {
    id: number
    title: string
    organization: { id: number; name: string }
  }
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: number
  title: string
  body: string
  published_at: string | null
  created_at: string
}

export interface Message {
  id: number
  body: string
  sender: { id: number; name: string }
  created_at: string
}

export interface Conversation {
  id: number
  participants: { id: number; name: string }[]
  last_message: { id: number; body: string; sender_name: string; created_at: string } | null
  unread_count: number
  created_at: string
}

export interface Referral {
  id: number
  status: 'pending' | 'accepted' | 'declined'
  message: string | null
  referring_org: { id: number; name: string }
  referred_user: { id: number; name: string }
  target: { type: 'Program' | 'Organization'; id: number; title?: string; name?: string } | null
  created_at: string
}

export interface PartnerConnection {
  id: number
  status: 'pending' | 'accepted' | 'declined'
  message: string | null
  requester_org: { id: number; name: string }
  target_org: { id: number; name: string }
  created_at: string
}

export type NotificationType =
  | 'new_message'
  | 'application_update'
  | 'referral_received'
  | 'partner_request'
  | 'referral_accepted'

export interface Notification {
  id: number
  notification_type: NotificationType
  title: string
  body: string | null
  url: string
  actor_name: string | null
  read_at: string | null
  created_at: string
}

export interface ApiError {
  error?: string
  errors?: string[]
}
