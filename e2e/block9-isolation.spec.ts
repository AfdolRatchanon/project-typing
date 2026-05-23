import { test, expect } from '@playwright/test';
import { loginAndGoto, USERS } from './helpers/auth';

test.describe('Block 9 — Teacher Isolation', () => {

  test('9.1 — Teacher 2 เห็นเฉพาะห้องของตัวเอง', async ({ page }) => {
    await loginAndGoto(page, USERS.teacher2.email, USERS.teacher2.password, '/teacher');
    await page.screenshot({ path: 'e2e/screenshots/9.1-teacher2-rooms.png', fullPage: true });
    // ห้องของ Teacher 1 ต้องไม่โชว์
    await expect(page.getByText('คอมพิวเตอร์ 4/1')).not.toBeVisible();
  });

  test('9.2 — Teacher 2 ไม่เห็นข้อมูล Teacher 1', async ({ page }) => {
    await loginAndGoto(page, USERS.teacher2.email, USERS.teacher2.password, '/teacher');
    // ตรวจ dropdown ว่าไม่มีห้องของ Teacher 1
    const dropdown = page.locator('select').first();
    if (await dropdown.isVisible()) {
      const options = await dropdown.locator('option').allTextContents();
      const hasTeacher1Room = options.some(o => o.includes('4/1') || o.includes('ครูทดสอบ 1'));
      await page.screenshot({ path: 'e2e/screenshots/9.2-teacher2-dropdown.png' });
      expect(hasTeacher1Room).toBe(false);
    }
  });

  test('9.3 — Student ไม่สามารถเข้า /teacher ได้', async ({ page }) => {
    await loginAndGoto(page, USERS.student01.email, USERS.student01.password, '/teacher');
    await page.screenshot({ path: 'e2e/screenshots/9.3-student-blocked.png', fullPage: true });
    await expect(page.getByText('จัดการห้องเรียน')).not.toBeVisible();
  });

});
