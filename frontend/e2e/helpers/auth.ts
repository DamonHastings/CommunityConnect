import type { Page } from '@playwright/test'

const API_BASE_URL = 'http://localhost:3001/api/v1'
const PASSWORD = 'password123'

export async function loginAs(
  page: Page,
  email: string,
  password = PASSWORD,
  redirectTo = '/dashboard'
) {
  const res = await page.request.post(`${API_BASE_URL}/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ user: { email, password } }),
  })
  if (!res.ok()) throw new Error(`Login failed for ${email}: ${res.status()}`)
  const token = res.headers()['authorization']?.replace('Bearer ', '') ?? ''
  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('auth_token', t), token)
  await page.goto(redirectTo)
}

export async function registerSeekerWithIntake(page: Page, redirectTo = '/dashboard') {
  const email = `demo_seeker_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`
  const registerRes = await page.request.post(`${API_BASE_URL}/auth/register`, {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({
      user: {
        email,
        password: PASSWORD,
        password_confirmation: PASSWORD,
        first_name: 'Jason',
        last_name: 'Demo',
        profile_type: 'individual_seeker',
      },
    }),
  })
  if (!registerRes.ok()) throw new Error(`Registration failed for ${email}: ${registerRes.status()}`)

  const token = registerRes.headers()['authorization']?.replace('Bearer ', '') ?? ''
  if (!token) throw new Error(`Registration did not return an auth token for ${email}`)

  const intakeRes = await page.request.post(`${API_BASE_URL}/intake`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({
      intake_response: {
        housing_status: 'at_risk',
        employment_status: 'unemployed_seeking',
        needs_categories: ['food_nutrition', 'housing_shelter', 'job_training'],
        urgency: 'within_weeks',
        goals: 'Find stable support and academic help.',
        barriers: 'Transportation and scheduling constraints.',
        preferred_contact: 'email',
      },
    }),
  })
  if (!intakeRes.ok()) throw new Error(`Intake setup failed for ${email}: ${intakeRes.status()}`)

  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('auth_token', t), token)
  await page.goto(redirectTo)

  return { email }
}
