# Browsers and system dependencies come preinstalled; keep the tag in step with @playwright/test.
FROM mcr.microsoft.com/playwright:v1.65.0-noble

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

CMD ["npx", "playwright", "test"]
