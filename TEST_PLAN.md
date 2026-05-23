# แผนทดสอบระบบ Full Regression
> อัปเดต: 2026-05-23 | ครอบคลุมทุก Feature ที่ implement แล้ว (Sprint UX-0 → UX-4)

---

## เครื่องมือที่ใช้ทดสอบ

### Manual Testing Tools

| เครื่องมือ | ที่อยู่ | ใช้สำหรับ |
|---|---|---|
| **Firebase Emulator UI** | http://localhost:4000 | ดู/แก้ Firestore, Auth, สร้าง user จำลอง |
| **Firestore Emulator** | http://localhost:8080 | ตรวจ document ที่ถูกเขียน/อ่าน |
| **Auth Emulator** | http://localhost:9099 | จัดการ test accounts, custom claims |
| **Dev server (Vite)** | http://localhost:5173 | ตัวแอป |
| **Chrome DevTools → Console** | F12 | ตรวจ JS error, warning |
| **Chrome DevTools → Network** | F12 → Network | ตรวจ Firestore request / response |
| **Chrome DevTools → Application → LocalStorage** | F12 → Application | ตรวจ exam draft, theme, font size |
| **Chrome DevTools → Responsive** | F12 → Toggle device | ทดสอบ mobile layout |

### Automated Testing — Playwright

| เครื่องมือ | เวอร์ชัน | ใช้สำหรับ |
|---|---|---|
| **@playwright/test** | ^1.60.0 | E2E automation + screenshot |
| **Chromium (headless)** | bundled | browser engine |
| **iPhone 12 emulation** | devices preset | mobile viewport test |
| **HTML Reporter** | built-in | ดู screenshots + trace ผ่าน browser |

**Playwright ทำอะไรได้บ้าง:**
- รัน test script อัตโนมัติทุก block
- บันทึก **screenshot** ทุก test (pass และ fail)
- บันทึก **video + trace** เมื่อ test fail (replay ได้)
- สร้าง **HTML report** ดูผลและ screenshots ในหน้าเดียว
- ทดสอบทั้ง Desktop (1440×900) และ Mobile (iPhone 12)

---

## Playwright — วิธีใช้งาน

### Prerequisites

```
Node.js ≥ 18, npm install เสร็จแล้ว
firebase emulators:start  (Auth:9099, Firestore:8080, UI:4000)
VITE_USE_EMULATOR=true npm run dev  (http://localhost:5173)
```

### ติดตั้ง browser (ครั้งแรกครั้งเดียว)

```bash
npx playwright install chromium
```

### โครงสร้างไฟล์ Playwright

```
e2e/
  global-setup.ts          ← สร้าง test users ใน Emulator ก่อน suite
  helpers/
    auth.ts                ← login/logout ผ่าน window.__devLogin
    emulator.ts            ← REST API ของ Auth + Firestore Emulator
  block0-auth.spec.ts
  block1-practice.spec.ts
  block2-classroom-teacher.spec.ts
  block3-classroom-student.spec.ts
  block4-preposttest.spec.ts
  block5-exam.spec.ts
  block6-survey.spec.ts
  block7-dashboard.spec.ts
  block8-admin.spec.ts
  block9-isolation.spec.ts
  block10-edgecases.spec.ts
  screenshots/             ← ไฟล์ .png จากทุก test
  playwright-report/       ← HTML report (เปิดด้วย npm run test:e2e:report)
  test-results/            ← trace + video เมื่อ fail
playwright.config.ts
```

### คำสั่งรัน

```bash
# รันทุก block (headless — เร็ว)
npm run test:e2e

# รันพร้อมเห็น browser (เห็นการ interact แบบ real-time)
npm run test:e2e:headed

# รัน UI mode (เลือก test ผ่าน GUI, เห็น screenshots ทันที)
npm run test:e2e:ui

# รันเฉพาะ block
npm run test:e2e:b0      # Auth
npm run test:e2e:b1      # Practice
npm run test:e2e:b2      # Classroom Teacher
npm run test:e2e:b3      # Classroom Student
npm run test:e2e:b5      # Exam + T10 Live oversight

# ดู HTML report หลังรันเสร็จ
npm run test:e2e:report
```

### ดู Screenshots

**วิธีที่ 1 — HTML Report** (แนะนำ)
```bash
npm run test:e2e:report
# เปิด http://localhost:9323 → คลิก test → เห็น screenshot ทุก step
```

**วิธีที่ 2 — โฟลเดอร์ตรง**
```
e2e/screenshots/
  0.1-landing.png
  0.2-guest-practice.png
  0.5-teacher-dashboard.png
  1.1-practice-full.png
  1.10a-before-focus.png
  1.10b-after-focus.png
  2.1b-room-created.png
  2.7a-after-archive.png
  2.7b-archived-section.png
  ...
```

**วิธีที่ 3 — Trace Viewer** (เมื่อ test fail)
```bash
npx playwright show-trace e2e/test-results/*/trace.zip
```

### Auth Strategy (window.__devLogin)

`main.tsx` inject `window.__devLogin(email, password)` เมื่อ `VITE_USE_EMULATOR=true`  
Playwright ใช้ตัวนี้ login โดยไม่ต้องกดปุ่มใน UI — เร็วและเชื่อถือได้

```typescript
// ตัวอย่างในทุก spec
import { login, USERS } from './helpers/auth';

test.beforeEach(async ({ page }) => {
  await login(page, USERS.teacher1.email, USERS.teacher1.password);
  await page.goto('/teacher');
});
```

### ตั้งค่าก่อนเริ่ม (Manual)

```bash
# Terminal 1 — Firebase Emulator
firebase emulators:start

# Terminal 2 — Dev server
VITE_USE_EMULATOR=true npm run dev
```

> **สำคัญ:** `VITE_USE_EMULATOR=true` ต้องตั้งทุกครั้งที่รัน dev — ห้าม deploy production ด้วย flag นี้

---

## ข้อมูลจำลองที่ต้องสร้าง (Test Data)

```
Teacher 1  teacher1@test.com  / password: test1234
  ├── ห้อง A: คอมพิวเตอร์ 4/1  ม.4  ภาค 1/2568  — 10 นักเรียน, 3 บทเรียน
  └── ห้อง B: คอมพิวเตอร์ 5/1  ม.5  ภาค 1/2568  —  5 นักเรียน, 2 บทเรียน

Teacher 2  teacher2@test.com  / password: test1234
  ├── ห้อง C: คอมพิวเตอร์ 4/2  ม.4  ภาค 1/2568  —  8 นักเรียน, 2 บทเรียน
  └── ห้อง D: คอมพิวเตอร์ 6/1  ม.6  ภาค 1/2568  —  3 นักเรียน, 1 บทเรียน

Student    student01–10@test.com  / password: test1234
           (student01–07 อยู่ห้อง A, student06–10 อยู่ห้อง B)

Admin      admin@test.com         / password: test1234
SuperAdmin superadmin@test.com    / password: test1234
```

**สร้าง user ผ่าน Emulator UI:** http://localhost:4000 → Authentication → Add user

---

## สัญลักษณ์ผลการทดสอบ

| สัญลักษณ์ | ความหมาย |
|---|---|
| ✅ | ผ่าน |
| ❌ | ไม่ผ่าน |
| ⚠️ | ผ่านแต่มีข้อสังเกต |
| ⏭️ | ข้าม (ไม่เกี่ยวกับ scope) |

---

## BLOCK 0 — Setup & Authentication

| # | สิ่งที่ทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| 0.1 | Landing page โหลด | เปิด localhost:5173 | ไม่ blank, Console ไม่มี Error | | |
| 0.2 | Guest mode | กด "ทดลองใช้" / "Guest" | ไปหน้า /practice โดยไม่ต้อง login | | |
| 0.3 | Google login (Emulator) | กด "เข้าสู่ระบบ" → Google | Emulator auth popup ขึ้น เลือก account ได้ | | |
| 0.4 | CompleteProfile — user ใหม่ | login ครั้งแรกด้วย account ใหม่ | redirect ไปหน้า CompleteProfile | | |
| 0.5 | CompleteProfile — role = teacher | กรอกชื่อ/สกุล → เลือก teacher → บันทึก | ไป /teacher, role ถูกบันทึกใน Firestore | | |
| 0.6 | CompleteProfile — role = student | กรอกข้อมูล → เลือก student → บันทึก | ไป /practice | | |
| 0.7 | ProtectedRoute — student เข้า /teacher | login student → พิมพ์ URL /teacher | redirect หรือแสดง 403/ไม่มีสิทธิ์ | | |
| 0.8 | ProtectedRoute — guest เข้า /dashboard | ไม่ login → พิมพ์ /dashboard | redirect ไปหน้า login | | |
| 0.9 | Theme toggle Dark/Light | กด toggle มุมขวาบน | CSS vars เปลี่ยนทั้งหน้า ไม่มี flash | | |
| 0.10 | Theme บันทึกข้ามหน้า | toggle dark → refresh | ยังคง dark อยู่ | | |
| 0.11 | Session timeout modal | login → เข้าหน้าสอบ → force signOut จาก Emulator Auth | modal sign-in ขึ้น ไม่ redirect ออกจากหน้า | | |
| 0.12 | Deactivated user login | admin deactivate account → user พยายาม refresh | ถูก sign out อัตโนมัติ | | |

---

## BLOCK 1 — Practice Page

| # | สิ่งที่ทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| 1.1 | หน้า /practice โหลด | navigate | sidebar stats + level selector + TypingArea ครบ | | |
| 1.2 | เลือก level Thai → พิมพ์ถูก | พิมพ์ตัวอักษรถูก 10 ตัว | ตัวอักษรเปลี่ยนสีเขียว, cursor เลื่อน | | |
| 1.3 | พิมพ์ผิด — shake animation | กดตัวผิด | TypingArea สั่น 0.25s | | |
| 1.4 | พิมพ์ผิด 3 ครั้งติด — red border flash | กดผิด 3 ครั้งติดกัน | border กะพริบแดง | | |
| 1.5 | WPM อัปเดตทุก 3 วิ | พิมพ์นาน 10 วิ | WPM card อัปเดตเป็นระยะ (ไม่กระโดดทุกตัว) | | |
| 1.6 | Virtual keyboard — key highlight | พิมพ์แต่ละตัว | key ที่ต้องกดไฮไลต์ | | |
| 1.7 | Finger zone colors | ดู keyboard โดยไม่พิมพ์ | แต่ละ key มีสีพื้นหลังตามนิ้ว opacity 15% | | |
| 1.8 | WPM sparkline SVG | พิมพ์นาน >15 วิ (ผ่าน 3 tick ที่ 5s) | SVG sparkline โชว์ใน WPM card | | |
| 1.9 | Countdown ring (level ที่มี timeLimit) | เลือก level ที่กำหนดเวลา | SVG ring ลดวงกลม, เปลี่ยนแดงตอน <30s | | |
| 1.10 | Focus Mode — sidebar fade | คลิกใน TypingArea | sidebar ลดเป็น opacity 8%, pointer-events none | | |
| 1.11 | Focus Mode — Esc | กด Esc ขณะ focus | sidebar กลับ opacity เต็ม | | |
| 1.12 | Font size A− / A+ | กด A+ 3 ครั้ง | ข้อความ TypingArea ใหญ่ขึ้น | | |
| 1.13 | Font size บันทึก localStorage | ตั้ง size → refresh | size คงเดิม | | |
| 1.14 | จบ level → GameResults modal | พิมพ์ครบทุกตัว | modal WPM/accuracy/grade/top errors โชว์ | | |
| 1.15 | GameResults — top 3 error chars | พิมพ์ผิดตัวเดิมหลายครั้ง | chips ตัวอักษรที่ผิดบ่อยปรากฏ | | |
| 1.16 | Stats บันทึกหลังจบ level | เล่นจบ → ไป /dashboard | WPM history chart มีจุดใหม่ | | |
| 1.17 | Level ที่มี requiredPlayCount | เล่น level จนครบจำนวน | badge เขียว "ครบแล้ว" | | |

---

## BLOCK 2 — Classroom Management (Teacher 1)

### 2A — สร้าง & จัดการห้อง

| # | สิ่งที่ทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| 2.1 | สร้างห้อง A | กด "สร้างห้องใหม่" → กรอกข้อมูล | ห้อง A ปรากฏใน dropdown | | |
| 2.2 | สร้างห้อง B | ซ้ำขั้นตอน | ห้อง B ปรากฏ | | |
| 2.3 | Auto-select ห้องแรก | refresh หน้า | dropdown เลือกห้อง A อัตโนมัติ | | |
| 2.4 | Quick stats strip | เลือกห้อง A | แสดง 0 คน / 0 บทเรียน / joinCode ถูกต้อง | | |
| 2.5 | Regenerate Join Code | กด refresh icon | joinCode เปลี่ยน; Emulator Firestore ยืนยัน joinCodes ลบ/เพิ่มถูก | | |
| 2.6 | Clone ห้อง A (หลังสร้างบทเรียนแล้ว) | กด Copy icon → ตั้งชื่อ "ห้อง A สำเนา" | ห้องใหม่ปรากฏ, บทเรียนถูก copy ครบ | | |
| 2.7 | Clone ห้องเปล่า (ไม่มีบทเรียน) | clone ห้อง B ที่ยังไม่มีบทเรียน | ห้องใหม่สร้างได้, 0 บทเรียน | | |
| 2.8 | Archive ห้อง B | กด Archive icon → confirm | ห้อง B หายจาก dropdown; ปรากฏใน "ห้องที่เก็บถาวร" | | |
| 2.9 | Archive ห้องที่ selected อยู่ | เลือกห้อง B → archive | selectedId reset, content panel ว่าง | | |
| 2.10 | Unarchive ห้อง B | expand "ห้องที่เก็บถาวร" → "ยกเลิกเก็บถาวร" | ห้อง B กลับมาใน dropdown | | |
| 2.11 | Delete ห้อง | กด Trash → confirm | ห้องหายจาก Firestore (ตรวจใน Emulator UI) | | |

### 2B — นักเรียน & Import

| # | สิ่งที่ทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| 2.12 | Import CSV (email มีบัญชีแล้ว) | tab "นำเข้า CSV" → upload | Added: N คน, Skipped: 0 | | |
| 2.13 | Import CSV (email ไม่มีบัญชี) | CSV มี email ที่ไม่ได้ register | Skipped แสดง email ที่ไม่พบ | | |
| 2.14 | Auto-number เลขที่ | กด "เลขที่อัตโนมัติ" → confirm | เรียง A-Z → เลขที่ 1, 2, 3... | | |
| 2.15 | ค้นหานักเรียน | พิมพ์ชื่อใน search | filter real-time | | |
| 2.16 | Drill-down member | กดชื่อนักเรียน | modal สถิติรายบทเรียน โชว์ | | |
| 2.17 | Remove member | กด remove → confirm | นักเรียนหายจาก list, classroomIds อัปเดต | | |
| 2.18 | Export CSV รายชื่อ | กด Export | download ไฟล์ .csv มีข้อมูลครบ | | |
| 2.19 | Print รายชื่อ | กด Print | print dialog เปิด | | |

### 2C — บทเรียน

| # | สิ่งที่ทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| 2.20 | สร้างบทเรียน 1 — ไม่กำหนดเวลา | tab "บทเรียน" → สร้าง | card บทเรียนปรากฏ ไม่มี clock icon | | |
| 2.21 | สร้างบทเรียน 2 — มี timeLimit + requiredPlayCount | กำหนด timeLimit=180, required=3 | card แสดง clock + "ฝึก 0/3 ครั้ง" | | |
| 2.22 | สร้างบทเรียน 3 — มี dueDate | กำหนด dueDate | card แสดงวันกำหนดส่ง | | |
| 2.23 | Edit บทเรียน | กด edit → แก้ชื่อ → save | ชื่อ/เนื้อหาอัปเดต | | |
| 2.24 | Delete บทเรียน | กด delete → confirm | บทเรียนหายจากลิสต์ | | |
| 2.25 | Reorder บทเรียน | ลาก order handle | ลำดับเปลี่ยน, บันทึกใน Firestore | | |

---

## BLOCK 3 — Classroom (Student View)

| # | สิ่งที่ทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| 3.1 | Join ด้วย joinCode ถูกต้อง | login student01 → /my-classroom → กรอก code ห้อง A | เข้าห้องสำเร็จ, แสดงบทเรียน | | |
| 3.2 | Join code ผิด | กรอก code ผิด | error "ไม่พบรหัสห้องเรียน" | | |
| 3.3 | Join code เก่า (หลัง regenerate) | ใช้ code เก่าที่ regenerate แล้ว | error ชัดเจน | | |
| 3.4 | Join ซ้ำ | join ห้องเดิมอีกครั้ง | error "เป็นสมาชิกอยู่แล้ว" | | |
| 3.5 | Onboarding card ครั้งแรก | join ห้องใหม่ | card "ยินดีต้อนรับ" โชว์ | | |
| 3.6 | ปิด onboarding card | กด X | ซ่อน, localStorage บันทึก | | |
| 3.7 | Lesson state: ยังไม่เริ่ม | ดู lesson card ที่ยังไม่เล่น | border ปกติ, ปุ่ม "เริ่ม" | | |
| 3.8 | Lesson state: กำลังทำ | เล่น 1 ครั้งจาก required 3 | border สีส้ม, "ฝึกแล้ว 1/3 ครั้ง" | | |
| 3.9 | Lesson state: ครบแล้ว | เล่นครบ required | border สีเขียว, badge "ครบแล้ว" | | |
| 3.10 | Lesson state: ไม่กำหนดจำนวน | บทเรียนที่ไม่มี required | ไม่มี progress counter | | |
| 3.11 | ฝึกบทเรียน classroom | กด "เริ่ม" | เข้า PracticePage ใน classroom mode | | |
| 3.12 | Stats อัปเดตหลังเล่น | จบบทเรียน → กลับ /my-classroom | WPM/playCount อัปเดตใน card | | |
| 3.13 | **X6 Leaderboard** | กด "ดูกระดานอันดับ" → เลือกบทเรียน | ranked list WPM ทุกคนในห้องที่เล่นแล้ว | | |
| 3.14 | Leaderboard — ยังไม่มีใครเล่น | เลือก lesson ใหม่ | "ยังไม่มีข้อมูล" | | |
| 3.15 | Dropdown สลับห้อง (มี >1 ห้อง) | student อยู่ 2 ห้อง | dropdown เลือกสลับได้ | | |
| 3.16 | Leave classroom | กด "ออกจากห้อง" → confirm | ออก, classroomIds อัปเดต | | |

---

## BLOCK 4 — Pre/Post Test

| # | สิ่งที่ทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| 4.1 | ครูสร้าง Pre-test | tab "การทดสอบ" → สร้าง Pre | บันทึก isOpen=false | | |
| 4.2 | กำหนด setAssignmentMethod = by-student-number | เลือก option | นักเรียนที่เลขคี่ได้ชุด 1, เลขคู่ได้ชุด 2 | | |
| 4.3 | ครูเปิดทดสอบ | toggle → open | isOpen=true; นักเรียนเห็นใน Action Hub (สีเหลือง) | | |
| 4.4 | Schedule auto-open | กำหนด openAt = 2 นาทีข้างหน้า | auto-open เมื่อถึงเวลา (ตรวจใน Emulator) | | |
| 4.5 | Auto-close | กำหนด closeAt | ปิดอัตโนมัติ, นักเรียนเข้าไม่ได้หลัง closeAt | | |
| 4.6 | นักเรียนเข้าสอบ | กด "เข้าสอบ" | briefing card → เริ่มได้ → TypingArea | | |
| 4.7 | **S3 Resume** กลางสอบ | เข้าสอบ → ปิด tab → เปิดใหม่ | banner "ต่อจากเดิม / เริ่มใหม่" พร้อม remaining time | | |
| 4.8 | Resume — กด "ต่อจากเดิม" | กดปุ่ม | เริ่มด้วย timeLimitOverride ที่เหลือ | | |
| 4.9 | Resume — กด "เริ่มใหม่" | กดปุ่ม | reset, เริ่มด้วย timeLimit เต็ม | | |
| 4.10 | Draft หมดอายุ (>timeLimit ผ่านไปแล้ว) | รอให้ timeLimit ผ่านแล้วเปิดใหม่ | ไม่มีแบนเนอร์ resume | | |
| 4.11 | ส่งผลสอบ | พิมพ์ครบ / หมดเวลา | GameResults โชว์; Firestore มี result document | | |
| 4.12 | Lock หลังส่งครั้งแรก | ดูสถานะ isLocked | ไม่สามารถแก้ไข exam settings ได้ | | |
| 4.13 | ครูดูผล | tab → ดูผล | ตาราง WPM/accuracy/grade ครบ | | |
| 4.14 | สร้าง Post-test + Pair กับ Pre | สร้าง Post → เลือก pairId | เชื่อม Pre-Post ใน Firestore | | |
| 4.15 | นักเรียนสอบ Post เสร็จ | ส่งผล | ผล Post บันทึก | | |
| 4.16 | ประกาศผล | ครู → "เผยแพร่ผลให้นักเรียน" | isResultPublished=true | | |
| 4.17 | นักเรียนดูผล | ไป /my-classroom | section "ผลที่ครูประกาศแล้ว" โชว์ กด "ดูผล" เห็น modal | | |

---

## BLOCK 5 — Exam System

| # | สิ่งที่ทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| 5.1 | ครูสร้างข้อสอบ | tab "การสอบ" → สร้าง | กำหนด sets, timeLimit, scorePolicy=best, maxRetake=2 | | |
| 5.2 | เปิดข้อสอบ | toggle → open | นักเรียนเห็นใน Action Hub "สอบ" สีส้ม | | |
| 5.3 | Fullscreen request | นักเรียนเข้าสอบ | browser ขอ fullscreen | | |
| 5.4 | นับ Fullscreen exit | ออก fullscreen ขณะสอบ | fullscreenExitCount เพิ่ม | | |
| 5.5 | iOS Safari — fullscreen fallback | (ถ้ามี iOS) | ไม่ขอ fullscreen, แสดงข้อความแจ้งแทน | | |
| 5.6 | **S3 Resume exam draft** | เริ่มสอบ → ปิด tab → เปิดใหม่ | banner "ต่อจากเดิม" พร้อม remaining | | |
| 5.7 | **T10 Live oversight** | ครูเปิด results modal ขณะนักเรียนสอบ | progress bar N/M อัปเดตสด เมื่อนักเรียนส่ง ✅ โชว์ทันที | | |
| 5.8 | ScorePolicy = best | นักเรียนสอบ 2 รอบ (รอบ 2 คะแนนต่ำกว่า) | Firestore เก็บคะแนนรอบ 1 (สูงกว่า) | | |
| 5.9 | ScorePolicy = average | นักเรียนสอบ 2 รอบ | คะแนน = ค่าเฉลี่ย 2 รอบ | | |
| 5.10 | maxRetake enforce | นักเรียนสอบครบ maxRetake แล้วพยายามอีก | แสดง "ครบจำนวนครั้งแล้ว" | | |
| 5.11 | Force close ขณะสอบ | ครูปิดสอบ ขณะนักเรียนกำลังสอบอยู่ | นักเรียนถูก submit อัตโนมัติ isForceSubmitted=true | | |
| 5.12 | Publish results | ครู → "เผยแพร่ผล" | นักเรียนเห็นผลใน /my-classroom | | |
| 5.13 | นักเรียนไม่ได้อยู่ห้อง เข้า URL ตรง | navigate /exam/[examId] โดยตรง | block / redirect | | |

---

## BLOCK 6 — Survey & Research Export

| # | สิ่งที่ทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| 6.1 | สร้าง Survey | tab "แบบสอบถาม" → สร้าง | คำถามครบ 3 dimension (content/design/benefit) | | |
| 6.2 | เปิด Survey | toggle | นักเรียนเห็นใน Action Hub "สำรวจ" สีม่วง | | |
| 6.3 | นักเรียนตอบ | เลือก 1–5 ทุกข้อ → ส่ง | บันทึก Firestore | | |
| 6.4 | ตอบซ้ำ (ถ้า isAnonymous=false) | นักเรียนตอบอีกครั้ง | แจ้งว่าตอบแล้ว / ไม่ให้ตอบซ้ำ | | |
| 6.5 | ครูดู Summary | | mean per dimension + overall mean | | |
| 6.6 | **Research Export CSV** | tab survey → "Export ข้อมูลวิจัย" | CSV มีข้อมูล pre/post/exam/survey ทุก column ครบ | | |
| 6.7 | Export เมื่อไม่มีข้อมูล | Export ก่อนมีผลใดๆ | ไม่ crash, CSV ว่าง/แจ้งเตือน | | |

---

## BLOCK 7 — Dashboard & Stats

| # | สิ่งที่ทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| 7.1 | UserDashboard โหลด | login student → /dashboard | Overall stats card (totalPlayed, bestWPM, avgAccuracy) | | |
| 7.2 | WPM History Chart | เล่นหลาย level แล้วดู dashboard | SVG polyline แสดง trend ย้อนหลัง 30 วัน | | |
| 7.3 | Chart ซ่อนเมื่อข้อมูลน้อย | account ใหม่ที่เล่น 1 ครั้ง | Chart ไม่โชว์ (ต้องการ >= 2 data points) | | |
| 7.4 | Detailed stats per level | ขยาย / scroll | WPM/accuracy/grade/playCount รายด่านถูกต้อง | | |

---

## BLOCK 8 — Admin & SuperAdmin

| # | สิ่งที่ทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| 8.1 | AdminDashboard โหลด | login admin → /admin | tabs Users / Classrooms โหลดได้ | | |
| 8.2 | ค้นหา user | พิมพ์ชื่อ/email | filter real-time | | |
| 8.3 | Deactivate user | toggle → deactivate student01 | isDeactivated=true; ถ้า login อยู่ถูก signOut ทันที | | |
| 8.4 | Deactivated user login | student01 พยายาม login | ถูก signOut ทันที ไม่เข้าระบบได้ | | |
| 8.5 | Reactivate user | toggle กลับ | student01 login ได้ปกติ | | |
| 8.6 | ดู Classrooms ทั้งระบบ | tab Classrooms | เห็นทุกห้องของทั้ง Teacher 1 และ Teacher 2 | | |
| 8.7 | Drill-down classroom | กดชื่อห้อง | modal แสดงรายชื่อนักเรียนในห้อง | | |
| 8.8 | Transfer classroom | dropdown เลือก Teacher 2 | teacherUid เปลี่ยน; classroomIds ทั้ง 2 ครูอัปเดต | | |
| 8.9 | SuperAdmin เห็นทุกอย่าง | login superadmin | access ทุก tab ได้ | | |

---

## BLOCK 9 — Teacher 2 Isolation Test

> ตรวจว่า Teacher 2 ไม่เห็นข้อมูลของ Teacher 1

| # | สิ่งที่ทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| 9.1 | Teacher 2 login → /teacher | login teacher2 | เห็นเฉพาะห้อง C และ D | | |
| 9.2 | Teacher 2 เข้า URL ห้อง A | navigate /teacher และเลือก classroomId ห้อง A | ไม่เห็นข้อมูล / ไม่แสดง | | |
| 9.3 | Exam ของ Teacher 1 | Teacher 2 navigate /exam/[examId ของ Teacher 1] | block หรือ "ไม่ใช่ข้อสอบของคุณ" | | |

---

## BLOCK 10 — Edge Cases & Negative Tests

| # | สิ่งที่ทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| 10.1 | Join ห้องที่ archived | นักเรียนใช้ code ของห้อง D (archived) | error หรือ block ไม่ให้เข้า (isActive check) | | |
| 10.2 | สอบตอน exam ปิดแล้ว | navigate /exam/[id] ที่ isOpen=false | หน้า "ข้อสอบนี้ปิดแล้ว" | | |
| 10.3 | Leaderboard lesson ที่ไม่มีใครเล่น | เลือก lesson ใหม่ที่สร้างเพิ่ง | "ยังไม่มีข้อมูล" ไม่ crash | | |
| 10.4 | Clone ห้องที่ไม่มีบทเรียน | clone ห้องเปล่า | ห้องใหม่สร้างได้ ไม่ error | | |
| 10.5 | Archive ห้องที่ selected | archive ห้องที่กำลังดูอยู่ | selectedId reset, content panel แสดง empty state | | |
| 10.6 | Exam draft expired | draft เก่ากว่า timeLimit | ไม่มี resume banner | | |
| 10.7 | Import CSV นักเรียน 0 แถว | upload ไฟล์เปล่า | แจ้งเตือน ไม่ crash | | |
| 10.8 | Mobile layout (375px) | DevTools → responsive 375px | ทุกหน้า scroll ได้, ไม่มี overflow ซ่อน | | |
| 10.9 | Live oversight close modal | ปิด results modal | onSnapshot unsubscribe (ตรวจใน DevTools Network ว่า listener หยุด) | | |
| 10.10 | ท่องเว็บแบบ offline | DevTools → Network → Offline | แสดง error อย่างสุภาพ ไม่ white screen | | |

---

## สรุปจำนวน Test Cases

| Block | หัวข้อ | จำนวน |
|---|---|---|
| 0 | Setup & Auth | 12 |
| 1 | Practice Page | 17 |
| 2 | Classroom Teacher | 25 |
| 3 | Classroom Student | 16 |
| 4 | Pre/Post Test | 17 |
| 5 | Exam System | 13 |
| 6 | Survey & Export | 7 |
| 7 | Dashboard | 4 |
| 8 | Admin/SuperAdmin | 9 |
| 9 | Teacher Isolation | 3 |
| 10 | Edge Cases | 10 |
| **รวม** | | **133** |

---

## Checklist ก่อนรายงานผล

- [ ] Console ไม่มี Error (Warning ยอมรับได้ถ้าไม่ affect UX)
- [ ] Firestore Emulator UI ยืนยัน document เขียนถูกต้อง
- [ ] LocalStorage ค่าถูกต้อง (draft, theme, fontSize)
- [ ] Mobile responsive ผ่านที่ 375px และ 768px
- [ ] onSnapshot listener ทุกตัว unsubscribe เมื่อ component unmount

---

*อัปเดต: 2026-05-23 | เวอร์ชัน 1.0*
