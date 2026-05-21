# แผนพัฒนาระบบฝึกพิมพ์ดีด (Development Plan)

> อัปเดตล่าสุด: **2026-05-21** (UX/UI Redesign Plan — ทิศทางตกลงแล้ว)  
> สถานะปัจจุบัน: **v3.5.0** — ทดสอบครบ ✅ 46/46 | Phase 6 (UX Redesign) อยู่ในแผน

---

## Feature หลัก — สถานะปัจจุบัน

| Feature | สถานะ |
|---------|--------|
| แยกห้องเรียนได้ | ✅ เสร็จแล้ว |
| Profile จริง (ชื่อ-นามสกุล + รหัสนักเรียน) | ✅ เสร็จแล้ว |
| Pre-test / Post-test (5 ชุดข้อสอบ) | ✅ เสร็จแล้ว |
| กำหนดจำนวนครั้งฝึกต่อบทเรียน | ✅ เสร็จแล้ว |
| เลขที่นักเรียนในห้อง | ✅ เสร็จแล้ว |
| ระบบเก็บข้อมูลความพึงพอใจ (วิจัย) | ✅ เสร็จแล้ว |
| Export ข้อมูลวิจัย (E1/E2, paired t-test CSV) | ✅ เสร็จแล้ว |
| ครูดูเฉพาะห้องตัวเอง (Teacher Scope) | ✅ เสร็จแล้ว |
| ระบบสอบทั่วไป (Exam + scorePolicy) | ✅ เสร็จแล้ว |
| Responsive UI ทุก viewport | ✅ เสร็จแล้ว |
| Gamification & UX | 📋 วางแผนแล้ว (ดู UX_IMPROVEMENT_PLAN.md) |
| Advanced Reports & Export | ❌ ยังไม่เริ่ม |

---

## สถานะ Phase

| Phase | ชื่อ | สถานะ | วันที่เสร็จ |
|-------|------|--------|------------|
| 0 | Critical Bug Fixes | ✅ เสร็จ | 2026-05-20 |
| F | Firestore Migration | ✅ เสร็จ | 2026-05-21 |
| P | User Profile System | ✅ เสร็จ | 2026-05-21 |
| 1 | เลขที่นักเรียน + จำนวนครั้งฝึก | ✅ เสร็จ | 2026-05-21 |
| 2 | Pre-test / Post-test Foundation | ✅ เสร็จ | 2026-05-21 |
| 3 | Test Room + Student Flow | ✅ เสร็จ | 2026-05-21 |
| R | Survey + Research Export | ✅ เสร็จ | 2026-05-20 |
| 4 | Exam System + Teacher Dashboard | ✅ เสร็จ | 2026-05-21 |
| — | Responsive Fix + Automated Testing | ✅ เสร็จ | 2026-05-21 |
| 6 | UX/UI Redesign | 📋 วางแผนแล้ว (ดู UX_IMPROVEMENT_PLAN.md) | — |
| 7 | Reports & Export (Advanced) | ❌ ยังไม่เริ่ม | — |

---

## สิ่งที่เสร็จแล้ว (สรุป)

### Sprint 0 — Critical Bug Fixes ✅
- แก้ event listener cleanup ใน `useTypingGame.ts` (Shift/CapsLock ค้าง)
- แก้ admin role check `'admin'` → `'superAdmin'`
- แก้ CSV import — ลด Firebase round-trips
- แก้ level lock ถาวร (playCount >= 1 เท่านั้น ไม่ดูคะแนน)
- แก้ custom text injection ใน ClassroomPracticePage
- แก้ scoring formula ใช้ `getScore10Point()` แทนสูตรเฉพาะกิจ

### Sprint F — Firestore Migration ✅
- ย้าย `useAuth`, `useClassroom`, `useStudentClassroom` จาก Realtime DB → Firestore
- `firebaseConfig.ts` — เพิ่ม Firestore SDK, ลบ Realtime DB
- Firestore Security Rules ครบทุก collection
- Firebase Emulator setup (Auth:9099, Firestore:8080, UI:4000)

### Sprint P — Profile System ✅
- `types.ts`: เพิ่ม `firstName`, `lastName`, `studentId`, `isProfileComplete` ใน `UserProfile`
- `CompleteProfilePage.tsx` (`/complete-profile`) — gate first-login
- `ProfilePage.tsx` (`/profile`) — แก้ข้อมูลส่วนตัวได้
- ProtectedRoute gate: redirect ถ้า `!isProfileComplete`
- `AuthSection.tsx` — ปุ่ม "โปรไฟล์" (UserCog icon)

### Sprint 1 — Student Number + Practice Count ✅
- `ClassroomMember.studentNumber` — เลขที่นักเรียน
- `CustomLesson.requiredPlayCount` — จำนวนครั้งที่ต้องฝึก
- `MemberTable.tsx` — คอลัมน์เลขที่ + sort + inline edit
- `CSVImportPanel.tsx` — รองรับ column เลขที่ / studentNumber
- `StudentClassroomPage.tsx` — progress badge X/Y ครั้ง
- `LessonManager.tsx` — field requiredPlayCount

### Sprint 2+3 — Pre/Post Test System ✅
- Types: `ExamSet`, `PrePostTest`, `PrePostTestResult`, `PrePostComparison`
- `usePrePostTest.ts` — CRUD + realtime + `computeAssignedSet()`
  - by-student-number: `((n-1) % 5) + 1`
  - random: hash(uid + testId) % 5 + 1 (deterministic)
- `ExamSetEditor.tsx` — กรอก 5 ชุดข้อความ
- `PrePostTestCreate.tsx`, `PrePostTestList.tsx`, `PrePostTestCard.tsx`
- `PrePostTestRoom.tsx` (`/test/:testId`) — fullscreen + anti-cheat + auto-submit
- TeacherPage tab "การทดสอบ" (ClipboardList icon)
- StudentClassroomPage banner "การทดสอบที่รอดำเนินการ"
- Firestore: `prePostTests/{testId}/results/{uid}`

### Sprint R — Survey + Research Export ✅
- Types: `SurveyDimension`, `SurveyQuestion`, `Survey`, `SurveyResponse`, `ResearchExportRow`
- `useSurvey.ts` — CRUD + submit + `buildResearchData()`
- `utils/researchExport.ts` — `SURVEY_TEMPLATE_QUESTIONS` (10 ข้อ), `exportResearchCSV()`
- `SurveyPage.tsx` (`/survey/:surveyId`) — Likert form นักเรียน
- `SurveyCreate`, `SurveyList`, `SurveyResultsDashboard`, `ResearchExport` components
- เกณฑ์แปลผล: บุญชม ศรีสะอาด (4.51+ = มากที่สุด)
- Export CSV: BOM UTF-8, รวม E1/E2/Pre/Post/Survey — เปิดได้ใน Excel/SPSS ตรง

### Sprint 4 — Exam System + Teacher Dashboard ✅
- Types: `ScorePolicy`, `Exam`, `ExamResult`
- `useExam.ts` — CRUD + realtime, reuse `computeAssignedSet()`
- `ExamCard`, `ExamCreate`, `ExamList` components
- `ExamRoom.tsx` (`/exam/:examId`) — fullscreen + anti-cheat + retake
  - scorePolicy: `best` / `last` / `average`
  - maxRetake: 0 = ไม่จำกัด, >0 = จำกัด
- TeacherPage tab "การสอบ" (FileText icon)
- StudentClassroomPage banner "การสอบที่เปิดอยู่" (สีส้ม)
- `TeacherDashboard.tsx` — analytics เฉพาะห้องครู (แยกจาก AdminDashboard)
- `/admin` routing: superAdmin → AdminDashboard, teacher → TeacherDashboard

### Responsive Fix + Testing ✅ (2026-05-21)
- `PracticePage.tsx`: `xl:flex-row` → `lg:flex-row`, `shrink-0` ให้ aside, `min-w-0` ให้ main
- `VirtualKeyboard.tsx`: ลบ `xl:` breakpoint ออก ใช้ `2xl:` — sidebar ไม่บีบที่ 1280px
- แก้ bug `displayName.localeCompare()` crash (`useClassroom.ts:102`)
- `full-test.mjs`: 7 suites, 46 test cases — **✅ 46/46 PASS** ทุก role ทุกฟีเจอร์
- `TEST-REPORT.md` + 25 screenshots ใน `test-screenshots/`

---

## Test Accounts (Firebase Emulator — ไม่มีใน Production)

| Role | Email | Password |
|------|-------|----------|
| superAdmin | superadmin@test.local | Test1234! |
| teacher | teacher@test.local | Test1234! |
| student | student@test.local | Test1234! |

> รัน `node full-test.mjs` เพื่อ regenerate accounts (UID จะเปลี่ยนทุกครั้ง)  
> Test Classroom: `classroomId=test-classroom-001`, `joinCode=TEST01`

---

## โครงสร้างข้อมูล Firestore (ปัจจุบัน)

```
users/{uid}                          # UserProfile
  ├── uid, email, role, isProfileComplete
  ├── firstName, lastName, studentId, displayName, photoURL
  ├── createdAt
  └── stats/{levelId}                # LevelStats (WPM, accuracy, playCount)

classrooms/{classroomId}             # Classroom
  ├── classroomId, name, teacherUid, joinCode, isActive, createdAt
  ├── members/{uid}                  # ClassroomMember (displayName, studentNumber, role)
  └── lessons/{lessonId}             # CustomLesson (text, timeLimit, requiredPlayCount)

prePostTests/{testId}                # PrePostTest
  ├── testId, classroomId, title, type (pre/post), pairId
  ├── examSets[5], setAssignmentMethod, timeLimit
  ├── isOpen, isResultPublished, createdBy
  └── results/{uid}                  # PrePostTestResult (wpm, score10Point, assignedSet)

exams/{examId}                       # Exam
  ├── examId, classroomId, title
  ├── examSets[5], setAssignmentMethod, timeLimit
  ├── scorePolicy (best/last/average), maxRetake
  ├── isOpen, isResultPublished, createdBy
  └── results/{uid}                  # ExamResult

surveys/{surveyId}                   # Survey
  ├── surveyId, classroomId, title
  ├── questions[] (10 ข้อ, 3 มิติ: content/design/benefit)
  ├── isOpen, createdBy
  └── responses/{uid}               # SurveyResponse (answers: {questionId → 1-5})

joinCodes/{code}                     # { classroomId, createdBy, createdAt }
```

---

## ระบบวิจัยในชั้นเรียน

ออกแบบรองรับ **One-Group Pretest-Posttest Design**:
```
O1 (Pre-test) → X (การสอนด้วยระบบ) → O2 (Post-test)
```

| ตัวแปรวิจัย | แหล่งข้อมูลในระบบ |
|------------|------------------|
| **E1** (ประสิทธิภาพกระบวนการ) | `users/{uid}/stats/{levelId}` avg score ระหว่างฝึก |
| **E2** (ประสิทธิภาพผลลัพธ์) | `prePostTests/{postTestId}/results` avg score10Point |
| **O1** (ก่อนเรียน) | `prePostTests/{preTestId}/results` wpm + score10Point |
| **O2** (หลังเรียน) | `prePostTests/{postTestId}/results` wpm + score10Point |
| **ความพึงพอใจ** | `surveys/{surveyId}/responses/{uid}` Likert 5 ระดับ |

**เกณฑ์ประสิทธิภาพมาตรฐาน**: E1/E2 ≥ 80/80 (Chaiyong Brahmawong, 2545)

---

## Phase ที่ยังเหลือ

### Phase 6 — UX/UI Redesign
> ทิศทางตกลงแล้ว — ดูรายละเอียดเต็มใน `UX_IMPROVEMENT_PLAN.md`

**Design Direction ที่ตกลง:**
- Visual: Modern Dashboard (card-based, gradient, glassmorphism เบาๆ)
- Layout: Focus Mode — UI fade เมื่อ focus ช่องพิมพ์, Keyboard ยังแสดง
- Theme: Light default + OS auto-detect + profile setting + accent color picker
- Teacher page: Full-Width Dashboard (ลบ sidebar, ใช้ dropdown + full-width tabs)
- Animation: 150–200ms เท่านั้น ไม่มี spring/bounce
- Mobile: Teacher = desktop-first, Student = mobile-first

**Sprint UX-1 — Quick Wins:**
- [ ] U1 — Wrong char highlight แทน line-through (TypingArea)
- [ ] U2 — เปรียบเทียบ WPM กับครั้งก่อน + Personal Best (GameResults)
- [ ] U3 — Progress bar full-width เหนือ textarea
- [ ] U4 — ปุ่ม "ถัดไป" / "ลองอีกครั้ง" หลังจบ
- [ ] U15 — Smooth number transitions
- [ ] A1 — Empty state actionable (ไม่มีข้อมูล → บอก next step)
- [ ] A2 — First-join onboarding card (นักเรียน join ห้องครั้งแรก)
- [ ] B1 — Cursor blinking + extra-char underline สีส้ม
- [ ] D1 — Notification badge บน nav เมื่อมีสอบ/แบบสอบถามรอ
- [ ] E2 — Teacher pinned quick action bar

**Sprint UX-2 — Interaction Polish:**
- [ ] U5 — Shake animation เมื่อพิมพ์ผิด
- [ ] U6 — Pre-exam briefing card ก่อนเริ่มสอบ
- [ ] U7 — Lesson card states 4 แบบ (ยังไม่เริ่ม/กำลังฝึก/ครบแล้ว/ไม่กำหนด)
- [ ] U10 — Unified Action Hub (รวม banner สอบ/ทดสอบ/แบบสอบถาม)
- [ ] U14 — Font size control (A- / A+ persist localStorage)
- [ ] B2 — Live stats smoothing (WPM อัปเดตทุก 3 วิ)
- [ ] B3 — Red border flash เมื่อพิมพ์ผิด 3 ครั้งติดกัน
- [ ] C1 — Enhanced result card (top 3 อักษรผิด + เทียบครั้งก่อน)
- [ ] U12 — Quick stats header ในห้องครู

**Sprint UX-3 — Visual Depth & Redesign (breaking changes):**
- [ ] E1 — Teacher full-width dashboard layout restructure
- [ ] U8 — Live WPM Sparkline (SVG, ไม่ต้อง library)
- [ ] U9 — Keyboard finger zone colors (passive, opacity 20%)
- [ ] U11 — Countdown ring timer SVG ในห้องสอบ
- [ ] U13 — WPM History Chart (UserDashboard)
- [ ] Theme system redesign (Light/Dark + accent color)
- [ ] Focus Mode implementation

**Gamification (เลื่อนมาจากแผนเดิม):**
- [ ] Sound Effects (click, error, level complete) — toggle ปิดได้
- [ ] Achievement Badges
- [ ] Daily Practice Streak
- [ ] Error Boundary ครอบทุก route
- [ ] Loading Skeleton

### Phase 7 — Advanced Reports & Export
- [ ] Export ผล Pre/Post พร้อม assignedSet เป็น CSV/Excel
- [ ] PDF ตารางผลสอบทั้งห้อง (เรียงตามเลขที่)
- [ ] ใบรับรอง (Certificate) เมื่อผ่านเกณฑ์ WPM
- [ ] Error Analytics Report (ตัวอักษรที่นักเรียนพิมพ์ผิดบ่อย)

---

## หมายเหตุสำคัญ

### Environment
```
VITE_USE_EMULATOR=true   ← Development (Emulator)
VITE_USE_EMULATOR=false  ← ต้องเปลี่ยนก่อน deploy Production
```

### Logic กำหนดชุดข้อสอบ
```typescript
// by-student-number (default — deterministic, ครูควบคุมได้)
const assignedSet = ((studentNumber - 1) % 5) + 1;
// เลขที่ 1→ชุด1, 2→ชุด2, ..., 5→ชุด5, 6→ชุด1, ...

// random (deterministic per student per test)
// hash(uid + testId) % 5 + 1
```

### Teacher vs SuperAdmin scope
```typescript
// TeacherDashboard — query เฉพาะห้องที่ครูเป็น teacherUid
query(collection(db, 'classrooms'), where('teacherUid', '==', user.uid))

// AdminDashboard — query users ทั้งระบบ (superAdmin เท่านั้น)
```

---

*แผนนี้อัปเดตตามความคืบหน้า — 2026-05-21*
