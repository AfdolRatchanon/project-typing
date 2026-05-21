import { chromium } from '@playwright/test';

const BASE = 'http://localhost:5174';
const browser = await chromium.launch({ headless: true });

for (const vp of [{ w: 1280, h: 800 }, { w: 1440, h: 900 }, { w: 1536, h: 864 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();

  // landing
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  const guestBtn = page.getByRole('button', { name: /ลองเล่น|ทดลอง|guest|ไม่ต้อง.*login/i }).first();
  await guestBtn.click();
  await page.waitForURL(/\/practice/, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(800);

  const data = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    const main  = document.querySelector('main');
    const parent = aside?.parentElement;
    const cs = aside ? getComputedStyle(aside) : null;
    const pcs = parent ? getComputedStyle(parent) : null;
    const r = aside?.getBoundingClientRect();
    return {
      innerWidth: window.innerWidth,
      asideW: r?.width,
      asideClasses: aside?.className,
      asideFlexBasis: cs?.flexBasis,
      asideMinWidth: cs?.minWidth,
      asideMaxWidth: cs?.maxWidth,
      asideWidth: cs?.width,
      parentFlexDir: pcs?.flexDirection,
      mainW: main?.getBoundingClientRect().width,
    };
  });

  console.log(`\n[${vp.w}×${vp.h}]`);
  console.log('  flexDir:', data.parentFlexDir);
  console.log('  aside rect.width:', data.asideW);
  console.log('  aside computed width:', data.asideWidth);
  console.log('  aside flex-basis:', data.asideFlexBasis);
  console.log('  aside min-width:', data.asideMinWidth);
  console.log('  aside max-width:', data.asideMaxWidth);
  console.log('  main rect.width:', data.mainW);
  console.log('  aside classes:', data.asideClasses?.substring(0, 120));
  await ctx.close();
}

await browser.close();
