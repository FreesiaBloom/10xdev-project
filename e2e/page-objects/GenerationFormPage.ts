import { Page, Locator, expect } from "@playwright/test";
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
    this.sourceTextArea = this.getByTestId("source-text-area");
    this.characterCounter = this.getByTestId("character-counter");
    this.submitButton = this.getByTestId("generate-button");
    this.loadingSpinner = this.getByTestId("loading-spinner");
    this.toastContainer = this.page.locator("[data-sonner-toaster]");
  }

  /**
   * Navigate to the generation form page
   */
  async navigateToForm(): Promise<void> {
    await this.goto("/");
    await this.waitForPageLoad();
  }

  /**
   * Enter text into the source text area
   */
  async enterSourceText(text: string): Promise<void> {
    await this.sourceTextArea.clear();
    await this.sourceTextArea.fill(text);
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
    // Wait for loading to start
    await this.waitForElement(this.loadingSpinner);
    // Wait for loading to finish
    await this.loadingSpinner.waitFor({ state: "hidden" });
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
    await this.page.waitForURL(/\/review\/\d+/);
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
