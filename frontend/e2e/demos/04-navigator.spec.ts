/**
 * Demo 04 — Resource Navigator manages caseload and sends a referral
 * Shows: /caseload with seeded clients → expand Jason's card → open inline
 * Refer panel → switch to Program → search "summer" → select Summer Job
 * Training → add message → send → panel closes.
 */
import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'

const PAUSE = (ms = 1200) => new Promise((r) => setTimeout(r, ms))

test('Navigator manages caseload and sends an inline referral', async ({ page }) => {
  await loginAs(page, 'navigator@example.com')
  await page.goto('/caseload')
  await PAUSE()

  // ── Caseload overview: two seeded clients ─────────────────────────────────
  await expect(page.getByText(/jason/i)).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // Scroll down to see both client cards
  await page.evaluate(() => window.scrollBy(0, 150))
  await PAUSE(1200)

  // ── Inline refer panel: Jason ──────────────────────────────────────────────
  const jasonSection = page.locator('article, [class*="card"], section').filter({ hasText: /jason/i }).first()
  await jasonSection.getByRole('button', { name: /refer/i }).click()
  await PAUSE(1000)

  // Switch to Program tab inside the panel
  await page.getByRole('button', { name: /program/i }).filter({ hasText: /^Program$/i }).click()
  await PAUSE(800)

  // Search for the summer program
  const searchInput = page.getByPlaceholder(/search programs/i).or(page.getByPlaceholder(/search/i)).last()
  await searchInput.fill('summer')
  await PAUSE(1000)

  await page.getByText('Summer Job Training').click()
  await PAUSE(800)

  // Add a message
  const messageInput = page.getByPlaceholder(/message/i).or(page.locator('textarea')).last()
  await messageInput.fill("This program aligns perfectly with Jason's employment goals.")
  await PAUSE(1000)

  // Send the referral
  await page.getByRole('button', { name: /send referral/i }).click()
  await PAUSE(1500)

  // Panel closes — Refer button should be visible again
  await expect(jasonSection.getByRole('button', { name: /refer/i })).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // ── Add a new client ──────────────────────────────────────────────────────
  await page.getByRole('button', { name: /add client/i }).click()
  await PAUSE(800)

  const clientSearch = page.getByPlaceholder(/search/i).last()
  await clientSearch.fill('professional')
  await PAUSE(1000)

  // Click the first suggestion
  await page.getByText(/professional@example\.com/i).first().click()
  await PAUSE(1500)

  // New card appears
  await expect(page.getByText(/professional/i)).toBeVisible({ timeout: 10000 })
  await PAUSE(2000)
})
