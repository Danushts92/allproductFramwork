import { test, expect } from "../../../../shared/fixtures/base.fixture";
import { LoginPage } from "../../pages/login.page";

test.describe("Allplan Share — Login", () => {
  test("user can log in successfully", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(process.env.SSO_USERNAME!, process.env.SSO_PASSWORD!);
    await expect(page).not.toHaveURL(/login|signin|auth/i, { timeout: 30_000 });
  });
});
