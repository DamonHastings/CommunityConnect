/**
 * Demo 09 — Seeker discovers, saves, and follows an organization
 * Shows: seeker logs in → browses /organizations with search + category filter
 * → opens City Food Bank profile → saves it (bookmark) → follows it (bell) →
 * My Services page shows the saved org in the Saved Organizations section.
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

test("Seeker discovers organizations, saves one, and views it in My Services", async ({ page }) => {
  await loginAs(page, "jason.intake3@example.com");
  await PAUSE();

  // ── Browse organizations ───────────────────────────────────────────────────
  await page.goto("/organizations");
  await PAUSE(1200);

  await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible({
    timeout: 10000,
  });
  await PAUSE(800);

  // Search for "food"
  const searchInput = page.locator('input[placeholder*="Search"]');
  await smoothScrollTo(searchInput);
  await searchInput.fill("food");
  await PAUSE(1500);

  await expect(page.getByText("City Food Bank")).toBeVisible({ timeout: 10000 });
  await PAUSE(1200);

  // Filter by category — food_bank
  const categorySelect = page.locator("select").first();
  await categorySelect.selectOption("food_bank");
  await PAUSE(1200);

  await expect(page.getByText("City Food Bank")).toBeVisible({ timeout: 10000 });
  await PAUSE(1000);

  // ── Open org profile ──────────────────────────────────────────────────────
  await smoothClick(page.getByText("City Food Bank").first());
  await expect(page).toHaveURL(/\/organizations\/\d+/, { timeout: 8000 });
  await PAUSE(1500);

  await expect(page.getByRole("heading", { level: 1, name: "City Food Bank" })).toBeVisible();
  await PAUSE(1000);

  // Scroll down to show description / programs section
  await page.evaluate(() => window.scrollBy(0, 300));
  await PAUSE(1200);

  // ── Save the organization (bookmark) ─────────────────────────────────────
  const saveBtn = page.getByRole("button", { name: /Save|Bookmark/i }).first();
  await smoothScrollTo(saveBtn, 800);
  await smoothClick(saveBtn);
  await PAUSE(1200);

  // Button label or icon updates to indicate saved state
  await expect(page.getByRole("button", { name: /Saved|Unsave/i }).first()).toBeVisible({
    timeout: 8000,
  });
  await PAUSE(1000);

  // ── Follow the organization (bell) ───────────────────────────────────────
  const followBtn = page.getByRole("button", { name: /Follow/i }).first();
  await smoothScrollTo(followBtn, 800);
  await smoothClick(followBtn);
  await PAUSE(1200);

  await expect(page.getByRole("button", { name: /Unfollow|Following/i }).first()).toBeVisible({
    timeout: 8000,
  });
  await PAUSE(1500);

  // ── My Services: Saved Organizations section ──────────────────────────────
  await page.goto("/my-services");
  await PAUSE(1200);

  // Scroll to the saved orgs section
  const savedSection = page.getByText("Saved Organizations").first();
  await smoothScrollTo(savedSection, 1000);

  await expect(page.getByRole("heading", { level: 3, name: "City Food Bank" })).toBeVisible({
    timeout: 10000,
  });
  await PAUSE(2000);
});
