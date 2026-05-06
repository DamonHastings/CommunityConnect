import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/demos',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  outputDir: 'demo-output',
  reporter: [['html', { outputFolder: 'demo-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1440, height: 900 },
    video: 'on',
    screenshot: 'on',
    trace: 'off',
    launchOptions: {
      slowMo: 100,
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: `PATH="/opt/homebrew/opt/ruby/bin:/opt/homebrew/lib/ruby/gems/4.0.0/bin:$PATH" bundle exec rails server -p 3001`,
      cwd: '../backend',
      port: 3001,
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev',
      port: 5173,
      reuseExistingServer: true,
    },
  ],
})
