import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for the Generation Form component
 * Handles interactions with the flashcard generation form
 */
export class GenerationFormPage extends BasePage {
  // Locators for form elements
  private readonly sourceTextArea: Locator;
  private readonly characterCounter: Locator;
  private readonly submitButton: Locator;
  private readonly loadingSpinner: Locator;
  private readonly toastContainer: Locator;

  // Constants matching component logic
  private readonly MIN_LENGTH = 1000;
  private readonly MAX_LENGTH = 10000;

  constructor(page: Page) {
    super(page);

    // Initialize locators using data-testid attributes
    this.sourceTextArea = this.page.locator('[data-testid="source-text-area"]');
    this.characterCounter = this.page.locator('[data-testid="character-counter"]');
    this.submitButton = this.page.locator('[data-testid="generate-button"]');
    this.loadingSpinner = this.page.locator('[data-testid="loading-spinner"]');
    this.toastContainer = this.page.locator("[data-sonner-toaster]");
  }

  /**
   * Navigate to the generation form page
   */
  async navigateToForm(): Promise<void> {
    // Add test parameter to URL to ensure test mode
    await this.goto("/generate?e2e=true");
    await this.waitForPageLoad();

    // Wait for React hydration to complete
    await this.page.waitForSelector('[data-testid="source-text-area"]', {
      state: "attached",
      timeout: 20000,
    });

    // Give time for hydration
    await this.page.waitForTimeout(2000);
  }

  /**
   * Check if the form is ready for interaction
   */
  async isFormReady(): Promise<boolean> {
    try {
      await this.page.locator('[data-testid="form-ready"]').waitFor({
        state: "attached",
        timeout: 1000,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for form to be ready with fallback
   */
  async waitForFormReady(): Promise<void> {
    // Element should already be available from navigateToForm
    // Just add a small wait for any remaining async operations
    await this.page.waitForTimeout(500);
  }

  /**
   * Enter text into the source text area
   */
  async enterSourceText(text: string): Promise<void> {
    // Ensure form is ready before interaction
    await this.waitForFormReady();

    // Clear and fill with multiple attempts for reliability
    for (let i = 0; i < 3; i++) {
      try {
        await this.sourceTextArea.clear();
        await this.sourceTextArea.fill(text);

        // Verify the text was actually entered
        const value = await this.sourceTextArea.inputValue();
        if (value === text) {
          return; // Success!
        }
      } catch (error) {
        if (i === 2) throw error; // Last attempt failed
        await this.page.waitForTimeout(1000); // Wait before retry
      }
    }
  }

  /**
   * Get the current character count
   */
  async getCharacterCount(): Promise<number> {
    const counterText = await this.characterCounter.textContent();
    const match = counterText?.match(/(\d+) \/ \d+/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get the maximum character limit
   */
  async getMaxCharacterLimit(): Promise<number> {
    const counterText = await this.characterCounter.textContent();
    const match = counterText?.match(/\d+ \/ (\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Check if the form is valid (text length within limits)
   */
  async isFormValid(): Promise<boolean> {
    const characterCount = await this.getCharacterCount();
    return characterCount >= this.MIN_LENGTH && characterCount <= this.MAX_LENGTH;
  }

  /**
   * Check if the submit button is enabled
   */
  async isSubmitButtonEnabled(): Promise<boolean> {
    return !(await this.isDisabled(this.submitButton));
  }

  /**
   * Check if the form is in loading state
   */
  async isLoading(): Promise<boolean> {
    return await this.isVisible(this.loadingSpinner);
  }

  /**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Fill form and submit
   */
  async fillAndSubmitForm(text: string): Promise<void> {
    await this.enterSourceText(text);
    await this.submitForm();
  }

  /**
   * Wait for form submission to complete
   */
  async waitForSubmissionComplete(): Promise<void> {
    try {
      // Wait for loading to start (but don't fail if it doesn't appear)
      await this.loadingSpinner.waitFor({ state: "visible", timeout: 2000 });
      // Wait for loading to finish
      await this.loadingSpinner.waitFor({ state: "hidden" });
    } catch {
      // If loading spinner never appears, that's OK for error cases
      // This can happen when API requests fail immediately
    }
  }

  /**
   * Check if success toast is visible
   */
  async isSuccessToastVisible(): Promise<boolean> {
    const successToast = this.toastContainer.locator('[data-type="success"]');
    return await this.isVisible(successToast);
  }

  /**
   * Check if error toast is visible
   */
  async isErrorToastVisible(): Promise<boolean> {
    const errorToast = this.toastContainer.locator('[data-type="error"]');
    return await this.isVisible(errorToast);
  }

  /**
   * Get error toast message
   */
  async getErrorToastMessage(): Promise<string | null> {
    const errorToast = this.toastContainer.locator('[data-type="error"]');
    return await errorToast.textContent();
  }

  /**
   * Wait for navigation to review page
   */
  async waitForNavigationToReview(): Promise<void> {
    // Wait for navigation with longer timeout
    await this.page.waitForURL(/\/review\/\d+/, { timeout: 15000 });
  }

  /**
   * Verify form validation states
   */
  async verifyFormValidation(): Promise<{
    isValid: boolean;
    isButtonEnabled: boolean;
    characterCount: number;
  }> {
    return {
      isValid: await this.isFormValid(),
      isButtonEnabled: await this.isSubmitButtonEnabled(),
      characterCount: await this.getCharacterCount(),
    };
  }

  /**
   * Generate text of specific length for testing
   */
  generateTestText(length: number): string {
    const baseText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
    const repetitions = Math.ceil(length / baseText.length);
    return baseText.repeat(repetitions).substring(0, length);
  }

  /**
   * Test scenarios helper methods
   */
  async testMinimumLengthValidation(): Promise<void> {
    const shortText = this.generateTestText(this.MIN_LENGTH - 1);
    await this.enterSourceText(shortText);

    const validation = await this.verifyFormValidation();
    expect(validation.isValid).toBe(false);
    expect(validation.isButtonEnabled).toBe(false);
    expect(validation.characterCount).toBe(this.MIN_LENGTH - 1);
  }

  async testMaximumLengthValidation(): Promise<void> {
    const longText = this.generateTestText(this.MAX_LENGTH + 1);
    await this.enterSourceText(longText);

    const validation = await this.verifyFormValidation();
    expect(validation.characterCount).toBeLessThanOrEqual(this.MAX_LENGTH);
  }

  async testValidLengthSubmission(): Promise<void> {
    const validText = this.generateTestText(this.MIN_LENGTH + 100);
    await this.fillAndSubmitForm(validText);

    await this.waitForSubmissionComplete();
    await this.waitForNavigationToReview();

    expect(this.getCurrentUrl()).toMatch(/\/review\/\d+/);
  }
}
