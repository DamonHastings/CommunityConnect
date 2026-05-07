/**
 * Demo 06 — New org admin registers and creates their organization
 * Shows: register as Community Org → land on dashboard → create organization
 * (name / type / category / description / mission / contact / location) →
 * view org profile → create first volunteer opportunity from manage page.
 */
import { test, expect, type Locator } from "@playwright/test";
import { cleanupDemoData } from "../helpers/demoCleanup";

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

test("Org admin registers and creates their organization", async ({ page }) => {
  const email = `demo_org_${Date.now()}@example.com`;

  // ── Register as Community Org ─────────────────────────────────────────────
  await page.goto("/register");
  await PAUSE();

  await smoothFill(page.locator('input[name="first_name"]'), "Morgan");
  await PAUSE(500);
  await smoothFill(page.locator('input[name="last_name"]'), "Chen");
  await PAUSE(500);
  await smoothFill(page.locator('input[name="email"]'), email);
  await PAUSE(500);
  await smoothFill(page.locator('input[name="password"]'), "password123");
  await PAUSE(500);
  await smoothFill(page.locator('input[name="password_confirmation"]'), "password123");
  await PAUSE(800);

  await smoothClick(page.getByRole("button", { name: /Continue/i }));
  await PAUSE();

  // Select "Community Org" profile type
  await smoothClick(page.getByRole("heading", { name: "Community organization", exact: true }));
  await PAUSE(1000);

  await smoothClick(page.getByRole("button", { name: "Create Account" }).first());
  await PAUSE();

  await expect(page).toHaveURL(/\/profile/, { timeout: 10000 });
  await expect(page.getByRole("heading", { level: 1, name: "Morgan Chen" })).toBeVisible();
  await PAUSE(1500);

  await smoothClick(page.locator('a[href="/dashboard"]'));
  await PAUSE(1500);

  // ── Dashboard ─────────────────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  await PAUSE(1200);

  // ── Navigate to create org ────────────────────────────────────────────────
  await page.goto("/organizations/new");
  await PAUSE();

  // ── Fill out org form ─────────────────────────────────────────────────────
  await smoothFill(page.locator('input[name="name"]'), "Westside Housing Alliance");
  await PAUSE(600);

  // Organization type select
  await page.locator('select[name="org_type"]').selectOption("nonprofit");
  await PAUSE(600);

  // Category select
  await page.locator('select[name="category"]').selectOption("housing");
  await PAUSE(800);

  // Description textarea
  await smoothFill(
    page.locator("textarea").first(),
    "We provide affordable housing resources, rental assistance, and tenant advocacy for low-income families across Portland.",
  );
  await PAUSE(800);

  // Mission textarea
  await smoothFill(
    page.locator("textarea").nth(1),
    "Every family deserves a stable, safe, and affordable place to call home.",
  );
  await PAUSE(800);

  await smoothScrollTo(page.locator('input[name="contact_email"]'));
  await smoothFill(page.locator('input[name="contact_email"]'), "info@westsidehousing.org");
  await PAUSE(500);
  await smoothFill(page.locator('input[name="phone"]'), "503-555-0199");
  await PAUSE(500);
  await smoothFill(page.locator('input[name="address"]'), "1450 NW 23rd Ave");
  await PAUSE(500);
  await smoothFill(page.locator('input[name="city"]'), "Portland");
  await PAUSE(400);
  await smoothFill(page.locator('input[name="state"]'), "OR");
  await PAUSE(400);
  await smoothFill(page.locator('input[name="zip"]'), "97210");
  await PAUSE(800);

  // Submit
  await smoothClick(page.getByRole("button", { name: "Create organization" }));
  await PAUSE(1500);

  // ── Org profile page ──────────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/organizations\/\d+$/, { timeout: 10000 });
  await expect(page.getByText("Westside Housing Alliance")).toBeVisible();
  await PAUSE(1500);

  await page.evaluate(() => window.scrollBy(0, 300));
  await PAUSE(1200);

  // ── Navigate to manage → create first opportunity ─────────────────────────
  const orgUrl = page.url();
  const orgId = orgUrl.split("/").pop();
  await page.goto(`/organizations/${orgId}/manage`);
  await PAUSE();

  // Click Opportunities tab
  await smoothClick(page.getByRole("button", { name: "Opportunities" }));
  await PAUSE(800);

  // Navigate to new opportunity form
  await page.goto(`/organizations/${orgId}/opportunities/new`);
  await PAUSE();

  await smoothFill(page.locator('input[name="title"]'), "Tenant Rights Workshop Facilitator");
  await PAUSE(600);

  await page.locator('select[name="opportunity_type"]').selectOption("volunteer");
  await PAUSE(600);

  await smoothFill(
    page.locator("textarea").first(),
    "Help us facilitate monthly workshops educating tenants on their rights. Training provided — no legal background needed.",
  );
  await PAUSE(1000);

  await smoothClick(page.getByRole("button", { name: "Create opportunity" }));
  await PAUSE(1500);

  await expect(page.getByText("Tenant Rights Workshop Facilitator")).toBeVisible({
    timeout: 10000,
  });
  await PAUSE(2000);
});
