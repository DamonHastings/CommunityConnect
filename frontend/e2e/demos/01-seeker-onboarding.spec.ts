/**
 * Demo 01 — Seeker onboarding
 * Shows: register as Individual Seeker → complete 3-step intake → land on
 * personalised dashboard with matched organisations.
 */
import { test, expect, type Locator } from "@playwright/test";

const PAUSE = (ms = 1200) => new Promise((r) => setTimeout(r, ms));

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

test("Seeker onboarding: register → intake → personalised dashboard", async ({ page }) => {
  const email = `demo_seeker_${Date.now()}@example.com`;

  // ── Landing page ──────────────────────────────────────────────────────────
  await page.goto("/");
  await PAUSE();

  await smoothClick(page.getByRole("link", { name: /get started|sign up|register/i }).first());
  await PAUSE();

  // ── Register ──────────────────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/register/);
  await smoothFill(page.locator('input[name="first_name"]'), "Alex");
  await PAUSE(600);
  await smoothFill(page.locator('input[name="last_name"]'), "Rivera");
  await PAUSE(600);
  await smoothFill(page.locator('input[name="email"]'), email);
  await PAUSE(600);
  await smoothFill(page.locator('input[name="password"]'), "password123");
  await PAUSE(600);
  await smoothFill(page.locator('input[name="password_confirmation"]'), "password123");
  await PAUSE(800);
  await smoothClick(page.getByRole("button", { name: /Continue/i }));
  await PAUSE();

  // Select "Individual Seeker" profile type card
  await smoothClick(page.getByText("Individual Seeking Resources"));
  await PAUSE(1000);

  // Attempt all common registration call-to-action patterns in order; tolerate label changes
  const registrationButton = page.getByRole("button", { name: "Create Account" }).first();
  await smoothClick(registrationButton);
  await PAUSE();

  // ── Intake step 1: housing + employment ───────────────────────────────────
  await expect(page).toHaveURL(/\/intake/, { timeout: 10000 });
  await PAUSE(800);

  await smoothClick(page.getByText("I am at risk of losing housing"));
  await PAUSE(800);
  await smoothClick(page.getByText("Unemployed and looking for work"));
  await PAUSE(1000);

  await smoothClick(page.getByRole("button", { name: "Continue" }));
  await PAUSE();

  // ── Intake step 2: needs + urgency ────────────────────────────────────────
  await smoothClick(page.getByText("Food & nutrition"));
  await PAUSE(500);
  await smoothClick(page.getByText("Housing & shelter"));
  await PAUSE(500);
  await smoothClick(page.getByText("Job training & employment"));
  await PAUSE(800);

  await smoothClick(page.getByText("Within the next few weeks"));
  await PAUSE(1000);

  await smoothClick(page.getByRole("button", { name: "Continue" }));
  await PAUSE();

  // ── Intake step 3: goals ──────────────────────────────────────────────────
  await smoothFill(
    page.locator("#intake-goals"),
    "Find stable housing and a steady job so I can support my family.",
  );
  await PAUSE(800);

  await smoothClick(page.getByRole("button", { name: /finish|submit|complete|done/i }));
  await PAUSE();

  // ── Dashboard with matches ────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  await PAUSE(1500);

  // Scroll down to show the matched organisations section.
  await smoothScrollTo(page.getByRole("heading", { name: "Matched for you" }), 1000);
  await PAUSE(1500);
});
