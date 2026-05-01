import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { OrganizationCategory, OpportunityType, ProfileType } from '../types'

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
}

export const PROFILE_TYPE_OPTIONS: { value: ProfileType; label: string; description: string }[] = [
  {
    value: 'individual_seeker',
    label: 'Individual seeking resources',
    description: 'I\'m looking for services, programs, or support for myself or my family.',
  },
  {
    value: 'individual_professional',
    label: 'Professional offering services',
    description: 'I\'m a practitioner, consultant, or volunteer offering skills to organizations or individuals.',
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

export function formatDate(date: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
