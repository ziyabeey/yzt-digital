import { defineConfig } from "@playwright/test";

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const localBaseURL = "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: externalBaseURL ?? localBaseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  ...(externalBaseURL
    ? {}
    : {
        webServer: {
          command: "npm run dev -- --hostname 127.0.0.1",
          url: localBaseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
  projects: [
    {
      name: "mobile-small",
      use: {
        viewport: { width: 360, height: 800 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "mobile-large",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "desktop",
      use: {
        viewport: { width: 1440, height: 1000 },
      },
    },
  ],
});
