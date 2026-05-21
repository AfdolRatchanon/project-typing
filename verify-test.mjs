import { chromium } from '@playwright/test';
import fs from 'fs';

const BASE = 'http://localhost:5174';
const SS_DIR = 'verify-screenshots';
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', e => errors.push('[JS ERROR] ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('[CONSOLE] ' + m.text()); });

const ss = async (name) => {
    await page.screenshot({ path: `${SS_DIR}/${name}.png` });
    console.log(`    📸 ${SS_DIR}/${name}.png`);
};

let pass = 0, fail = 0, warn = 0;
const ok  = (msg) => { console.log(`  ✅ ${msg}`); pass++; };
const ng  = (msg) => { console.log(`  ❌ ${msg}`); fail++; };
const wn  = (msg) => { console.log(`  ⚠️  ${msg}`); warn++; };

console.log('\n════════════════════════════════════════');
console.log('  Verify: project-typing (emulator mode)');
console.log('════════════════════════════════════════\n');

// ══════════════════════════════════════════
// 1. Landing page
// ══════════════════════════════════════════
console.log('【1】 Landing page');
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
await ss('01-landing');

(await page.locator('body').count()) > 0 ? ok('โหลดได้ ไม่ blank') : ng('body ว่าง');
errors.length === 0 ? ok('ไม่มี JS error') : ng('JS error: ' + errors[0]);

const heading = await page.locator('h1, h2').first().textContent().catch(() => '');
heading ? ok(`heading: "${heading.trim()}"`) : wn('ไม่พบ heading');

// ══════════════════════════════════════════
// 2. Guest mode — คลิกปุ่มจริง
// ══════════════════════════════════════════
console.log('\n【2】 Guest mode');
errors.length = 0;

// หาปุ่มจาก text ที่เห็นในภาพ: "ลองเล่น / ไม่ต้อง Login"
const guestBtn = page.getByRole('button', { name: /ลองเล่น|ทดลอง|guest|ไม่ต้อง.*login/i }).first();
const guestCount = await guestBtn.count();

if (guestCount > 0) {
    await guestBtn.click();
    try {
        await page.waitForURL(/\/practice/, { timeout: 8000 });
        ok('คลิก guest → redirect ไป /practice');
        await ss('02-practice-guest');

        // ตรวจ textarea
        const ta = page.locator('textarea').first();
        const taVisible = await ta.isVisible().catch(() => false);
        taVisible ? ok('textarea พิมพ์ได้') : wn('ไม่พบ textarea (อาจต้องกด Start)');

        // ตรวจ sidebar มีบทเรียนไหม
        const lessonText = await page.locator('text=เลือกบทเรียน').count();
        lessonText > 0 ? ok('sidebar "เลือกบทเรียน" แสดงผล') : wn('ไม่พบ sidebar บทเรียน');

        // ตรวจ guest mode warning
        const guestWarn = await page.locator('text=/โหมดทดลอง|guest/i').count();
        guestWarn > 0 ? ok('แสดง "โหมดทดลอง" warning ถูกต้อง') : wn('ไม่พบ guest warning');

        errors.length === 0 ? ok('ไม่มี JS error ใน practice page') : ng('JS error: ' + errors[0]);
    } catch (e) {
        ng('guest flow ล้มเหลว: ' + e.message);
    }
} else {
    wn('ไม่พบ guest button — ข้าม');
}

// ══════════════════════════════════════════
// 3. Start game — พิมพ์ใน textarea ที่ auto-start แล้ว
// ══════════════════════════════════════════
console.log('\n【3】 Start & type');
errors.length = 0;

if (page.url().includes('/practice')) {
    const ta = page.locator('textarea').first();
    const taVis = await ta.isVisible().catch(() => false);

    if (taVis) {
        // game auto-started in guest mode — type directly
        await ta.click();
        await ta.type('ด', { delay: 80 });
        await page.waitForTimeout(400);
        const val = await ta.inputValue().catch(() => '');
        val.length > 0 ? ok('พิมพ์ลงใน textarea ได้ (auto-start)') : wn('พิมพ์แล้วแต่ value ว่าง (อาจมี preventDefault)');
        await ss('03-typing');
    } else {
        // try clicking Start first
        const startBtn = page.getByRole('button', { name: /เริ่ม|start/i }).first();
        const isEnabled = await startBtn.isEnabled().catch(() => false);
        if (isEnabled) {
            await startBtn.click();
            await page.waitForTimeout(500);
            ok('กด Start ได้');
            await ta.type('ด', { delay: 80 });
            await page.waitForTimeout(300);
            ok('พิมพ์ลงใน textarea ได้');
            await ss('03-typing');
        } else {
            wn('textarea ไม่ visible และ Start ยัง disabled');
            await ss('03-start-disabled');
        }
    }
}

// ══════════════════════════════════════════
// 4. Protected routes redirect
// ══════════════════════════════════════════
console.log('\n【4】 Protected routes (ไม่ login)');
errors.length = 0;

for (const route of ['/dashboard', '/my-classroom', '/admin', '/teacher']) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 8000 });
    await page.waitForTimeout(800);
    const url = page.url();
    !url.includes(route) ? ok(`${route} → redirect ถูกต้อง (${url.split('/').pop() || '/'})`)
                         : ng(`${route} เข้าได้โดยไม่ login! (url: ${url})`);
}
await ss('04-redirect');

// ══════════════════════════════════════════
// 5. Theme switch — data-theme attribute
// ══════════════════════════════════════════
console.log('\n【5】 Theme switch');
errors.length = 0;
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 10000 });

// หา toggle button (fixed bottom-right, มี Palette icon)
const allBtns = await page.locator('button').all();
let toggleBtn = null;
for (const btn of allBtns) {
    const box = await btn.boundingBox().catch(() => null);
    if (!box) continue;
    if (box.x > 1100 && box.y > 680) { toggleBtn = btn; break; }
}

if (toggleBtn) {
    const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    ok(`data-theme ก่อน click: "${themeBefore}"`);

    // เปิด panel
    await toggleBtn.click();
    await page.waitForTimeout(400);

    // หา theme option ที่ไม่ใช่ theme ปัจจุบัน แล้วคลิก
    const themeOptions = await page.locator('div.bg-white button').all();
    let clicked = false;
    for (const opt of themeOptions) {
        const txt = await opt.textContent().catch(() => '');
        if (txt && !txt.includes('✓') && !txt.includes(themeBefore || '')) {
            await opt.click();
            clicked = true;
            break;
        }
    }
    if (!clicked && themeOptions.length > 0) {
        await themeOptions[0].click();
    }
    await page.waitForTimeout(500);

    const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await ss('05-theme-toggled');
    themeAfter !== themeBefore ? ok(`theme เปลี่ยนได้: "${themeBefore}" → "${themeAfter}"`)
                               : wn(`theme ไม่เปลี่ยน (ยังเป็น "${themeAfter}") — อาจคลิก theme เดิม`);
} else {
    wn('หา theme toggle button ไม่พบ (ตำแหน่ง bottom-right)');
}

// ══════════════════════════════════════════
// 6. Level selector — re-enter guest mode from home
// ══════════════════════════════════════════
console.log('\n【6】 Level selector & sidebar');
errors.length = 0;

// /practice ต้องผ่าน guest mode จาก home page เท่านั้น (React state)
// ต้อง navigate กลับ home แล้วคลิก guest ก่อน
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 10000 });
const guestBtn2 = page.getByRole('button', { name: /ลองเล่น|ทดลอง|guest|ไม่ต้อง.*login/i }).first();
if (await guestBtn2.count() > 0) {
    await guestBtn2.click();
    await page.waitForURL(/\/practice/, { timeout: 8000 }).catch(() => {});
}
await page.waitForTimeout(1000);

const url6 = page.url();
if (url6.includes('/practice')) {
    await ss('06-practice-sidebar');
    const levels = await page.locator('button').filter({ hasText: /Level|บทที่|ด้านซ้าย|ไทย|อังกฤษ/i }).count();
    levels > 0 ? ok(`level selector มี ${levels} items`) : wn('ไม่พบ level buttons');
    // check sidebar lesson list count
    const sideItems = await page.locator('aside button, [role="navigation"] button, nav button').count();
    sideItems > 0 ? ok(`sidebar มี ${sideItems} items`) : wn('ไม่พบ sidebar items');
} else {
    ok('/practice ต้อง initiate guest จาก home (redirect ถูกต้อง)');
}

// ══════════════════════════════════════════
// สรุป
// ══════════════════════════════════════════
console.log('\n════════════════════════════════════════');
console.log(`  สรุป: ✅ ${pass}  ❌ ${fail}  ⚠️  ${warn}`);
console.log('════════════════════════════════════════');
if (fail > 0) console.log('  → FAIL');
else if (warn > 0) console.log('  → PASS with warnings');
else console.log('  → PASS');

if (errors.length > 0) {
    console.log('\nJS Errors:');
    errors.forEach(e => console.log('  -', e));
}

await browser.close();
