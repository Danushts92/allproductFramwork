import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../../../shared/base/base.page";
import { SideNav } from "../components/sideNav";
import { ModuleTabs } from "../components/moduleTabs";

export class ManufacturingPage extends BasePage {
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

  private get createButton(): Locator {
    return this.page.locator('button:has(i.icon-addnew)').first();
  }

  private get createDialog(): Locator {
    return this.page.locator(".o-modal");
  }

  async open() {
    await this.sideNav.open("productionManager");
    await this.tabs.open("Manufacturing", /#\/manager\/manufacturing/);
    await this.waitForLoad();
  }

  async expectDataLoaded() {
    await expect(this.table).toBeVisible({ timeout: 30_000 });
    await expect(this.table.getByRole("columnheader", { name: "Order Name" })).toBeVisible();
    await expect(this.tableRows.first().getByRole("link").first()).toBeVisible({ timeout: 30_000 });
    await expect(this.tableRows).not.toHaveCount(0);
  }

  async createProductionOrder({
    name,
    manufactureBy,
    onsite,
    facility,
  }: {
    name: string;
    manufactureBy: string;
    onsite: string;
    facility: string;
  }) {
    await this.createButton.click();
    await expect(this.createDialog.getByRole("heading", { name: /Create Production Orders/ })).toBeVisible();

    await this.createDialog
      .locator('input[placeholder="Enter name (3 or more characters)"]')
      .fill(name);
    await this.selectDate(this.createDialog.locator('input[placeholder="mm/dd/yyyy"]').nth(0), manufactureBy);
    await this.selectDate(this.createDialog.locator('input[placeholder="mm/dd/yyyy"]').nth(1), onsite);

    const facilitySelector = this.createDialog.locator('.multiselect[sort="false"]');
    await facilitySelector.click();
    await facilitySelector.locator('input[placeholder="Locations (Required)"]').pressSequentially(facility);
    await this.createDialog
      .locator(`.multiselect__option:has-text("${facility}")`)
      .click();

    const createOrderButton = this.createDialog.getByRole("button", { name: "Create Order" });
    await expect(createOrderButton).toBeEnabled();
    await createOrderButton.click();
  }

  async expectCreatedOrder({ name, manufactureBy, onsite, facility }: {
    name: string;
    manufactureBy: string;
    onsite: string;
    facility: string;
  }) {
    await expect(this.createDialog).toBeHidden({ timeout: 30_000 });
    const orderRow = this.tableRows.filter({ hasText: name }).first();
    await expect(orderRow).toBeVisible({ timeout: 30_000 });
    await expect(orderRow.getByText(facility, { exact: true })).toBeVisible();
    await expect(orderRow.getByText(manufactureBy, { exact: true }).first()).toBeVisible();
    await expect(orderRow.getByText(onsite, { exact: true }).nth(1)).toBeVisible();
  }

  private async selectDate(input: Locator, date: string) {
    await input.click();
    await this.page
      .locator('.o-dpck__table__cell--selectable')
      .filter({ hasText: new RegExp(`^${Number(date.split("/")[1])}$`) })
      .last()
      .click();
  }
}