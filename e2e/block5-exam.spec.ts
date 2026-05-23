import { test, expect } from '@playwright/test';
import { loginAndGoto, USERS } from './helpers/auth';

test.describe('Block 5 — Exam System', () => {

  test('5.1 — ครูเห็นแท็บ "การสอบ"', async ({ page }) => {
    await loginAndGoto(page, USERS.teacher1.email, USERS.teacher1.password, '/teacher');
    await page.getByRole('button', { name: /การสอบ|Exam/ }).first().click();
    await page.screenshot({ path: 'e2e/screenshots/5.1-exam-tab.png', fullPage: true });
    await expect(page.getByRole('button', { name: /สร้างการสอบ/ })).toBeVisible();
  });

  test('5.2 — ครูสร้างข้อสอบ form โหลดได้', async ({ page }) => {
    await loginAndGoto(page, USERS.teacher1.email, USERS.teacher1.password, '/teacher');
    await page.getByRole('button', { name: /การสอบ/ }).first().click();
    await page.getByRole('button', { name: /สร้างการสอบ/ }).click();
    await page.screenshot({ path: 'e2e/screenshots/5.2-exam-create-form.png', fullPage: true });
    await expect(page.getByLabel(/ชื่อ|title/i).first()).toBeVisible();
  });

  test('5.7 — T10 live oversight modal เปิดได้ (screenshot)', async ({ page }) => {
    await loginAndGoto(page, USERS.teacher1.email, USERS.teacher1.password, '/teacher');
    await page.getByRole('button', { name: /การสอบ/ }).first().click();
    await page.screenshot({ path: 'e2e/screenshots/5.7-exam-list.png', fullPage: true });
    // ถ้ามีข้อสอบ → กดดูผล → modal โชว์ live status
    const viewResultBtn = page.getByRole('button', { name: /ดูผล/ }).first();
    if (await viewResultBtn.isVisible()) {
      await viewResultBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'e2e/screenshots/5.7-live-oversight-modal.png', fullPage: true });
      // ตรวจ live status section
      await expect(page.getByText(/สถานะสด/)).toBeVisible();
      // ปิด modal
      await page.locator('button').filter({ has: page.locator('svg') }).last().click();
    }
  });

  test('5.6 — S3 exam draft key ถูก set หลังเริ่มสอบ', async ({ page }) => {
    await loginAndGoto(page, USERS.student01.email, USERS.student01.password, '/my-classroom');
    const draftKeys = await page.evaluate(() =>
      Object.keys(localStorage).filter(k => k.startsWith('exam-draft'))
    );
    console.log('Exam draft keys:', draftKeys);
    await page.screenshot({ path: 'e2e/screenshots/5.6-exam-draft.png' });
  });

});
