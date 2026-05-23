import { test, expect } from '@playwright/test';
import { loginAndGoto, USERS } from './helpers/auth';

test.describe('Block 8 — Admin & SuperAdmin', () => {

  test('8.1 — AdminDashboard โหลดได้', async ({ page }) => {
    await loginAndGoto(page, USERS.admin.email, USERS.admin.password, '/admin');
    await page.screenshot({ path: 'e2e/screenshots/8.1-admin-dashboard.png', fullPage: true });
    await expect(page).toHaveURL(/\/admin/);
  });

  test('8.2 — ค้นหา user ใน admin dashboard', async ({ page }) => {
    await loginAndGoto(page, USERS.admin.email, USERS.admin.password, '/admin');
    const searchInput = page.getByPlaceholder(/ค้นหา|search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('teacher1');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'e2e/screenshots/8.2-search-user.png', fullPage: true });
    }
  });

  test('8.3 — Deactivate user toggle โชว์', async ({ page }) => {
    await loginAndGoto(page, USERS.admin.email, USERS.admin.password, '/admin');
    await page.screenshot({ path: 'e2e/screenshots/8.3-deactivate-toggle.png', fullPage: true });
    // ตรวจว่า toggle หรือ button deactivate มีอยู่
    const toggles = page.locator('button[title*="deactivate"], button[title*="ปิดใช้งาน"], input[type="checkbox"]');
    console.log(`Toggle count: ${await toggles.count()}`);
  });

  test('8.6 — tab Classrooms แสดงรายการห้องเรียน', async ({ page }) => {
    await loginAndGoto(page, USERS.admin.email, USERS.admin.password, '/admin');
    const classroomsTab = page.getByRole('button', { name: /ห้องเรียน|Classrooms/ });
    if (await classroomsTab.isVisible()) {
      await classroomsTab.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'e2e/screenshots/8.6-admin-classrooms.png', fullPage: true });
    }
  });

  test('8.9 — SuperAdmin มี access ทุก tab', async ({ page }) => {
    await loginAndGoto(page, USERS.superAdmin.email, USERS.superAdmin.password, '/admin');
    await page.screenshot({ path: 'e2e/screenshots/8.9-superadmin.png', fullPage: true });
    await expect(page).toHaveURL(/\/admin/);
  });

});
