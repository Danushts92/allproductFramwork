import { defineConfig } from "@playwright/test";
import * as path from "path";
import * as dotenv from "dotenv";
import { baseConfig, productReporters } from "../../config/playwright.base.config";
import { getBrowserUse } from "../../config/playwright.browser.config";

dotenv.config({ path: path.resolve(__dirname, "../../config/env/outlook/.env.dev") });
dotenv.config({ path: path.resolve(__dirname, "../../config/env/outlook/.env") });

const authFile = path.resolve(
  __dirname,
  "../../",
  process.env.OUTLOOK_AUTH_FILE || "shared/auth/storage/outlook.json",
);

export default defineConfig({
  ...baseConfig,
  reporter: productReporters("outlook"),
  outputDir: "../../test-results/outlook",
  testDir: "./tests/ui",
  use: {
    ...baseConfig.use,
    ...getBrowserUse({ headless: true }),
    baseURL: process.env.OUTLOOK_URL,
    storageState: authFile,
  },
  projects: [
    {
      name: "outlook",
      testDir: "./tests/ui",
      use: {
        ...getBrowserUse({ headless: true }),
        baseURL: process.env.OUTLOOK_URL,
        storageState: authFile,
      },
    },
  ],
});