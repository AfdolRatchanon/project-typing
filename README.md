# ระบบฝึกพิมพ์ดีด (Typing Practice System)
ระบบฝึกพิมพ์ดีดสำหรับอาชีวศึกษา (ปวช./ปวส.) รองรับโหมด Guest (ฝึกโดยไม่ต้อง Login) และระบบห้องเรียนสำหรับนักเรียน–ครู พร้อมระบบเก็บข้อมูลวิจัยในชั้นเรียน

---

## Changelog

### v3.5.0 — Responsive Fix + Automated Testing _(2026-05-21)_
> แก้ปัญหา UI ขนาดเล็กเมื่อบีบหน้าจอ และทดสอบระบบครบทุก role อัตโนมัติ

- แก้ sidebar บทเรียนถูก flex-shrink เมื่อ viewport ~1280px (`PracticePage.tsx` + `VirtualKeyboard.tsx`)
- Virtual Keyboard: เปลี่ยน `xl:` breakpoint → `2xl:` เพื่อให้ compact กว่าที่ 1280px
- แก้ bug `displayName.localeCompare` crash เมื่อ member ไม่มี displayName (`useClassroom.ts:102`)
- สร้าง `full-test.mjs` ทดสอบ Playwright ครบ 7 suites / 46 test cases — **✅ 46/46 PASS**
- Test Report อยู่ใน `TEST-REPORT.md` พร้อม screenshots 25 ภาพ

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

---

## สถานะระบบ (ณ 2026-05-21)

| ระบบ | สถานะ | Route |
|------|--------|-------|
| ฝึกพิมพ์ (Guest/Login) | ✅ สมบูรณ์ | `/practice` |
| Profile & First-login | ✅ สมบูรณ์ | `/complete-profile`, `/profile` |
| Student Dashboard | ✅ สมบูรณ์ | `/dashboard` |
| Teacher Classroom | ✅ สมบูรณ์ | `/teacher` |
| Student Classroom | ✅ สมบูรณ์ | `/my-classroom` |
| Pre/Post Test | ✅ สมบูรณ์ | `/test/:testId` |
| Exam System | ✅ สมบูรณ์ | `/exam/:examId` |
| Survey & Research Export | ✅ สมบูรณ์ | `/survey/:surveyId` |
| Teacher Dashboard | ✅ สมบูรณ์ | `/admin` (teacher role) |
| Admin Dashboard | ✅ สมบูรณ์ | `/admin` (superAdmin role) |
| Gamification & UX | ❌ ยังไม่เริ่ม | — |
| Advanced Reports | ❌ ยังไม่เริ่ม | — |

---

## Role System

| Role | สิทธิ์ |
|------|--------|
| `guest` | ฝึกพิมพ์ได้ ไม่บันทึกคะแนน |
| `student` | ฝึกพิมพ์ + บันทึกคะแนน + เข้าห้องเรียน + สอบ + ตอบแบบสอบถาม |
| `teacher` | ทุกอย่างของ student + จัดการห้องเรียน + สร้างสอบ/แบบสอบถาม + export ข้อมูลวิจัย |
| `superAdmin` | ทุกอย่าง + จัดการ user/role ทั้งระบบ |

---

## โครงสร้างโฟลเดอร์ (ปัจจุบัน)

```
src/
├── components/
│   ├── auth/           ← AuthSection
│   ├── classroom/      ← ClassroomCard, MemberTable, LessonManager,
│   │                      CSVImportPanel, JoinClassroomForm, CreateClassroomModal
│   ├── dashboard/      ← AdminDashboard, TeacherDashboard, UserDashboard
│   ├── exam/           ← ExamCard, ExamCreate, ExamList
│   ├── practice/       ← TypingArea, VirtualKeyboard, StatsDisplay,
│   │                      GameControls, GameResults, NextCharGuidance,
│   │                      LevelSelector, LevelScoringCriteria
│   ├── prepost/        ← ExamSetEditor, PrePostTestCard, PrePostTestCreate,
│   │                      PrePostTestList
│   ├── shared/         ← ThemeSwitch
│   └── survey/         ← SurveyCard, SurveyCreate, SurveyList,
│                          SurveyResultsDashboard, ResearchExport
├── contexts/
│   └── ThemeContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useClassroom.ts
│   ├── useExam.ts
│   ├── usePrePostTest.ts
│   ├── useStudentClassroom.ts
│   ├── useSurvey.ts
│   └── useTypingGame.ts
├── pages/
│   ├── LandingPage.tsx
│   ├── PracticePage.tsx
│   ├── CompleteProfilePage.tsx
│   ├── ProfilePage.tsx
│   ├── UserDashboardPage.tsx
│   ├── TeacherPage.tsx
│   ├── StudentClassroomPage.tsx
│   ├── ExamRoom.tsx
│   ├── PrePostTestRoom.tsx
│   └── SurveyPage.tsx
├── firebase/
│   └── firebaseConfig.ts
├── types/
│   └── types.ts
├── utils/
│   ├── scoreUtils.ts
│   ├── classroomUtils.ts
│   └── researchExport.ts
└── data/
    ├── data.ts
    └── keyboardData.ts
```

---

## โครงสร้างข้อมูล Firestore

```
users/{uid}
  ├── uid, email, role (student/teacher/superAdmin)
  ├── firstName, lastName, studentId
  ├── displayName, photoURL
  ├── isProfileComplete, createdAt
  └── stats/{levelId}               ← สถิติฝึกพิมพ์หลัก (WPM, accuracy, playCount)

classrooms/{classroomId}
  ├── classroomId, name, teacherUid
  ├── joinCode, isActive, createdAt
  ├── members/{uid}                  ← ClassroomMember (displayName, studentNumber, role)
  └── lessons/{lessonId}             ← CustomLesson (text, timeLimit, requiredPlayCount)

prePostTests/{testId}
  ├── testId, classroomId, title, type (pre/post)
  ├── examSets[5], setAssignmentMethod
  ├── timeLimit, isOpen, isResultPublished
  └── results/{uid}                  ← PrePostTestResult (wpm, score10Point, assignedSet)

exams/{examId}
  ├── examId, classroomId, title
  ├── examSets[5], setAssignmentMethod
  ├── scorePolicy (best/last/average), maxRetake
  ├── timeLimit, isOpen, isResultPublished
  └── results/{uid}                  ← ExamResult

surveys/{surveyId}
  ├── surveyId, classroomId, title
  ├── questions[] (Likert 5 ระดับ, 10 ข้อ, 3 มิติ)
  ├── isOpen
  └── responses/{uid}                ← SurveyResponse (answers, submittedAt)

joinCodes/{code}
  └── classroomId, createdBy, createdAt
```

---

## การติดตั้ง (Setup)

### 1. Firebase Setup
สร้างโปรเจ็คที่ Firebase และเปิดใช้บริการ:
- **Authentication** (Google Provider)
- **Firestore Database**
- **Hosting** (optional)

### 2. Environment Variables
คัดลอกไฟล์ `.env.example` และแก้ไขค่า:
```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# สำหรับ Development (Firebase Emulator)
VITE_USE_EMULATOR=true   ← ตั้งเป็น false ก่อน deploy Production
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Firebase Emulator (Development)

```bash
firebase emulators:start
# Auth: http://localhost:9099
# Firestore: http://localhost:8080
# Emulator UI: http://localhost:4000
```

### 5. Testing

```bash
# ทดสอบครบทุก role (ต้องรัน emulator และ dev server ก่อน)
node full-test.mjs
# ผล: TEST-REPORT.md + test-screenshots/
```

### 6. Build & Deploy

```bash
npm run build
firebase deploy
```

> ⚠️ ตรวจสอบว่า `VITE_USE_EMULATOR=false` ก่อน deploy

---

## Firestore Security Rules (ปัจจุบัน)

ดูไฟล์ `firestore.rules` — รองรับ: users, classrooms, members, lessons, prePostTests, exams, surveys, joinCodes

---

## การแก้ไขบทเรียน
ไปที่ไฟล์ [src/data/data.ts](src/data/data.ts) และสร้างบทเรียนที่ต้องการ
เกณฑ์คะแนนเริ่มต้นอยู่ใน [src/utils/scoreUtils.ts](src/utils/scoreUtils.ts)

---

## ลิขสิทธิ์และสัญญาอนุญาต (License)

```
MIT License
Copyright (c) 2025 Ratchanon Semsayan (รัชชานนท์ เสมสายัณห์)
```

*พัฒนาสำหรับอาชีวศึกษา — AFDOL79*
