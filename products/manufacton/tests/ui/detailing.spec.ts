import { test, expect } from "../../../../shared/fixtures/base.fixture";
import { LoginPage } from "../../pages/login.page";
import { DetailingPage } from "../../pages/detailing.page";

test.describe("Manufacton — Detailing", () => {
  test("detailing table loads data after login", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(process.env.SSO_USERNAME!, process.env.SSO_PASSWORD!);
    await expect(page, "login did not complete").not.toHaveURL(/#\/login$/, { timeout: 30_000 });

    const detailingPage = new DetailingPage(page);
    await detailingPage.open();
    await detailingPage.expectDataLoaded();
  });
});
