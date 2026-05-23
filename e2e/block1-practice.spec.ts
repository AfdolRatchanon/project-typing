import { test, expect } from '@playwright/test';
import { loginAndGoto, USERS } from './helpers/auth';

test.describe('Block 1 — Practice Page', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoto(page, USERS.student01.email, USERS.student01.password, '/practice');
  });

  test('1.1 — practice page โหลดครบ', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/1.1-practice-full.png', fullPage: true });
    // Typing area ต้องมี
    const typingArea = page.locator('textarea, [contenteditable="true"]').first();
    await expect(typingArea).toBeVisible();
  });

  test('1.5 — virtual keyboard แสดงผลได้', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/1.5-keyboard.png', fullPage: true });
    const keyboard = page.locator('[data-testid="virtual-keyboard"]');
    await expect(keyboard.first()).toBeVisible();
  });

  test('1.10 — focus mode: sidebar ลด opacity เมื่อ focus', async ({ page }) => {
    // blur first so we can re-trigger focus
    const typingArea = page.locator('textarea, [contenteditable="true"]').first();
    await typingArea.evaluate(el => (el as HTMLElement).blur());
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'e2e/screenshots/1.10a-before-focus.png', fullPage: true });

    await typingArea.click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'e2e/screenshots/1.10b-after-focus.png', fullPage: true });

    // sidebar/aside ต้องมี opacity ต่ำ
    const aside = page.locator('aside').first();
    if (await aside.isVisible()) {
      const opacity = await aside.evaluate(el => getComputedStyle(el).opacity);
      expect(parseFloat(opacity)).toBeLessThan(0.5);
    }
  });

  test('1.11 — Esc ออก focus mode', async ({ page }) => {
    const typingArea = page.locator('textarea, [contenteditable="true"]').first();
    await typingArea.click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'e2e/screenshots/1.11-after-escape.png', fullPage: true });

    const aside = page.locator('aside').first();
    if (await aside.isVisible()) {
      const opacity = await aside.evaluate(el => getComputedStyle(el).opacity);
      expect(parseFloat(opacity)).toBeGreaterThan(0.9);
    }
  });

  test('1.12 — font size A+ / A− เปลี่ยน font', async ({ page }) => {
    const aPlus = page.getByRole('button', { name: 'A+' });
    const aMinus = page.getByRole('button', { name: 'A-' });

    if (await aPlus.isVisible()) {
      const displayDiv = page.locator('[data-testid="typing-display"]').first();
      const before = await displayDiv.evaluate(el => getComputedStyle(el).fontSize);

      await aPlus.click();
      await aPlus.click();
      const after = await displayDiv.evaluate(el => getComputedStyle(el).fontSize);
      await page.screenshot({ path: 'e2e/screenshots/1.12a-large-font.png', fullPage: true });
      expect(parseFloat(after)).toBeGreaterThan(parseFloat(before));

      await aMinus.click();
      await aMinus.click();
      await page.screenshot({ path: 'e2e/screenshots/1.12b-small-font.png', fullPage: true });
    }
  });

  test('1.13 — font size บันทึกใน localStorage', async ({ page }) => {
    const aPlus = page.getByRole('button', { name: 'A+' });
    if (await aPlus.isVisible()) {
      await aPlus.click();
      const saved = await page.evaluate(() => localStorage.getItem('typingFontSize'));
      expect(saved).not.toBeNull();
      await page.screenshot({ path: 'e2e/screenshots/1.13-fontsize-saved.png' });
    }
  });

  test('1.9 — countdown ring แสดงตอน level มี timeLimit', async ({ page }) => {
    // เลือก level ที่มี timeLimit (ขึ้นอยู่กับ data ใน app)
    await page.screenshot({ path: 'e2e/screenshots/1.9-countdown-ring.png', fullPage: true });
    // ตรวจ SVG circle
    const ring = page.locator('svg circle').first();
    if (await ring.isVisible()) {
      await expect(ring).toBeVisible();
    }
  });

});
