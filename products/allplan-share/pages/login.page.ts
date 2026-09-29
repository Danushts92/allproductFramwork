import { Page, Locator } from "@playwright/test";
import { BaseLoginPage } from "../../../shared/base/base.login.page";
import { dismissCookieBanner } from "../../../shared/components/cookieBanner";

// Generic locators — confirm them against the real login page (e.g. with the playwright-allplan-share MCP server).
export class LoginPage extends BaseLoginPage {
  constructor(page: Page) {
    super(page);
  }

  protected get usernameInput(): Locator {
    return this.page.getByRole("textbox", { name: /email|user/i }).first();
  }
  protected get passwordInput(): Locator {
    return this.page.locator('input[type="password"]').first();
  }
  protected get loginButton(): Locator {
    return this.page.getByRole("button", { name: /log ?in|sign ?in|continue/i }).first();
  }
  protected get loginApiPattern() {
    return null;
  }

  async open() {
    await this.goto(process.env.ALLPLAN_SHARE_URL!);
    await dismissCookieBanner(this.page);
  }
}
