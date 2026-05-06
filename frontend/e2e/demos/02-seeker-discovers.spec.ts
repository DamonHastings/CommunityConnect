/**
 * Demo 02 — Seeker discovers services and applies to a program
 * Shows: personalised dashboard with matched orgs → browse programs →
 * open Weekly Tutoring Program detail → apply → see pending badge →
 * My Services list with existing applications.
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

test('Seeker discovers services and applies to a program', async ({ page }) => {
  await loginAs(page, 'jason.intake3@example.com')
  await PAUSE()

  // ── Dashboard: personalised matches ───────────────────────────────────────
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByText('City Food Bank')).toBeVisible({ timeout: 10000 })
  await PAUSE(800)

  await smoothScrollTo(page.getByText('Matched for you'), 1200)

  // ── Browse Programs ────────────────────────────────────────────────────────
  await page.goto('/programs')
  await PAUSE()
  await expect(page.getByText('Weekly Tutoring Program')).toBeVisible({ timeout: 10000 })
  await PAUSE(1200)

  // ── Open program detail ────────────────────────────────────────────────────
  await smoothClick(page.getByText('Weekly Tutoring Program').first())
  await expect(page).toHaveURL(/\/programs\/\d+/, { timeout: 8000 })
  await PAUSE(1500)

  await page.evaluate(() => window.scrollBy(0, 250))
  await PAUSE(1000)

  // ── Apply ─────────────────────────────────────────────────────────────────
  await smoothClick(page.getByRole('button', { name: /apply/i }).first())
  await PAUSE(800)

  // Fill optional message if a modal/inline form appears
  const messageBox = page.locator('textarea').first()
  if (await messageBox.isVisible()) {
    await smoothFill(messageBox, 'I would love to improve my academic skills and get back on track.')
    await PAUSE(800)
    await smoothClick(page.getByRole('button', { name: /submit|apply|send/i }).last())
    await PAUSE()
  }

  // Pending badge appears on the page
  await expect(page.getByText(/pending/i)).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // ── My Services: existing applications ────────────────────────────────────
  await page.goto('/my-services')
  await expect(page.getByText('Weekend Food Pantry Volunteer')).toBeVisible({ timeout: 10000 })
  await PAUSE(2000)
})
