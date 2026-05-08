/**
 * Demo 13 — Seeker Program Journey
 * Shows: Jason discovers Summer Job Training → views program detail →
 * applies → navigates to My Services to track approval and milestones
 * → checks off a milestone → adds a personal task.
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

async function resolveProgramId(page: import('@playwright/test').Page, title: string): Promise<number> {
  const token = await page.evaluate(() => localStorage.getItem('auth_token') ?? '')
  const res = await page.request.get(
    `http://localhost:3001/api/v1/programs?q=${encodeURIComponent(title)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const data = await res.json()
  const program = data.programs?.find((p: { title: string }) => p.title === title)
  if (!program) throw new Error(`Program not found: ${title}`)
  return program.id
}

test('Seeker discovers a program, applies, tracks milestones, and adds a task', async ({ page }) => {
  // Jason is a seeded individual seeker with intake completed
  await loginAs(page, 'jason.intake3@example.com', 'password123', '/programs')
  await PAUSE(1200)

  // ── Programs list ─────────────────────────────────────────────────────────
  await expect(page.getByText('Summer Job Training')).toBeVisible({ timeout: 10000 })
  await PAUSE(1500)

  // Search for summer programs to show discovery
  const searchInput = page.getByPlaceholder(/search/i).first()
  if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await smoothFill(searchInput, 'summer')
    await PAUSE(1000)
  }

  // ── Program detail page ───────────────────────────────────────────────────
  const programId = await resolveProgramId(page, 'Summer Job Training')
  await page.goto(`/programs/${programId}`)
  await PAUSE(1200)

  await expect(page.getByText('Summer Job Training')).toBeVisible({ timeout: 10000 })
  await PAUSE(1000)

  // Scroll to show program details
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }))
  await PAUSE(1200)

  // Apply button (Jason may already have a pending/approved application from seed)
  const applyBtn = page.getByRole('button', { name: /apply/i }).first()
  const alreadyApplied = page.getByText(/applied|approved|pending/i).first()

  const hasApplied = await alreadyApplied.isVisible({ timeout: 2000 }).catch(() => false)

  if (!hasApplied && await applyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await smoothClick(applyBtn)
    await PAUSE(800)

    // Application modal or form
    const messageArea = page.getByPlaceholder(/message|tell us/i).first()
    if (await messageArea.isVisible({ timeout: 2000 }).catch(() => false)) {
      await smoothFill(messageArea, 'I am excited to develop job skills and build my career path.')
      await PAUSE(800)
    }

    const submitBtn = page.getByRole('button', { name: /submit|apply/i }).first()
    await smoothClick(submitBtn)
    await PAUSE(1500)
  } else {
    // Application status is already visible — linger on it
    await smoothScrollTo(alreadyApplied, 1200)
  }

  await PAUSE(1500)

  // ── My Services page: track the application ───────────────────────────────
  await page.goto('/my-services')
  await PAUSE(1200)

  await expect(page.getByText('Summer Job Training')).toBeVisible({ timeout: 10000 })
  await PAUSE(1200)

  // Scroll to show program applications section
  const programAppsSection = page.getByText(/program applications/i).first()
  await smoothScrollTo(programAppsSection, 1000)
  await PAUSE(1000)

  // Show milestone progress for the approved application
  const progressBar = page.locator('[class*="bg-indigo"], [class*="progress"], [role="progressbar"]').first()
  if (await progressBar.isVisible({ timeout: 3000 }).catch(() => false)) {
    await smoothScrollTo(progressBar, 1000)
    await PAUSE(1200)
  }

  // ── Tasks section ─────────────────────────────────────────────────────────
  const tasksHeading = page.getByText(/tasks & deadlines/i).first()
  await smoothScrollTo(tasksHeading, 1000)
  await PAUSE(1000)

  // Add a personal task
  const taskInput = page.getByPlaceholder(/new task/i).first()
  if (await taskInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await smoothFill(taskInput, 'Update resume before orientation')
    await PAUSE(600)

    // Set a due date if the field is visible
    const dueDateInput = page.locator('input[type="date"]').first()
    if (await dueDateInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await smoothFill(dueDateInput, '2026-06-15')
      await PAUSE(400)
    }

    await page.keyboard.press('Enter')
    await PAUSE(1500)

    await expect(page.getByText('Update resume before orientation')).toBeVisible({ timeout: 8000 })
    await PAUSE(1500)

    // Mark the task as complete
    const taskRow = page.locator('[class*="task"], li, div')
      .filter({ hasText: 'Update resume before orientation' })
      .first()
    const completeBtn = taskRow.locator('button, [type="checkbox"]').first()
    if (await completeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await smoothClick(completeBtn)
      await PAUSE(1200)
    }
  }

  await PAUSE(2000)
})
