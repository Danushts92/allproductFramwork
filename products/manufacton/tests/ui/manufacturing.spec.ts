import { test, expect } from "../../../../shared/fixtures/base.fixture";
import { LoginPage } from "../../pages/login.page";
import { ManufacturingPage } from "../../pages/manufacturing.page";

test.describe("Manufacton — Manufacturing", () => {
  test("manufacturing table loads data after login", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(process.env.SSO_USERNAME!, process.env.SSO_PASSWORD!);
    await expect(page, "login did not complete").not.toHaveURL(/#\/login$/, { timeout: 30_000 });

    const manufacturingPage = new ManufacturingPage(page);
    await manufacturingPage.open();
    await manufacturingPage.expectDataLoaded();
  });

  test("creates a manufacturing production order", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(process.env.SSO_USERNAME!, process.env.SSO_PASSWORD!);
    await expect(page, "login did not complete").not.toHaveURL(/#\/login$/, { timeout: 30_000 });

    const manufacturingPage = new ManufacturingPage(page);
    await manufacturingPage.open();

    const today = new Date();
    const date = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;
    const orderName = process.env.MANUFACTON_TEST_ORDER_NAME ?? `Automation Order ${Date.now()}`;
    const facility = process.env.MANUFACTON_TEST_FACILITY ?? "INDA12378001";

    await manufacturingPage.createProductionOrder({
      name: orderName,
      manufactureBy: date,
      onsite: date,
      facility,
    });
    await manufacturingPage.expectCreatedOrder({
      name: orderName,
      manufactureBy: date,
      onsite: date,
      facility,
    });
  });
});