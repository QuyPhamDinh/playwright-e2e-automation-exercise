# Playwright E2E Framework

End-to-end test framework built with Playwright and TypeScript. It tests two public demo targets: a web shop UI ([Sauce Demo](https://www.saucedemo.com)) and a REST API with token auth ([Restful-Booker](https://restful-booker.herokuapp.com)).

## What's in it

| Area | How it's done |
|---|---|
| Fixtures | `src/fixtures/index.ts` extends Playwright's `test` with page objects, a worker-scoped API auth token, and a `bookingApi` client that cleans up the data it creates |
| Page objects | `src/pages/`, using `getByTestId` locators and web-first assertions |
| Test data | Factory in `src/data/bookingFactory.ts` generates unique bookings so parallel workers never collide |
| Auth | UI session is created once in global setup and reused via `storageState`; login specs opt out and start logged out |
| API tests | `tests/api/`: auth, create, read, filter, update, delete, negative cases, and 403 without a token |
| Cross-browser | Chromium, Firefox and WebKit projects run the same UI specs |
| Parallelism | `fullyParallel` locally; sharded 4 ways in GitHub Actions |
| Reporting | Trace on first retry, screenshots and video on failure, merged HTML report from all shards |
| Accessibility | axe-core (WCAG A/AA) fails the build on serious or critical violations and attaches the full result to the report |
| Visual regression | `toHaveScreenshot` baselines generated and compared inside the Playwright Linux image |
| Docker | Same image locally and in CI, so results match |

## Layout

```
src/
  api/        typed API client
  config/     env + global setup
  data/       users and data factories
  fixtures/   custom test fixtures
  pages/      page objects
  utils/      axe helper
tests/
  ui/ api/ a11y/ visual/
```

## Run it

```bash
npm ci
npx playwright install --with-deps

npm test                  # everything
npm run test:ui           # UI on all three browsers
npm run test:api          # API only, no browser needed
npm run test:smoke        # tests tagged @smoke
npm run test:a11y         # axe checks
npm run report            # open the last HTML report
```

### Visual tests

Screenshots differ between operating systems, so baselines are created in the Linux container and committed:

```bash
docker compose run --rm visual-update   # create or refresh baselines in tests/__screenshots__
docker compose run --rm visual          # compare against them
```

The CI visual job skips itself until baselines are committed. You can also generate them from the Actions tab by running the workflow manually with "Regenerate visual baselines" ticked.

### Docker

```bash
docker compose run --rm tests           # full suite in the Playwright image
```

Keep the image tag in `Dockerfile`, `docker-compose.yml` and the workflow in step with the `@playwright/test` version in `package.json`.

## CI

`.github/workflows/playwright.yml`:

1. **typecheck**: `tsc --noEmit`
2. **test**: four shards in parallel, each running all browser projects, API and a11y
3. **report**: merges the shard blob reports into one HTML report (traces, screenshots, videos) and uploads it
4. **visual**: runs in the Playwright container when baselines exist
5. A daily scheduled run doubles as a canary check against the live targets

## Configuration

Targets and credentials are environment variables with public-demo defaults. See `.env.example`.

## Notes

- Both targets are shared public demos, so occasional slowness or data resets are expected. CI retries failures twice and keeps a trace of each retry.
- `ALLOWED_RULES` in `tests/a11y/accessibility.spec.ts` is empty on purpose. If axe flags something you intend to fix later, add the rule id there with a comment explaining why.
