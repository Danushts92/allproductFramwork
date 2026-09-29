import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../../../shared/base/base.page";
import { SideNav } from "../components/sideNav";
import { ModuleTabs } from "../components/moduleTabs";

export class DetailingPage extends BasePage {
  private readonly sideNav: SideNav;
  private readonly tabs: ModuleTabs;

  constructor(page: Page) {
    super(page);
    this.sideNav = new SideNav(page);
    this.tabs = new ModuleTabs(page);
  }

  get table(): Locator {
    return this.page.locator("table.o-table");
  }

  get tableRows(): Locator {
    return this.table.locator("tbody tr");
  }

  async open() {
    await this.sideNav.open("productionManager");
    await this.tabs.open("Detailing", /#\/manager\/detailing/);
    await this.waitForLoad();
  }

  async expectDataLoaded() {
    await expect(this.table).toBeVisible({ timeout: 30_000 });
    await expect(this.table.getByRole("columnheader", { name: "Order Name" })).toBeVisible();
    // A real data row has an order-name link; an empty-state row does not.
    await expect(this.tableRows.first().getByRole("link").first()).toBeVisible({ timeout: 30_000 });
    await expect(this.tableRows).not.toHaveCount(0);
  }
}
