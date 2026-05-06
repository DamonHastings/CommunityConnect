/**
 * Demo 05 — Org admin manages City Food Bank
 * Shows: manage page → Applications tab (review seeded apps) → approve
 * Jason's pending application → Announcements tab → post a new announcement
 * → create a new volunteer opportunity.
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

test('Org admin reviews applications, posts an announcement, and adds an opportunity', async ({ page }) => {
  await loginAs(page, 'carol@example.com')
  await PAUSE()

  // ── Resolve City Food Bank org ID via API ─────────────────────────────────
  const token = await page.evaluate(() => localStorage.getItem('auth_token') ?? '')
  const res = await page.request.get('http://localhost:3001/api/v1/organizations?q=City+Food+Bank', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const { organizations } = await res.json()
  const orgId: number = organizations[0].id

  await page.goto(`/organizations/${orgId}/manage`)
  await PAUSE()

  // ── Applications tab (default active tab) ─────────────────────────────────
  await expect(page.getByText('Weekend Food Pantry Volunteer')).toBeVisible({ timeout: 10000 })
  await PAUSE(1200)

  // Scroll down to show Jason's application row
  const jasonRow = page
    .locator('tr, article, [class*="row"]')
    .filter({ hasText: /jason/i })
    .first()
  await smoothScrollTo(jasonRow, 1000)

  // ── Approve Jason's application ───────────────────────────────────────────
  await smoothClick(jasonRow.getByRole('button', { name: 'Approve' }))
  await PAUSE(1500)

  await expect(jasonRow.getByText('approved')).toBeVisible({ timeout: 10000 })
  await PAUSE(1200)

  // ── Announcements tab ─────────────────────────────────────────────────────
  await smoothClick(page.getByRole('button', { name: 'Announcements' }))
  await PAUSE(1000)

  await smoothClick(page.getByRole('button', { name: 'Post Announcement' }))
  await PAUSE(800)

  await smoothFill(page.getByPlaceholder('Announcement title'), 'Summer Volunteer Drive — Join Us!')
  await PAUSE(600)

  // Body textarea has no placeholder — target by its label
  await smoothFill(
    page.locator('label').filter({ hasText: 'Body' }).locator('~ textarea, + textarea').or(
      page.locator('textarea').last()
    ),
    'We are ramping up our summer food distribution. Volunteers needed every Saturday 9 am – 1 pm.',
  )
  await PAUSE(1000)

  await smoothClick(page.getByRole('button', { name: 'Publish' }))
  await PAUSE(1500)

  await expect(page.getByText('Summer Volunteer Drive — Join Us!')).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // ── Create a new volunteer opportunity ────────────────────────────────────
  await page.goto(`/organizations/${orgId}/opportunities/new`)
  await PAUSE()

  await smoothFill(page.locator('input[name="title"]'), 'Holiday Food Box Packing')
  await PAUSE(600)

  await smoothClick(page.locator('select[name="opportunity_type"]'))
  await page.locator('select[name="opportunity_type"]').selectOption('volunteer')
  await PAUSE(600)

  await smoothFill(
    page.locator('textarea').first(),
    "Help us pack holiday food boxes for 500 local families. No experience needed — just bring your energy!",
  )
  await PAUSE(1000)

  await smoothClick(page.getByRole('button', { name: 'Create opportunity' }))
  await PAUSE(1500)

  await expect(page.getByText('Holiday Food Box Packing')).toBeVisible({ timeout: 10000 })
  await PAUSE(2000)
})
