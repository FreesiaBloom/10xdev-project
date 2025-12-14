import { Page, Locator, expect } from "@playwright/test";

/**
 * Base Page Object Model class providing common functionality
 * for all page objects in the application.
 */
export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(url: string): Promise<void> {
    // Add e2e parameter if not already present
    const urlObj = new URL(url, 'http://localhost:4321');
    if (!urlObj.searchParams.has('e2e')) {
      urlObj.searchParams.set('e2e', 'true');
    }
    await this.page.goto(urlObj.pathname + urlObj.search);
  }

  /**
   * Wait for page to be loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get element by test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Get element by role
   */
  getByRole(role: string, options?: { name?: string }): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * Get element by text
   */
  getByText(text: string): Locator {
    return this.page.getByText(text);
  }

  /**
   * Get element by placeholder
   */
  getByPlaceholder(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator): Promise<void> {
    await locator.waitFor({ state: "visible" });
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Check if element is disabled
   */
  async isDisabled(locator: Locator): Promise<boolean> {
    return await locator.isDisabled();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name?: string): Promise<void> {
    await expect(this.page).toHaveScreenshot(name);
  }
}
