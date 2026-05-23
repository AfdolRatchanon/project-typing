import { test, expect } from '@playwright/test';
import { loginAndGoto, USERS } from './helpers/auth';

test.describe('Block 7 — Dashboard & Stats', () => {

  test('7.1 — UserDashboard โหลดได้', async ({ page }) => {
    await loginAndGoto(page, USERS.student01.email, USERS.student01.password, '/dashboard');
    await page.screenshot({ path: 'e2e/screenshots/7.1-dashboard.png', fullPage: true });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('7.2 — WPM history chart section โชว์ (หรือซ่อนเมื่อข้อมูลน้อย)', async ({ page }) => {
    await loginAndGoto(page, USERS.student01.email, USERS.student01.password, '/dashboard');
    await page.screenshot({ path: 'e2e/screenshots/7.2-wpm-chart.png', fullPage: true });
    // SVG chart โชว์ (เมื่อมีข้อมูล ≥ 2 วัน) หรือซ่อน
    const svg = page.locator('svg polyline, svg path[d]');
    console.log(`SVG polyline count: ${await svg.count()}`);
  });

  test('7.4 — detailed stats per level โชว์', async ({ page }) => {
    await loginAndGoto(page, USERS.student01.email, USERS.student01.password, '/dashboard');
    await page.screenshot({ path: 'e2e/screenshots/7.4-level-stats.png', fullPage: true });
  });

});
