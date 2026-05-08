/**
 * Demo 12 — Non-Profit Program Lifecycle
 * Shows: Carol (Metro Youth Center admin) manages Summer Job Training program:
 * views cohort → adds a new Fall cohort → adds Jason as member → reviews
 * milestones panel → adds a new milestone → navigates program detail page.
 */
import { test, expect, type Locator } from "@playwright/test";
import { cleanupDemoData } from "../helpers/demoCleanup";
import { loginAs } from "../helpers/auth";

const PAUSE = (ms = 1200) => new Promise((r) => setTimeout(r, ms));

test.beforeEach(({ request }) => cleanupDemoData(request));
test.afterEach(({ request }) => cleanupDemoData(request));

const smoothScrollTo = async (locator: Locator, pauseMs = 700) => {
  await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const margin = 80;
    const isInViewport =
      rect.top >= margin &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight - margin &&
      rect.right <= window.innerWidth;
    if (!isInViewport) {
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  });
  await PAUSE(pauseMs);
};

const smoothClick = async (locator: Locator) => {
  await smoothScrollTo(locator);
  await locator.click();
};

const smoothFill = async (locator: Locator, value: string) => {
  await smoothScrollTo(locator);
  await locator.fill(value);
};

async function resolveOrgId(page: import("@playwright/test").Page, query: string): Promise<number> {
  const token = await page.evaluate(() => localStorage.getItem("auth_token") ?? "");
  const res = await page.request.get(
    `http://localhost:3001/api/v1/organizations?q=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const { organizations } = await res.json();
  if (!organizations?.[0]) throw new Error(`No org found for query: ${query}`);
  return organizations[0].id;
}

async function resolveProgramId(
  page: import("@playwright/test").Page,
  title: string,
): Promise<number> {
  const token = await page.evaluate(() => localStorage.getItem("auth_token") ?? "");
  const res = await page.request.get(
    `http://localhost:3001/api/v1/programs?q=${encodeURIComponent(title)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = await res.json();
  const program = data.programs?.find((p: { title: string }) => p.title === title);
  if (!program) throw new Error(`Program not found: ${title}`);
  return program.id;
}

test("Org admin builds cohorts, tracks milestones, and reviews the program page", async ({
  page,
}) => {
  await loginAs(page, "carol@example.com");
  await PAUSE();

  const youthCenterId = await resolveOrgId(page, "Metro Youth Center");
  const programId = await resolveProgramId(page, "Summer Job Training");

  await page.goto(`/organizations/${youthCenterId}/manage`);
  await PAUSE(1200);

  // ── Programs tab ──────────────────────────────────────────────────────────
  await smoothClick(page.getByRole("button", { name: "Programs" }));
  await PAUSE(1000);

  await expect(page.getByText("Summer Job Training")).toBeVisible({ timeout: 10000 });
  await PAUSE(1500);

  // The program card and its panels (Milestones, Cohort) render in a parent
  // flex-col wrapper. Scope to that wrapper so both sections are reachable.
  const programWrapper = page
    .locator("div.flex.flex-col")
    .filter({ hasText: "Summer Job Training" })
    .first();
  await smoothScrollTo(programWrapper, 1000);

  // ── Milestones panel: show existing milestones ────────────────────────────
  // The toggle button renders below the Card in a sibling div — use the wrapper.
  const milestonesToggle = programWrapper.getByRole("button").filter({ hasText: /milestone/i }).first();
  await smoothClick(milestonesToggle);
  await PAUSE(1000);

  await expect(programWrapper.getByText("Orientation")).toBeVisible({ timeout: 8000 });
  await expect(programWrapper.getByText("Midpoint Check-In")).toBeVisible({ timeout: 8000 });
  await PAUSE(1500);

  // Add a new milestone: Career Fair Prep
  const milestoneInput = programWrapper.getByPlaceholder("New milestone title…");
  await smoothFill(milestoneInput, "Career Fair Prep");
  await PAUSE(600);
  await milestoneInput.press("Enter");
  await PAUSE(2000);

  await expect(programWrapper.getByText("Career Fair Prep").first()).toBeVisible({ timeout: 12000 });
  await PAUSE(1500);

  // ── Cohort panel: show existing cohort ───────────────────────────────────
  const cohortToggle = programWrapper.getByRole("button").filter({ hasText: /cohort/i }).first();
  await smoothClick(cohortToggle);
  await PAUSE(1000);

  await expect(page.getByText("Spring 2026 Cohort")).toBeVisible({ timeout: 8000 });
  await PAUSE(1200);

  // Create a new Fall cohort — click "New Cohort" then submit via Enter
  await smoothClick(page.getByRole("button", { name: /New Cohort/i }).first());
  await PAUSE(700);

  const cohortInput = page.getByPlaceholder(/cohort name/i).first();
  await smoothFill(cohortInput, "Fall 2026 Demo Cohort");
  await PAUSE(600);
  await cohortInput.press("Enter");
  await PAUSE(2000);

  await expect(page.getByText("Fall 2026 Demo Cohort")).toBeVisible({ timeout: 12000 });
  await PAUSE(1500);

  // ── Applications tab: show program has applicants ────────────────────────
  await smoothClick(page.getByRole("button", { name: "Applications" }));
  await PAUSE(1000);

  // Expand Summer Job Training applications
  const summerProgCard = page.locator('[class*="card"], article')
    .filter({ hasText: "Summer Job Training" })
    .first();
  await smoothScrollTo(summerProgCard, 800);

  const viewAppsBtn = summerProgCard.getByRole("button", { name: /view applications/i });
  if (await viewAppsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await smoothClick(viewAppsBtn);
    await PAUSE(1500);
  }
  await PAUSE(1000);

  // ── Public program detail page ────────────────────────────────────────────
  await page.goto(`/programs/${programId}`);
  await PAUSE(1200);

  await expect(page.getByText("Summer Job Training")).toBeVisible({ timeout: 10000 });
  await PAUSE(1200);

  // Scroll down to see program details
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }));
  await PAUSE(1500);

  await expect(page.getByText(/job training/i).first()).toBeVisible({ timeout: 8000 });
  await PAUSE(2000);
});
