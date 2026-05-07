/**
 * Demo 04 — Resource Navigator manages caseload and sends a referral
 * Shows: /caseload with two seeded clients → open Jason's inline Refer panel
 * (default: Program) → search "summer" → select Summer Job Training → add
 * message → Send referral → panel closes → Add client flow.
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

test("Navigator manages caseload and sends an inline referral", async ({ page }) => {
  await loginAs(page, "navigator@example.com");
  await page.goto("/caseload");
  await PAUSE();

  // ── Caseload overview ─────────────────────────────────────────────────────
  await expect(page.getByText(/jason testuser/i)).toBeVisible({ timeout: 10000 });
  await PAUSE(1500);

  // ── Inline refer panel on Jason's card ────────────────────────────────────
  // The ReferPanel defaults to "Program" — no need to toggle
  const jasonCard = page
    .locator('div[class*="card"], article')
    .filter({ hasText: /jason/i })
    .first();

  await smoothScrollTo(jasonCard);
  await smoothClick(jasonCard.getByRole("button", { name: /^Refer$/ }));
  await PAUSE(1000);

  // "Refer to…" heading is now visible
  await expect(page.getByText("Refer to…")).toBeVisible({ timeout: 8000 });
  await PAUSE(800);

  // Search for the summer program (placeholder is "Search programs…")
  await smoothFill(page.getByPlaceholder("Search programs…"), "summer");
  await PAUSE(1200);

  await smoothClick(page.getByText("Summer Job Training"));
  await PAUSE(800);

  // Add a message
  await smoothFill(
    page.getByPlaceholder("Optional message for the client…"),
    "This program aligns perfectly with Jason's employment goals.",
  );
  await PAUSE(1000);

  // Send the referral
  await smoothClick(page.getByRole("button", { name: "Send referral" }));
  await PAUSE(1500);

  // Panel closes — Refer button visible again on Jason's card
  await expect(jasonCard.getByRole("button", { name: /^Refer$/ })).toBeVisible({ timeout: 10000 });
  await PAUSE(1500);

  // ── Add a new client ──────────────────────────────────────────────────────
  await smoothClick(page.getByRole("button", { name: "Add client" }));
  await PAUSE(800);

  await smoothFill(page.getByPlaceholder("Search by name or email…"), "professional");
  await PAUSE(1200);

  // Click the first suggestion row
  await smoothClick(page.getByText("professional@example.com"));
  await PAUSE(1500);

  // New card appears in the list
  await expect(
    page
      .getByText("Professional offering services")
      .or(page.getByText(/professional@example\.com/i)),
  ).toBeVisible({ timeout: 10000 });
  await PAUSE(2000);
});
