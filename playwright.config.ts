import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/test-results',
  fullyParallel: false,   // sequential — ป้องกัน Firestore race condition
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'e2e/playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'on',                 // บันทึก screenshot ทุก test (pass + fail)
    trace: 'retain-on-failure',       // trace เมื่อ fail
    video: 'retain-on-failure',       // video เมื่อ fail
    actionTimeout: 12_000,
    navigationTimeout: 20_000,
    locale: 'th-TH',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Mobile iPhone',
      use: { ...devices['iPhone 12'] },
    },
  ],
  globalSetup: './e2e/global-setup.ts',
});
