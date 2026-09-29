const fs = require("fs");
const path = require("path");
const os = require("os");
const dotenv = require("dotenv");
const { chromium } = require("@playwright/test");

const root = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(root, "config", "env", "outlook", ".env.dev") });
dotenv.config({ path: path.join(root, "config", "env", "outlook", ".env") });

const outlookUrl = process.env.OUTLOOK_URL || "https://outlook.office.com";
const userDataDir = process.env.EDGE_USER_DATA_DIR;
const profileDirectory = process.env.EDGE_PROFILE_DIRECTORY || "Default";
const authFile = path.resolve(
  root,
  process.env.OUTLOOK_AUTH_FILE || "shared/auth/storage/outlook.json",
);

if (!userDataDir) {
  throw new Error(
    "EDGE_USER_DATA_DIR is required. Copy config/env/outlook/.env.example to .env.dev and set your Edge User Data path.",
  );
}

// Transient/cache folders Edge creates and deletes while running; not needed for the session.
const SKIPPED_DIRS = new Set([
  "Temp",
  "Cache",
  "Code Cache",
  "GPUCache",
  "DawnCache",
  "DawnGraphiteCache",
  "DawnWebGPUCache",
  "GrShaderCache",
  "ShaderCache",
  "CacheStorage",
  "ScriptCache",
  "Crashpad",
]);

function shouldCopy(src) {
  return !SKIPPED_DIRS.has(path.basename(src)) && fs.existsSync(src);
}

function hasEntraSession(state) {
  return state.cookies.some(
    (c) => /login\.microsoftonline\.com$/i.test(c.domain.replace(/^\./, "")) && /^ESTSAUTH/.test(c.name),
  );
}

// Windows-account SSO in Edge is device-bound (not cookies), so fall back to an interactive sign-in.
async function interactiveLogin() {
  console.log("Edge profile has no reusable Microsoft sign-in cookies.");
  console.log('Sign in manually in the opened Chrome window and choose "Yes" on "Stay signed in?".');
  console.log("Keep the window open; it closes by itself once the session is saved.");
  // Chrome (the test browser) avoids Edge's managed-profile SSO, which closes the automation window mid-login.
  const browser = await chromium.launch({ channel: "chrome", headless: false });
  const context = await browser.newContext();
  let lastState = { cookies: [], origins: [] };
  let closed = false;
  context.on("close", () => (closed = true));

  try {
    const page = await context.newPage();
    await page.goto(outlookUrl);
    const deadline = Date.now() + 300000;
    while (!closed && Date.now() < deadline) {
      lastState = await context.storageState();
      const active = context.pages().at(-1);
      const onMailbox = active && /^outlook\.office\.com$/i.test(new URL(active.url()).hostname);
      if (onMailbox && hasEntraSession(lastState)) {
        await active.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
        lastState = await context.storageState();
        break;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  } catch (error) {
    if (!closed) throw error;
  } finally {
    await browser.close().catch(() => {});
  }

  if (closed && !hasEntraSession(lastState)) {
    throw new Error("The sign-in window was closed before login finished. Run the script again and keep it open.");
  }
  return lastState;
}

async function main() {
  console.log("Close all Microsoft Edge windows before continuing.");
  console.log(`Launching Edge profile: ${profileDirectory}`);

  const temporaryUserDataDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "outlook-edge-profile-"),
  );
  const sourceProfileDir = path.join(userDataDir, profileDirectory);
  const copiedProfileDir = path.join(temporaryUserDataDir, profileDirectory);

  try {
    await fs.promises.cp(path.join(userDataDir, "Local State"), path.join(temporaryUserDataDir, "Local State"));
    await fs.promises.cp(sourceProfileDir, copiedProfileDir, { recursive: true, filter: shouldCopy });

    const context = await chromium.launchPersistentContext(temporaryUserDataDir, {
      channel: "msedge",
      headless: false,
      args: [`--profile-directory=${profileDirectory}`],
    });

    const page = context.pages()[0] || (await context.newPage());
    await page.goto(outlookUrl);
    console.log("Complete Microsoft login/MFA in the opened Edge window if prompted.");
    await page.waitForURL(/outlook\.office\.com\/mail/i, { timeout: 300000 });

    const state = await context.storageState();
    await context.close();

    const finalState = hasEntraSession(state) ? state : await interactiveLogin();
    if (!hasEntraSession(finalState)) {
      throw new Error(
        "No Microsoft sign-in cookies (ESTSAUTH*) were captured. " +
          'Sign in interactively and choose "Yes" on "Stay signed in?", then run this script again.',
      );
    }

    await fs.promises.mkdir(path.dirname(authFile), { recursive: true });
    await fs.promises.writeFile(authFile, JSON.stringify(finalState, null, 2));
    console.log(`Saved Outlook session state to ${authFile}`);
  } finally {
    await fs.promises.rm(temporaryUserDataDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});