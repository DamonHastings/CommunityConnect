/**
 * Demo 03 — Volunteer browses opportunities and logs hours
 * Shows: browse volunteer opportunities → open an opportunity detail →
 * My Services with approved application (7.5h seeded) → expand hours
 * panel → log 2.5 more hours → total updates to 10h.
 */
import { test, expect, type Locator } from '@playwright/test'
import { loginAs } from '../helpers/auth'

const PAUSE = (ms = 1200) => new Promise((r) => setTimeout(r, ms))

const smoothScrollTo = async (locator: Locator, pauseMs = 700) => {
  await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const margin = 80
    const isInViewport =
      rect.top >= margin &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight - margin &&
      rect.right <= window.innerWidth
    if (!isInViewport) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  })
  await PAUSE(pauseMs)
}

const smoothClick = async (locator: Locator) => {
  await smoothScrollTo(locator)
  await locator.click()
}

const smoothFill = async (locator: Locator, value: string) => {
  await smoothScrollTo(locator)
  await locator.fill(value)
}

test('Volunteer browses opportunities and logs hours', async ({ page }) => {
  await loginAs(page, 'volunteer@example.com')
  await PAUSE()

  // ── Volunteer opportunities list ───────────────────────────────────────────
  await page.goto('/volunteer-opportunities')
  await expect(page.getByText('Weekend Food Pantry Volunteer')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('Meal Delivery Driver')).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // ── Open opportunity detail ────────────────────────────────────────────────
  await smoothClick(page.getByText('Weekend Food Pantry Volunteer').first())
  await expect(page).toHaveURL(/\/opportunities\/\d+/, { timeout: 8000 })
  await PAUSE(1200)

  await page.evaluate(() => window.scrollBy(0, 250))
  await PAUSE(1200)

  // ── My Services: approved application with seeded hours ───────────────────
  await page.goto('/my-services')
  await expect(page.getByText('Weekend Food Pantry Volunteer')).toBeVisible({ timeout: 10000 })
  await PAUSE(1200)

  // Expand the hours panel — toggle button shows "7.5h logged"
  await smoothClick(page.getByText('7.5h logged'))
  await PAUSE(1000)

  // Seeded hour entries are visible
  await expect(page.getByText('Sorting donations')).toBeVisible({ timeout: 8000 })
  await PAUSE(1500)

  // ── Log 2.5 new hours ─────────────────────────────────────────────────────
  await smoothFill(page.getByPlaceholder('Hours'), '2.5')
  await PAUSE(600)

  await smoothFill(
    page.locator('input[type="date"]').last(),
    new Date().toISOString().split('T')[0],
  )
  await PAUSE(600)

  await smoothFill(page.getByPlaceholder('Notes (optional)'), 'Community outreach morning shift')
  await PAUSE(800)

  await smoothClick(page.getByRole('button', { name: 'Save' }).last())
  await PAUSE(1200)

  // Total updates to 10h
  await expect(page.getByText('10h logged')).toBeVisible({ timeout: 10000 })
  await PAUSE(2000)
})
