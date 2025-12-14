import { test, expect } from "@playwright/test";

test("application loads and shows generate page", async ({ page }) => {
  // Go directly to generate page with test parameter
  await page.goto("/generate?e2e=true");

  // Wait for page to load
  await page.waitForLoadState("networkidle");

  // Expect the generate page title
  await expect(page).toHaveTitle(/Wygeneruj fiszki/);

  // Check that we have the main heading
  await expect(page.getByRole("heading", { name: /Wygeneruj fiszki z dowolnego tekstu/ })).toBeVisible();

  // Check that we have navigation links
  const myFlashcardsLink = page.getByRole("link", { name: "Moje fiszki" });
  await expect(myFlashcardsLink).toHaveAttribute("href", "/my-flashcards");

  // Check that the main form element exists
  await expect(page.locator('[data-testid="source-text-area"]')).toBeVisible();
});
