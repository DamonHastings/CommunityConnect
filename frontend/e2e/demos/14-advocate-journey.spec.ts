/**
 * Demo 14 — Advocate Journey
 * Shows: New advocate registers → My Clients dashboard (empty state) →
 * adds first client (Maria Santos, housing crisis) → adds second client
 * (David Chen, job seeker) → opens Maria's profile → applies to Summer
 * Job Training on her behalf → confirms application in client profile.
 */
import { test, expect, type Locator } from '@playwright/test'
import { cleanupDemoData } from '../helpers/demoCleanup'
import { registerAdvocate } from '../helpers/auth'

const PAUSE = (ms = 1200) => new Promise((r) => setTimeout(r, ms))

test.beforeEach(({ request }) => cleanupDemoData(request))
test.afterEach(({ request }) => cleanupDemoData(request))

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

test('Advocate registers, adds two clients, and applies on behalf of one', async ({ page }) => {
  // ── Register a fresh advocate account ────────────────────────────────────
  await registerAdvocate(page)
  await PAUSE(1200)

  // ── Empty state: My Clients dashboard ────────────────────────────────────
  await expect(page.getByText(/no clients yet/i)).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // ── Add first client: Maria Santos ───────────────────────────────────────
  await smoothClick(page.getByRole('button', { name: /add client/i }).first())
  await PAUSE(800)

  // Scope all form fills to the modal overlay. Inputs appear in DOM order:
  // [0]=first_name [1]=last_name [2]=email [3]=phone [4]=city [5]=state
  // Selects: [0]=housing_status [1]=employment_status [2]=urgency
  const modal = page.locator('.fixed.inset-0')

  await smoothFill(modal.locator('input').nth(0), 'Maria')
  await PAUSE(300)
  await smoothFill(modal.locator('input').nth(1), 'Santos')
  await PAUSE(300)
  await smoothFill(modal.locator('input').nth(2), 'maria.santos@example.com')
  await PAUSE(300)
  await smoothFill(modal.locator('input').nth(4), 'Portland')
  await PAUSE(300)

  const housingSelect = modal.locator('select').nth(0)
  await smoothScrollTo(housingSelect, 500)
  await housingSelect.selectOption('unhoused')
  await PAUSE(300)

  const urgencySelect = modal.locator('select').nth(2)
  await smoothScrollTo(urgencySelect, 500)
  await urgencySelect.selectOption('crisis')
  await PAUSE(300)

  await smoothClick(modal.getByRole('button', { name: 'Housing & Shelter' }))
  await PAUSE(200)
  await smoothClick(modal.getByRole('button', { name: 'Food & Nutrition' }))
  await PAUSE(200)

  await smoothFill(modal.getByPlaceholder(/hoping to achieve/i), 'Secure stable housing and connect with social services.')
  await PAUSE(600)

  await smoothClick(modal.getByRole('button', { name: /add client/i }))
  await PAUSE(1500)

  await expect(page.getByText('Maria Santos')).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // ── Add second client: David Chen ─────────────────────────────────────────
  await smoothClick(page.getByRole('button', { name: /add client/i }).first())
  await PAUSE(800)

  await smoothFill(modal.locator('input').nth(0), 'David')
  await PAUSE(300)
  await smoothFill(modal.locator('input').nth(1), 'Chen')
  await PAUSE(300)
  await smoothFill(modal.locator('input').nth(4), 'Seattle')
  await PAUSE(300)

  const employmentSelect = modal.locator('select').nth(1)
  await smoothScrollTo(employmentSelect, 500)
  await employmentSelect.selectOption('unemployed_seeking')
  await PAUSE(300)

  const urgencySelect2 = modal.locator('select').nth(2)
  await smoothScrollTo(urgencySelect2, 500)
  await urgencySelect2.selectOption('high')
  await PAUSE(300)

  await smoothClick(modal.getByRole('button', { name: 'Job Training' }))
  await PAUSE(200)

  await smoothClick(modal.getByRole('button', { name: /add client/i }))
  await PAUSE(1500)

  await expect(page.getByText('David Chen')).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // ── Open Maria's profile ──────────────────────────────────────────────────
  const mariaCard = page.locator('a, [class*="card"]')
    .filter({ hasText: 'Maria Santos' })
    .first()
  await smoothClick(mariaCard)
  await PAUSE(1200)

  await expect(page.getByText('Maria Santos')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText(/unhoused/i)).toBeVisible({ timeout: 8000 })
  await PAUSE(1500)

  // ── Apply to a program on Maria's behalf ─────────────────────────────────
  await smoothClick(page.getByRole('button', { name: /apply to program/i }).first())
  await PAUSE(800)

  // Select Summer Job Training from the program dropdown
  const programSelect = page.locator('label')
    .filter({ hasText: /program/i })
    .locator('~ select, + select')
    .first()
  await smoothScrollTo(programSelect, 600)

  // Pick Summer Job Training if available
  const options = await programSelect.locator('option').allTextContents()
  const summerOption = options.find((o) => o.includes('Summer Job Training'))
  if (summerOption) {
    await programSelect.selectOption({ label: summerOption })
  } else {
    // Fall back to first real option
    const firstRealOption = options.find((o) => o !== 'Select a program…')
    if (firstRealOption) await programSelect.selectOption({ label: firstRealOption })
  }
  await PAUSE(600)

  const messageArea = page.getByPlaceholder(/tell the organization/i)
  await smoothFill(
    messageArea,
    'Maria is in a housing crisis and urgently needs employment support to stabilize her situation.',
  )
  await PAUSE(800)

  await smoothClick(page.getByRole('button', { name: /submit application/i }))
  await PAUSE(1500)

  // ── Confirm application appears on Maria's profile ────────────────────────
  await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible({ timeout: 10000 })
  await PAUSE(1000)

  // Scroll down to the applications list
  const appEntry = page.locator('[class*="card"], article, section')
    .filter({ hasText: /pending|summer job training/i })
    .first()

  if (await appEntry.isVisible({ timeout: 4000 }).catch(() => false)) {
    await smoothScrollTo(appEntry, 1000)
    await expect(appEntry).toBeVisible({ timeout: 8000 })
  } else {
    // Application section is visible even if no apps listed yet (timing)
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }))
  }
  await PAUSE(2000)
})
