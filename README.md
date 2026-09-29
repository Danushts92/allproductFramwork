# Playwright Automation Framework — Web + API, 3 products, MCP-enabled

Built and verified step by step: dependencies installed for real, every file
type-checked with `tsc --noEmit` (zero errors), YAML workflows validated,
and the MCP config validated as JSON against the actual installed
`@playwright/mcp` CLI flags.

## What's here

```
config/                     shared base config + per-product env files
mcp/                         Playwright MCP server config for manufacton & bimplus
shared/                      base classes, fixtures, utils — reused by both products
products/manufacton/          pages, api, tests, own playwright.config.ts
products/bimplus/          pages, api, tests, own playwright.config.ts
products/outlook/            headless Outlook tests using extracted Edge session state
.github/workflows/           one CI pipeline per product
```

## First-time setup

```bash
npm install
npx playwright install --with-deps   # downloads browser binaries (not run in this sandbox — no network access to Playwright's CDN here)
cp config/env/manufacton/.env.example config/env/manufacton/.env.dev
cp config/env/bimplus/.env.example config/env/bimplus/.env.dev
cp config/env/outlook/.env.example config/env/outlook/.env.dev
# fill in real URLs/credentials in both .env.dev files
# set EDGE_USER_DATA_DIR in the Outlook .env.dev file
```

## Running tests

```bash
npm run test:manufacton         # web + api for manufacton
npm run test:manufacton:web     # web only
npm run test:manufacton:api     # api only
npm run test:bimplus         # same for bimplus
npm run auth:outlook         # extract Outlook session from a local Edge profile
npm run test:outlook         # run Outlook tests with the extracted session
npm run test:all               # manufacton, bimplus, and outlook
npm run typecheck              # verify TypeScript compiles cleanly
npm run report                 # open the last HTML report
```

## MCP — AI-assisted test authoring for both products

See `mcp/README.md` for full setup. Short version: `mcp/mcp.config.json`
defines two named servers, `playwright-manufacton` and `playwright-bimplus`,
each pointed at that product's `baseURL` and reusing its saved SSO session
(`shared/auth/storage/<product>.json`) so the AI drives an already-logged-in
browser instead of needing to authenticate on every prompt.

## Outlook — Approach 2

1. Close every Microsoft Edge window.
2. Copy `config/env/outlook/.env.example` to `.env.dev` and set
	`EDGE_USER_DATA_DIR` to the parent Edge User Data directory. Keep
	`EDGE_PROFILE_DIRECTORY=Default` unless the authenticated account uses a
	different Edge profile.
3. Run `npm run auth:outlook`. Complete Microsoft login or MFA in the opened
	Edge window. The script saves only Playwright storage state to
	`shared/auth/storage/outlook.json`.
4. Run `npm run test:outlook` for headless Outlook tests.

The storage-state file contains live session tokens and is ignored by Git.
Re-run the extraction command when Outlook redirects back to sign-in.

## What's verified vs. what needs your environment

| Verified in this build | Needs your machine/CI |
|---|---|
| `npm install` — all packages resolve | `npx playwright install` — browser binaries (this sandbox has no network route to Playwright's CDN) |
| `tsc --noEmit` — zero type errors across all files | Actually running tests against real manufacton/bimplus URLs |
| MCP config is valid JSON, flags match the installed CLI's `--help` | Connecting an AI client to the MCP servers (needs your local `.mcp.json`) |
| GitHub Actions YAML is syntactically valid | Actual CI run (needs real secrets configured in your repo) |

## Governance rules (placement: shared vs product-specific)

See the "Rule of Two" table from the earlier starter kit — utils/helpers/base
shapes are shared from day one; locators/fixtures with business logic follow
Rule of Two; test data, test cases, and env config are never shared.
