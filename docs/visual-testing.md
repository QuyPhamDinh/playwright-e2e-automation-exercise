# Visual testing

Visual regression uses Playwright screenshot assertions for two focused regions:

- The login/signup form container.
- The first product information region.

The product UI is not masked. Only third-party `iframe`, Google Ads, and
`adsbygoogle` regions are masked defensively. Known Google advertising network
requests are blocked before navigation; application requests and fonts remain
untouched.

## Baseline workflow

Generate or update baselines explicitly:

```bash
docker compose run --rm visual-update
```

Review the generated files under `tests/__screenshots__`, then compare without
updating snapshots:

```bash
docker compose run --rm visual
```

Never use the update command in CI. Missing baselines fail the visual project.
Failed comparisons retain expected, actual, and diff images in `test-results`
and the Playwright report.

## Matched environment

Local Docker and GitHub Actions use the pinned
`mcr.microsoft.com/playwright:v1.65.0-noble` image. Compose forces
`linux/amd64`, matching the GitHub-hosted Ubuntu runner. On Apple Silicon,
Docker may use emulation so local baseline generation targets the same
architecture as CI.

The project also fixes viewport, locale, timezone, color scheme, browser, and
platform through the Playwright configuration and container environment.

## Stability and comparison policy

Screenshot comparisons allow zero differing pixels. Repeated comparisons in the
matched Docker environment produced no rendering noise, so the former global
1% pixel-ratio tolerance was broader than necessary for these small component
screenshots.

Before capture, target fonts must be ready and every target image must finish
loading with a non-zero natural width. Broken images fail the visual test rather
than becoming an accepted baseline.
