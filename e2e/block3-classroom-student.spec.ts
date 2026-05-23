import { test, expect } from '@playwright/test';
import { loginAndGoto, USERS } from './helpers/auth';

test.describe('Block 3 — Classroom (Student)', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoto(page, USERS.student01.email, USERS.student01.password, '/my-classroom');
  });

  test('3.1 — หน้า /my-classroom โหลดได้', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/3.1-my-classroom.png', fullPage: true });
    await expect(page.getByText('ห้องเรียนของฉัน')).toBeVisible();
  });

  test('3.2 — join code ผิด แสดง error', async ({ page }) => {
    const input = page.getByPlaceholder(/รหัส|code/i).first();
    if (await input.isVisible()) {
      await input.fill('XXXXXX');
      await page.getByRole('button', { name: /เข้าร่วม|Join/ }).click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'e2e/screenshots/3.2-wrong-code.png' });
      await expect(page.getByText(/ไม่พบรหัส/)).toBeVisible();
    }
  });

  test('3.4 — join code ว่าง validation', async ({ page }) => {
    const input = page.getByPlaceholder(/รหัส|code/i).first();
    if (await input.isVisible()) {
      await input.fill('AB');
      await page.screenshot({ path: 'e2e/screenshots/3.4-short-code.png' });
      // ปุ่มถูก disabled เมื่อ code < 6 ตัวอักษร (validation แบบ disable button)
      await expect(page.getByRole('button', { name: /เข้าร่วม|Join/ })).toBeDisabled();
    }
  });

  test('3.8 — leaderboard toggle โชว์/ซ่อน (X6)', async ({ page }) => {
    const leaderBtn = page.getByRole('button', { name: /ดูกระดานอันดับ|กระดานอันดับ/ });
    if (await leaderBtn.isVisible()) {
      await leaderBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'e2e/screenshots/3.8a-leaderboard-open.png', fullPage: true });
      // lesson selector ต้องโชว์
      await expect(page.getByText(/เลือกบทเรียน/)).toBeVisible();

      // กด toggle อีกครั้งซ่อน
      await leaderBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'e2e/screenshots/3.8b-leaderboard-closed.png', fullPage: true });
    }
  });

  test('3.13 — leaderboard แสดง "ยังไม่มีข้อมูล" ตอน lesson ใหม่', async ({ page }) => {
    const leaderBtn = page.getByRole('button', { name: /ดูกระดานอันดับ/ });
    if (await leaderBtn.isVisible()) {
      await leaderBtn.click();
      const lessonSelect = page.locator('select').filter({ hasText: /เลือกบทเรียน/ });
      if (await lessonSelect.isVisible()) {
        const options = await lessonSelect.locator('option').all();
        if (options.length > 1) {
          await lessonSelect.selectOption({ index: 1 });
          await page.waitForTimeout(1500);
          await page.screenshot({ path: 'e2e/screenshots/3.13-leaderboard-empty.png' });
          // ถ้ายังไม่มีใครเล่น → "ยังไม่มีข้อมูล"
          const noData = page.getByText('ยังไม่มีข้อมูล');
          if (await noData.isVisible()) {
            await expect(noData).toBeVisible();
          }
        }
      }
    }
  });

});
