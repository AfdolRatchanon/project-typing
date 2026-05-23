/**
 * Auth helpers สำหรับ Playwright tests
 * ใช้ window.__devLogin ที่ main.tsx inject ไว้ตอน VITE_USE_EMULATOR=true
 */

import type { Page } from '@playwright/test';

// ── Test accounts ─────────────────────────────────────────────────────────────

export const USERS = {
  teacher1:   { email: 'teacher1@test.com',    password: 'test1234', displayName: 'ครูทดสอบ 1' },
  teacher2:   { email: 'teacher2@test.com',    password: 'test1234', displayName: 'ครูทดสอบ 2' },
  student01:  { email: 'student01@test.com',   password: 'test1234', displayName: 'นักเรียน 01' },
  student02:  { email: 'student02@test.com',   password: 'test1234', displayName: 'นักเรียน 02' },
  student03:  { email: 'student03@test.com',   password: 'test1234', displayName: 'นักเรียน 03' },
  admin:      { email: 'admin@test.com',       password: 'test1234', displayName: 'Admin ทดสอบ' },
  superAdmin: { email: 'superadmin@test.com',  password: 'test1234', displayName: 'SuperAdmin' },
} as const;

// ── Login / Logout ────────────────────────────────────────────────────────────

/**
 * Login ผ่าน window.__devLogin ที่ inject ไว้ใน main.tsx
 * รอ networkidle เพื่อให้ Firestore profile โหลดเสร็จก่อน
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/');
  // รอ __devLogin พร้อม (inject แบบ async ใน main.tsx)
  await page.waitForFunction(
    () => typeof (window as any).__devLogin === 'function',
    { timeout: 15_000 },
  );
  await page.evaluate(
    ({ e, p }: { e: string; p: string }) => (window as any).__devLogin(e, p),
    { e: email, p: password },
  );
  // รอ auth propagate — networkidle ไม่ได้ใช้เพราะ onSnapshot listeners ทำให้ไม่ settle
  await page.waitForLoadState('load');
  await page.waitForTimeout(2500);
}

/** Logout */
export async function logout(page: Page): Promise<void> {
  await page.evaluate(() => (window as any).__devSignOut?.());
  await page.waitForTimeout(500);
}

/** Login แล้ว navigate ไป route ที่ต้องการ (in-SPA navigation, auth state stays in memory) */
export async function loginAndGoto(page: Page, email: string, password: string, route: string): Promise<void> {
  await login(page, email, password);
  // ใช้ React Router navigate แทน page.goto เพื่อไม่ให้ Firebase auth reset
  await page.waitForFunction(() => typeof (window as any).__devNavigate === 'function', { timeout: 5000 });
  await page.evaluate((r) => (window as any).__devNavigate(r), route);
  // รอ navigation settle — ไม่ fail ถ้า redirect เกิดขึ้น (เช่น student → /teacher redirect ไป /practice)
  await page.waitForTimeout(2500);
}
