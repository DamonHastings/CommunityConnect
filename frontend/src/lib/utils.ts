import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { OrganizationCategory, OpportunityType } from '../types'

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

export function formatDate(date: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
