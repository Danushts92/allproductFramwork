import { Page, Locator } from "@playwright/test";

// Side-menu items are icon-only with no accessible name; swap to getByTestId once devs add data-testid.
const MODULE_ICONS = {
  home: "icon-dashboard",
  projectPlanner: "icon-projectplanner",
  materialManager: "icon-materialmanager",
  productionManager: "icon-productionmanager",
  logisticsManager: "icon-logisticsmanager",
  supplyChainManager: "icon-supplychainmanager",
  resources: "icon-resources",
  settings: "icon-settings",
} as const;

export type ManufactonModule = keyof typeof MODULE_ICONS;

export class SideNav {
  constructor(private page: Page) {}

  item(module: ManufactonModule): Locator {
    return this.page.locator(`aside i.${MODULE_ICONS[module]}`);
  }

  async open(module: ManufactonModule) {
    await this.item(module).click();
  }
}
