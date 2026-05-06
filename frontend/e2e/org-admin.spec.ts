import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Org admin flows (carol@example.com)', () => {
  let orgId: number

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'carol@example.com')
    // Resolve City Food Bank org ID dynamically
    const res = await page.request.get('http://localhost:3001/api/v1/organizations?q=City+Food+Bank', {
      headers: { Authorization: `Bearer ${await getToken(page)}` },
    })
    const data = await res.json()
    orgId = data.organizations[0].id
  })

  test('can post a new opportunity', async ({ page }) => {
    await page.goto(`/organizations/${orgId}/opportunities/new`)

    await page.fill('input[name="title"]', 'Holiday Volunteer Drive')
    await page.locator('select[name="opportunity_type"]').selectOption('volunteer')

    await page.getByRole('button', { name: /publish|create|submit/i }).click()

    await expect(page.getByText('Holiday Volunteer Drive')).toBeVisible({ timeout: 10000 })
  })

  test('manage page Applications tab shows seeded applications', async ({ page }) => {
    await page.goto(`/organizations/${orgId}/manage`)

    await page.getByRole('tab', { name: /applications/i })
      .or(page.getByRole('button', { name: /applications/i })).click()

    await expect(page.getByText('Weekend Food Pantry Volunteer')).toBeVisible({ timeout: 10000 })
  })

  test('can approve a pending application', async ({ page }) => {
    await page.goto(`/organizations/${orgId}/manage`)

    await page.getByRole('tab', { name: /applications/i })
      .or(page.getByRole('button', { name: /applications/i })).click()

    // Find jason's pending application and approve it
    const appRow = page.locator('tr, [data-testid="application-row"]', { hasText: /jason/i }).first()
    await appRow.getByRole('button', { name: /approve/i }).click()

    await expect(appRow.getByText(/approved/i)).toBeVisible({ timeout: 10000 })
  })

  test('can post an announcement', async ({ page }) => {
    await page.goto(`/organizations/${orgId}/manage`)

    await page.getByRole('tab', { name: /announcement/i })
      .or(page.getByRole('button', { name: /announcement/i })).click()

    const title = `Test Announcement ${Date.now()}`
    await page.fill('input[name="title"]', title)
    await page.locator('textarea[name="body"]').or(page.locator('textarea')).first().fill('Important update for our community.')

    await page.getByRole('button', { name: /publish|post|submit/i }).click()

    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })
  })
})

async function getToken(page: import('@playwright/test').Page): Promise<string> {
  return page.evaluate(() => localStorage.getItem('auth_token') ?? '')
}
