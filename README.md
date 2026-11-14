# Playwright E2E Framework

Playwright and TypeScript framework for [Automation Exercise](https://automationexercise.com).
The initial scenario demonstrates API setup, UI verification, and API cleanup:

1. Generate a unique account for the test.
2. Create it through `POST /api/createAccount`.
3. Open the login page and sign in through the UI.
4. Verify `Logged in as [name]` and the logout control.
5. Delete the account through `DELETE /api/deleteAccount` during fixture teardown.

Cleanup is attempted even when account creation returns an unexpected response.
Cleanup failures are attached and logged; they fail an otherwise successful
test without replacing an original test failure.

The accessibility suite runs `@axe-core/playwright` against the login/signup
and products pages with WCAG 2.0 and 2.1 A/AA tags. It attaches all detected
violations to the report, fails on serious or critical findings, and keeps
lower-impact findings visible for investigation.

## What's in it

| Area | How it's done |
|---|---|
| Fixtures | A test-scoped account fixture creates and deletes an account, handles partial setup, and disposes its API context |
| API client | Typed, form-encoded Automation Exercise account client with runtime response validation and separate HTTP/application-code checks |
| Page objects | Login, product details, cart, and checkout objects using stable locators and web-first assertions |
| Test data | UUID-based account factory, safe for parallel workers and retries |
| Cross-browser | Chromium, Firefox, and WebKit run the integrated UI scenario |
| Accessibility | axe-core scans the login/signup and products pages for WCAG 2.0/2.1 A/AA rules |
| Visual regression | Chromium compares focused login/signup and first-product-card screenshots |
| Reporting | Trace on first retry, screenshots and video on failure, JUnit/HTML/blob reporters |
| Docker | The same Playwright image is used locally and in CI |

The API suite creates a unique synthetic account per test, validates account
creation, lookup, authentication, duplicate-account rejection, and deletion
responses, and removes created accounts during fixture teardown. Negative
authentication cases change only one input at a time. Passwords are not
included in logs or report attachments.

The SHOP-001 UI/API integration test signs in with the API-created account,
verifies empty-cart state, adds Blue Top (4) and Men Tshirt (2), and compares
row-level prices, quantities, line totals, checkout totals, and delivery
address fields without placing an order.

## Run it

```bash
npm ci
npx playwright install --with-deps

npm test                  # all configured projects
npm run test:api          # account API tests
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
from [`Dockerfile`](./Dockerfile). See the [visual testing guide](./docs/visual-testing.md)
for baseline review, environment matching, masking, and stability details.

## Visual regression

Visual tests compare focused login/signup and first-product-card regions in Chromium.
Baselines are generated and reviewed explicitly in the pinned Docker environment; CI never updates them.
See [docs/visual-testing.md](./docs/visual-testing.md) for commands, masks, and failure artifacts.

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
The blocking shards cover the integrated UI/API scenario and visual projects,
then merge their blob reports into one HTML report. This is the same image and
`linux/amd64` target used by Compose. It retains diagnostic artifacts from
failed tests.

Accessibility runs separately as an advisory audit against the public demo.
Its serious and critical assertions remain unchanged and findings are
available in the separate `accessibility-report` artifact, but the
workflow-level audit is non-blocking. A successful workflow therefore does
not establish accessibility compliance. Local `npm test` and Jenkins' `all`
suite still include accessibility and fail when blocking findings exist;
Jenkins also offers `smoke`, `api`, `ui`, `a11y`, and `visual` suite choices.

The API request and response fields used by the account fixture are documented
by [Automation Exercise's API list](https://automationexercise.com/api_list).
