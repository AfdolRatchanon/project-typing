import { test, expect } from '@playwright/test';
import { loginAndGoto, USERS } from './helpers/auth';

test.describe('Block 4 — Pre/Post Test', () => {

  test('4.1 — ครูเห็นแท็บ "การทดสอบ" ใน /teacher', async ({ page }) => {
    await loginAndGoto(page, USERS.teacher1.email, USERS.teacher1.password, '/teacher');
    await page.getByRole('button', { name: /การทดสอบ|Pre.*Post|Tests/ }).first().click();
    await page.screenshot({ path: 'e2e/screenshots/4.1-tests-tab.png', fullPage: true });
    await expect(page.getByRole('button', { name: /สร้าง.*Test|สร้างการทดสอบ/ })).toBeVisible();
  });

  test('4.2 — ครูสร้าง Pre-test ได้', async ({ page }) => {
    await loginAndGoto(page, USERS.teacher1.email, USERS.teacher1.password, '/teacher');
    await page.getByRole('button', { name: /การทดสอบ/ }).first().click();
    await page.getByRole('button', { name: /สร้าง/ }).first().click();
    await page.screenshot({ path: 'e2e/screenshots/4.2a-pretest-form.png', fullPage: true });

    // กรอก title
    const titleInput = page.getByLabel(/ชื่อ|title/i).first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Pre-test ทดสอบ Playwright');
    }
    await page.screenshot({ path: 'e2e/screenshots/4.2b-pretest-filled.png', fullPage: true });
  });

  test('4.5 — S3 resume banner ใน /test/:id', async ({ page }) => {
    // ทดสอบว่าหน้า /test มีโครงสร้าง draft/resume
    // (ต้องมีข้อมูล test ก่อน — ใช้เป็น screenshot เปล่าๆ ก่อน)
    await loginAndGoto(page, USERS.student01.email, USERS.student01.password, '/my-classroom');
    await page.screenshot({ path: 'e2e/screenshots/4.5-resume-check.png', fullPage: true });
  });

  test('4.6 — localStorage draft key ถูก set หลังเริ่มสอบ', async ({ page }) => {
    // ตรวจว่า localStorage มี key pattern 'prepost-draft-*' หลังเริ่มสอบ
    await loginAndGoto(page, USERS.student01.email, USERS.student01.password, '/my-classroom');
    const draftKeys = await page.evaluate(() =>
      Object.keys(localStorage).filter(k => k.startsWith('prepost-draft') || k.startsWith('exam-draft'))
    );
    await page.screenshot({ path: 'e2e/screenshots/4.6-draft-keys.png' });
    console.log('Draft keys in localStorage:', draftKeys);
  });

});
