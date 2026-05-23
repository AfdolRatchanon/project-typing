import { test, expect } from '@playwright/test';
import { login, loginAndGoto, USERS } from './helpers/auth';

test.describe('Block 0 — Authentication', () => {

  test('0.1 — landing page โหลดไม่ blank ไม่มี JS error', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e/screenshots/0.1-landing.png', fullPage: true });
    const jsErrors = errors.filter(e => !e.includes('favicon') && !e.includes('404'));
    expect(jsErrors, `JS Errors: ${jsErrors.join(', ')}`).toHaveLength(0);
  });

  test('0.2 — guest mode ไปหน้า /practice ได้', async ({ page }) => {
    await page.goto('/');
    const guestBtn = page.getByRole('button', { name: /ทดลองใช้|guest|ฝึก/i }).first();
    await guestBtn.click();
    await page.waitForURL(/\/practice/);
    await page.screenshot({ path: 'e2e/screenshots/0.2-guest-practice.png', fullPage: true });
    await expect(page).toHaveURL(/\/practice/);
  });

  test('0.5 — teacher1 login → ไป /teacher ได้', async ({ page }) => {
    await loginAndGoto(page, USERS.teacher1.email, USERS.teacher1.password, '/teacher');
    await page.screenshot({ path: 'e2e/screenshots/0.5-teacher-dashboard.png', fullPage: true });
    await expect(page.getByText('จัดการห้องเรียน')).toBeVisible();
  });

  test('0.6 — student ไม่สามารถเข้า /teacher ได้', async ({ page }) => {
    await loginAndGoto(page, USERS.student01.email, USERS.student01.password, '/teacher');
    await page.screenshot({ path: 'e2e/screenshots/0.6-student-blocked.png', fullPage: true });
    await expect(page.getByText('จัดการห้องเรียน')).not.toBeVisible();
  });

  test('0.7 — guest ไม่สามารถเข้า /dashboard ได้', async ({ page }) => {
    await page.goto('/dashboard');
    await page.screenshot({ path: 'e2e/screenshots/0.7-guest-dashboard-blocked.png' });
    // ควร redirect หรือแสดง login prompt
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test('0.9 — theme toggle เปลี่ยน dark/light', async ({ page }) => {
    await page.goto('/');
    await page.screenshot({ path: 'e2e/screenshots/0.9a-light-mode.png' });
    const themeBtn = page.locator('button[title*="ธีม"], button[aria-label*="theme"], button[title*="Dark"], button[title*="Light"]').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.screenshot({ path: 'e2e/screenshots/0.9b-dark-mode.png' });
    }
  });

  test('0.10 — theme บันทึกหลัง refresh', async ({ page }) => {
    await page.goto('/');
    const htmlEl = page.locator('html');
    const before = await htmlEl.getAttribute('data-theme') ?? await htmlEl.getAttribute('class');
    // toggle
    const themeBtn = page.locator('button[title*="ธีม"], button[aria-label*="theme"]').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.reload();
      const after = await htmlEl.getAttribute('data-theme') ?? await htmlEl.getAttribute('class');
      expect(after).not.toEqual(before);
      await page.screenshot({ path: 'e2e/screenshots/0.10-theme-persisted.png' });
    }
  });

});
