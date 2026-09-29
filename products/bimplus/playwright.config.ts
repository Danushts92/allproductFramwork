import { defineConfig } from "@playwright/test";
import * as path from "path";
import * as dotenv from "dotenv";
import { baseConfig, productReporters } from "../../config/playwright.base.config";
import { getBrowserUse } from "../../config/playwright.browser.config";

dotenv.config({ path: path.resolve(__dirname, "../../config/env/bimplus/.env.dev") });

dotenv.config({ path: path.resolve(__dirname, "../../config/env/bimplus/.env") });

export default defineConfig({
  ...baseConfig,
  reporter: productReporters("bimplus"),
  outputDir: "../../test-results/bimplus",
  testDir: "./tests/ui",
  use: {
    ...baseConfig.use,
    ...getBrowserUse(),
    baseURL: process.env.BIMPLUS_URL,
  },
  projects: [
    {
      name: "bimplus-setup",
      testDir: "../../shared/auth",
      testMatch: /bimplus\.auth\.setup\.ts/,
    },
    {
      name: "bimplus",
      testDir: "./tests/ui",
      dependencies: ["bimplus-setup"],
      use: {
        ...getBrowserUse(),
        baseURL: process.env.BIMPLUS_URL,
      },
    },
  ],
});
