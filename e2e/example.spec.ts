import { test, expect } from "@playwright/test";

test("homepage redirects to generate page and shows correct title", async ({ page }) => {
  // Go to homepage with test parameter
  await page.goto("/?e2e=true");

  // Should redirect to generate page
  await expect(page).toHaveURL(/\/generate/);

  // Expect the generate page title
  await expect(page).toHaveTitle(/Wygeneruj fiszki/);

  // Check that we have the main heading
  await expect(page.getByRole("heading", { name: /Wygeneruj fiszki z dowolnego tekstu/ })).toBeVisible();

  // Check that we have navigation links
  const myFlashcardsLink = page.getByRole("link", { name: "Moje fiszki" });
  await expect(myFlashcardsLink).toHaveAttribute("href", "/my-flashcards");
});
