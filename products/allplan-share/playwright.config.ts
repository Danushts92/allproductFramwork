import { defineConfig } from "@playwright/test";
import * as path from "path";
import * as dotenv from "dotenv";
import { baseConfig, productReporters } from "../../config/playwright.base.config";
import { getBrowserUse } from "../../config/playwright.browser.config";

dotenv.config({ path: path.resolve(__dirname, "../../config/env/allplan-share/.env.dev") });
dotenv.config({ path: path.resolve(__dirname, "../../config/env/allplan-share/.env") });

export default defineConfig({
  ...baseConfig,
  reporter: productReporters("allplan-share"),
  outputDir: "../../test-results/allplan-share",
  testDir: "./tests/ui",
  use: {
    ...baseConfig.use,
    ...getBrowserUse(),
    baseURL: process.env.ALLPLAN_SHARE_URL,
  },
  projects: [
    {
      name: "allplan-share-setup",
      testDir: "../../shared/auth",
      testMatch: /allplan\-share\.auth\.setup\.ts/,
    },
    {
      name: "allplan-share",
      testDir: "./tests/ui",
      dependencies: ["allplan-share-setup"],
      use: {
        ...getBrowserUse(),
        baseURL: process.env.ALLPLAN_SHARE_URL,
      },
    },
  ],
});
