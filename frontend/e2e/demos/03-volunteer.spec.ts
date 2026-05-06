/**
 * Demo 03 — Volunteer browses opportunities and logs hours
 * Shows: browse volunteer opportunities → view My Services with approved
 * application → expand hours panel (7.5h seeded) → log 2.5 more hours →
 * total updates to 10h.
 */
import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'

const PAUSE = (ms = 1200) => new Promise((r) => setTimeout(r, ms))

test('Volunteer browses opportunities and logs hours', async ({ page }) => {
  await loginAs(page, 'volunteer@example.com')
  await PAUSE()

  // ── Volunteer opportunities list ───────────────────────────────────────────
  await page.goto('/volunteer-opportunities')
  await expect(page.getByText('Weekend Food Pantry Volunteer')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('Meal Delivery Driver')).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // Scroll down to show more cards
  await page.evaluate(() => window.scrollBy(0, 200))
  await PAUSE(1200)

  // ── Open an opportunity detail ────────────────────────────────────────────
  await page.getByText('Weekend Food Pantry Volunteer').first().click()
  await PAUSE()
  await expect(page).toHaveURL(/\/opportunities\/\d+/, { timeout: 8000 })
  await PAUSE(1500)

  // ── My Services: approved application with seeded hours ───────────────────
  await page.goto('/my-services')
  await expect(page.getByText('Weekend Food Pantry Volunteer')).toBeVisible({ timeout: 10000 })
  await PAUSE(1200)

  // Expand the hours panel — button shows "7.5h logged"
  await page.getByText(/7\.5h logged/i).click()
  await PAUSE(1000)

  // Seeded hour entries should be visible
  await expect(page.getByText('Sorting donations')).toBeVisible({ timeout: 8000 })
  await PAUSE(1500)

  // ── Log 2.5 new hours ─────────────────────────────────────────────────────
  const hoursInput = page.getByPlaceholder('Hours').or(page.locator('input[type="number"]')).last()
  await hoursInput.fill('2.5')
  await PAUSE(600)

  const dateInput = page.locator('input[type="date"]').last()
  await dateInput.fill(new Date().toISOString().split('T')[0])
  await PAUSE(600)

  const notesInput = page.getByPlaceholder('Notes (optional)').or(page.locator('input[placeholder*="notes" i]')).last()
  if (await notesInput.isVisible()) {
    await notesInput.fill('Community outreach morning shift')
    await PAUSE(600)
  }

  await page.getByRole('button', { name: /log|save|add/i }).last().click()
  await PAUSE(1000)

  // Total should now show 10h
  await expect(page.getByText(/10h logged/i)).toBeVisible({ timeout: 10000 })
  await PAUSE(2000)
})
