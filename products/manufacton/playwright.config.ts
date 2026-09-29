import { defineConfig } from "@playwright/test";
import * as path from "path";
import * as dotenv from "dotenv";
import { baseConfig, productReporters } from "../../config/playwright.base.config";
import { getBrowserUse } from "../../config/playwright.browser.config";

dotenv.config({ path: path.resolve(__dirname, "../../config/env/manufacton/.env.dev") });

dotenv.config({ path: path.resolve(__dirname, "../../config/env/manufacton/.env") });

export default defineConfig({
  ...baseConfig,
  reporter: productReporters("manufacton"),
  outputDir: "../../test-results/manufacton",
  testDir: "./tests/ui",
  use: {
    ...baseConfig.use,
    ...getBrowserUse(),
    baseURL: process.env.MANUFACTON_URL,
  },
  projects: [
    {
      name: "manufacton-setup",
      testDir: "../../shared/auth",
      testMatch: /manufacton\.auth\.setup\.ts/,
    },
    {
      name: "manufacton",
      testDir: "./tests/ui",
      dependencies: ["manufacton-setup"],
      use: {
        ...getBrowserUse(),
        baseURL: process.env.MANUFACTON_URL,
      },
    },
  ],
});
