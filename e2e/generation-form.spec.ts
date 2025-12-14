import { test, expect } from "@playwright/test";
import { GenerationFormPage } from "./page-objects/GenerationFormPage";

test.describe("Generation Form", () => {
  let generationFormPage: GenerationFormPage;

  test.beforeEach(async ({ page }) => {
    generationFormPage = new GenerationFormPage(page);
    await generationFormPage.navigateToForm();
  });

  test.describe("Form Validation", () => {
    test("should disable submit button when text is too short", async () => {
      // Arrange
      const shortText = generationFormPage.generateTestText(500);

      // Act
      await generationFormPage.enterSourceText(shortText);

      // Assert
      const validation = await generationFormPage.verifyFormValidation();
      expect(validation.isValid).toBe(false);
      expect(validation.isButtonEnabled).toBe(false);
      expect(validation.characterCount).toBe(500);
    });

    test("should enable submit button when text length is valid", async () => {
      // Arrange
      const validText = generationFormPage.generateTestText(1500);

      // Act
      await generationFormPage.enterSourceText(validText);

      // Assert
      const validation = await generationFormPage.verifyFormValidation();
      expect(validation.isValid).toBe(true);
      expect(validation.isButtonEnabled).toBe(true);
      expect(validation.characterCount).toBe(1500);
    });

    test("should enforce maximum character limit", async () => {
      // Arrange
      const longText = generationFormPage.generateTestText(15000);

      // Act
      await generationFormPage.enterSourceText(longText);

      // Assert
      const validation = await generationFormPage.verifyFormValidation();
      expect(validation.characterCount).toBeLessThanOrEqual(10000);
    });

    test("should update character counter in real time", async () => {
      // Arrange
      const testText = "Hello World";

      // Act
      await generationFormPage.enterSourceText(testText);

      // Assert
      const characterCount = await generationFormPage.getCharacterCount();
      expect(characterCount).toBe(testText.length);
    });
  });

  test.describe("Form Submission", () => {
    test("should show loading state during submission", async () => {
      // Arrange
      const validText = generationFormPage.generateTestText(2000);
      await generationFormPage.enterSourceText(validText);

      // Act
      await generationFormPage.submitForm();

      // Assert
      const isLoading = await generationFormPage.isLoading();
      expect(isLoading).toBe(true);
    });

    test("should navigate to review page on successful submission", async () => {
      // Arrange
      const validText = generationFormPage.generateTestText(2000);

      // Act
      await generationFormPage.fillAndSubmitForm(validText);
      await generationFormPage.waitForSubmissionComplete();

      // Assert
      await generationFormPage.waitForNavigationToReview();
      expect(generationFormPage.getCurrentUrl()).toMatch(/\/review\/\d+/);
    });

    test("should show error toast on submission failure", async ({ page }) => {
      // Arrange
      const validText = generationFormPage.generateTestText(2000);

      // Mock API to return error
      await page.route("/api/generations", (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      });

      // Act
      await generationFormPage.fillAndSubmitForm(validText);
      await generationFormPage.waitForSubmissionComplete();

      // Assert
      const isErrorVisible = await generationFormPage.isErrorToastVisible();
      expect(isErrorVisible).toBe(true);
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper form labels and structure", async () => {
      // Assert
      const textArea = generationFormPage.getByTestId("source-text-area");
      const submitButton = generationFormPage.getByTestId("generate-button");

      await expect(textArea).toHaveAttribute("placeholder", "Wklej tutaj swój tekst...");
      await expect(submitButton).toHaveAttribute("type", "submit");
    });

    test("should disable form elements during loading", async () => {
      // Arrange
      const validText = generationFormPage.generateTestText(2000);
      await generationFormPage.enterSourceText(validText);

      // Act
      await generationFormPage.submitForm();

      // Assert
      const textArea = generationFormPage.getByTestId("source-text-area");
      await expect(textArea).toBeDisabled();
    });
  });

  test.describe("Visual Regression", () => {
    test("should match visual snapshot of empty form", async ({ page }) => {
      // Wait for form to be fully loaded and stable
      await page.waitForTimeout(2000);

      // Wait for all fonts and images to load
      await page.waitForLoadState("networkidle");

      // Ensure form is in stable state
      await expect(page.locator('[data-testid="source-text-area"]')).toBeVisible();

      // Hide dynamic content that might change between runs
      await page.addStyleTag({
        content: `
          [data-astro-source-file] { display: none !important; }
          [data-astro-source-loc] { display: none !important; }
        `,
      });

      // Assert - be more tolerant on first run for CI
      try {
        await expect(page).toHaveScreenshot("generation-form-empty.png", {
          threshold: 0.3,
        });
      } catch (error) {
        // If snapshot doesn't exist on this platform, create it
        if (error.message.includes("doesn't exist")) {
          await expect(page).toHaveScreenshot("generation-form-empty.png");
        } else {
          throw error;
        }
      }
    });

    test("should match visual snapshot of form with text", async ({ page }) => {
      // Arrange
      const validText = generationFormPage.generateTestText(1500);

      // Act
      await generationFormPage.enterSourceText(validText);

      // Assert - allow platform differences
      await expect(page).toHaveScreenshot("generation-form-with-text.png", {
        threshold: 0.3,
      });
    });

    test("should match visual snapshot of loading state", async ({ page }) => {
      // Arrange
      const validText = generationFormPage.generateTestText(2000);
      await generationFormPage.enterSourceText(validText);

      // Act
      await generationFormPage.submitForm();

      // Assert - allow platform differences
      await expect(page).toHaveScreenshot("generation-form-loading.png", {
        threshold: 0.3,
      });
    });
  });
});
