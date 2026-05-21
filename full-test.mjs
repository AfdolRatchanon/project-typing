/**
 * full-test.mjs — ทดสอบครบทุก Role + ฟีเจอร์ (Firebase Emulator)
 * Project: project-typing-2026  |  Viewport: 1280×800
 */
import { chromium } from '@playwright/test';
import fs from 'fs';

const BASE        = 'http://localhost:5174';
const AUTH_URL    = 'http://localhost:9099';
const FS_URL      = 'http://localhost:8080';
const PROJECT_ID  = 'project-typing-2026';
const SS_DIR      = 'test-screenshots';
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

// ──────────────────────────────────────────────────────────────
// Test accounts (สร้างใน emulator — ไม่กระทบ production)
// ──────────────────────────────────────────────────────────────
const ACCOUNTS = {
  superAdmin: { email: 'superadmin@test.local', password: 'Test1234!', role: 'superAdmin', name: 'Super Admin', studentId: '' },
  teacher:    { email: 'teacher@test.local',    password: 'Test1234!', role: 'teacher',    name: 'ครูทดสอบ',    studentId: '' },
  student:    { email: 'student@test.local',    password: 'Test1234!', role: 'student',    name: 'นักเรียนทดสอบ', studentId: '001' },
};

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
const results = [];
let pass = 0, fail = 0, warn = 0;
const log = (section, status, msg, detail = '') => {
  results.push({ section, status, msg, detail });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`  ${icon} [${section}] ${msg}${detail ? ' — ' + detail : ''}`);
  if (status === 'PASS') pass++;
  else if (status === 'FAIL') fail++;
  else warn++;
};

// สร้าง user ผ่าน Auth Emulator REST API
async function createEmulatorUser(acc) {
  // ลบ user เดิมถ้ามี
  try {
    const list = await fetch(
      `${AUTH_URL}/identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:lookup`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: [acc.email] }) }
    ).then(r => r.json());
    if (list.users?.[0]?.localId) {
      await fetch(
        `${AUTH_URL}/identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:delete`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ localId: list.users[0].localId }) }
      );
    }
  } catch(e) {}

  // สร้าง user ใหม่
  const res = await fetch(
    `${AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: acc.email, password: acc.password, returnSecureToken: true }) }
  ).then(r => r.json());
  if (res.error) throw new Error(res.error.message);
  return { uid: res.localId, idToken: res.idToken };
}

// เขียน Firestore doc ผ่าน REST (ต้องส่ง idToken เพื่อผ่าน security rules ของ emulator)
async function writeFirestore(path, data, idToken = null) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'string')  fields[k] = { stringValue: v };
    if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    if (typeof v === 'number')  fields[k] = { integerValue: String(v) };
  }
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
  const res = await fetch(
    `${FS_URL}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`,
    { method: 'PATCH', headers, body: JSON.stringify({ fields }) }
  );
  const json = await res.json();
  if (json.error) throw new Error(`Firestore write failed: ${json.error.message}`);
  return json;
}

// อ่าน Firestore doc
async function readFirestore(path) {
  const res = await fetch(
    `${FS_URL}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`
  ).then(r => r.json());
  if (!res.fields) return null;
  const out = {};
  for (const [k, v] of Object.entries(res.fields)) {
    out[k] = v.stringValue ?? v.booleanValue ?? v.integerValue ?? null;
  }
  return out;
}

// ──────────────────────────────────────────────────────────────
// Setup: สร้าง accounts + profiles
// ──────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════');
console.log('  SETUP — สร้าง test accounts ใน emulator');
console.log('══════════════════════════════════════════════');

// ล้าง accounts เดิมทั้งหมดใน emulator ก่อน (เพื่อสร้างใหม่สะอาด)
try {
  await fetch(`${AUTH_URL}/emulator/v1/projects/${PROJECT_ID}/accounts`, { method: 'DELETE' });
  console.log('  🗑️  cleared existing emulator accounts');
} catch(e) { console.log('  ⚠️  clear accounts failed:', e.message); }

const uids = {};
const tokens = {};  // เก็บ idToken ของแต่ละ role ไว้ใช้ต่อ
for (const [key, acc] of Object.entries(ACCOUNTS)) {
  try {
    const { uid, idToken } = await createEmulatorUser(acc);
    uids[key] = uid;
    tokens[key] = idToken;
    if (!uid) throw new Error('UID is undefined — signUp failed');
    // เขียน Firestore profile ด้วย idToken ของ user นั้นเอง (ผ่าน security rules: create if auth.uid == uid)
    await writeFirestore(`users/${uid}`, {
      uid, email: acc.email, role: acc.role,
      firstName: acc.name.split(' ')[0], lastName: acc.name.split(' ')[1] || '',
      studentId: acc.studentId, isProfileComplete: true, createdAt: Date.now(),
    }, idToken);
    console.log(`  ✅ ${key}: ${acc.email}  uid=${uid}`);
  } catch(e) {
    console.log(`  ❌ ${key}: ${e.message}`);
  }
}

// สร้าง classroom สำหรับทดสอบ (ต้องสร้าง profile teacher ก่อน เพราะ isTeacherOrAdmin() ต้องดู role จาก Firestore)
let classroomId = 'test-classroom-001';
try {
  // ใช้ superAdmin token สร้าง classroom (superAdmin มี isTeacherOrAdmin() == true)
  await writeFirestore(`classrooms/${classroomId}`, {
    classroomId, name: 'ห้องทดสอบ', teacherUid: uids.teacher,
    classCode: 'TEST01', joinCode: 'TEST01', isActive: true,
    createdAt: Date.now(),
  }, tokens.superAdmin);
  // เพิ่ม teacher เป็น member (teacher เป็น classroomOwner ได้)
  await writeFirestore(`classrooms/${classroomId}/members/${uids.teacher}`, {
    uid: uids.teacher, role: 'teacher', joinedAt: Date.now(),
    displayName: 'ครูทดสอบ', firstName: 'ครูทดสอบ', lastName: '', studentNumber: 0,
  }, tokens.superAdmin);
  // เพิ่ม student เป็น member (student join ตัวเอง: auth.uid == memberId)
  await writeFirestore(`classrooms/${classroomId}/members/${uids.student}`, {
    uid: uids.student, role: 'student', joinedAt: Date.now(),
    displayName: 'นักเรียนทดสอบ', firstName: 'นักเรียนทดสอบ', lastName: '', studentNumber: 1,
  }, tokens.student);
  console.log(`  ✅ classroom: ${classroomId}`);
} catch(e) {
  console.log(`  ❌ classroom: ${e.message}`);
}

// ──────────────────────────────────────────────────────────────
// Browser helper
// ──────────────────────────────────────────────────────────────
const browser = await chromium.launch({ headless: true });

async function loginAs(page, acc) {
  // โหลด app ก่อนเพื่อให้ Firebase SDK + __devLogin initialize
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // เรียก window.__devLogin ที่ inject ไว้ใน main.tsx (emulator mode เท่านั้น)
  const loginResult = await page.evaluate(async ({ email, password }) => {
    if (typeof window.__devLogin !== 'function') return 'no __devLogin function';
    try {
      await window.__devLogin(email, password);
      return 'ok';
    } catch(e) { return e.message; }
  }, { email: acc.email, password: acc.password });

  if (loginResult !== 'ok') throw new Error('__devLogin: ' + loginResult);

  // รอให้ auth state propagate และ React re-render
  await page.waitForTimeout(3000);

  // ถ้า redirect ไป /complete-profile → แสดงว่า profile ยังไม่พบ ให้รออีก
  if (page.url().includes('/complete-profile')) {
    // navigate กลับ home แล้วรอ auth + profile โหลดอีกครั้ง
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
  }
}

const ss = async (page, name) => {
  const path = `${SS_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  return path;
};

// ══════════════════════════════════════════════════════════════
// TEST SUITE 1: Landing & Guest Mode
// ══════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════');
console.log('  SUITE 1 — Landing & Guest Mode');
console.log('══════════════════════════════════════════════');

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await ss(page, '01_landing');

  const body = await page.locator('body').count() > 0;
  log('Landing', body ? 'PASS' : 'FAIL', 'หน้า Landing โหลดได้');
  log('Landing', errors.length === 0 ? 'PASS' : 'FAIL', 'ไม่มี JS error', errors[0] || '');

  const h1 = await page.locator('h1').first().textContent().catch(() => '');
  log('Landing', h1 ? 'PASS' : 'FAIL', `heading: "${h1?.trim()}"`);

  // Guest mode
  const guestBtn = page.getByRole('button', { name: /ลองเล่น|ลองฝึก|guest|ไม่ต้อง/i }).first();
  if (await guestBtn.count() > 0) {
    await guestBtn.click();
    await page.waitForURL(/\/practice/, { timeout: 8000 }).catch(() => {});
    await ss(page, '02_guest_practice');
    const atPractice = page.url().includes('/practice');
    log('GuestMode', atPractice ? 'PASS' : 'FAIL', 'คลิก Guest → /practice');

    const ta = page.locator('textarea').first();
    log('GuestMode', await ta.isVisible().catch(() => false) ? 'PASS' : 'WARN', 'textarea แสดงผล');

    const guestWarn = await page.locator('text=/โหมดทดลอง|คะแนนไม่/i').count() > 0;
    log('GuestMode', guestWarn ? 'PASS' : 'WARN', 'แสดง guest mode warning');
  } else {
    log('GuestMode', 'FAIL', 'ไม่พบ Guest button');
  }
  await ctx.close();
}

// ══════════════════════════════════════════════════════════════
// TEST SUITE 2: Protected Routes (ไม่ Login)
// ══════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════');
console.log('  SUITE 2 — Protected Routes (no auth)');
console.log('══════════════════════════════════════════════');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  for (const route of ['/dashboard', '/my-classroom', '/teacher', '/admin', '/profile']) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 8000 });
    await page.waitForTimeout(600);
    const url = page.url();
    const redirected = !url.includes(route) || url === BASE + '/';
    log('ProtectedRoute', redirected ? 'PASS' : 'FAIL', `${route} redirect ถูกต้อง`, url);
  }
  await ss(page, '03_protected_redirect');
  await ctx.close();
}

// ══════════════════════════════════════════════════════════════
// SUITE 3: Student Role
// ══════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════');
console.log('  SUITE 3 — Student Role');
console.log('══════════════════════════════════════════════');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  try {
    await loginAs(page, ACCOUNTS.student);
    await ss(page, '04_student_home');

    // ตรวจว่า login สำเร็จ (profile complete ไม่ต้องกรอก)
    const url = page.url();
    log('Student-Login', !url.includes('/complete') ? 'PASS' : 'WARN',
        `Login → "${url.replace(BASE, '') || '/'}"`, url.includes('/complete') ? 'ไปหน้า CompleteProfile' : '');

    // Dashboard
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await ss(page, '05_student_dashboard');
    const dashUrl = page.url();
    log('Student-Dashboard', dashUrl.includes('/dashboard') ? 'PASS' : 'FAIL',
        '/dashboard เข้าได้', dashUrl);

    // My Classroom
    await page.goto(`${BASE}/my-classroom`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await ss(page, '06_student_classroom');
    const classUrl = page.url();
    log('Student-Classroom', classUrl.includes('/my-classroom') ? 'PASS' : 'FAIL',
        '/my-classroom เข้าได้', classUrl);

    // ตรวจหา join classroom UI
    const joinField = await page.locator('input[placeholder*="Code"], input[placeholder*="รหัส"], input[placeholder*="code"]').count() > 0;
    log('Student-JoinCode', joinField ? 'PASS' : 'WARN', 'มีช่อง Join Class Code');

    // Practice
    await page.goto(`${BASE}/practice`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await ss(page, '07_student_practice');
    log('Student-Practice', page.url().includes('/practice') ? 'PASS' : 'FAIL',
        '/practice เข้าได้');

    const sidebar = await page.locator('aside').count() > 0;
    log('Student-Practice', sidebar ? 'PASS' : 'FAIL', 'Sidebar บทเรียนแสดง');

    const ta = page.locator('textarea').first();
    if (await ta.isVisible().catch(() => false)) {
      await ta.click();
      await ta.type('ด', { delay: 80 });
      log('Student-Practice', 'PASS', 'พิมพ์ใน Practice ได้');
    } else {
      log('Student-Practice', 'WARN', 'textarea ไม่ visible');
    }

    // Profile
    await page.goto(`${BASE}/profile`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(800);
    await ss(page, '08_student_profile');
    log('Student-Profile', page.url().includes('/profile') ? 'PASS' : 'FAIL',
        '/profile เข้าได้');

    // admin route should redirect
    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(800);
    log('Student-AccessControl', !page.url().includes('/admin') ? 'PASS' : 'FAIL',
        'Student ไม่สามารถเข้า /admin');

    log('Student-JS', errors.length === 0 ? 'PASS' : 'WARN',
        'ไม่มี JS error', errors[0] || '');
  } catch(e) {
    log('Student-Login', 'FAIL', 'Login ล้มเหลว: ' + e.message);
  }
  await ctx.close();
}

// ══════════════════════════════════════════════════════════════
// SUITE 4: Teacher Role
// ══════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════');
console.log('  SUITE 4 — Teacher Role');
console.log('══════════════════════════════════════════════');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  try {
    await loginAs(page, ACCOUNTS.teacher);
    await ss(page, '09_teacher_home');

    // Teacher page
    await page.goto(`${BASE}/teacher`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    await ss(page, '10_teacher_page');
    log('Teacher-Page', page.url().includes('/teacher') ? 'PASS' : 'FAIL', '/teacher เข้าได้');

    // Classroom list
    const roomList = await page.locator('text=/ห้อง|classroom/i').count() > 0;
    log('Teacher-Classroom', roomList ? 'PASS' : 'WARN', 'รายการห้องเรียนแสดง');

    // คลิกเลือกห้องเรียน "ห้องทดสอบ" → tabs จะปรากฏ
    const classCard = page.locator('text=ห้องทดสอบ').first();
    if (await classCard.count() > 0) {
      await classCard.click();
      await page.waitForTimeout(1500);
      await ss(page, '10b_teacher_classroom_selected');
    }

    // ตรวจ tabs: members, lessons, tests, exam, survey
    const tabs = await page.locator('button').filter({ hasText: /สมาชิก|บทเรียน|การทดสอบ|การสอบ|แบบสอบถาม/i }).count();
    log('Teacher-Tabs', tabs >= 4 ? 'PASS' : 'WARN', `Tab ใน TeacherPage: ${tabs} รายการ`);

    // คลิก tab "การสอบ" (exact label from tabs array)
    const examTab = page.locator('button').filter({ hasText: /^การสอบ$/ }).first();
    if (await examTab.count() > 0) {
      await examTab.click();
      await page.waitForTimeout(800);
      await ss(page, '11_teacher_exam_tab');
      log('Teacher-ExamTab', 'PASS', 'Tab การสอบ เปิดได้');

      const createExam = await page.locator('button').filter({ hasText: /สร้าง.*สอบ|สร้างการสอบ/i }).count() > 0;
      log('Teacher-ExamCreate', createExam ? 'PASS' : 'WARN', 'ปุ่มสร้างการสอบมี');
    } else {
      log('Teacher-ExamTab', 'WARN', 'ไม่พบ Tab การสอบ');
    }

    // คลิก tab "การทดสอบ" (Pre/Post)
    const testTab = page.locator('button').filter({ hasText: /^การทดสอบ$/ }).first();
    if (await testTab.count() > 0) {
      await testTab.click();
      await page.waitForTimeout(800);
      await ss(page, '12_teacher_prepost_tab');
      log('Teacher-PrePostTab', 'PASS', 'Tab การทดสอบ (Pre/Post) เปิดได้');
    } else {
      log('Teacher-PrePostTab', 'WARN', 'ไม่พบ Tab การทดสอบ');
    }

    // คลิก tab "แบบสอบถาม"
    const surveyTab = page.locator('button').filter({ hasText: /^แบบสอบถาม$/ }).first();
    if (await surveyTab.count() > 0) {
      await surveyTab.click();
      await page.waitForTimeout(800);
      await ss(page, '13_teacher_survey_tab');
      log('Teacher-SurveyTab', 'PASS', 'Tab แบบสอบถาม เปิดได้');
    } else {
      log('Teacher-SurveyTab', 'WARN', 'ไม่พบ Tab แบบสอบถาม');
    }

    // Teacher dashboard
    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await ss(page, '14_teacher_dashboard');
    const dashOk = page.url().includes('/admin') || page.url().includes('/dashboard');
    log('Teacher-Dashboard', dashOk ? 'PASS' : 'WARN', 'Teacher dashboard เข้าได้', page.url());

    log('Teacher-JS', errors.length === 0 ? 'PASS' : 'WARN',
        'ไม่มี JS error', errors[0] || '');
  } catch(e) {
    log('Teacher-Login', 'FAIL', 'Login ล้มเหลว: ' + e.message);
  }
  await ctx.close();
}

// ══════════════════════════════════════════════════════════════
// SUITE 5: SuperAdmin Role
// ══════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════');
console.log('  SUITE 5 — SuperAdmin Role');
console.log('══════════════════════════════════════════════');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  try {
    await loginAs(page, ACCOUNTS.superAdmin);
    await ss(page, '15_admin_home');

    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    await ss(page, '16_admin_dashboard');
    log('SuperAdmin-Dashboard', page.url().includes('/admin') ? 'PASS' : 'FAIL',
        '/admin เข้าได้ (AdminDashboard)');

    // ตรวจ admin features
    const adminContent = await page.locator('h1, h2').first().textContent().catch(() => '');
    log('SuperAdmin-Dashboard', adminContent ? 'PASS' : 'WARN',
        `Dashboard heading: "${adminContent?.trim()}"`);

    log('SuperAdmin-JS', errors.length === 0 ? 'PASS' : 'WARN',
        'ไม่มี JS error', errors[0] || '');
  } catch(e) {
    log('SuperAdmin-Login', 'FAIL', 'Login ล้มเหลว: ' + e.message);
  }
  await ctx.close();
}

// ══════════════════════════════════════════════════════════════
// SUITE 6: Theme & Responsive
// ══════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════');
console.log('  SUITE 6 — Theme & Responsive');
console.log('══════════════════════════════════════════════');
{
  for (const vp of [{ w: 1920, h: 1080, name: 'desktop-1920' }, { w: 1280, h: 800, name: 'desktop-1280' }, { w: 1024, h: 768, name: 'laptop-1024' }, { w: 390, h: 844, name: 'mobile-390' }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 10000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    log('Responsive', !overflow ? 'PASS' : 'FAIL', `${vp.name} (${vp.w}×${vp.h}) — ไม่มี horizontal overflow`);

    const guestBtn = page.getByRole('button', { name: /ลองเล่น|ลองฝึก|guest|ไม่ต้อง/i }).first();
    if (await guestBtn.count() > 0) {
      await guestBtn.click();
      await page.waitForURL(/\/practice/, { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(800);
      await ss(page, `17_responsive_${vp.name}`);
      // ตรวจ sidebar
      const sideBox = await page.locator('aside').first().boundingBox().catch(() => null);
      if (sideBox) {
        const isNarrow = sideBox.width < 28;
        log('Responsive', !isNarrow ? 'PASS' : 'FAIL',
            `${vp.name}: sidebar=${sideBox.width}px`);
      }
    }
    await ctx.close();
  }

  // Theme switch
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page2 = await ctx2.newPage();
  await page2.goto(BASE, { waitUntil: 'networkidle', timeout: 10000 });
  const themeBefore = await page2.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const allBtns = await page2.locator('button').all();
  let toggled = false;
  for (const btn of allBtns) {
    const box = await btn.boundingBox().catch(() => null);
    if (box && box.x > 1100 && box.y > 680) {
      await btn.click();
      await page2.waitForTimeout(400);
      const opts = await page2.locator('div.bg-white button').all();
      for (const opt of opts) {
        const t = await opt.textContent().catch(() => '');
        if (t && !t.includes(themeBefore || '')) { await opt.click(); toggled = true; break; }
      }
      break;
    }
  }
  const themeAfter = await page2.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await ss(page2, '18_theme_toggled');
  log('Theme', (toggled && themeBefore !== themeAfter) ? 'PASS' : 'WARN',
      `Theme switch: "${themeBefore}" → "${themeAfter}"`);
  await ctx2.close();
}

// ══════════════════════════════════════════════════════════════
// SUITE 7: ExamRoom & PrePostTestRoom (URL accessible)
// ══════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════');
console.log('  SUITE 7 — Exam/PrePost Room Routes');
console.log('══════════════════════════════════════════════');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  try {
    await loginAs(page, ACCOUNTS.student);

    // /exam/:id ที่ไม่มีอยู่จริง → ควรแสดง "ไม่พบการสอบ" หรือ redirect
    await page.goto(`${BASE}/exam/nonexistent-exam`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    await ss(page, '19_exam_notfound');
    const notFound = await page.locator('text=/ไม่พบ|not found|404/i').count() > 0;
    const redirected = !page.url().includes('/exam');
    log('ExamRoom', (notFound || redirected) ? 'PASS' : 'WARN',
        'ExamRoom ไม่มีจริง → แสดงข้อความ/redirect');

    // /test/:id ที่ไม่มีอยู่จริง
    await page.goto(`${BASE}/test/nonexistent-test`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    await ss(page, '20_prepost_notfound');
    const notFound2 = await page.locator('text=/ไม่พบ|not found|404/i').count() > 0;
    const redirected2 = !page.url().includes('/test');
    log('PrePostRoom', (notFound2 || redirected2) ? 'PASS' : 'WARN',
        'PrePostTestRoom ไม่มีจริง → แสดงข้อความ/redirect');

    // /survey/:id
    await page.goto(`${BASE}/survey/nonexistent-survey`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    await ss(page, '21_survey_notfound');
    const notFound3 = await page.locator('text=/ไม่พบ|not found|404/i').count() > 0;
    const redirected3 = !page.url().includes('/survey');
    log('SurveyPage', (notFound3 || redirected3) ? 'PASS' : 'WARN',
        'SurveyPage ไม่มีจริง → แสดงข้อความ/redirect');

    log('ExamRoutes-JS', errors.length === 0 ? 'PASS' : 'WARN',
        'ไม่มี JS error ใน exam routes', errors[0] || '');
  } catch(e) {
    log('ExamRoutes', 'FAIL', 'ทดสอบล้มเหลว: ' + e.message);
  }
  await ctx.close();
}

await browser.close();

// ══════════════════════════════════════════════════════════════
// สรุปผล
// ══════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════');
console.log(`  สรุป: ✅ ${pass}  ❌ ${fail}  ⚠️  ${warn}`);
console.log('══════════════════════════════════════════════');

// เขียน TEST-REPORT.md
const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
const statusIcon = fail > 0 ? '❌ FAIL' : warn > 0 ? '⚠️ PASS with warnings' : '✅ PASS';

const bySection = {};
for (const r of results) {
  if (!bySection[r.section]) bySection[r.section] = [];
  bySection[r.section].push(r);
}

let md = `# Test Report — Project Typing 2026
**วันที่ทดสอบ:** ${now}
**สภาพแวดล้อม:** Firebase Emulator (Auth:9099, Firestore:8080, UI:4000)
**Dev server:** http://localhost:5174
**สถานะรวม:** ${statusIcon} (✅ ${pass} / ❌ ${fail} / ⚠️ ${warn})

---

## Test Accounts (Emulator Only — ไม่ใช่ Production)

| Role | Email | Password | UID |
|------|-------|----------|-----|
| superAdmin | superadmin@test.local | Test1234! | ${uids.superAdmin || '-'} |
| teacher | teacher@test.local | Test1234! | ${uids.teacher || '-'} |
| student | student@test.local | Test1234! | ${uids.student || '-'} |

> ⚠️ accounts เหล่านี้มีเฉพาะใน Firebase **Emulator** เท่านั้น ไม่มีใน Production

## Test Classroom (Emulator Only)

| Field | Value |
|-------|-------|
| classroomId | test-classroom-001 |
| name | ห้องทดสอบ |
| classCode / joinCode | TEST01 |
| teacher | teacher@test.local |
| student | student@test.local |

---

## ผลการทดสอบแยกตาม Suite

`;

for (const [section, items] of Object.entries(bySection)) {
  md += `### ${section}\n`;
  for (const r of items) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    md += `- ${icon} **${r.status}** — ${r.msg}${r.detail ? ` *(${r.detail})*` : ''}\n`;
  }
  md += '\n';
}

md += `---

## Screenshots
Screenshots อยู่ใน \`test-screenshots/\` (${fs.readdirSync(SS_DIR).length} ไฟล์)

## การตั้งค่า Environment
\`\`\`
VITE_USE_EMULATOR=true   ← ใช้ Emulator (ตอนนี้)
VITE_USE_EMULATOR=false  ← เปลี่ยนก่อน deploy Production
\`\`\`

## หมายเหตุ
- ทดสอบด้วย Playwright (headless Chromium)
- Firebase Auth Emulator: สร้าง/ลบ user ผ่าน REST API
- Firestore Emulator: เขียน doc โดยตรงผ่าน REST API
- Login inject ผ่าน localStorage (emulator auth state)
`;

fs.writeFileSync('TEST-REPORT.md', md, 'utf8');
console.log('\n  📄 บันทึกผลใน TEST-REPORT.md');
console.log('  📸 screenshots ใน test-screenshots/');
if (fail > 0) console.log('  → FAIL');
else if (warn > 0) console.log('  → PASS with warnings');
else console.log('  → PASS');
