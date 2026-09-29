import { Page, Locator } from "@playwright/test";
import { BaseLoginPage } from "../../../shared/base/base.login.page";

export class LoginPage extends BaseLoginPage {
  constructor(page: Page) {
    super(page);
  }

  protected get usernameInput(): Locator {
    return this.page.locator('input[placeholder="Email Address"]');
  }
  protected get passwordInput(): Locator {
    return this.page.locator('input[placeholder="Password"]');
  }
  protected get loginButton(): Locator {
    return this.page.getByRole("button", { name: /log in/i });
  }
  protected get loginApiPattern() {
    return null;
  }

  async open() {
    await this.goto("https://stage.manufacton.com/#/login");
  }
}
