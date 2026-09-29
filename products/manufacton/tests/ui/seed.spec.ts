import { test, expect } from "../../../../shared/fixtures/base.fixture";
import { LoginPage } from "../../pages/login.page";

// Starting point for Playwright planner/generator agents: a logged-in Manufacton session.
test.describe("Manufacton — seed", () => {
  test("seed", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(process.env.SSO_USERNAME!, process.env.SSO_PASSWORD!);
    await expect(page).not.toHaveURL(/#\/login$/, { timeout: 30_000 });
  });
});
