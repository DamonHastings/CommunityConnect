/**
 * Demo 02 — Seeker discovers services and applies to a program
 * Shows: dashboard matches → browse programs → view program detail →
 * apply to Weekly Tutoring Program → see pending application in My Services.
 */
import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'

const PAUSE = (ms = 1200) => new Promise((r) => setTimeout(r, ms))

test('Seeker discovers services and applies to a program', async ({ page }) => {
  await loginAs(page, 'jason.intake3@example.com')
  await PAUSE()

  // ── Dashboard: matched organisations visible ───────────────────────────────
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByText('City Food Bank')).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // Scroll down to show matches
  await page.evaluate(() => window.scrollBy(0, 350))
  await PAUSE(1500)

  // ── Navigate to Programs via sidebar / nav ────────────────────────────────
  await page.goto('/programs')
  await PAUSE()
  await expect(page.getByText('Weekly Tutoring Program')).toBeVisible({ timeout: 10000 })
  await PAUSE(1200)

  // ── Open program detail ────────────────────────────────────────────────────
  await page.getByText('Weekly Tutoring Program').click()
  await PAUSE()
  await expect(page).toHaveURL(/\/programs\/\d+/, { timeout: 8000 })
  await PAUSE(1500)

  // Scroll to read description
  await page.evaluate(() => window.scrollBy(0, 200))
  await PAUSE(1200)

  // ── Apply ─────────────────────────────────────────────────────────────────
  await page.getByRole('button', { name: /apply/i }).first().click()
  await PAUSE(800)

  // Fill optional message if a dialog/form appears
  const messageBox = page.locator('textarea').first()
  if (await messageBox.isVisible()) {
    await messageBox.fill('I would like to improve my academic skills and get back on track.')
    await PAUSE(800)
    await page.getByRole('button', { name: /submit|apply|send/i }).last().click()
    await PAUSE()
  }

  // ── Confirm pending status appears ────────────────────────────────────────
  await expect(page.getByText(/pending/i)).toBeVisible({ timeout: 10000 })
  await PAUSE(1200)

  // ── My Services shows the new application ─────────────────────────────────
  await page.goto('/my-services')
  await expect(page.getByText('Weekend Food Pantry Volunteer')).toBeVisible({ timeout: 10000 })
  await PAUSE(2000)
})
