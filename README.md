# ระบบฝึกพิมพ์ดีด (Typing Practice System)
ระบบฝึกพิมพ์ดีดสำหรับอาชีวศึกษา (ปวช./ปวส.) รองรับโหมด Guest (ฝึกโดยไม่ต้อง Login) และระบบห้องเรียนสำหรับนักเรียน–ครู พร้อมระบบเก็บข้อมูลวิจัยในชั้นเรียน

---

## Changelog

ดูประวัติการเปลี่ยนแปลงทุก version ได้ที่ [CHANGELOG.md](CHANGELOG.md)

---

## สถานะระบบ (ณ 2026-05-23)

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
| Admin Dashboard | ✅ สมบูรณ์ | `/admin` (admin/superAdmin role) |
| UX/UI Redesign (Sprint UX-0 ถึง UX-4) | ✅ สมบูรณ์ | ทุกหน้า |
| Advanced Reports (Pre/Post comparison, leaderboard) | ✅ สมบูรณ์ | `/admin`, `/my-classroom` |

---

## Role System

| Role | สิทธิ์ |
|------|--------|
| `guest` | ฝึกพิมพ์ได้ ไม่บันทึกคะแนน |
| `student` | ฝึกพิมพ์ + บันทึกคะแนน + เข้าห้องเรียน + สอบ + ตอบแบบสอบถาม |
| `teacher` | ทุกอย่างของ student + จัดการห้องเรียน + สร้างสอบ/แบบสอบถาม + export ข้อมูลวิจัย |
| `admin` | ทุกอย่างของ teacher + จัดการ user ทั้งระบบ + ดู/ย้าย classroom ทุกห้อง (แต่งตั้งโดย superAdmin) |
| `superAdmin` | ทุกอย่าง + จัดการ role ทุก level + แต่งตั้ง/ถอด admin |

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
│   ├── shared/         ← ThemeSwitch, ConfirmDialog, SkeletonCard
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
│   ├── researchExport.ts
│   ├── asyncUtils.ts       ← debounce, withRetry, useSubmitGuard
│   ├── clipboardUtils.ts   ← copyToClipboard, getJoinLink
│   └── dateUtils.ts        ← toThaiDate (รองรับ Timestamp/Date/ms/relative)
└── data/
    ├── data.ts
    └── keyboardData.ts
```

---

## โครงสร้างข้อมูล Firestore

```
users/{uid}
  ├── uid, email, role (guest/student/teacher/admin/superAdmin)
  ├── firstName, lastName, studentId
  ├── displayName, photoURL
  ├── isProfileComplete, isDeactivated, createdAt
  └── stats/{levelId}               ← สถิติฝึกพิมพ์หลัก (WPM, accuracy, playCount)
        └── sessions/{sessionId}    ← ประวัติการเล่นรายครั้ง (wpm, accuracy, duration, createdAt)

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

คัดลอก `.env.example` และแก้ไขค่า:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Mac / Linux
cp .env.example .env
```

เปิดไฟล์ `.env` แล้วใส่ค่าจาก Firebase Console:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Development = true | Production = false
VITE_USE_EMULATOR=true
```

> **หมายเหตุ `.env`**
> - Vite อ่าน `.env` อัตโนมัติ — ไม่ต้อง `require('dotenv')` หรือ install package เพิ่ม
> - ตัวแปรต้องขึ้นต้นด้วย `VITE_` ถึงจะใช้งานได้ใน code (เช่น `import.meta.env.VITE_FIREBASE_API_KEY`)
> - ตัวแปรที่ไม่มี `VITE_` prefix จะ**ไม่ถูกส่ง**ไปยัง browser (ปลอดภัย)
> - `.env` อยู่ใน `.gitignore` แล้ว — **ห้าม commit** ไฟล์นี้ขึ้น Git

**ไฟล์ .env ที่รองรับ (ลำดับ priority สูง → ต่ำ):**

| ไฟล์ | ใช้เมื่อ |
|------|---------|
| `.env.local` | override ทุกอย่าง (ใช้บน local ตัวเอง) |
| `.env.development` | `npm run dev` เท่านั้น |
| `.env.production` | `npm run build` เท่านั้น |
| `.env` | ทุก mode (default) |

### 3. Install & Run

```bash
npm install
npm run dev
# เปิด http://localhost:5173
```

**หยุด Vite:** กด `Ctrl + C` ในหน้าต่าง terminal นั้น

### 4. Firebase Emulator (Development)

```bash
firebase emulators:start
```

| บริการ | URL |
|--------|-----|
| Auth | http://localhost:9099 |
| Firestore | http://localhost:8080 |
| Emulator UI | http://localhost:4000 |

**หยุด Emulator:** กด `Ctrl + C` ในหน้าต่าง terminal นั้น

> ⚠️ ต้องรัน Emulator **ก่อน** `npm run dev` เมื่อ `VITE_USE_EMULATOR=true`  
> ถ้า Emulator ไม่ได้รัน → Firebase จะ error ทุก request

### 5. Testing (Playwright E2E)

```bash
# ต้องรัน Emulator และ dev server ก่อนเสมอ
# Terminal 1:
firebase emulators:start

# Terminal 2:
npm run dev

# Terminal 3: รันทดสอบทั้งหมด (106 test cases)
npx playwright test

# รันเฉพาะ block:
npx playwright test e2e/block0-auth.spec.ts
npx playwright test e2e/block2-classroom-teacher.spec.ts

# ดูผล report:
npx playwright show-report
```

Suite ครอบคลุม 11 spec files (block0–block10) — Desktop Chrome + Mobile iPhone
ผลล่าสุด: **106/106 PASS** (2026-05-23)

### 6. Build & Deploy

```bash
# 1. เปลี่ยน .env ก่อน
VITE_USE_EMULATOR=false

# 2. Build
npm run build

# 3. Deploy
firebase deploy
```

> ⚠️ **สำคัญ**: ตรวจสอบว่า `VITE_USE_EMULATOR=false` ก่อน deploy ทุกครั้ง  
> ถ้าลืม → Production จะพยายามเชื่อม Emulator บนเครื่องตัวเอง ไม่ใช่ Firebase จริง

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
