import { chromium } from '@playwright/test';
import fs from 'fs';

const BASE = 'http://localhost:5174';
const SS_DIR = 'ux-screenshots';
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop-1920', w: 1920, h: 1080 },
  { name: 'desktop-1280', w: 1280, h: 800  },
  { name: 'laptop-1024',  w: 1024, h: 768  },
  { name: 'tablet-768',   w: 768,  h: 1024 },
  { name: 'mobile-390',   w: 390,  h: 844  },
];

const browser = await chromium.launch({ headless: true });
const issues = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  const ss = async (name) => {
    const path = `${SS_DIR}/${vp.name}_${name}.png`;
    await page.screenshot({ path, fullPage: false });
    console.log(`  📸 ${path}`);
  };

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  ${vp.name}  (${vp.w}×${vp.h})`);
  console.log('═'.repeat(50));

  // ── Landing ──────────────────────────────────
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await ss('landing');

  // ── Enter guest mode ──────────────────────────
  const guestBtn = page.getByRole('button', { name: /ลองเล่น|ทดลอง|guest|ไม่ต้อง.*login/i }).first();
  if (await guestBtn.count() > 0) {
    await guestBtn.click();
    await page.waitForURL(/\/practice/, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(800);
    await ss('practice');

    // ── ตรวจ sidebar ──────────────────────────────
    const sidebar = page.locator('aside, [class*="sidebar"], nav').first();
    const sideBox  = await sidebar.boundingBox().catch(() => null);
    if (sideBox) {
      const ratio = sideBox.width / vp.w;
      const note  = `sidebar width=${sideBox.width}px (${(ratio*100).toFixed(1)}% of viewport)`;
      console.log(`  sidebar: ${note}`);
      if (sideBox.width < 48) issues.push(`[${vp.name}] sidebar แคบมาก: ${sideBox.width}px`);
    }

    // ── ตรวจปุ่ม level selector ──────────────────
    const levelBtns = await page.locator('aside button, nav button').all();
    let smallBtns = 0, hiddenBtns = 0;
    for (const btn of levelBtns) {
      const box = await btn.boundingBox().catch(() => null);
      if (!box) { hiddenBtns++; continue; }
      if (box.height < 28 || box.width < 28) smallBtns++;
    }
    console.log(`  level buttons: total=${levelBtns.length}, small(<28px)=${smallBtns}, hidden=${hiddenBtns}`);
    if (smallBtns > 0) issues.push(`[${vp.name}] ${smallBtns} level buttons เล็กเกิน (< 28px)`);
    if (hiddenBtns > levelBtns.length * 0.5 && levelBtns.length > 0)
      issues.push(`[${vp.name}] ${hiddenBtns}/${levelBtns.length} level buttons ถูกซ่อน`);

    // ── ตรวจ textarea ────────────────────────────
    const ta = page.locator('textarea').first();
    const taBox = await ta.boundingBox().catch(() => null);
    if (taBox) {
      console.log(`  textarea: ${taBox.width}×${taBox.height}px`);
      if (taBox.width < 200) issues.push(`[${vp.name}] textarea แคบมาก: ${taBox.width}px`);
      if (taBox.height < 60) issues.push(`[${vp.name}] textarea เตี้ยมาก: ${taBox.height}px`);
    } else {
      console.log(`  textarea: ไม่พบ`);
    }

    // ── ตรวจ overflow ────────────────────────────
    const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (overflowX) issues.push(`[${vp.name}] มี horizontal overflow (scroll ซ้าย-ขวา)`);
    console.log(`  horizontal overflow: ${overflowX ? '⚠️ YES' : '✅ none'}`);

    // ── ตรวจ virtual keyboard ────────────────────
    const kbd = page.locator('[class*="keyboard"], [class*="Keyboard"]').first();
    const kbdBox = await kbd.boundingBox().catch(() => null);
    if (kbdBox) {
      console.log(`  keyboard: ${kbdBox.width}×${kbdBox.height}px`);
      if (kbdBox.width > vp.w) issues.push(`[${vp.name}] keyboard ล้นหน้าจอ: ${kbdBox.width}px > ${vp.w}px`);
    }

    // ── Game text overflow ─────────────────────
    const gameText = page.locator('[class*="game"], [class*="text-display"], p').first();
    const gtBox = await gameText.boundingBox().catch(() => null);
    if (gtBox && gtBox.width > vp.w) {
      issues.push(`[${vp.name}] game text ล้นหน้าจอ: ${gtBox.width}px`);
    }

    // ── Stats cards overlap check ─────────────
    await ss('practice-stats');

    // ── Keyboard screenshot ───────────────────
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await ss('keyboard');
  } else {
    console.log(`  ⚠️ ไม่พบ guest button`);
  }

  await ctx.close();
}

// ── สรุปปัญหา ─────────────────────────────────────
console.log(`\n${'═'.repeat(50)}`);
console.log(`  UX Audit Summary — ปัญหาที่พบ`);
console.log('═'.repeat(50));
if (issues.length === 0) {
  console.log('  ✅ ไม่พบปัญหา responsive');
} else {
  issues.forEach((iss, i) => console.log(`  ${i+1}. ❌ ${iss}`));
}
console.log('');

await browser.close();
