/**
 * Demo 10 — Activity feed exploration
 * Shows: org admin logs in → navigates to /feed → scrolls through a rich mix
 * of feed item types (new_opportunity, new_program, application_update,
 * referral, partner_request, announcement) → clicks through to a program item.
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

test('Org admin browses the activity feed and clicks through to an item', async ({ page }) => {
  // Carol is an org admin with the richest feed — orgs she manages have
  // programs, opportunities, applications, and announcements seeded.
  await loginAs(page, 'carol@example.com')
  await PAUSE()

  // ── Activity feed ─────────────────────────────────────────────────────────
  await page.goto('/feed')
  await PAUSE(1200)

  await expect(page.getByRole('heading', { name: 'Activity Feed' })).toBeVisible({ timeout: 10000 })
  await PAUSE(1000)

  // Feed should contain items (seeded opportunities, programs, etc.)
  const feedItems = page.locator('a.rounded-card').first()
  await expect(feedItems).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // Slowly scroll through the feed to show different item types
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }))
  await PAUSE(1200)

  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }))
  await PAUSE(1200)

  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }))
  await PAUSE(1500)

  // ── Click through to a program feed item ──────────────────────────────────
  // Look for any link to a program or opportunity in the feed
  const programLink = page
    .getByRole('link')
    .filter({ hasText: /Summer Job Training|Weekly Tutoring|Food Pantry|Tutoring/i })
    .first()

  const programLinkVisible = await programLink.isVisible()
  if (programLinkVisible) {
    await smoothScrollTo(programLink, 800)
    await smoothClick(programLink)
    await PAUSE(1500)

    // On detail page
    await expect(page).toHaveURL(/\/(programs|opportunities)\/\d+/, { timeout: 8000 })
    await PAUSE(2000)

    // Scroll down to show full detail
    await page.evaluate(() => window.scrollBy(0, 400))
    await PAUSE(1500)
  } else {
    // Scroll back to top and show feed summary if no link found
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
    await PAUSE(1500)
  }
})

test('Navigator sees a personalised feed with referrals and partner activity', async ({ page }) => {
  await loginAs(page, 'navigator@example.com')
  await PAUSE()

  await page.goto('/feed')
  await PAUSE(1200)

  await expect(page.getByRole('heading', { name: 'Activity Feed' })).toBeVisible({ timeout: 10000 })
  await PAUSE(1200)

  // Scroll slowly through to show feed items
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }))
  await PAUSE(1200)

  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }))
  await PAUSE(1500)

  // Navigate to dashboard from feed — shows the full picture
  await page.goto('/dashboard')
  await PAUSE(1500)

  await expect(page.getByRole('heading', { name: /Dashboard|Welcome/i })).toBeVisible({
    timeout: 10000,
  })
  await PAUSE(2000)
})
