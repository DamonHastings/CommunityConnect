import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Navigator flows (navigator@example.com)', () => {
  test('/caseload shows seeded clients', async ({ page }) => {
    await loginAs(page, 'navigator@example.com')
    await page.goto('/caseload')
    await expect(page.getByText(/jason/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/seeker2/i).or(page.getByText(/seeker 2/i))).toBeVisible({ timeout: 10000 })
  })

  test('can add a client to caseload', async ({ page }) => {
    await loginAs(page, 'navigator@example.com')
    await page.goto('/caseload')

    await page.getByRole('button', { name: /add client/i }).click()

    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('textbox')).last()
    await searchInput.fill('professional')
    await page.getByText(/professional@example\.com|Professional/i).first().click()

    await expect(page.getByText(/professional/i)).toBeVisible({ timeout: 10000 })
  })

  test('can send an inline referral from a caseload card', async ({ page }) => {
    await loginAs(page, 'navigator@example.com')
    await page.goto('/caseload')

    // Click the Refer button on Jason's card
    const jasonCard = page.locator('[data-testid="caseload-card"]', { hasText: /jason/i })
      .or(page.locator('.caseload-card', { hasText: /jason/i }))
      .or(page.locator('div', { hasText: /jason/i }).first())
    await jasonCard.getByRole('button', { name: /refer/i }).click()

    // Toggle to Program
    await page.getByRole('button', { name: /program/i }).click()

    // Search for the summer program
    const searchInput = page.getByPlaceholder(/search/i).last()
    await searchInput.fill('summer')
    await page.getByText(/summer job training/i).click()

    // Fill optional message
    const messageInput = page.getByPlaceholder(/message/i).or(page.locator('textarea')).last()
    await messageInput.fill('Great fit for your goals')

    await page.getByRole('button', { name: /send referral/i }).click()

    // Panel should close — Refer button visible again
    await expect(jasonCard.getByRole('button', { name: /refer/i })).toBeVisible({ timeout: 10000 })
  })
})
