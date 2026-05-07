/**
 * Demo 07 — User-to-user messaging
 * Shows: seeker browses People directory → clicks message icon on Nina Navigator
 * → lands in conversation thread → sends a message → switches to navigator
 * account → sees unread badge in Messages nav → opens conversation → replies.
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

const smoothFill = async (locator: Locator, value: string) => {
  await smoothScrollTo(locator)
  await locator.fill(value)
}

test('Seeker messages a navigator; navigator sees and replies', async ({ page }) => {
  // ── Seeker: browse People, message Nina Navigator ─────────────────────────
  await loginAs(page, 'jason.intake3@example.com')
  await PAUSE()

  await page.goto('/professionals')
  await expect(page.getByText('Nina Navigator')).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // Filter to Navigators
  await smoothClick(page.getByRole('button', { name: 'Navigators' }))
  await PAUSE(1000)

  await expect(page.getByText('Nina Navigator')).toBeVisible({ timeout: 8000 })
  await PAUSE(1200)

  // Click the message icon on Nina's card
  const ninaCard = page
    .locator('[class*="card"], article')
    .filter({ hasText: 'Nina Navigator' })
    .first()
  await smoothScrollTo(ninaCard)
  await smoothClick(ninaCard.getByRole('button').filter({ has: page.locator('svg') }).first())
  await PAUSE(1500)

  // Routed to conversation thread
  await expect(page).toHaveURL(/\/messages\/\d+/, { timeout: 10000 })
  await PAUSE(1000)

  // Type and send a message
  const messageBox = page.locator('textarea').last()
  await smoothFill(
    messageBox,
    "Hi Nina — I was referred to your caseload and I'd love to connect about next steps for housing support.",
  )
  await PAUSE(1000)

  await smoothClick(page.getByRole('button').filter({ has: page.locator('svg') }).last())
  await PAUSE(1500)

  // Message appears in thread
  await expect(
    page.getByText("Hi Nina — I was referred to your caseload"),
  ).toBeVisible({ timeout: 10000 })
  await PAUSE(2000)

  // ── Navigator: see unread badge, open conversation, reply ─────────────────
  await loginAs(page, 'navigator@example.com', 'password123', '/messages')
  await PAUSE()

  // Unread badge visible on the conversation
  await expect(page.getByText(/1 new/i)).toBeVisible({ timeout: 10000 })
  await PAUSE(1200)

  // Open the conversation
  await smoothClick(page.getByText('Jason Demo').or(page.getByText('jason')).first())
  await expect(page).toHaveURL(/\/messages\/\d+/, { timeout: 8000 })
  await PAUSE(1200)

  // Jason's message is visible
  await expect(
    page.getByText("Hi Nina — I was referred to your caseload"),
  ).toBeVisible({ timeout: 8000 })
  await PAUSE(1000)

  // Reply
  const replyBox = page.locator('textarea').last()
  await smoothFill(
    replyBox,
    "Hi Jason! Great to hear from you. Let's schedule a call this week — I have a few housing programs that might be a great fit.",
  )
  await PAUSE(1000)

  await smoothClick(page.getByRole('button').filter({ has: page.locator('svg') }).last())
  await PAUSE(1500)

  await expect(
    page.getByText("Let's schedule a call this week"),
  ).toBeVisible({ timeout: 10000 })
  await PAUSE(2000)
})
