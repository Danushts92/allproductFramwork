import { Page, Locator, expect } from "@playwright/test";

/** Oruga tab strip used at the top of every Manufacton module (Dashboard, Detailing, ...). */
export class ModuleTabs {
  constructor(private page: Page) {}

  tab(name: string): Locator {
    return this.page.getByRole("tab").getByRole("button", { name, exact: true });
  }

  async open(name: string, expectedUrl?: RegExp) {
    await this.tab(name).click();
    if (expectedUrl) await expect(this.page).toHaveURL(expectedUrl);
  }
}
