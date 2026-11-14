# Playwright E2E Framework

Playwright and TypeScript framework for [Automation Exercise](https://automationexercise.com).
The initial scenario demonstrates API setup, UI verification, and API cleanup:

1. Generate a unique account for the test.
2. Create it through `POST /api/createAccount`.
3. Open the login page and sign in through the UI.
4. Verify `Logged in as [name]` and the logout control.
5. Delete the account through `DELETE /api/deleteAccount` during fixture teardown.

The accessibility suite runs `@axe-core/playwright` against the login/signup
and products pages with WCAG 2.0 and 2.1 A/AA tags. It attaches all detected
violations to the report, fails on serious or critical findings, and keeps
lower-impact findings visible for investigation.

## What's in it

| Area | How it's done |
|---|---|
| Fixtures | A test-scoped account fixture creates and deletes an account and disposes its API context |
| API client | Typed, form-encoded Automation Exercise account client with separate HTTP and application-code validation |
| Page objects | Login page object using `data-qa` locators and web-first assertions |
| Test data | UUID-based account factory, safe for parallel workers and retries |
| Cross-browser | Chromium, Firefox, and WebKit run the integrated UI scenario |
| Accessibility | axe-core scans the login/signup and products pages for WCAG 2.0/2.1 A/AA rules |
| Visual regression | Chromium compares focused login/signup and first-product-card screenshots |
| Reporting | Trace on first retry, screenshots and video on failure, JUnit/HTML/blob reporters |
| Docker | The same Playwright image is used locally and in CI |

## Run it

```bash
npm ci
npx playwright install --with-deps

npm test                  # all browsers
npm run test:ui           # all three browsers
npm run test:integrated   # API setup -> UI login -> API cleanup
npm run test:smoke        # the tagged integrated scenario
npm run test:a11y         # accessibility scans
npm run test:visual       # visual comparisons
npm run test:visual:update # explicitly regenerate visual baselines
npm run typecheck
npm run report            # open the last HTML report
```

Set `UI_BASE_URL` and `API_BASE_URL` to target another compatible environment.
Defaults are `https://automationexercise.com` and
`https://automationexercise.com/api`. Account passwords and generated
authentication state are never written to the repository.

## Docker

```bash
docker compose run --rm tests
docker compose run --rm visual
docker compose run --rm visual-update
```

Visual baselines must be generated and reviewed explicitly with
`docker compose run --rm visual-update`, using the pinned Playwright image
from [`Dockerfile`](./Dockerfile). Never use the update command in CI.
Review the generated files under `tests/__screenshots__`, then run
`docker compose run --rm visual` without `--update-snapshots` to compare them.
Missing baselines fail the visual project. Failed comparisons retain expected,
actual, and diff images in `test-results` and the Playwright report.
Compose forces `linux/amd64`, matching the GitHub-hosted Ubuntu runner. On
Apple Silicon, Docker may use emulation so local baseline generation targets
the same architecture as CI.

The visual targets intentionally exclude advertising and other page-level
dynamic content: the login/signup form container and the first product card
are the only captured regions. The product-card comparison masks only
third-party `iframe`, Google Ads, and `adsbygoogle` regions; the product card
UI itself is not masked. The visual tests also block only known Google
advertising network requests before navigation; application requests and
fonts remain untouched. The project fixes
viewport, locale, timezone, color scheme, browser, and platform through the
Docker image and Compose platform setting so committed baselines match CI.

Accessibility scans attach every axe violation, including rule ID, impact,
description, affected elements, and help URL. Serious and critical findings
fail the tests; lower-impact findings remain visible in the report. The scan
scope is the rendered login/signup page and products page. Third-party
advertising and external resources are not treated as application coverage.
Automated axe scans do not establish full WCAG compliance; manual and
assistive-technology testing are still required.

The current public-demo scan reports `button-name` (critical) and
`color-contrast` (serious) findings on both pages. These are reported as
application findings, not suppressed or treated as automation failures.

## CI

`.github/workflows/playwright.yml` runs type checking, then runs two Playwright
shards inside the pinned `mcr.microsoft.com/playwright:v1.65.0-noble` image.
The shards cover the integrated UI/API scenario, accessibility, and visual
projects, then merge their blob reports into one HTML report. This is the same
image and `linux/amd64` target used by Compose. It retains diagnostic
artifacts from failed tests. Jenkins uses the same Docker Compose `tests`
service and offers `all`, `smoke`, `ui`, `a11y`, and `visual` suite choices.

The API request and response fields used by the account fixture are documented
by [Automation Exercise's API list](https://automationexercise.com/api_list).
