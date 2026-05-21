import { chromium } from '@playwright/test';
const BASE = 'http://localhost:5174';
const browser = await chromium.launch({ headless: true });

// Test at exactly 1280px
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
const guestBtn = page.getByRole('button', { name: /ลองเล่น|ทดลอง|guest|ไม่ต้อง.*login/i }).first();
await guestBtn.click();
await page.waitForURL(/\/practice/, { timeout: 8000 }).catch(() => {});
await page.waitForTimeout(1000);

const data = await page.evaluate(() => {
  const aside = document.querySelector('aside');
  const parent = aside?.parentElement;
  const cs = window.getComputedStyle(aside);
  const pcs = window.getComputedStyle(parent);

  // Check all matched CSS rules for aside width
  const sheets = Array.from(document.styleSheets);
  const asideRules = [];
  for (const sheet of sheets) {
    try {
      const rules = Array.from(sheet.cssRules || []);
      for (const rule of rules) {
        if (rule.type === CSSRule.MEDIA_RULE) {
          const inner = Array.from(rule.cssRules || []);
          for (const innerRule of inner) {
            if (innerRule.selectorText && aside.matches && aside.matches(innerRule.selectorText)) {
              const style = innerRule.style;
              if (style.width) asideRules.push(`@media ${rule.conditionText} { ${innerRule.selectorText} { width: ${style.width} } }`);
            }
          }
        } else if (rule.type === CSSRule.STYLE_RULE) {
          if (rule.selectorText && aside.matches && aside.matches(rule.selectorText)) {
            if (rule.style.width) asideRules.push(`${rule.selectorText} { width: ${rule.style.width} }`);
          }
        }
      }
    } catch(e) {}
  }

  return {
    innerWidth: window.innerWidth,
    asideW: aside?.getBoundingClientRect().width,
    asideComputedWidth: cs.width,
    asideFlexBasis: cs.flexBasis,
    asideFlexShrink: cs.flexShrink,
    asideFlexGrow: cs.flexGrow,
    parentFlexDir: pcs.flexDirection,
    spacing: getComputedStyle(document.documentElement).getPropertyValue('--spacing').trim(),
    asideMatchedRules: asideRules,
    asideClasses: aside?.className,
  };
});

console.log(`\nViewport: ${data.innerWidth}px`);
console.log(`Parent flex-direction: ${data.parentFlexDir}`);
console.log(`aside rect.width: ${data.asideW}px`);
console.log(`aside computed width: ${data.asideComputedWidth}`);
console.log(`aside flex-basis: ${data.asideFlexBasis}`);
console.log(`aside flex-shrink: ${data.asideFlexShrink}`);
console.log(`aside flex-grow: ${data.asideFlexGrow}`);
console.log(`--spacing: "${data.spacing}"`);
console.log(`\nMatched CSS rules for aside width:`);
data.asideMatchedRules.forEach(r => console.log(' ', r));
console.log(`\naside classes: ${data.asideClasses}`);

await ctx.close();
await browser.close();
