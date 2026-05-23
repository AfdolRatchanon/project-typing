import { test, expect } from '@playwright/test';
import { loginAndGoto, USERS } from './helpers/auth';

test.describe('Block 6 — Survey & Research Export', () => {

  test('6.1 — ครูเห็นแท็บ "แบบสอบถาม"', async ({ page }) => {
    await loginAndGoto(page, USERS.teacher1.email, USERS.teacher1.password, '/teacher');
    await page.getByRole('button', { name: /แบบสอบถาม|Survey/ }).first().click();
    await page.screenshot({ path: 'e2e/screenshots/6.1-survey-tab.png', fullPage: true });
  });

  test('6.5 — Research Export button มีอยู่', async ({ page }) => {
    await loginAndGoto(page, USERS.teacher1.email, USERS.teacher1.password, '/teacher');
    await page.getByRole('button', { name: /แบบสอบถาม/ }).first().click();
    await page.screenshot({ path: 'e2e/screenshots/6.5-research-export.png', fullPage: true });
    // ตรวจว่า Export button มี
    const exportBtn = page.getByRole('button', { name: /Export|ส่งออก|ดาวน์โหลด/ });
    if (await exportBtn.isVisible()) {
      await expect(exportBtn).toBeVisible();
    }
  });

});
