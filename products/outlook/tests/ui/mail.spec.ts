import { test, expect } from "../../../../shared/fixtures/base.fixture";

test.describe("Outlook — authenticated access", () => {
  test("user can open the mailbox with extracted Edge session", async ({ page }) => {
    await page.goto("/mail/");
    await page.waitForTimeout(10000);
    await expect(page).toHaveURL(/outlook\.office\.com\/mail/i, { timeout: 30000 });
  });
});