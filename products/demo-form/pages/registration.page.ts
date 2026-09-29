import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../../shared/base/base.page";

export type RegistrationData = {
  fullName?: string;
  email?: string;
  password?: string;
  country?: string;
  acceptTerms?: boolean;
};

export class RegistrationPage extends BasePage {
  readonly heading: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly countrySelect: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;
  readonly resetButton: Locator;
  readonly successMessage: Locator;
  readonly fullNameError: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly termsError: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Registration" });
    this.fullNameInput = page.getByRole("textbox", { name: "Your name" });
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.countrySelect = page.getByLabel("Country");
    this.termsCheckbox = page.getByLabel("I accept the terms");
    this.submitButton = page.getByRole("button", { name: "Create account" });
    this.resetButton = page.getByRole("button", { name: "Clear1233" });
    this.successMessage = page.getByRole("status");
    this.fullNameError = page.locator("#fullName-error");
    this.emailError = page.locator("#email-feedback");
    this.passwordError = page.locator("#password-error");
    this.termsError = page.locator("#terms-error");
  }

  async open() {
    await this.page.goto("index.html");
  }

  async fill(data: RegistrationData) {
    if (data.fullName !== undefined) await this.fullNameInput.fill(data.fullName);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.password !== undefined) await this.passwordInput.fill(data.password);
    if (data.country !== undefined) await this.countrySelect.selectOption({ label: data.country });
    if (data.acceptTerms) await this.termsCheckbox.check();
  }

  async submit() {
    await this.submitButton.click();
  }

  async reset() {
    await this.resetButton.click();
  }
}
