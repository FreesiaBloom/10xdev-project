import { test, expect } from "@playwright/test";

test("homepage has title and links to intro page", async ({ page }) => {
  await page.goto("/?e2e=true");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/10x-astro-starter/);

  // create a locator
  const getStarted = page.getByRole("link", { name: "Get Started" });

  // Expect an attribute "to be truthy".
  await expect(getStarted).toHaveAttribute("href", "/astro");

  // Click the get started link.
  await getStarted.click();

  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/astro/);
});
