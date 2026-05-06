import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Volunteer flows (volunteer@example.com)', () => {
  test('/volunteer-opportunities shows seeded opportunities', async ({ page }) => {
    await loginAs(page, 'volunteer@example.com')
    await page.goto('/volunteer-opportunities')
    await expect(page.getByText('Weekend Food Pantry Volunteer')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Meal Delivery Driver')).toBeVisible({ timeout: 10000 })
  })

  test('/my-services shows approved application with hours logged', async ({ page }) => {
    await loginAs(page, 'volunteer@example.com')
    await page.goto('/my-services')
    await expect(page.getByText('Weekend Food Pantry Volunteer')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/7\.5\s*h/i)).toBeVisible({ timeout: 10000 })
  })

  test('can log new volunteer hours and total updates', async ({ page }) => {
    await loginAs(page, 'volunteer@example.com')
    await page.goto('/my-services')

    // Open the hours panel for the approved application
    await page.getByRole('button', { name: /log hours|add hours|hours/i }).first().click()

    await page.fill('input[name="hours"]', '2.5')
    await page.fill('input[name="date"]', new Date().toISOString().split('T')[0])
    await page.getByRole('button', { name: /save|submit|add/i }).last().click()

    await expect(page.getByText(/10\s*h/i)).toBeVisible({ timeout: 10000 })
  })
})
