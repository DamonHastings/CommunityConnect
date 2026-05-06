/**
 * Demo 05 — Org admin manages City Food Bank
 * Shows: manage page → Applications tab (review seeded apps) → approve
 * Jason's application → Announcements tab → post a new announcement →
 * Opportunities tab → post a new opportunity.
 */
import { test, expect } from '@playwright/test'
import { loginAs } from '../helpers/auth'

const PAUSE = (ms = 1200) => new Promise((r) => setTimeout(r, ms))

test('Org admin reviews applications, posts an announcement, and adds an opportunity', async ({ page }) => {
  await loginAs(page, 'carol@example.com')
  await PAUSE()

  // ── Resolve City Food Bank org ID ─────────────────────────────────────────
  const token = await page.evaluate(() => localStorage.getItem('auth_token') ?? '')
  const res = await page.request.get('http://localhost:3001/api/v1/organizations?q=City+Food+Bank', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const { organizations } = await res.json()
  const orgId: number = organizations[0].id

  await page.goto(`/organizations/${orgId}/manage`)
  await PAUSE()

  // ── Applications tab ──────────────────────────────────────────────────────
  await expect(page.getByText('Applications')).toBeVisible({ timeout: 10000 })
  await PAUSE(800)

  // Click the Applications tab (it is active by default, but make it explicit)
  await page.getByRole('button', { name: /^applications$/i })
    .or(page.getByText(/^applications$/i)).first().click()
  await PAUSE(1000)

  await expect(page.getByText('Weekend Food Pantry Volunteer')).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // Scroll to show application cards
  await page.evaluate(() => window.scrollBy(0, 200))
  await PAUSE(1000)

  // ── Approve Jason's application ───────────────────────────────────────────
  const jasonRow = page.locator('tr, [class*="row"], article').filter({ hasText: /jason/i }).first()
  await jasonRow.getByRole('button', { name: /approve/i }).click()
  await PAUSE(1500)

  await expect(jasonRow.getByText(/approved/i)).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // ── Announcements tab ─────────────────────────────────────────────────────
  await page.getByRole('button', { name: /^announcements$/i })
    .or(page.getByText(/^announcements$/i)).first().click()
  await PAUSE(1000)

  await page.getByRole('button', { name: /post announcement/i }).click()
  await PAUSE(800)

  await page.getByPlaceholder('Announcement title').fill('Summer Volunteer Drive — Join Us!')
  await PAUSE(600)

  const bodyInput = page.locator('textarea[name="body"]').or(page.locator('textarea')).first()
  await bodyInput.fill(
    'We are ramping up our summer food distribution. Volunteers are needed every Saturday from 9 am to 1 pm.'
  )
  await PAUSE(1000)

  await page.getByRole('button', { name: /publish|post|save/i }).last().click()
  await PAUSE(1500)

  await expect(page.getByText('Summer Volunteer Drive — Join Us!')).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // ── Opportunities tab: post a new opportunity ─────────────────────────────
  await page.goto(`/organizations/${orgId}/opportunities/new`)
  await PAUSE()

  await page.fill('input[name="title"]', 'Holiday Food Box Packing')
  await PAUSE(600)

  await page.locator('select[name="opportunity_type"]').or(
    page.locator('[name="opportunity_type"]')
  ).selectOption('volunteer')
  await PAUSE(600)

  const descField = page.locator('textarea[name="description"]').or(page.locator('textarea')).first()
  await descField.fill('Help us pack holiday food boxes for 500 local families. No experience needed — just bring your energy!')
  await PAUSE(1000)

  await page.getByRole('button', { name: /publish|create|post|save/i }).click()
  await PAUSE(1500)

  await expect(page.getByText('Holiday Food Box Packing')).toBeVisible({ timeout: 10000 })
  await PAUSE(2000)
})
