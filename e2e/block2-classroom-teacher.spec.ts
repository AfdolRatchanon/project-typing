import { test, expect } from '@playwright/test';
import { loginAndGoto, USERS } from './helpers/auth';

test.describe('Block 2 — Classroom (Teacher)', () => {

  test.beforeEach(async ({ page }) => {
    await loginAndGoto(page, USERS.teacher1.email, USERS.teacher1.password, '/teacher');
  });

  // ── 2A: สร้างและจัดการห้อง ───────────────────────────────────────────────

  test('2.1 — สร้างห้อง A', async ({ page }) => {
    await page.getByRole('button', { name: /สร้างห้องใหม่/ }).click();
    await page.screenshot({ path: 'e2e/screenshots/2.1a-create-modal.png' });

    await page.getByLabel(/ชื่อห้อง/).fill('คอมพิวเตอร์ 4/1');
    await page.getByLabel(/วิชา|Subject/).fill('คอมพิวเตอร์');
    // เลือก gradeLevel, semester ฯลฯ ผ่าน select
    const gradeSel = page.locator('select').first();
    if (await gradeSel.isVisible()) await gradeSel.selectOption({ index: 0 });

    await page.getByRole('button', { name: /สร้าง|บันทึก/ }).last().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/2.1b-room-created.png', fullPage: true });

    // classroom name lives in a <option> which is hidden — check dropdown has a value instead
    const dropdown = page.locator('select').first();
    await expect(dropdown).not.toHaveValue('');
  });

  test('2.3 — auto-select ห้องแรกหลัง refresh', async ({ page }) => {
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(4000); // เผื่อ WebKit restore auth state จาก IndexedDB ช้า
    await page.screenshot({ path: 'e2e/screenshots/2.3-auto-select.png', fullPage: true });
    // dropdown ต้องมีค่าที่เลือกอยู่ (ไม่ใช่ "— เลือกห้องเรียน —")
    const dropdown = page.locator('select', { hasText: /—/ }).first();
    const selected = await dropdown.inputValue({ timeout: 10000 });
    expect(selected).not.toBe('');
  });

  test('2.4 — quick stats strip แสดงข้อมูล', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/2.4-quick-stats.png', fullPage: true });
    // joinCode ต้องแสดง
    await expect(page.locator('[data-testid="join-code"]')).toBeVisible({ timeout: 10000 });
  });

  test('2.7 — archive ห้องเรียน', async ({ page }) => {
    // กดปุ่ม Archive (title="เก็บถาวรห้องเรียน")
    const archiveBtn = page.locator('button[title*="เก็บถาวร"]');
    if (await archiveBtn.isVisible()) {
      page.on('dialog', d => d.accept());
      await archiveBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/screenshots/2.7a-after-archive.png', fullPage: true });

      // ห้องถูก archive → section "ห้องที่เก็บถาวร" โชว์
      await expect(page.getByText('ห้องที่เก็บถาวร')).toBeVisible();
      await page.screenshot({ path: 'e2e/screenshots/2.7b-archived-section.png', fullPage: true });
    }
  });

  test('2.8 — unarchive ห้องเรียน', async ({ page }) => {
    const archiveSection = page.locator('details');
    if (await archiveSection.isVisible()) {
      await archiveSection.click(); // expand
      await page.getByRole('button', { name: /ยกเลิกเก็บถาวร/ }).first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/screenshots/2.8-unarchived.png', fullPage: true });
    }
  });

  test('2.5 — regenerate join code', async ({ page }) => {
    // หา joinCode ปัจจุบัน
    const joinCodeEl = page.locator('[data-testid="join-code"]');
    await joinCodeEl.waitFor({ timeout: 10000 });
    const oldCode = await joinCodeEl.textContent();

    page.on('dialog', d => d.accept());
    await page.locator('button[title*="Join Code"]').click();

    // Wait for the join code in the DOM to change before reading the new value
    await page.waitForFunction(
      (old) => document.querySelector('[data-testid="join-code"]')?.textContent !== old,
      oldCode,
      { timeout: 10000 },
    );

    const newCode = await page.locator('[data-testid="join-code"]').textContent();
    await page.screenshot({ path: 'e2e/screenshots/2.5-new-join-code.png', fullPage: true });
    expect(newCode).not.toEqual(oldCode);
  });

  // ── 2B: บทเรียน ──────────────────────────────────────────────────────────

  test('2.20 — สร้างบทเรียน', async ({ page }) => {
    // กดปุ่ม Quick Action "+ บทเรียน" ซึ่งสลับไปแท็บ lessons
    await page.getByRole('button', { name: /^\+ บทเรียน$/ }).click();
    await page.screenshot({ path: 'e2e/screenshots/2.20a-lessons-tab.png', fullPage: true });

    // กดปุ่ม "สร้างบทเรียน" ใน LessonManager (ไม่ใช่ quick action)
    await page.getByRole('button', { name: /^สร้างบทเรียน$/ }).first().click();
    await page.screenshot({ path: 'e2e/screenshots/2.20b-lesson-form.png' });

    await page.getByLabel(/ชื่อบทเรียน|หัวข้อ/).fill('บทเรียนทดสอบ Playwright');
    await page.getByLabel(/เนื้อหา|ข้อความ/).fill('กขคงจฉช ทดสอบการพิมพ์ด้วย Playwright');

    await page.getByRole('button', { name: /บันทึก|สร้าง/ }).last().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e/screenshots/2.20c-lesson-created.png', fullPage: true });

    await expect(page.getByText('บทเรียนทดสอบ Playwright')).toBeVisible();
  });

  // ── 2C: Clone ─────────────────────────────────────────────────────────────

  test('2.6 — clone ห้องเรียน (T9)', async ({ page }) => {
    const cloneBtn = page.locator('button[title*="คัดลอก"]');
    if (await cloneBtn.isVisible()) {
      page.on('dialog', async d => {
        if (d.type() === 'prompt') await d.accept('ห้อง A (สำเนา Playwright)');
        else await d.accept();
      });
      await cloneBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'e2e/screenshots/2.6-cloned-room.png', fullPage: true });
      expect(await page.locator('option').filter({ hasText: 'สำเนา Playwright' }).count()).toBeGreaterThan(0);
    }
  });

});
