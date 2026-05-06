import type { Page } from '@playwright/test'

export async function loginAs(
  page: Page,
  email: string,
  password = 'password123',
  redirectTo = '/dashboard'
) {
  const res = await page.request.post('http://localhost:3001/api/v1/auth/login', {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ user: { email, password } }),
  })
  if (!res.ok()) throw new Error(`Login failed for ${email}: ${res.status()}`)
  const token = res.headers()['authorization']?.replace('Bearer ', '') ?? ''
  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('auth_token', t), token)
  await page.goto(redirectTo)
}
