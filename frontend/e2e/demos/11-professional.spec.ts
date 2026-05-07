/**
 * Demo 11 — Professional manages their presence and reaches out
 * Shows: professional logs in → browses /professionals directory (filters by
 * Professionals, searches own name) → starts a conversation with a seeker
 * from the directory → updates their profile (bio, availability, specialty) →
 * views the updated profile card on /professionals.
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

test("Professional browses the directory, messages a seeker, and updates profile", async ({
  page,
}) => {
  await loginAs(page, "professional@example.com");
  await PAUSE();

  // ── Browse the People directory ───────────────────────────────────────────
  await page.goto("/professionals");
  await expect(page.getByRole("heading", { name: "People" })).toBeVisible({ timeout: 10000 });
  await PAUSE(1200);

  // Filter to Professionals only
  await smoothClick(page.getByRole("button", { name: "Professionals" }));
  await PAUSE(1000);

  await expect(page.getByRole("heading", { level: 3, name: "Pete Professional" })).toBeVisible({
    timeout: 8000,
  });
  await PAUSE(1200);

  // Search for own profile by specialty
  const searchBox = page.locator('input[placeholder*="Search"]');
  await smoothFill(searchBox, "Social Work");
  await PAUSE(1200);

  await expect(page.getByRole("heading", { level: 3, name: "Pete Professional" })).toBeVisible({
    timeout: 8000,
  });
  await PAUSE(1000);

  // Clear search and view all professionals
  await smoothFill(searchBox, "");
  await PAUSE(800);

  // ── Switch to all-types view and message a navigator ─────────────────────
  await smoothClick(page.getByRole("button", { name: "All" }));
  await PAUSE(800);

  await expect(page.getByText("Nina Navigator")).toBeVisible({ timeout: 10000 });
  await PAUSE(1000);

  const ninaCard = page
    .locator('[class*="card"], article')
    .filter({ hasText: "Nina Navigator" })
    .first();

  await smoothScrollTo(ninaCard);
  await PAUSE(800);

  // Click the message icon on Nina's card
  const messageBtn = ninaCard
    .getByRole("button")
    .filter({ has: page.locator("svg") })
    .first();
  await smoothClick(messageBtn);
  await PAUSE(1500);

  // Routed to conversation
  await expect(page).toHaveURL(/\/messages\/\d+/, { timeout: 10000 });
  await PAUSE(1000);

  const messageBox = page.locator("textarea").last();
  await smoothFill(
    messageBox,
    "Hi Nina, I'm Pete — a licensed social worker specializing in housing. I'd love to collaborate on client referrals.",
  );
  await PAUSE(1000);

  await smoothClick(
    page
      .getByRole("button")
      .filter({ has: page.locator("svg") })
      .last(),
  );
  await PAUSE(1500);

  await expect(page.getByText("Hi Nina, I'm Pete")).toBeVisible({ timeout: 10000 });
  await PAUSE(1500);

  // ── Update profile ────────────────────────────────────────────────────────
  await page.goto("/profile");
  await PAUSE(1200);

  await expect(page.getByRole("heading", { level: 1, name: "Pete Professional" })).toBeVisible({
    timeout: 10000,
  });
  await PAUSE(800);

  // Click Edit
  await smoothClick(page.getByRole("button", { name: /Edit|Edit profile/i }));
  await PAUSE(800);

  // Update bio
  const bioField = page.locator('textarea[name="bio"]').or(page.locator("#bio"));
  await smoothScrollTo(bioField);
  await bioField.fill("");
  await PAUSE(400);
  await bioField.fill(
    "Licensed social worker with 8 years of experience in housing stability, employment coaching, and crisis intervention. Available for referrals and consultations.",
  );
  await PAUSE(800);

  // Update availability
  const availabilitySelect = page
    .locator('select[name="availability"]')
    .or(page.locator("#availability"));
  if (await availabilitySelect.isVisible()) {
    await availabilitySelect.selectOption("flexible");
    await PAUSE(600);
  }

  // Save changes
  await smoothClick(page.getByRole("button", { name: /Save|Save Profile/i }));
  await PAUSE(1500);

  // Profile is now in read mode showing updated bio
  await expect(page.getByText("Licensed social worker with 8 years")).toBeVisible({
    timeout: 10000,
  });
  await PAUSE(1500);

  // ── Confirm updated card appears on /professionals ────────────────────────
  await page.goto("/professionals");
  await PAUSE(1200);

  const updatedCard = page
    .locator('[class*="card"], article')
    .filter({ hasText: "Pete Professional" })
    .first();

  await expect(updatedCard).toBeVisible({ timeout: 10000 });
  await smoothScrollTo(updatedCard, 1000);
  await PAUSE(2000);
});
