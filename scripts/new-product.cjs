// Scaffolds a new product: config, login page, login test, auth setup, env files, npm scripts and MCP servers.
// Usage: npm run new:product -- <name> [--url https://app.example.com]
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const name = (args.find((a) => !a.startsWith("--")) || "").toLowerCase();
const urlIndex = args.indexOf("--url");
const url = urlIndex >= 0 ? args[urlIndex + 1] : "https://your-app.example.com";

if (!/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error("Usage: npm run new:product -- <name> [--url https://app.example.com]");
  console.error("Name must be lowercase letters, digits or '-', starting with a letter (e.g. 'allplan-share').");
  process.exit(1);
}
if (!/^https?:\/\//.test(url)) {
  console.error(`--url must start with http:// or https:// (got "${url}").`);
  process.exit(1);
}

const productDir = path.join(root, "products", name);
if (fs.existsSync(productDir)) {
  console.error(`products/${name} already exists — pick another name.`);
  process.exit(1);
}

const ENV = name.toUpperCase().replace(/-/g, "_");
const Title = name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
const created = [];

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  created.push(rel);
}

function updateJson(rel, mutate) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return;
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  mutate(data);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n");
  created.push(`${rel} (updated)`);
}

write(`products/${name}/playwright.config.ts`, `import { defineConfig } from "@playwright/test";
import * as path from "path";
import * as dotenv from "dotenv";
import { baseConfig, productReporters } from "../../config/playwright.base.config";
import { getBrowserUse } from "../../config/playwright.browser.config";

dotenv.config({ path: path.resolve(__dirname, "../../config/env/${name}/.env.dev") });
dotenv.config({ path: path.resolve(__dirname, "../../config/env/${name}/.env") });

export default defineConfig({
  ...baseConfig,
  reporter: productReporters("${name}"),
  outputDir: "../../test-results/${name}",
  testDir: "./tests/ui",
  use: {
    ...baseConfig.use,
    ...getBrowserUse(),
    baseURL: process.env.${ENV}_URL,
  },
  projects: [
    {
      name: "${name}-setup",
      testDir: "../../shared/auth",
      testMatch: /${name.replace(/-/g, "\\-")}\\.auth\\.setup\\.ts/,
    },
    {
      name: "${name}",
      testDir: "./tests/ui",
      dependencies: ["${name}-setup"],
      use: {
        ...getBrowserUse(),
        baseURL: process.env.${ENV}_URL,
      },
    },
  ],
});
`);

write(`products/${name}/pages/login.page.ts`, `import { Page, Locator } from "@playwright/test";
import { BaseLoginPage } from "../../../shared/base/base.login.page";
import { dismissCookieBanner } from "../../../shared/components/cookieBanner";

// Generic locators — confirm them against the real login page (e.g. with the playwright-${name} MCP server).
export class LoginPage extends BaseLoginPage {
  constructor(page: Page) {
    super(page);
  }

  protected get usernameInput(): Locator {
    return this.page.getByRole("textbox", { name: /email|user/i }).first();
  }
  protected get passwordInput(): Locator {
    return this.page.locator('input[type="password"]').first();
  }
  protected get loginButton(): Locator {
    return this.page.getByRole("button", { name: /log ?in|sign ?in|continue/i }).first();
  }
  protected get loginApiPattern() {
    return null;
  }

  async open() {
    await this.goto(process.env.${ENV}_URL!);
    await dismissCookieBanner(this.page);
  }
}
`);

write(`products/${name}/tests/ui/login.spec.ts`, `import { test, expect } from "../../../../shared/fixtures/base.fixture";
import { LoginPage } from "../../pages/login.page";

test.describe("${Title} — Login", () => {
  test("user can log in successfully", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(process.env.SSO_USERNAME!, process.env.SSO_PASSWORD!);
    await expect(page).not.toHaveURL(/login|signin|auth/i, { timeout: 30_000 });
  });
});
`);

write(`shared/auth/${name}.auth.setup.ts`, `import { test as setup, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { LoginPage } from "../../products/${name}/pages/login.page";

const authFile = path.resolve(__dirname, "storage/${name}.json");

function isStale(file: string, maxAgeMinutes = 30): boolean {
  if (!fs.existsSync(file)) return true;
  return (Date.now() - fs.statSync(file).mtimeMs) / 60000 > maxAgeMinutes;
}

setup("authenticate ${name}", async ({ page }) => {
  if (!isStale(authFile)) {
    setup.skip();
    return;
  }
  if (!process.env.${ENV}_URL || !process.env.SSO_USERNAME || !process.env.SSO_PASSWORD) {
    throw new Error("Set ${ENV}_URL, SSO_USERNAME and SSO_PASSWORD in config/env/${name}/.env.dev");
  }

  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(process.env.SSO_USERNAME, process.env.SSO_PASSWORD);
  await expect(page).not.toHaveURL(/login|signin|auth/i, { timeout: 30000 });

  await fs.promises.mkdir(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
`);

const envTemplate = `${ENV}_URL=${url}\nSSO_USERNAME=\nSSO_PASSWORD=\n`;
write(`config/env/${name}/.env.example`, envTemplate);
write(`config/env/${name}/.env.dev`, envTemplate);

updateJson("package.json", (pkg) => {
  pkg.scripts[`test:${name}`] = `playwright test --config=products/${name}/playwright.config.ts --project=${name}`;
  pkg.scripts[`report:${name}`] = `playwright show-report playwright-report/${name}`;
  if (!pkg.scripts["test:all"].includes(`test:${name}`)) pkg.scripts["test:all"] += ` && npm run test:${name}`;
});

const mcpArgs = (prefix) => [
  "--browser", "chromium",
  "--storage-state", `${prefix}shared/auth/storage/${name}.json`,
  "--output-dir", `${prefix}mcp/ai-generated/${name}`,
  "--viewport-size", "1280x720",
];

updateJson(".vscode/mcp.json", (cfg) => {
  cfg.servers[`playwright-${name}`] = {
    type: "stdio",
    command: "npx",
    args: ["--no-install", "@playwright/mcp", ...mcpArgs("${workspaceFolder}/")],
  };
  const input = (cfg.inputs || []).find((i) => i.id === "pwProduct");
  if (input && !input.options.includes(name)) input.options.push(name);
});

updateJson("mcp/mcp.config.json", (cfg) => {
  cfg.mcpServers[`playwright-${name}`] = { command: "npx", args: ["@playwright/mcp@latest", ...mcpArgs("")] };
});

console.log(`\nProduct "${name}" created:\n  ${created.join("\n  ")}\n`);
console.log("Next steps:");
console.log(`  1. Fill SSO_USERNAME / SSO_PASSWORD in config/env/${name}/.env.dev`);
console.log(`  2. Check the locators in products/${name}/pages/login.page.ts against the real login page`);
console.log(`  3. npm run test:${name}      then   npm run report:${name}`);
console.log("  4. Reload VS Code to pick up the new MCP server");
