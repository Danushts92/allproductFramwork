import { Page, Locator } from "@playwright/test";
import { BaseLoginPage } from "../../../shared/base/base.login.page";
import { dismissCookieBanner } from "../../../shared/components/cookieBanner";

export class LoginPage extends BaseLoginPage {
  constructor(page: Page) {
    super(page);
  }

  protected get usernameInput(): Locator {
    return this.page.locator(
      'input[aria-label="Username or email"], input[name="username"], input[type="email"]',
    ).first();
  }
  protected get passwordInput(): Locator {
    return this.page.locator(
      'input[aria-label="Password"], input[name="password"], input[type="password"]',
    ).first();
  }
  protected get loginButton(): Locator {
    return this.page.getByRole("button", { name: /^login$/i }).last();
  }
  protected get loginApiPattern() {
    return null;
  }

  async open() {
    await this.goto(process.env.BIMPLUS_URL!);
    await dismissCookieBanner(this.page);

    const browserWarning = this.page.locator("#browserWarningBanner .close-button");
    if (await browserWarning.isVisible({ timeout: 3000 }).catch(() => false)) {
      await browserWarning.click({ force: true });
    }

    const logIn = this.page.getByRole("button", { name: /^log in$/i });
    if (await logIn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logIn.click();
    }

    await this.usernameInput.waitFor({ state: "visible", timeout: 30000 });
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.loginButton.click();
    await this.passwordInput.waitFor({ state: "visible", timeout: 30000 });
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.waitForLoad();
  }
}
