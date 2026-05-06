/**
 * Demo 01 — Seeker onboarding
 * Shows: register as Individual Seeker → complete 3-step intake → land on
 * personalised dashboard with matched organisations.
 */
import { test, expect } from '@playwright/test'

const PAUSE = (ms = 1200) => new Promise((r) => setTimeout(r, ms))

test('Seeker onboarding: register → intake → personalised dashboard', async ({ page }) => {
  const email = `demo_seeker_${Date.now()}@example.com`

  // ── Landing page ──────────────────────────────────────────────────────────
  await page.goto('/')
  await PAUSE()

  await page.getByRole('link', { name: /get started|sign up|register/i }).first().click()
  await PAUSE()

  // ── Register ──────────────────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/register/)
  await page.fill('input[name="first_name"]', 'Alex')
  await PAUSE(600)
  await page.fill('input[name="last_name"]', 'Rivera')
  await PAUSE(600)
  await page.fill('input[name="email"]', email)
  await PAUSE(600)
  await page.fill('input[name="password"]', 'password123')
  await PAUSE(600)
  await page.fill('input[name="password_confirmation"]', 'password123')
  await PAUSE(800)

  // Select "Individual Seeker" profile type card
  await page.getByText('Individual Seeker').click()
  await PAUSE(1000)

  await page.getByRole('button', { name: /create account|sign up|register|get started/i }).click()
  await PAUSE()

  // ── Intake step 1: housing + employment ───────────────────────────────────
  await expect(page).toHaveURL(/\/intake/, { timeout: 10000 })
  await PAUSE(800)

  await page.getByText('I am at risk of losing housing').click()
  await PAUSE(800)
  await page.getByText('Unemployed and looking for work').click()
  await PAUSE(1000)

  await page.getByRole('button', { name: 'Continue' }).click()
  await PAUSE()

  // ── Intake step 2: needs + urgency ────────────────────────────────────────
  await page.getByText('Food & nutrition').click()
  await PAUSE(500)
  await page.getByText('Housing & shelter').click()
  await PAUSE(500)
  await page.getByText('Job training & employment').click()
  await PAUSE(800)

  await page.getByText('Within the next few weeks').click()
  await PAUSE(1000)

  await page.getByRole('button', { name: 'Continue' }).click()
  await PAUSE()

  // ── Intake step 3: goals ──────────────────────────────────────────────────
  await page.locator('textarea').fill('Find stable housing and a steady job so I can support my family.')
  await PAUSE(800)

  await page.getByRole('button', { name: /finish|submit|complete|done/i }).click()
  await PAUSE()

  // ── Dashboard with matches ────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  await PAUSE(1500)

  // Scroll down to show the matched organisations section
  await page.evaluate(() => window.scrollBy(0, 300))
  await PAUSE(1500)
})
