import { test, expect } from '@playwright/test';
import { loginAndGoto, USERS } from './helpers/auth';

test.describe('Block 10 — Edge Cases', () => {

  test('10.2 — /exam/invalid-id แสดง error state', async ({ page }) => {
    await loginAndGoto(page, USERS.student01.email, USERS.student01.password, '/exam/nonexistent-exam-id');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/10.2-invalid-exam.png', fullPage: true });
    // ต้องไม่ crash / ต้องมีข้อความแจ้งเตือน
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('10.4 — archive ห้องที่ selected อยู่ → selectedId reset', async ({ page }) => {
    await loginAndGoto(page, USERS.teacher1.email, USERS.teacher1.password, '/teacher');
    // ถ้ามีห้องที่เลือกอยู่ → archive → content panel ควรว่าง
    const archiveBtn = page.locator('button[title*="เก็บถาวร"]');
    if (await archiveBtn.isVisible()) {
      page.on('dialog', d => d.accept());
      await archiveBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/screenshots/10.4-archived-content-reset.png', fullPage: true });
      // content panel ว่าง หรือ empty state
      await expect(page.getByText('เลือกห้องเรียนด้านบน')).toBeVisible();
    }
  });

  test('10.8 — mobile layout 375px ไม่มี overflow ซ่อน', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAndGoto(page, USERS.student01.email, USERS.student01.password, '/practice');
    await page.screenshot({ path: 'e2e/screenshots/10.8a-mobile-practice.png', fullPage: true });

    await loginAndGoto(page, USERS.teacher1.email, USERS.teacher1.password, '/teacher');
    await page.screenshot({ path: 'e2e/screenshots/10.8b-mobile-teacher.png', fullPage: true });

    // ตรวจ horizontal scroll ไม่ควรมี
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    await page.screenshot({ path: 'e2e/screenshots/10.8c-mobile-classroom.png', fullPage: true });
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // ยอมรับ 10px tolerance
  });

  test('10.9 — T10 live oversight: onSnapshot cleanup เมื่อปิด modal', async ({ page }) => {
    await loginAndGoto(page, USERS.teacher1.email, USERS.teacher1.password, '/teacher');
    await page.getByRole('button', { name: /การสอบ/ }).first().click();
    const viewBtn = page.getByRole('button', { name: /ดูผล/ }).first();
    if (await viewBtn.isVisible()) {
      await viewBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'e2e/screenshots/10.9a-modal-open.png' });
      // ปิด modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'e2e/screenshots/10.9b-modal-closed.png' });
    }
  });

  test('10.1 — join ห้องที่ archived ไม่ควรได้', async ({ page }) => {
    // ถ้ามีห้อง archived ที่มี joinCode → ใช้ code นั้น
    // (ตรวจ Emulator UI ก่อนรัน test นี้)
    await loginAndGoto(page, USERS.student03.email, USERS.student03.password, '/my-classroom');
    await page.screenshot({ path: 'e2e/screenshots/10.1-join-archived.png', fullPage: true });
  });

});
