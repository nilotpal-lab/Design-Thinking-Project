import { defineConfig } from '@playwright/test';

/**
 * E2E against the production build. Uses the system-installed Chrome
 * (channel: 'chrome') so no browser download is needed. Serial + one worker:
 * these are stateful campus flows against one shared database.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run start -- --port 3100',
    url: 'http://127.0.0.1:3100/spaces',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
