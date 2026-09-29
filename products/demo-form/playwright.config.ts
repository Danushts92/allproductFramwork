import { defineConfig } from "@playwright/test";
import * as path from "path";
import { pathToFileURL } from "url";
import { baseConfig, productReporters } from "../../config/playwright.base.config";
import { getBrowserUse } from "../../config/playwright.browser.config";

// Local static page, no auth/server needed; trailing slash so page.goto("index.html") resolves inside app/.
const baseURL = pathToFileURL(path.resolve(__dirname, "app")).href + "/";

export default defineConfig({
  ...baseConfig,
  reporter: productReporters("demo-form"),
  outputDir: "../../test-results/demo-form",
  testDir: "./tests/ui",
  use: {
    ...baseConfig.use,
    ...getBrowserUse({ headless: true }),
    baseURL,
  },
  projects: [
    {
      name: "demo-form",
      testDir: "./tests/ui",
      use: {
        ...getBrowserUse({ headless: true }),
        baseURL,
      },
    },
  ],
});
