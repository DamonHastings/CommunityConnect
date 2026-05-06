import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Seeker flows (jason.intake3@example.com)', () => {
  test('dashboard shows matched orgs based on intake', async ({ page }) => {
    await loginAs(page, 'jason.intake3@example.com')
    await expect(page.getByText('City Food Bank')).toBeVisible({ timeout: 10000 })
  })

  test('seeker without intake is redirected to /intake from /dashboard', async ({ page }) => {
    await loginAs(page, 'seeker3@example.com', 'password123', '/dashboard')
    await expect(page).toHaveURL(/\/intake/, { timeout: 10000 })
  })

  test('seeker3 can complete intake and land on dashboard', async ({ page }) => {
    await loginAs(page, 'seeker3@example.com', 'password123', '/intake')
    await expect(page).toHaveURL(/\/intake/)

    // Fill and submit the intake form
    await page.locator('select[name="housing_status"]').selectOption('stable')
    await page.locator('select[name="employment_status"]').selectOption('employed_full_time')
    await page.locator('select[name="urgency"]').selectOption('ongoing')

    // Submit the form
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('/my-services shows pending application for jason', async ({ page }) => {
    await loginAs(page, 'jason.intake3@example.com')
    await page.goto('/my-services')
    await expect(page.getByText('Weekend Food Pantry Volunteer')).toBeVisible({ timeout: 10000 })
  })
})
