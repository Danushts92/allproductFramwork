# Playwright MCP — 2 products

This sets up the Playwright MCP server so an AI client (Claude Desktop/Code,
Cursor, etc.) can drive a real browser against manufacton or bimplus and
generate test specs from natural-language instructions.

## Setup

1. Copy `mcp/mcp.config.json`'s contents into your AI client's MCP config file:
   - Claude Desktop / Claude Code: `.mcp.json` in the project root, or
     `claude_desktop_config.json`
   - Cursor / VS Code: `.vscode/mcp.json`

2. Restart the client so it picks up both servers. You should see two
   connections available: `playwright-manufacton` and `playwright-bimplus`.

3. Run manufacton's or bimplus's auth setup FIRST, so the storage state file
   each server references actually exists:

   ```bash
   npx playwright test --project=manufacton-setup --config=products/manufacton/playwright.config.ts
   npx playwright test --project=bimplus-setup --config=products/bimplus/playwright.config.ts
   ```

   This is why each MCP server points at `shared/auth/storage/<product>.json` —
   the AI drives an already-authenticated session instead of needing to log in
   itself on every prompt.

## Usage

Ask the AI, naming the product explicitly so it picks the right server, e.g.:

> "Using playwright-manufacton, go to /dashboard, open the settings page, and
> generate a Playwright TypeScript spec verifying the save button is disabled
> until a field changes. Save it to
> products/manufacton/tests/ui/settings.spec.ts using the existing BasePage
> pattern."

## Why two servers instead of one

Each product has its own base URL, its own authenticated session
(`storageState`), and its own output folder for anything the AI generates
(`mcp/ai-generated/manufacton/` vs `bimplus/`). Using one server for both
would mean manually swapping storage state between prompts — two named
servers keep each product's context isolated, the same way the rest of the
framework keeps `products/manufacton/` and `products/bimplus/` isolated.

## Review before merging

Anything the AI writes lands in `mcp/ai-generated/<product>/` first — treat it
as a draft. Review it against the framework's patterns (extends `BasePage`,
locators via `page.getByRole`/`getByLabel`, no hardcoded waits) before moving
it into `products/<product>/tests/` for real.
