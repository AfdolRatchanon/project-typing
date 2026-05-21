# Test Report — Project Typing 2026
**วันที่ทดสอบ:** 21/5/2569 21:50:33
**สภาพแวดล้อม:** Firebase Emulator (Auth:9099, Firestore:8080, UI:4000)
**Dev server:** http://localhost:5174
**สถานะรวม:** ✅ PASS (✅ 46 / ❌ 0 / ⚠️ 0)

---

## Test Accounts (Emulator Only — ไม่ใช่ Production)

| Role | Email | Password | UID |
|------|-------|----------|-----|
| superAdmin | superadmin@test.local | Test1234! | bD9naoO1w9S6lxEApDSbF43x4jr0 |
| teacher | teacher@test.local | Test1234! | grqULxWqnIYKK1ScERH3lpjwsXZq |
| student | student@test.local | Test1234! | i4o4cSDZ848VbvrVLFG2xZSuk2zR |

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

### Landing
- ✅ **PASS** — หน้า Landing โหลดได้
- ✅ **PASS** — ไม่มี JS error
- ✅ **PASS** — heading: "ระบบฝึกพิมพ์ดีด"

### GuestMode
- ✅ **PASS** — คลิก Guest → /practice
- ✅ **PASS** — textarea แสดงผล
- ✅ **PASS** — แสดง guest mode warning

### ProtectedRoute
- ✅ **PASS** — /dashboard redirect ถูกต้อง *(http://localhost:5174/)*
- ✅ **PASS** — /my-classroom redirect ถูกต้อง *(http://localhost:5174/)*
- ✅ **PASS** — /teacher redirect ถูกต้อง *(http://localhost:5174/)*
- ✅ **PASS** — /admin redirect ถูกต้อง *(http://localhost:5174/)*
- ✅ **PASS** — /profile redirect ถูกต้อง *(http://localhost:5174/)*

### Student-Login
- ✅ **PASS** — Login → "/practice"

### Student-Dashboard
- ✅ **PASS** — /dashboard เข้าได้ *(http://localhost:5174/dashboard)*

### Student-Classroom
- ✅ **PASS** — /my-classroom เข้าได้ *(http://localhost:5174/my-classroom)*

### Student-JoinCode
- ✅ **PASS** — มีช่อง Join Class Code

### Student-Practice
- ✅ **PASS** — /practice เข้าได้
- ✅ **PASS** — Sidebar บทเรียนแสดง
- ✅ **PASS** — พิมพ์ใน Practice ได้

### Student-Profile
- ✅ **PASS** — /profile เข้าได้

### Student-AccessControl
- ✅ **PASS** — Student ไม่สามารถเข้า /admin

### Student-JS
- ✅ **PASS** — ไม่มี JS error

### Teacher-Page
- ✅ **PASS** — /teacher เข้าได้

### Teacher-Classroom
- ✅ **PASS** — รายการห้องเรียนแสดง

### Teacher-Tabs
- ✅ **PASS** — Tab ใน TeacherPage: 4 รายการ

### Teacher-ExamTab
- ✅ **PASS** — Tab การสอบ เปิดได้

### Teacher-ExamCreate
- ✅ **PASS** — ปุ่มสร้างการสอบมี

### Teacher-PrePostTab
- ✅ **PASS** — Tab การทดสอบ (Pre/Post) เปิดได้

### Teacher-SurveyTab
- ✅ **PASS** — Tab แบบสอบถาม เปิดได้

### Teacher-Dashboard
- ✅ **PASS** — Teacher dashboard เข้าได้ *(http://localhost:5174/admin)*

### Teacher-JS
- ✅ **PASS** — ไม่มี JS error

### SuperAdmin-Dashboard
- ✅ **PASS** — /admin เข้าได้ (AdminDashboard)
- ✅ **PASS** — Dashboard heading: "Admin Dashboard"

### SuperAdmin-JS
- ✅ **PASS** — ไม่มี JS error

### Responsive
- ✅ **PASS** — desktop-1920 (1920×1080) — ไม่มี horizontal overflow
- ✅ **PASS** — desktop-1920: sidebar=320px
- ✅ **PASS** — desktop-1280 (1280×800) — ไม่มี horizontal overflow
- ✅ **PASS** — desktop-1280: sidebar=288px
- ✅ **PASS** — laptop-1024 (1024×768) — ไม่มี horizontal overflow
- ✅ **PASS** — laptop-1024: sidebar=256px
- ✅ **PASS** — mobile-390 (390×844) — ไม่มี horizontal overflow
- ✅ **PASS** — mobile-390: sidebar=374px

### Theme
- ✅ **PASS** — Theme switch: "navy" → "slate-blue"

### ExamRoom
- ✅ **PASS** — ExamRoom ไม่มีจริง → แสดงข้อความ/redirect

### PrePostRoom
- ✅ **PASS** — PrePostTestRoom ไม่มีจริง → แสดงข้อความ/redirect

### SurveyPage
- ✅ **PASS** — SurveyPage ไม่มีจริง → แสดงข้อความ/redirect

### ExamRoutes-JS
- ✅ **PASS** — ไม่มี JS error ใน exam routes

---

## Screenshots
Screenshots อยู่ใน `test-screenshots/` (25 ไฟล์)

## การตั้งค่า Environment
```
VITE_USE_EMULATOR=true   ← ใช้ Emulator (ตอนนี้)
VITE_USE_EMULATOR=false  ← เปลี่ยนก่อน deploy Production
```

## หมายเหตุ
- ทดสอบด้วย Playwright (headless Chromium)
- Firebase Auth Emulator: สร้าง/ลบ user ผ่าน REST API
- Firestore Emulator: เขียน doc โดยตรงผ่าน REST API
- Login inject ผ่าน localStorage (emulator auth state)
