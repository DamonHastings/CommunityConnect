import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { OrganizationCategory, OpportunityType, ProfileType, ProgramType, ProgramStatus } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CATEGORY_LABELS: Record<OrganizationCategory, string> = {
  food_bank: 'Food Bank',
  shelter: 'Shelter',
  healthcare: 'Healthcare',
  education: 'Education',
  housing: 'Housing',
  mental_health: 'Mental Health',
  youth_services: 'Youth Services',
  other: 'Other',
}

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  volunteer: 'Volunteer',
  partnership: 'Partnership',
  funding: 'Funding',
  mentorship: 'Mentorship',
  resource_sharing: 'Resource Sharing',
}

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  individual_seeker: 'Individual — Seeking Resources',
  individual_professional: 'Individual — Service Professional',
  community_org: 'Community Organization',
  business_service_provider: 'Business / Service Provider',
  volunteer: 'Volunteer',
  resource_navigator: 'Resource Navigator / Advocate',
}

export const PROFILE_TYPE_OPTIONS: { value: ProfileType; label: string; description: string }[] = [
  {
    value: 'individual_seeker',
    label: 'Individual seeking resources',
    description: 'I\'m looking for services, programs, or support for myself or my family.',
  },
  {
    value: 'volunteer',
    label: 'Volunteer',
    description: 'I want to give my time and skills to support organizations and community programs.',
  },
  {
    value: 'resource_navigator',
    label: 'Resource navigator / advocate',
    description: 'I help others find and access services — as a case worker, community navigator, or advocate.',
  },
  {
    value: 'individual_professional',
    label: 'Professional offering services',
    description: 'I\'m a licensed practitioner or consultant offering professional services to orgs or individuals.',
  },
  {
    value: 'community_org',
    label: 'Community organization',
    description: 'I represent a nonprofit, social service agency, or community group.',
  },
  {
    value: 'business_service_provider',
    label: 'Business / service provider',
    description: 'I represent a commercial business that partners with or serves community organizations.',
  },
]

export const NEEDS_CATEGORY_LABELS: Record<string, string> = {
  food_nutrition: 'Food & nutrition',
  housing_shelter: 'Housing & shelter',
  healthcare: 'Healthcare',
  mental_health: 'Mental health',
  job_training: 'Job training & employment',
  education: 'Education',
  transportation: 'Transportation',
  legal_aid: 'Legal aid',
  financial_assistance: 'Financial assistance',
  childcare: 'Childcare',
  substance_use_support: 'Substance use support',
  other: 'Other',
}

export const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  mentorship: 'Mentorship',
  workshop: 'Workshop',
  summer_program: 'Summer Program',
  tutoring: 'Tutoring',
  job_training: 'Job Training',
  volunteer: 'Volunteer',
  community_event: 'Community Event',
  other: 'Other',
}

export const PROGRAM_STATUS_LABELS: Record<ProgramStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function formatDate(date: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
