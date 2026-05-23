# Changelog

ประวัติการเปลี่ยนแปลงทุก version — เรียงจากใหม่ไปเก่า

---

### v3.7.0 — Playwright E2E Suite 106/106 + App Fixes _(2026-05-23)_
> ทดสอบระบบครบวงจร 106 test cases ผ่านทุกข้อ + แก้ bug ที่พบระหว่าง test

**E2E Testing:**
- สร้าง Playwright test suite ใหม่ 11 spec files (block0–block10) แทน full-test.mjs เดิม
- ครอบคลุม: Auth, Practice, Classroom (Teacher+Student), Pre/Post Test, Exam, Survey, Dashboard, Admin, Isolation, Edge Cases
- รัน 2 browser: Desktop Chrome + Mobile iPhone — **106/106 PASS**
- เพิ่ม Playwright artifacts ใน `.gitignore` (playwright-report, test-results, screenshots)

**App Bug Fixes (พบระหว่าง E2E):**
- `firebaseConfig.ts`: เปลี่ยน emulator host `127.0.0.1` → `localhost` + เพิ่ม `experimentalForceLongPolling: true` แก้ WebKit/Safari onSnapshot ไม่ทำงาน
- `ExamCreate.tsx` + `PrePostTestCreate.tsx`: เพิ่ม `htmlFor`/`id` ให้ label+input (รองรับ `getByLabel()`)
- `TeacherPage.tsx`: เพิ่ม `data-testid="join-code"` แก้ regex locator บน WebKit
- `TypingArea.tsx`: เพิ่ม `data-testid="typing-display"` + แก้ minus sign U+2212 → hyphen U+002D
- `VirtualKeyboard.tsx`: เพิ่ม `data-testid="virtual-keyboard"`
- `PracticePage.tsx`: แก้ initial focus state ไม่ถูก set เมื่อ autoFocus fires ก่อน useEffect
- `main.tsx`: แก้ `__devLogin` รอ `onAuthStateChanged` ก่อน resolve (race condition)
- `MemberTable.tsx`: แก้ JSX structure — modal drill-down อยู่นอก outer div

---

### v3.6.0 — UX/UI Redesign (Sprint UX-0 ถึง UX-4) _(2026-05-22 – 2026-05-23)_
> ปรับปรุง UX/UI ครบทุกหน้า — Sprint UX-0 ถึง UX-4 สมบูรณ์แล้ว

**Foundation & Infrastructure (UX-0):**
- `SkeletonCard` + `SkeletonStatsGrid` + `SkeletonTableRows` + `SkeletonPage` — loading states ทุกหน้า
- `ConfirmDialog` component + `useConfirmDialog` hook — dialog ยืนยันก่อนลบ/action สำคัญ
- Sonner toast notifications (`sonner` package + `<Toaster>` ใน main.tsx)
- Route-level Lazy Loading + React Suspense + Vite `manualChunks` (Firebase/React vendor bundles)
- `asyncUtils.ts`: `debounce`, `withRetry`, `useSubmitGuard` hook
- `dateUtils.ts`: `toThaiDate()` รองรับ Firestore Timestamp/Date/ms/relative — แสดง พ.ศ.
- `clipboardUtils.ts`: `copyToClipboard()` + `getJoinLink()` (direct join link)
- Firestore composite indexes 5 รายการ (`firestore.indexes.json`)
- Session history subcollection: `users/{uid}/stats/{levelId}/sessions/{sessionId}`
- เพิ่ม `admin` role: types.ts + firestore.rules + route guard (เปลี่ยน role student↔teacher ได้)

**Security & Research Integrity (UX-0b):**
- Research data lock: `isLocked` auto-set เมื่อมีผลแรก — ป้องกันครูแก้ชุดข้อสอบ
- Multi-tab prevention: `BroadcastChannel` ping/pong ข้าม tab
- Exam auto-submit เมื่อครู force-close (`onSnapshot` บน `isOpen`)
- Audit trail: `openedAt/closedAt/openedBy` บน exam + prePostTest
- SuperAdmin UI แต่งตั้ง/ถอด Admin (dropdown ใน user table)
- Pre/Post comparison dashboard: เปรียบเทียบ O1 vs O2 เคียงกัน + Δ WPM
- ดูผลสอบ/ทดสอบย้อนหลังตัวเอง (modal แสดง WPM/accuracy/คะแนน/ผ่าน)
- Practice deadline: `dueDate` date picker บน LessonManager + แสดงในบัตรบทเรียน

**Quick Wins (UX-1):**
- Wrong char highlight (สีแดง) แทน line-through
- เปรียบเทียบ WPM กับครั้งก่อน + Personal Best badge
- Progress bar full-width เหนือ typing area
- ปุ่ม "ถัดไป" / "ลองอีกครั้ง" หลังจบ + Smooth number transitions (rAF ease-out)
- First-join onboarding card (localStorage flag + dismiss)
- Notification badge สีแดงบน nav เมื่อมีสอบ/ทดสอบเปิดอยู่
- Teacher pinned quick action bar (+ บทเรียน / Pre-Post Test / จำนวนคน)
- ค้นหานักเรียนในตาราง + Duplicate lesson/exam + เรียงลำดับ lesson (↑ ↓)
- Join code regeneration (ปุ่ม 🔄), Lesson text preview ก่อน save, Export member list CSV
- Auto-number students, System-wide stats header ใน AdminDashboard

**Interaction Polish (UX-2):**
- Shake animation เมื่อพิมพ์ผิด (rAF 0.25s)
- Red border flash เมื่อพิมพ์ผิด 3 ครั้งติดกัน
- Lesson card 4 states: notStarted/inProgress/completed/noReq + badge ✅
- Unified Action Hub: 3 banners → 1 hub สีเหลืองใน StudentClassroomPage
- Font size control ใน TypingArea (A- / A+ + localStorage)
- Live stats smoothing: WPM อัปเดตทุก 3 วิ + accuracy mini bar
- Enhanced result card: top 3 อักษรที่พิมพ์ผิดบ่อย (chips)
- Drill-down: กดชื่อนักเรียน → modal สถิติรายบทเรียน
- Auto-close exam ตามวันที่ (`closeAt` datetime input + enforcement)
- Export PDF รายงาน (print-friendly HTML)
- Deactivate account toggle (isDeactivated + enforce signOut)
- Admin: tab ห้องเรียนทั้งระบบ, drill-down modal members, ย้าย classroom ไปครูคนอื่น
- หลายห้องเรียน + dropdown สลับ ใน StudentClassroomPage
- Resume กลางสอบ (localStorage draft — ต่อจากเดิม/เริ่มใหม่)
- iOS Safari fullscreen fallback (ข้าม fullscreen request + แสดงข้อความแทน)
- Session timeout modal กลางสอบ (sign-in แทน redirect)

**Visual Depth & Redesign (UX-3):**
- Live WPM Sparkline: SVG polyline อัปเดตทุก 5s ข้าง WPM card
- Keyboard finger zone colors: fingerZoneColors map, opacity 15% ตามนิ้ว
- Countdown ring timer: SVG CountdownRing แทน Timer icon ใน StatsDisplay
- WPM History Chart: SVG polyline 30 วัน → UserDashboard
- Teacher full-width dashboard: sidebar → top dropdown + quick stats strip + full-width tabs
- Focus Mode: aside fade opacity 0.08 + pointer-events none เมื่อ textarea focused (Esc เพื่อ unfocus)

**Advanced Features (UX-4):**
- Clone classroom ข้ามเทอม: copy lessons/exams (ไม่รวม members/results)
- Live exam oversight: onSnapshot real-time N/M ส่งแล้ว + status ✅/⬜ ต่อนักเรียน
- Classroom archive: isArchived + archiveClassroom/unarchiveClassroom + ส่วน "ห้องที่เก็บถาวร"
- Leaderboard WPM รายห้อง: ปุ่ม "ดูกระดานอันดับ" + lesson selector + ranked list

---

### v3.5.0 — Responsive Fix + Automated Testing _(2026-05-21)_
> แก้ปัญหา UI ขนาดเล็กเมื่อบีบหน้าจอ และทดสอบระบบครบทุก role อัตโนมัติ

- แก้ sidebar บทเรียนถูก flex-shrink เมื่อ viewport ~1280px (`PracticePage.tsx` + `VirtualKeyboard.tsx`)
- Virtual Keyboard: เปลี่ยน `xl:` breakpoint → `2xl:` เพื่อให้ compact กว่าที่ 1280px
- แก้ bug `displayName.localeCompare` crash เมื่อ member ไม่มี displayName (`useClassroom.ts:102`)
- สร้าง `full-test.mjs` ทดสอบ Playwright ครบ 7 suites / 46 test cases — **✅ 46/46 PASS** (ต่อมาแทนที่ด้วย block0–block10 ใน v3.7.0)

### v3.4.0 — Exam System + Teacher Dashboard _(2026-05-21)_
> ระบบสอบทั่วไป + dashboard แยก scope ครู

- **Exam System**: ครูสร้างการสอบได้ (5 ชุดข้อสอบ, scorePolicy: best/last/average, maxRetake)
- ห้องสอบ `/exam/:examId` — fullscreen บังคับ + anti-cheat + retake support
- TeacherPage tab "การสอบ" (FileText icon) + StudentClassroomPage banner สีส้ม
- **TeacherDashboard** แยกจาก AdminDashboard — ครูเห็นเฉพาะห้องตัวเอง
- `/admin` route: superAdmin → AdminDashboard, teacher → TeacherDashboard
- Firestore: `exams/{examId}` + `exams/{examId}/results/{uid}` + security rules

### v3.3.0 — Survey & Research Export _(2026-05-20)_
> ระบบแบบสอบถามความพึงพอใจ + export ข้อมูลวิจัย SPSS-ready

- `SurveyPage` (/survey/:surveyId) — Likert 5 ระดับ 10 ข้อ 3 มิติ (เนื้อหา/ออกแบบ/ประโยชน์)
- TeacherPage tab "แบบสอบถาม" + ผล survey รายมิติ
- StudentClassroomPage banner แบบสอบถามที่รอตอบ (สีม่วง)
- `ResearchExport` — export CSV (BOM UTF-8, เปิดได้ใน Excel/SPSS) รวม E1/E2/Pre/Post/Survey
- เกณฑ์แปลผล Likert: บุญชม ศรีสะอาด (4.51+ = มากที่สุด)
- Firestore: `surveys/{surveyId}/responses/{uid}` + security rules

### v3.2.0 — Pre/Post Test System _(2026-05-21)_
> ระบบทดสอบก่อน-หลังเรียน รองรับ One-Group Pretest-Posttest Design

- ครูสร้างการทดสอบ Pre/Post: กรอก 5 ชุดข้อความ + เวลา + เกณฑ์ผ่าน
- กำหนดชุดข้อสอบ: ตามเลขที่ (`((n-1)%5)+1`) หรือสุ่ม (deterministic per student)
- ห้องสอบ `/test/:testId` — fullscreen + anti-cheat + นับครั้งออก fullscreen
- TeacherPage tab "การทดสอบ" + StudentClassroomPage banner รอดำเนินการ
- ผลการสอบ: wpm, accuracy, score10Point, assignedSet, isPassed
- Firestore: `prePostTests/{testId}/results/{uid}` + security rules

### v3.1.0 — Classroom & Practice Integration _(2026-05-21)_
> ระบบห้องเรียนครบวงจร + การฝึกบทเรียน Custom

- Classroom CRUD: สร้าง/แก้ไข/ลบห้องเรียน + Join Code 6 หลัก
- CSV Import นักเรียน (พร้อมเลขที่, รองรับ encoding ภาษาไทย)
- เลขที่นักเรียน (`studentNumber`) ใน MemberTable + sort + inline edit
- ครูสร้าง Custom Lesson + กำหนดจำนวนครั้งที่ต้องฝึก (`requiredPlayCount`)
- StudentClassroomPage: progress bar ครั้งที่ฝึก X/Y + badge เสร็จแล้ว
- ClassroomPracticePage: inject custom text เข้า `useTypingGame` โดยตรง

### v3.0.0 — Firestore Migration + Profile System _(2026-05-21)_
> migrate จาก Realtime Database → Firestore + ระบบ Profile จริง

- **Firestore Migration**: ย้าย `useAuth`, `useClassroom`, `useStudentClassroom` ทั้งหมด
- **Profile System**: `firstName`, `lastName`, `studentId`, `isProfileComplete`
- `CompleteProfilePage` (`/complete-profile`) — gate first-login, บังคับกรอกชื่อจริง
- `ProfilePage` (`/profile`) — แก้ข้อมูลส่วนตัวได้ภายหลัง
- ProtectedRoute gate: redirect ถ้า `!isProfileComplete`
- Firestore Security Rules ครบ: users, classrooms, prePostTests, exams, surveys, joinCodes
- Role system: `guest` / `student` / `teacher` / `superAdmin`

### v2.1.0 — Theme System & Routing Refactor _(2026-03-18)_
> ปรับโครงสร้างหน้า practice ให้ใช้ CSS Custom Properties ทั้งระบบ + เพิ่ม theme switcher

- เพิ่ม ThemeContext พร้อม 4 presets: Slate Blue, Charcoal Teal, **Navy Amber** (default), Purple Haze
- ThemeSwitch floating button (bottom-right) เปลี่ยน theme ได้ทันที พร้อม persist ใน localStorage
- ย้าย routing มาใช้ `react-router-dom` v7: `/`, `/practice`, `/dashboard`, `/admin`
- สร้าง LandingPage ใหม่พร้อม Guest Mode (ฝึกได้โดยไม่ต้อง Login)
- ProtectedRoute component สำหรับ role-based access control

### v2.0.0 — Dashboard & Auth System _(2025-08-05 – 2025-09-07)_
- AdminDashboard + UserDashboard + Google Auth
- Anti-cheat: ปิดกั้น copy/cut/paste ใน TypingArea
- แก้ WPM ติดลบ + TimeLimit scoring

### v1.x.x — Initial Release _(2025-07-24 – 2025-07-30)_
- Virtual Keyboard + Finger Guidance
- บทเรียนภาษาไทย/อังกฤษ, WPM, ความแม่นยำ, เกณฑ์คะแนน
