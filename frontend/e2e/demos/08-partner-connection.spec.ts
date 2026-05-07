/**
 * Demo 08 — Org partnership lifecycle
 * Shows: Carol (City Food Bank admin) visits Community Navigation Hub's profile
 * → requests partnership → switch to Nina (nav hub admin) → Partners tab on
 * manage page shows pending request → Accept → both orgs now shown as partners.
 */
import { test, expect, type Locator } from '@playwright/test'
import { cleanupDemoData } from '../helpers/demoCleanup'
import { loginAs } from '../helpers/auth'

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

async function resolveOrgId(page: import('@playwright/test').Page, query: string): Promise<number> {
  const token = await page.evaluate(() => localStorage.getItem('auth_token') ?? '')
  const res = await page.request.get(
    `http://localhost:3001/api/v1/organizations?q=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const { organizations } = await res.json()
  if (!organizations?.[0]) throw new Error(`No org found for query: ${query}`)
  return organizations[0].id
}

test('Org admin requests a partnership and partner accepts', async ({ page }) => {
  // ── Carol logs in as City Food Bank admin ─────────────────────────────────
  await loginAs(page, 'carol@example.com')
  await PAUSE()

  // ── Browse to Community Navigation Hub's profile ──────────────────────────
  const navHubId = await resolveOrgId(page, 'Community Navigation Hub')

  await page.goto(`/organizations/${navHubId}`)
  await PAUSE(1200)

  await expect(page.getByText('Community Navigation Hub')).toBeVisible({ timeout: 10000 })
  await PAUSE(1000)

  // Scroll to the partnership section
  await page.evaluate(() => window.scrollBy(0, 400))
  await PAUSE(1000)

  // Request Partnership button — Carol's admin org is City Food Bank
  const requestBtn = page.getByRole('button', { name: /Request Partnership/i })
  await smoothScrollTo(requestBtn, 800)
  await smoothClick(requestBtn)
  await PAUSE(1500)

  // Button changes to a "Partnership Pending" status badge
  await expect(page.getByText('Partnership Pending')).toBeVisible({
    timeout: 10000,
  })
  await PAUSE(2000)

  // ── Navigator logs in as Community Navigation Hub admin ───────────────────
  await loginAs(page, 'navigator@example.com')
  await PAUSE()

  const navHubId2 = await resolveOrgId(page, 'Community Navigation Hub')
  await page.goto(`/organizations/${navHubId2}/manage`)
  await PAUSE()

  // ── Partners tab ──────────────────────────────────────────────────────────
  await smoothClick(page.getByRole('button', { name: 'Partners' }))
  await PAUSE(1000)

  // Pending request from City Food Bank is visible
  await expect(page.getByText('City Food Bank')).toBeVisible({ timeout: 10000 })
  await PAUSE(1200)

  // Accept the request
  const acceptBtn = page.getByRole('button', { name: /Accept/i }).first()
  await smoothScrollTo(acceptBtn, 800)
  await smoothClick(acceptBtn)
  await PAUSE(1500)

  // City Food Bank now appears in accepted partners list
  await expect(page.getByText('City Food Bank')).toBeVisible({ timeout: 10000 })
  await PAUSE(2000)

  // ── Verify from City Food Bank manage page ────────────────────────────────
  await loginAs(page, 'carol@example.com')
  const foodBankId = await resolveOrgId(page, 'City Food Bank')
  await page.goto(`/organizations/${foodBankId}/manage`)
  await PAUSE()

  await smoothClick(page.getByRole('button', { name: 'Partners' }))
  await PAUSE(1000)

  await expect(page.getByText('Community Navigation Hub')).toBeVisible({ timeout: 10000 })
  await PAUSE(2000)
})
