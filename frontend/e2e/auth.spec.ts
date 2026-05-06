import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test('authenticated user lands on dashboard', async ({ page }) => {
  await loginAs(page, 'volunteer@example.com')
  await expect(page).toHaveURL(/\/dashboard/)
})

test('unauthenticated visit to /dashboard redirects to /login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})

test('register new seeker → redirects to /intake', async ({ page }) => {
  const email = `newseeker_${Date.now()}@example.com`

  await page.goto('/register')
  await page.fill('input[name="name"]', 'Test Seeker')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', 'password123')

  // Select Individual Seeker profile type
  const select = page.locator('select[name="profile_type"]')
  await select.selectOption('individual_seeker')

  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/intake/, { timeout: 10000 })
})
