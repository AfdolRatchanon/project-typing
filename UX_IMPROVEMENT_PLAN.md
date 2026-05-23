# แผนพัฒนา UX/UI (UX Improvement Plan)

> สร้าง: 2026-05-21 | อัปเดต: 2026-05-23  
> สถานะ: ✅ Sprint UX-0 | UX-0b | UX-1 | UX-2 | UX-3 เสร็จแล้ว — Sprint UX-4 (T9 T10 X5 X6 X3) เหลือ

---

## ทิศทางการออกแบบ (Design Direction) — ตกลงแล้ว ✅

### Visual Style: Modern Dashboard
- Card-based layout ทุกหน้า
- Gradient accent + glassmorphism elements เบาๆ
- Shadow hierarchy ชัดเจน (card มี shadow, ไม่ใช่แค่ border)
- ไม่ flashy — เน้น functional ที่ดูดีกว่าเดิม

### Layout: Focus Mode (Practice/Exam)
- เมื่อคลิกในช่องพิมพ์: header/sidebar fade-out (opacity 0, pointer-events none)
- Virtual Keyboard **ยังแสดงอยู่** — ไม่ซ่อน
- Stats แสดงเป็น floating strip เล็กๆ ด้านบน (WPM + accuracy + progress)
- กด Esc หรือคลิกนอกช่องพิมพ์: UI กลับมาครบ

### Theme System
- **Light** = default
- Auto-detect OS preference (`prefers-color-scheme`)
- ตั้งค่าได้ใน Profile (บันทึกถาวร)
- Quick toggle button (แสดงตลอด)
- Accent color เลือกได้ (Navy / Teal / Purple) แทน 4 preset เดิม

### Teacher Page Layout: Full-Width Dashboard
```
┌─────────────────────────────────────────────────────┐
│  "ห้อง ปวช.1/1"  ↓ dropdown เปลี่ยนห้อง           │
│  👥 28 คน  |  📊 avg 42 WPM  |  ✅ 18/28 ผ่าน     │
├─────────────────────────────────────────────────────┤
│  Tab: ฝึก | ทดสอบ | สอบ | แบบสอบถาม | Export      │
├─────────────────────────────────────────────────────┤
│  [Tab Content — full width]                         │
└─────────────────────────────────────────────────────┘
```
ครูเห็นข้อมูลทั้งหมดแบบ full-width, ตารางนักเรียนกว้างขึ้น

### Animation
- ใช้ `transition` 150–200ms เท่านั้น — ไม่มี bounce/spring
- Target คือนักเรียนที่ต้องสมาธิ ไม่ใช่เกม

### Typography & Spacing
- Font size default ใหญ่ขึ้น: typing area 18–20px
- Spacing system ชัดเจน — ไม่แน่นเกินไป

### Mobile Strategy
- Teacher page: **desktop-first** (ครูใช้คอมเป็นหลัก)
- Student pages (Practice, Classroom): **mobile-first**

### Role System (ตกลงแล้ว ✅)
| Role | สิทธิ์ | หมายเหตุ |
|------|--------|---------|
| `guest` | ฝึกพิมพ์อย่างเดียว | |
| `student` | ฝึก + ห้องเรียน + สอบ + แบบสอบถาม | |
| `teacher` | student + จัดการห้องเรียน + สร้างสอบ + export | |
| `admin` | teacher + จัดการ user + ดูห้องเรียนทั้งระบบ | แต่งตั้งโดย superAdmin เท่านั้น |
| `superAdmin` | ทุกอย่าง + แต่งตั้ง/ถอด admin | มีได้คนเดียว — set ใน Firestore โดยตรง |

**Admin vs SuperAdmin:**
- Admin **ทำได้**: เปลี่ยน role (student↔teacher), ดูห้องเรียนทั้งระบบ, deactivate user
- Admin **ทำไม่ได้**: แต่งตั้ง/ถอด admin, ลบ superAdmin, export ข้อมูลทั้งระบบ
- SuperAdmin สร้างผ่าน Firestore Console โดยตรง (ไม่มี UI สร้าง superAdmin)

---

## ภาพรวม

ระบบหลักเสร็จครบแล้ว (v3.5.0) ขั้นตอนนี้เน้น redesign UX/UI ให้ใช้งานได้ลื่น น่าใช้ และสอดคล้องกับ Design Direction ด้านบน  
จัดลำดับตาม **impact สูง / effort ต่ำ** ก่อน

---

## สรุปรายการทั้งหมด

### กลุ่ม U — Practice & Exam Core
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| U1 | เปลี่ยน wrong char จาก line-through → highlight | TypingArea | XS | ★★★★★ |
| U2 | เปรียบเทียบผลกับครั้งก่อน (+WPM / Personal Best) | GameResults | S | ★★★★★ |
| U3 | Progress bar full-width เหนือ textarea | StatsDisplay | S | ★★★★☆ |
| U4 | ปุ่ม "ถัดไป" / "ลองอีกครั้ง" หลังจบ | GameResults | S | ★★★★☆ |
| U5 | Shake animation เมื่อพิมพ์ผิด | TypingArea | S | ★★★☆☆ |
| U6 | Pre-exam briefing card ก่อนเริ่มสอบ | ExamRoom + PrePostTestRoom | M | ★★★★☆ |
| U7 | Lesson card สถานะแยกชัดเจน 4 แบบ | StudentClassroomPage | M | ★★★★☆ |
| U8 | Live WPM Sparkline graph | StatsDisplay | M | ★★★★☆ |
| U9 | Keyboard finger zone colors (passive) | VirtualKeyboard | M | ★★★☆☆ |
| U10 | Unified Action Hub (pending tests/exams/surveys) | StudentClassroomPage | M | ★★★★☆ |
| U11 | Countdown ring timer ในห้องสอบ | ExamRoom + PrePostTestRoom | M | ★★★☆☆ |
| U12 | Quick stats header ใน Teacher classroom | TeacherPage | S | ★★★☆☆ |
| U13 | WPM History Chart ใน Dashboard | UserDashboard | L | ★★★★☆ |
| U14 | Font size control ใน TypingArea | TypingArea | S | ★★☆☆☆ |
| U15 | Smooth number transitions (WPM, accuracy) | StatsDisplay | S | ★★★☆☆ |

### กลุ่ม F — Foundation UX (ทำก่อน Sprint UX-1)
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| F1 | Skeleton loading states ขณะรอข้อมูล Firestore | ทุกหน้า | S | ★★★★★ |
| F2 | Toast / Snackbar notifications (สำเร็จ / error) | ทุกหน้า | XS | ★★★★★ |
| F3 | Confirmation dialog สำหรับ destructive actions (ลบ/รีเซ็ต) | ทุกหน้า | S | ★★★★★ |
| G1 | ปุ่ม copy Join Code (1 คลิก) | TeacherPage | XS | ★★★★☆ |

### กลุ่ม A — Empty States & Onboarding
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| A1 | Empty state actionable (ไม่มีบทเรียน/นักเรียน → บอก next step) | TeacherPage, StudentClassroomPage | S | ★★★★☆ |
| A2 | First-join onboarding card (1 ครั้ง + dismiss) | StudentClassroomPage | S | ★★★☆☆ |

### กลุ่ม B — Typing Feedback
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| B1 | Cursor blinking line ชัดเจน + extra-char underline สีส้ม | TypingArea | S | ★★★★☆ |
| B2 | Live stats smoothing — WPM อัปเดตทุก 3 วิ (smooth), accuracy real-time bar | StatsDisplay | S | ★★★☆☆ |
| B3 | Red border flash เมื่อพิมพ์ผิด 3 ครั้งติดกัน | TypingArea | S | ★★★☆☆ |

### กลุ่ม C — Result Page
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| C1 | Result card: WPM+accuracy+คะแนนใหญ่ชัด + เทียบครั้งก่อน + top 3 อักษรผิด | GameResults + ExamRoom | M | ★★★★★ |

### กลุ่ม D — Navigation & Notification
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| D1 | Notification badge (🔴) บน nav item เมื่อมีสอบ/แบบสอบถามรอ | Navigation/Header | S | ★★★★☆ |

### กลุ่ม E — Teacher Tools
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| E1 | Teacher full-width dashboard layout + quick stats header | TeacherPage | L | ★★★★★ |
| E2 | Pinned quick action bar: [ + บทเรียน ] [ เปิด Pre-test ] [ Export CSV ] | TeacherPage | S | ★★★☆☆ |

### กลุ่ม H — Teacher Workflow (ที่ขาดไป)
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| H1 | ค้นหา/กรองนักเรียนในตาราง | TeacherPage | S | ★★★★☆ |
| H2 | Drill-down: กดชื่อนักเรียน → ดูสถิติรายคน | TeacherPage | M | ★★★★☆ |
| H3 | Duplicate lesson / exam (คัดลอกแล้วแก้) | TeacherPage | S | ★★★☆☆ |
| H4 | Auto-close exam ตามวันที่/เวลา | TeacherPage | M | ★★★☆☆ |
| H5 | แสดงนักเรียนที่ยัง "ไม่ได้ join" ห้อง | TeacherPage | M | ★★★★☆ |
| H6 | เรียงลำดับ lesson (ปุ่ม ↑ ↓) | TeacherPage | S | ★★★☆☆ |
| H7 | Export PDF รายงาน (print-friendly) | TeacherPage | S | ★★★☆☆ |

### กลุ่ม SA — SuperAdmin & Admin
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| SA1 | Admin role ใหม่ (types + Firestore rules + route guard) | ระบบ | M | ★★★★★ |
| SA2 | SuperAdmin แต่งตั้ง/ถอด Admin (dropdown ใน user table) | AdminDashboard | S | ★★★★★ |
| SA3 | ค้นหา user (ชื่อ / email / studentId) | AdminDashboard | S | ★★★★☆ |
| SA4 | Deactivate / ลบ account | AdminDashboard | S | ★★★★☆ |
| SA5 | Tab "ห้องเรียน" — ดูห้องเรียนทั้งระบบ | AdminDashboard | M | ★★★★☆ |
| SA6 | คลิกห้อง → ดูข้อมูลภายใน (members, lessons, stats) | AdminDashboard | M | ★★★☆☆ |
| SA7 | ย้าย classroom ไปครูคนอื่น | AdminDashboard | S | ★★★☆☆ |
| SA8 | System-wide stats (user แยก role, ห้องเรียน active) | AdminDashboard | S | ★★★☆☆ |
| SA9 | Audit trail: openedAt/closedAt บนสอบ/ทดสอบ | ทุกหน้าที่ toggle | S | ★★★★★ |

### กลุ่ม S — Student UX
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| S1 | รองรับหลายห้องเรียนพร้อมกัน + dropdown สลับห้อง | StudentClassroomPage | M | ★★★★☆ |
| S2 | ดูผลสอบ/ทดสอบย้อนหลังตัวเอง | StudentClassroomPage | M | ★★★★★ |
| S3 | Resume กลางสอบถ้า browser ปิด/หลุด | ExamRoom, PrePostTestRoom | M | ★★★★☆ |
| S4 | แสดงว่าครั้งไหน "นับ" ต่อ requiredPlayCount | StudentClassroomPage | S | ★★★☆☆ |
| S5 | ออกจากห้องเรียนได้ (leave classroom) | StudentClassroomPage | S | ★★★☆☆ |

### กลุ่ม X — System / Cross-cutting
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| X1 | Thai date format พ.ศ. ทุก timestamp ในระบบ | ทุกหน้า | XS | ★★★★☆ |
| X2 | Session timeout handling กลางสอบ | ExamRoom, PrePostTestRoom | S | ★★★★☆ |
| X3 | ลบ account ตัวเอง (PDPA) | ProfilePage | L | ★★★☆☆ |
| X4 | Direct join link (URL แทน code 6 หลัก) | TeacherPage | S | ★★★☆☆ |
| X5 | Classroom archive — จบเทอมปิดห้องโดยไม่ลบ (ข้อมูลวิจัยยังอยู่) | TeacherPage, AdminDashboard | S | ★★★★☆ |
| X6 | Leaderboard WPM รายห้อง — ranking นักเรียนในห้องเดียวกัน | StudentClassroomPage | M | ★★★☆☆ |

### กลุ่ม R — Research System (งานวิจัย — Critical)
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| R1 | Pre/Post comparison dashboard — แสดง O1 vs O2 เคียงกัน (pairId มีแล้วแต่ยังไม่มี UI) | TeacherPage | M | ★★★★★ |
| R2 | Result published notification — นักเรียนรู้ว่าครูปล่อยผลแล้ว (isResultPublished ชัดเจน) | StudentClassroomPage | S | ★★★★☆ |

### กลุ่ม T — Teacher Operations (ที่ยังขาด)
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| T8 | Practice deadline — กำหนดวันส่ง (dueDate) บน CustomLesson | TeacherPage | S | ★★★★☆ |
| T9 | Clone classroom ข้ามเทอม — copy lessons/exams ไปห้องใหม่ (ไม่รวม members/results) | TeacherPage | M | ★★★★☆ |
| T10 | Live exam oversight — ดู real-time ว่านักเรียนคนไหนกำลังสอบ/ส่งแล้ว/ยังไม่เข้า | TeacherPage | M | ★★★☆☆ |

### กลุ่ม SX — Student Extra
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| S6 | แสดงจำนวน retake ที่เหลือก่อนเข้าสอบ (ใน briefing card U6) | ExamRoom | XS | ★★★★☆ |
| S7 | แสดง assignedSet ของตัวเองก่อนเข้าสอบ | ExamRoom, PrePostTestRoom | XS | ★★★☆☆ |

### กลุ่ม Y — Infrastructure (Production Critical)
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| Y1 | Firestore composite indexes — plan และสร้าง index สำหรับ query ที่ซับซ้อน | firestore.indexes.json | S | ★★★★★ |
| Y2 | Rate limiting / debounce — ป้องกัน spam write (retry, submit ซ้ำเร็วเกิน) | useExam, usePrePostTest | S | ★★★★☆ |

### กลุ่ม Z — Data Model Gaps (ต้องแก้ก่อน feature อื่นที่ depend)
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| Z1 | Practice session history subcollection — ต้องมีก่อน U2/U13/S4 ทำงานได้ | users/{uid}/stats/{levelId}/sessions | M | ★★★★★ |
| Z2 | Auto-number students — ปุ่ม assign เลขที่อัตโนมัติ (เรียง A–Z → 1,2,3...) | TeacherPage MemberTable | S | ★★★☆☆ |

### กลุ่ม W — Stability & Performance
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| W1 | Error Boundary — ครอบทุก route ป้องกันหน้าขาวเมื่อ component crash | App.tsx | XS | ★★★★★ |
| W2 | Route-level Lazy Loading — `React.lazy()` + Suspense fallback (skeleton) | App.tsx | S | ★★★☆☆ |

### กลุ่ม P — Security & Data Integrity
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| P1 | Multi-tab prevention — กัน exam เปิดหลาย tab พร้อมกัน (anti-cheat) | ExamRoom, PrePostTestRoom | XS | ★★★★★ |
| P2 | Research data lock — ล็อค examSets เมื่อมีผลส่งแล้ว ป้องกันครูแก้ชุดข้อสอบ | useExam, usePrePostTest | S | ★★★★★ |
| P3 | Join code regeneration — ครูออก code ใหม่ได้ (ยกเลิก code เดิม) | TeacherPage | XS | ★★★☆☆ |
| P4 | Lesson text preview — ดูตัวอย่างก่อน save (แสดงแบบเดียวกับ TypingArea) | LessonManager | S | ★★★☆☆ |
| P5 | Export member list CSV — แยกจาก research export (ชื่อ + เลขที่ + email) | TeacherPage | XS | ★★★☆☆ |
| P6 | `updatedAt` + `updatedBy` บน CustomLesson และ ExamSet ทุกครั้งที่แก้ไข | ทุกที่ที่ edit | XS | ★★★☆☆ |

### กลุ่ม V — Platform Compatibility
| # | รายการ | หน้า | Effort | Impact |
|---|--------|------|--------|--------|
| V1 | iOS Safari fullscreen fallback — Safari ไม่รองรับ `requestFullscreen` | ExamRoom, PrePostTestRoom | S | ★★★★☆ |
| V2 | Exam auto-submit เมื่อครู force-close — `onSnapshot` บน `isOpen` | ExamRoom, PrePostTestRoom | S | ★★★★★ |

---

## รายละเอียดแต่ละรายการ

---

### U1 — เปลี่ยน Wrong Char Feedback
**ไฟล์**: [src/components/practice/TypingArea.tsx](src/components/practice/TypingArea.tsx)  
**Effort**: XS (แก้ 1 บรรทัด)  
**ปัญหา**: ตอนนี้ใช้ `text-red-600 line-through` → ขีดทับตัวอักษรที่ถูกต้อง ทำให้นักเรียนไม่เห็นว่าควรพิมพ์อะไร

**แก้**:
```tsx
// ก่อน
colorClass = typedText[index] === char ? 'text-green-600' : 'text-red-600 line-through';

// หลัง
colorClass = typedText[index] === char
  ? 'text-green-600'
  : 'bg-red-200 text-red-700 rounded-sm';   // highlight แทน strikethrough
```

---

### U2 — เปรียบเทียบผลกับครั้งก่อน
**ไฟล์**: [src/components/practice/GameResults.tsx](src/components/practice/GameResults.tsx)  
**Effort**: S (~15 บรรทัด)  
**ปัญหา**: `latestUserStats` รับมาใน props แต่ยังไม่ได้ใช้เปรียบเทียบกับ session ปัจจุบัน

**แก้**: เพิ่ม delta row ใต้ WPM card:
```tsx
// ถ้า latestUserStats มีค่า
const wpmDelta = wpm - latestUserStats.wpm;
const isPersonalBest = wpm > (latestUserStats.wpm);

// แสดง:
// 🏆 สถิติใหม่!        (ถ้า personal best)
// ▲ +5 WPM จากครั้งก่อน  (ถ้าดีขึ้น, สีเขียว)
// ▼ -3 WPM จากครั้งก่อน  (ถ้าแย่ลง, สีแดงอ่อน)
```

---

### U3 — Progress Bar Full-Width
**ไฟล์**: [src/pages/PracticePage.tsx](src/pages/PracticePage.tsx)  
**Effort**: S  
**ปัญหา**: Progress อยู่ใน stats grid (เล็กมาก ไม่มีใครสังเกตขณะพิมพ์)

**แก้**: เพิ่ม full-width progress bar ระหว่าง `<StatsDisplay>` และ `<TypingArea>`:
```tsx
<div className="w-full h-1.5 rounded-full mb-3" style={{ background: 'var(--color-border)' }}>
  <div
    className="h-full rounded-full transition-all duration-300"
    style={{
      width: `${progress}%`,
      background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
    }}
  />
</div>
```
ลบ progress bar เดิมออกจาก StatsDisplay grid

---

### U4 — ปุ่ม "ถัดไป" และ "ลองอีกครั้ง"
**ไฟล์**: [src/components/practice/GameResults.tsx](src/components/practice/GameResults.tsx)  
**Effort**: S  
**ปัญหา**: หลังพิมพ์เสร็จ ไม่มีปุ่มบอกว่าต้องทำอะไรต่อ — นักเรียนต้องหาเองจาก sidebar

**แก้**: เพิ่ม action bar ใต้ผลคะแนน:
```tsx
<div className="flex gap-3 justify-center mt-4">
  <button onClick={handleResetGame}>↩ ลองอีกครั้ง</button>
  {nextLevelId && (
    <button onClick={() => setCurrentLevelId(nextLevelId)}>
      ถัดไป: {nextLevelName} →
    </button>
  )}
</div>
```
หา `nextLevelId` จาก `languages` data โดย linear scan จาก `currentLevelId`

---

### U5 — Shake Animation เมื่อพิมพ์ผิด
**ไฟล์**: [src/components/practice/TypingArea.tsx](src/components/practice/TypingArea.tsx) + [src/App.css](src/App.css)  
**Effort**: S  
**ปัญหา**: พิมพ์ผิดแล้วไม่มี feedback ทันที ต้องมองหาตัวสีแดงเอง

**แก้**:
```css
/* App.css */
@keyframes shake-error {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.shake { animation: shake-error 0.2s ease; }
```
```tsx
// TypingArea: track errorCount, toggle class เมื่อ error เพิ่ม
const [shaking, setShaking] = useState(false);
useEffect(() => {
  if (errorCount > prevErrorCount) {
    setShaking(true);
    setTimeout(() => setShaking(false), 200);
  }
}, [errorCount]);

<div className={shaking ? 'shake' : ''}> ... </div>
```

---

### U6 — Pre-Exam Briefing Card
**ไฟล์**: [src/pages/ExamRoom.tsx](src/pages/ExamRoom.tsx), [src/pages/PrePostTestRoom.tsx](src/pages/PrePostTestRoom.tsx)  
**Effort**: M  
**ปัญหา**: Phase 'ready' ก่อนเริ่มสอบ น่าจะแสดงแค่ปุ่มเปล่า ๆ — นักเรียนไม่รู้ว่าได้ชุดไหน เวลาเท่าไหร่

**แก้**: สร้าง briefing card แสดงข้อมูลก่อนเริ่ม:
```
┌─────────────────────────────────────────┐
│  📋  ชื่อการสอบ: ภาคเรียน 1/2568        │
│  📄  ชุดที่ได้รับ: ชุดที่ 2 (จาก 5 ชุด)  │
│  ⏱   เวลาที่มี: 10 นาที                 │
│  ✍️   พิมพ์ข้อความตามที่แสดงบนหน้าจอ    │
│  ⚠️   ออก fullscreen = บันทึก warning   │
│                                         │
│         [ 🔒 เริ่มสอบ (fullscreen) ]    │
└─────────────────────────────────────────┘
```

---

### U7 — Lesson Card States แยกชัดเจน
**ไฟล์**: [src/pages/StudentClassroomPage.tsx](src/pages/StudentClassroomPage.tsx)  
**Effort**: M  
**ปัญหา**: lesson card ทุกใบมีรูปแบบเหมือนกัน ไม่ว่าจะเสร็จหรือยังไม่เริ่ม

**แก้**: แยก visual state 4 แบบตาม playCount vs requiredPlayCount:

| สถานะ | เงื่อนไข | Visual |
|-------|----------|--------|
| ยังไม่เริ่ม | playCount = 0 | border ปกติ, icon ⬜ สีเทา |
| กำลังฝึก | 0 < playCount < required | border accent, progress bar สี, icon 🔄 |
| ครบแล้ว | playCount >= required | border success สีเขียว, ✅ badge มุมขวาบน |
| ไม่กำหนดครั้ง | required = null | border ปกติ, แสดง playCount เฉย ๆ |

---

### U8 — Live WPM Sparkline Graph
**ไฟล์**: [src/components/practice/StatsDisplay.tsx](src/components/practice/StatsDisplay.tsx), [src/hooks/useTypingGame.ts](src/hooks/useTypingGame.ts)  
**Effort**: M  
**ปัญหา**: WPM เป็นตัวเลขเดียวที่ snap เปลี่ยน — ไม่รู้ว่า trend ขึ้นหรือลงใน session นี้

**แก้**:
1. ใน `useTypingGame`: เก็บ `wpmHistory: number[]` ทุก ๆ 5 วินาที
2. ใน `StatsDisplay`: แสดง SVG polyline ขนาด 60×24px ข้าง WPM card

```tsx
// SVG sparkline (pure, ไม่ต้อง install library)
const points = wpmHistory.map((v, i) =>
  `${(i / (wpmHistory.length - 1)) * 60},${24 - (v / maxWpm) * 24}`
).join(' ');
<svg width="60" height="24" className="opacity-60">
  <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
</svg>
```

---

### U9 — Keyboard Finger Zone Colors
**ไฟล์**: [src/components/practice/VirtualKeyboard.tsx](src/components/practice/VirtualKeyboard.tsx), [src/data/keyboardData.ts](src/data/keyboardData.ts)  
**Effort**: M  
**ปัญหา**: keyboard ตอนนี้ทุก key สีเทาเหมือนกัน ไม่บอกว่าควรใช้นิ้วไหน

**แก้**: กำหนด finger zone map ใน `keyboardData.ts` แล้ว apply base color อ่อน ๆ (opacity 20%) ตาม zone:

| นิ้ว | keys | สี |
|------|------|----|
| นิ้วก้อยซ้าย | Q, A, Z, 1, Tab, CapsLock, Shift | แดงอ่อน |
| นิ้วนางซ้าย | W, S, X, 2 | ส้มอ่อน |
| นิ้วกลางซ้าย | E, D, C, 3 | เหลืองอ่อน |
| นิ้วชี้ซ้าย | R, F, V, T, G, B, 4, 5 | เขียวอ่อน |
| นิ้วโป้ง | Space | น้ำเงินอ่อน |
| นิ้วชี้ขวา | Y, H, N, U, J, M, 6, 7 | เขียวอ่อน |
| นิ้วกลางขวา | I, K, ,, 8 | เหลืองอ่อน |
| นิ้วนางขวา | O, L, ., 9 | ส้มอ่อน |
| นิ้วก้อยขวา | P, ;, /, 0, Enter, Backspace | แดงอ่อน |

---

### U10 — Unified Action Hub
**ไฟล์**: [src/pages/StudentClassroomPage.tsx](src/pages/StudentClassroomPage.tsx)  
**Effort**: M  
**ปัญหา**: มีหลาย banner ซ้อนกัน (สอบ/ทดสอบ/แบบสอบถาม) ถ้าเปิดพร้อมกันดูรก

**แก้**: รวมเป็น "สิ่งที่ต้องทำ" card เดียว เรียงตาม priority:
```
📋 สิ่งที่ต้องทำ (3 รายการ)
├── 🔴 การสอบ "ภาคเรียน 1" — เปิดอยู่   [เข้าสอบ →]
├── 🟡 Pre-test — เปิดถึงวันศุกร์          [เริ่มทดสอบ →]
└── 🟣 แบบสอบถามความพึงพอใจ            [ตอบแบบสอบถาม →]
```

---

### U11 — Countdown Ring Timer
**ไฟล์**: [src/pages/ExamRoom.tsx](src/pages/ExamRoom.tsx), [src/pages/PrePostTestRoom.tsx](src/pages/PrePostTestRoom.tsx)  
**Effort**: M  
**ปัญหา**: timer แสดงตัวเลขในห้องสอบ ต้องอ่านตัวเลขเพื่อรู้เวลา — รบกวน focus

**แก้**: SVG circular countdown ring แทนหรือเพิ่มควบคู่ตัวเลข:
```tsx
// stroke-dasharray = เส้นรอบวง, stroke-dashoffset = ส่วนที่เหลือ
const circumference = 2 * Math.PI * 36; // r=36
const offset = circumference * (1 - remainingTime / timeLimit);
<circle
  r="36" cx="40" cy="40"
  fill="none" stroke="var(--color-primary)" strokeWidth="6"
  strokeDasharray={circumference}
  strokeDashoffset={offset}
  style={{ transition: 'stroke-dashoffset 1s linear',
           stroke: remainingTime < timeLimit * 0.2 ? 'var(--color-error)' : 'var(--color-primary)' }}
/>
```

---

### U12 — Quick Stats Header ในห้องครู
**ไฟล์**: [src/pages/TeacherPage.tsx](src/pages/TeacherPage.tsx)  
**Effort**: S  
**ปัญหา**: เลือกห้องเรียนแล้วเห็นแต่ชื่อห้อง ไม่มี overview ว่าห้องนี้เป็นอย่างไร

**แก้**: เพิ่ม 3 ตัวเลขขนาดเล็กใต้ชื่อห้องที่เลือก:
```
ห้อง 1/1 พาณิชยกรรม
👥 12 คน   ✅ 8 คนฝึกครบ (66%)   📊 avg WPM 28
```
คำนวณจาก `members.length` และ `stats` ที่โหลดมาแล้ว

---

### U13 — WPM History Chart
**ไฟล์**: [src/components/dashboard/UserDashboard.tsx](src/components/dashboard/UserDashboard.tsx)  
**Effort**: L  
**ปัญหา**: Dashboard แสดง WPM เป็นตัวเลขเดียวต่อ level ไม่เห็น trend ตามเวลา

**แก้**: ใช้ `lastPlayed` timestamp จาก `stats` เรียงตามวัน แสดงเป็น line chart  
แนะนำ: ใช้ `recharts` (`npm install recharts`) หรือ pure SVG path

```
WPM ใน 30 วันที่ผ่านมา
40 ┤                          ●
35 ┤              ●     ●─────
30 ┤    ●────●───              
25 ┤●───                       
   └──────────────────────────→ วัน
```

---

### U14 — Font Size Control
**ไฟล์**: [src/components/practice/TypingArea.tsx](src/components/practice/TypingArea.tsx)  
**Effort**: S  
**ปัญหา**: font size ตายตัว บางคนต้องการตัวใหญ่กว่าเพื่ออ่านสะดวก

**แก้**: เพิ่มปุ่ม A- / A+ มุมขวาของ typing display, persist ใน localStorage:
```tsx
const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
// class map: { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' }
```

---

### U15 — Smooth Number Transitions
**ไฟล์**: [src/components/practice/StatsDisplay.tsx](src/components/practice/StatsDisplay.tsx)  
**Effort**: S  
**ปัญหา**: ตัวเลข WPM, accuracy กระโดดทันทีทุกครั้งที่คำนวณใหม่ ดูกระตุก

**แก้**: ใช้ CSS `transition` + `useRef` track ค่าก่อนหน้า หรือ custom hook `useAnimatedNumber`:
```tsx
// เพิ่ม transition ให้ตัวเลข interpolate แบบ ease-out ใน ~300ms
function useAnimatedNumber(target: number, duration = 300) {
  const [display, setDisplay] = useState(target);
  // requestAnimationFrame lerp จาก current → target
}
```

---

## รายละเอียดรายการใหม่ (A–E)

---

### A1 — Empty State Actionable
**ไฟล์**: TeacherPage, StudentClassroomPage  
**ปัญหา**: ถ้าไม่มีข้อมูลหน้าจะว่างเปล่า นักเรียน/ครูไม่รู้ว่าต้องทำอะไร  
**แก้**: แต่ละ empty state บอก next step พร้อมปุ่ม action เลย:
```
ยังไม่มีบทเรียน
[ + สร้างบทเรียนแรก ]   หรือ import CSV นักเรียนก่อน →
```

---

### A2 — First-Join Onboarding Card
**ไฟล์**: StudentClassroomPage  
**ปัญหา**: student join ห้องแล้วเจอ list บทเรียนทันที ไม่รู้บริบทห้อง  
**แก้**: แสดง card ครั้งแรกเท่านั้น (localStorage flag `onboarded-{classroomId}`):
```
ยินดีต้อนรับสู่ ห้อง ปวช.1/1
ครู: อ.สมชาย | บทเรียน 8 บท | ฝึกให้ครบ X ครั้งต่อบท
[ เริ่มบทเรียนแรก → ]   [ปิด]
```

---

### B1 — Cursor & Extra-Char Feedback
**ไฟล์**: TypingArea  
**ปัญหา**: ไม่เห็น cursor ชัด และถ้าพิมพ์เกินตัวอักษรที่กำหนดไม่มี visual บอก  
**แก้**:
- Cursor position: blinking `|` line ที่ตำแหน่งถัดไป
- Extra chars (พิมพ์เกิน): underline สีส้ม บน char ที่ผิด

---

### B2 — Live Stats Smoothing
**ไฟล์**: StatsDisplay, useTypingGame  
**แก้**:
- WPM: คำนวณทุก keystroke แต่ **แสดงผลอัปเดตทุก 3 วินาที** (smooth กว่า)
- Accuracy: แสดงเป็น animated bar สีแดง/เขียว แทนตัวเลขเปล่า

---

### B3 — Red Border Flash
**ไฟล์**: TypingArea  
**แก้**: เมื่อพิมพ์ผิด 3 ครั้งติดกันโดยไม่ Backspace — border ของ typing area flash สีแดงเบาๆ 1 ครั้ง (300ms)

---

### C1 — Enhanced Result Card
**ไฟล์**: GameResults, ExamRoom  
**ปัญหา**: หน้าผลตอนนี้แสดงแค่ตัวเลข ไม่มี context  
**แก้**: Result card ใหม่:
```
┌─────────────────────────────────────┐
│  🏆  WPM 45     ✅ ความแม่นยำ 94%  │
│      คะแนน 8/10                     │
│  ──────────────────────────────     │
│  ▲ +5 WPM จากครั้งก่อน            │
│  อักษรที่ผิดบ่อย: ก, า, น (top 3) │
│  ──────────────────────────────     │
│  [ ↩ ลองอีกครั้ง ]  [ ถัดไป → ]  │
└─────────────────────────────────────┘
```

---

### D1 — Notification Badge
**ไฟล์**: Navigation/Header component  
**ปัญหา**: นักเรียนไม่รู้ว่ามีสอบ/แบบสอบถามเปิดอยู่ ต้องไปเข้า My Classroom เองเพื่อเช็ค  
**แก้**: red dot badge บน nav link "ห้องเรียน" นับจำนวน pending items รวม

---

### E1 — Teacher Full-Width Dashboard Layout
**ไฟล์**: TeacherPage  
**Effort**: L — เป็น layout restructure ใหญ่  
**แก้**:
- ลบ sidebar ออก
- Classroom เลือกจาก dropdown ด้านบน (ถ้ามีหลายห้อง)
- Quick stats header: นักเรียน / avg WPM / ผ่านเกณฑ์
- Tabs แบบ full-width ด้านล่าง
- ตารางนักเรียนกว้างขึ้น ไม่ scroll แนวนอน

---

### E2 — Pinned Quick Action Bar
**ไฟล์**: TeacherPage  
**แก้**: row ปุ่ม primary actions ใต้ quick stats:
```
[ + บทเรียน ]  [ เปิด/ปิด Pre-test ▼ ]  [ Export CSV ]
```

---

## ลำดับการทำงาน (Sprint UX)

## รายละเอียดรายการใหม่ (R, T, SX, Y)

---

### R1 — Pre/Post Comparison Dashboard
**ไฟล์**: TeacherPage (tab "การทดสอบ")  
**ปัญหา**: `pairId` มีใน data model แต่ครูดูผล Pre กับ Post เทียบกันไม่ได้บน UI  
**แก้**: ใน PrePostTestList เพิ่ม view "เปรียบเทียบ Pre/Post" — จับคู่ด้วย pairId แสดงตาราง:
```
ชื่อ-นามสกุล | Pre WPM | Post WPM | Δ WPM | Pre Score | Post Score | ผ่าน?
สมชาย ใจดี  |   25    |   38     | +13   |   6/10    |   8/10     |  ✅
```

---

### R2 — Result Published Notification
**ไฟล์**: StudentClassroomPage  
**แก้**: เมื่อ `isResultPublished = true` → แสดง banner/badge "ครูปล่อยผลแล้ว — ดูผลของคุณ" พร้อมลิงก์ไปยังผล

---

### T8 — Practice Deadline (dueDate)
**แก้**: เพิ่ม `dueDate?: Timestamp` ใน `CustomLesson`  
แสดงใน lesson card: "ส่งภายใน 30 พ.ค. 2569" + สีแดงถ้าเกินกำหนด  
LessonManager: เพิ่ม date picker field

---

### T9 — Clone Classroom ข้ามเทอม
**แก้**: ปุ่ม "คัดลอกการตั้งค่า" บน classroom card:
```tsx
const cloneClassroom = async (sourceId: string, newName: string) => {
  // 1. สร้าง classroom ใหม่
  // 2. copy lessons ทั้งหมด (ไม่รวม results)
  // 3. copy examSets จาก exams (ไม่รวม results)
  // 4. ไม่ copy members, surveys, responses
};
```

---

### T10 — Live Exam Oversight
**แก้**: ใน ExamList results modal เพิ่ม real-time status column  
ใช้ `onSnapshot` บน `exams/{id}/results` — ถ้ามี doc = ส่งแล้ว, ไม่มี = ยังไม่ส่ง  
แสดง: 🟢 กำลังสอบ (ถ้า exam เปิดอยู่และยังไม่มีผล) / ✅ ส่งแล้ว / ⬜ ยังไม่เข้า

---

### S6 + S7 — Briefing Card Enhancement
เพิ่มใน U6 briefing card:
```
│  📄  ชุดที่ได้รับ: ชุดที่ 2               ← S7
│  🔄  สิทธิ์สอบซ้ำที่เหลือ: 2 ครั้ง       ← S6
```
คำนวณ retake ที่เหลือ: `maxRetake - attemptCount` (0 = ไม่จำกัด แสดง "ไม่จำกัด")

---

### Y1 — Firestore Composite Indexes
**ไฟล์**: `firestore.indexes.json`  
Query ที่ต้องการ index เพิ่ม:
```json
{
  "indexes": [
    {
      "collectionGroup": "members",
      "fields": [{ "fieldPath": "uid" }, { "fieldPath": "classroomId" }]
    },
    {
      "collectionGroup": "results",
      "fields": [{ "fieldPath": "uid" }, { "fieldPath": "submittedAt", "order": "DESCENDING" }]
    }
  ]
}
```
ต้อง deploy index ก่อน production — ถ้าไม่สร้าง query จะ error พร้อม link สร้าง index อัตโนมัติ

---

### W1 — Error Boundary
**ไฟล์**: `src/components/shared/ErrorBoundary.tsx`, `App.tsx`  
**แก้**: React class component ครอบทุก route — แสดง fallback UI แทนหน้าขาว:
```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p>เกิดข้อผิดพลาด กรุณารีเฟรชหน้า</p>
        <button onClick={() => window.location.reload()}>รีเฟรช</button>
      </div>
    );
    return this.props.children;
  }
}
// App.tsx: ครอบแต่ละ <Route> ด้วย <ErrorBoundary>
```

---

### W2 — Route-level Lazy Loading
**ไฟล์**: `App.tsx`  
**แก้**: แยก bundle ต่อ page — หน้าหนักเช่น ExamRoom, TeacherPage โหลดเมื่อต้องการ:
```tsx
const TeacherPage = React.lazy(() => import('./pages/TeacherPage'));
const ExamRoom = React.lazy(() => import('./pages/ExamRoom'));

<Suspense fallback={<SkeletonCard lines={5} />}>
  <Routes>...</Routes>
</Suspense>
```
ใช้ `SkeletonCard` (F1) เป็น fallback — ไม่ต้องสร้าง component ใหม่

---

### Z1 — Practice Session History
**ปัญหา**: `users/{uid}/stats/{levelId}` เก็บแค่ค่าล่าสุด — U2, U13, S4 ต้องการ history ต่อ session  
**แก้**: เพิ่ม subcollection `sessions` ใน `useTypingGame.ts` ตอน save stats:
```typescript
// เดิม: update stats doc เดียว
// ใหม่: update stats doc + addDoc sessions
const sessionRef = collection(db, 'users', uid, 'stats', levelId, 'sessions');
await addDoc(sessionRef, {
  wpm, accuracy, score10Point,
  counted: score10Point >= passingScore, // นับต่อ requiredPlayCount ไหม
  playedAt: serverTimestamp(),
});
// stats doc ยังอัปเดตเหมือนเดิม (wpm, accuracy, playCount, lastPlayed)
```
Firestore rules: อ่านได้เฉพาะ owner + teacher ของห้องที่นักเรียนอยู่

---

### Z2 — Auto-number Students
```tsx
// MemberTable — ปุ่ม "กำหนดเลขที่อัตโนมัติ"
const autoNumber = async () => {
  const sorted = [...members].sort((a, b) =>
    (a.displayName ?? '').localeCompare(b.displayName ?? '', 'th')
  );
  await Promise.all(sorted.map((m, i) =>
    updateDoc(memberRef(m.uid), { studentNumber: i + 1 })
  ));
  toast.success('กำหนดเลขที่อัตโนมัติแล้ว');
};
```

---

### Y2 — Rate Limiting / Debounce
**แก้**: เพิ่ม debounce และ loading state บนทุก Firestore write ที่ user trigger:
```tsx
const [submitting, setSubmitting] = useState(false);
const handleSubmit = async () => {
  if (submitting) return; // กัน double-click
  setSubmitting(true);
  try { await submitResult(...); }
  finally { setSubmitting(false); }
};
<button disabled={submitting}>{submitting ? 'กำลังส่ง...' : 'ส่งคำตอบ'}</button>
```

---

---

## รายละเอียดรายการใหม่ (P, V)

---

### P1 — Multi-Tab Prevention
**ไฟล์**: [src/pages/ExamRoom.tsx](src/pages/ExamRoom.tsx), [src/pages/PrePostTestRoom.tsx](src/pages/PrePostTestRoom.tsx)  
**ปัญหา**: นักเรียนอาจเปิด exam ใน 2 tab พร้อมกัน → submit 2 ครั้ง หรือใช้ tab อื่น Google ระหว่างสอบ  
**แก้**: ใช้ `sessionStorage` flag เมื่อเข้าห้องสอบ — ถ้า flag มีอยู่แล้วให้ block:
```tsx
useEffect(() => {
  const key = `exam-open-${examId}`;
  if (sessionStorage.getItem(key)) {
    // แสดง error: "คุณกำลังสอบในอีก tab หนึ่งอยู่แล้ว"
    setBlocked(true);
    return;
  }
  sessionStorage.setItem(key, '1');
  return () => sessionStorage.removeItem(key);
}, [examId]);
```
**หมายเหตุ**: `sessionStorage` ต่างกันระหว่าง tab — tab ใหม่จะไม่เห็น flag ของ tab เก่า  
วิธีที่แข็งแกร่งกว่า: `BroadcastChannel` API ส่ง ping ข้าม tab และรอ pong (ถ้า pong ตอบกลับ = มีสอบอยู่แล้ว)

---

### P2 — Research Data Lock
**ไฟล์**: [src/hooks/useExam.ts](src/hooks/useExam.ts), [src/hooks/usePrePostTest.ts](src/hooks/usePrePostTest.ts)  
**ปัญหา**: ถ้าครูแก้ `examSets` หลังนักเรียนส่งผลแล้ว — ผลที่ส่งมาจะอิงชุดข้อสอบชุดเก่า แต่ข้อมูลในฐานข้อมูลเปลี่ยนไป ทำให้ข้อมูลวิจัยเสีย  
**แก้**: เพิ่ม `isLocked: boolean` บน exam/prePostTest doc — set เป็น `true` อัตโนมัติเมื่อมีผลแรกส่งเข้ามา:
```typescript
// ใน submitResult()
const examDoc = await getDoc(examRef);
if (!examDoc.data()?.isLocked) {
  await updateDoc(examRef, { isLocked: true });
}
await setDoc(resultRef, resultData);
```
UI: แสดง 🔒 icon บน exam ที่ locked — ครูแก้ชุดข้อสอบไม่ได้ แต่ยังเปิด/ปิดได้  
Firestore rules: `allow update: if !resource.data.isLocked || request.resource.data.examSets == resource.data.examSets`

---

### P3 — Join Code Regeneration
**ไฟล์**: [src/pages/TeacherPage.tsx](src/pages/TeacherPage.tsx), [src/hooks/useClassroom.ts](src/hooks/useClassroom.ts)  
**ปัญหา**: ถ้า join code หลุดออกไปนอกห้อง ครูต้องการออก code ใหม่แต่ปัจจุบันทำไม่ได้  
**แก้**:
```typescript
const regenerateJoinCode = async (classroomId: string, oldCode: string) => {
  const newCode = generateCode(); // 6 หลัก A-Z0-9
  await deleteDoc(doc(db, 'joinCodes', oldCode));
  await setDoc(doc(db, 'joinCodes', newCode), { classroomId, createdBy: uid, createdAt: serverTimestamp() });
  await updateDoc(classroomRef, { joinCode: newCode });
};
```
ปุ่ม "🔄 ออก Code ใหม่" + confirm dialog ("code เดิมจะใช้ไม่ได้ทันที")

---

### P4 — Lesson Text Preview
**ไฟล์**: [src/components/classroom/LessonManager.tsx](src/components/classroom/LessonManager.tsx)  
**ปัญหา**: ครูพิมพ์ข้อความใน textarea แต่ไม่รู้ว่าจะแสดงผลใน TypingArea จริง ๆ อย่างไร (spacing, line break)  
**แก้**: เพิ่ม preview panel ด้านขวา form — แสดงข้อความในรูปแบบเดียวกับ TypingArea (font, size, color สีเทา):
```tsx
{lessonText && (
  <div className="mt-2 p-3 rounded border text-sm font-mono leading-relaxed opacity-60">
    <span className="text-xs text-gray-400 block mb-1">ตัวอย่างใน TypingArea:</span>
    {lessonText}
  </div>
)}
```

---

### P5 — Export Member List CSV
**ไฟล์**: [src/pages/TeacherPage.tsx](src/pages/TeacherPage.tsx)  
**ปัญหา**: ครูอาจต้องการรายชื่อนักเรียนในห้องเป็น CSV (สำหรับทำเอกสาร) แยกจาก research export ที่ซับซ้อน  
**แก้**: ปุ่ม "Export รายชื่อ CSV" ใน MemberTable → download ไฟล์:
```
เลขที่,ชื่อ-นามสกุล,อีเมล,วันที่เข้าร่วม
1,สมชาย ใจดี,somchai@school.ac.th,22/05/2569
```
ใช้ BOM UTF-8 เหมือน research export เพื่อให้เปิดใน Excel ได้ถูกต้อง

---

### P6 — updatedAt + updatedBy Audit Fields
**ไฟล์**: [src/hooks/useClassroom.ts](src/hooks/useClassroom.ts), [src/hooks/useExam.ts](src/hooks/useExam.ts)  
**ปัญหา**: ถ้ามีคนแก้บทเรียนหรือชุดข้อสอบ ไม่มีทางรู้ว่าใครแก้เมื่อไหร่  
**แก้**: ทุก `updateDoc` บน CustomLesson และ ExamSet เพิ่ม:
```typescript
await updateDoc(lessonRef, {
  ...lessonData,
  updatedAt: serverTimestamp(),
  updatedBy: currentUser.uid,
});
```
แสดงใน UI: "แก้ไขล่าสุด: 22 พ.ค. 2569 โดย อ.สมชาย" (tooltip หรือ footnote เล็ก ๆ)

---

### V1 — iOS Safari Fullscreen Fallback
**ไฟล์**: [src/pages/ExamRoom.tsx](src/pages/ExamRoom.tsx), [src/pages/PrePostTestRoom.tsx](src/pages/PrePostTestRoom.tsx)  
**ปัญหา**: `document.documentElement.requestFullscreen()` ไม่ทำงานบน iOS Safari — นักเรียนที่ใช้ iPad/iPhone จะติด error หรือ exam ไม่เริ่ม  
**แก้**:
```typescript
const enterFullscreen = async () => {
  const el = document.documentElement as any;
  if (el.requestFullscreen) {
    await el.requestFullscreen();
  } else if (el.webkitRequestFullscreen) {
    // Safari desktop
    await el.webkitRequestFullscreen();
  } else {
    // iOS Safari — ไม่รองรับ fullscreen API เลย
    // fallback: แสดง overlay ที่ปิด header/footer ให้ดูเหมือน fullscreen
    setFakeFullscreen(true);
  }
};
```
`fakeFullscreen`: ใช้ `position: fixed; inset: 0; z-index: 9999` ครอบ exam content + ซ่อน header  
ยังนับ "ออก fullscreen" โดย track `visibilitychange` event แทน `fullscreenchange`

---

### V2 — Exam Auto-Submit เมื่อครู Force-Close
**ไฟล์**: [src/pages/ExamRoom.tsx](src/pages/ExamRoom.tsx), [src/pages/PrePostTestRoom.tsx](src/pages/PrePostTestRoom.tsx)  
**ปัญหา**: ครูปิด exam (`isOpen = false`) ขณะนักเรียนกำลังสอบอยู่ — นักเรียนยังสอบต่อได้โดยไม่รู้ว่าหมดเวลา และผลไม่ถูกส่ง  
**แก้**: เพิ่ม `onSnapshot` บน exam doc ระหว่างสอบ:
```typescript
useEffect(() => {
  const unsub = onSnapshot(examRef, (snap) => {
    if (!snap.data()?.isOpen && phase === 'typing') {
      // ครูปิดสอบ — auto-submit ทันที
      handleSubmit({ forcedClose: true });
    }
  });
  return unsub;
}, [phase]);
```
หลัง submit: แสดง toast "ครูปิดการสอบแล้ว — ผลของคุณถูกบันทึกแล้ว"

---

## ลำดับการทำงาน (Sprint UX)

### Sprint UX-0 — Foundation & Infrastructure ✅ เสร็จแล้ว (2026-05-22)
> Blocker ของทุกอย่างอื่น — ต้องเสร็จก่อนเริ่ม Sprint ถัดไป

- [x] **W1** — Error Boundary ครอบทุก route ✅ (มีอยู่แล้วก่อน sprint นี้)
- [x] **Y1** — สร้าง Firestore composite indexes `firestore.indexes.json` ✅ (5 indexes: members, results, sessions, classrooms, prePostTests)
- [x] **F2** — ติดตั้ง `sonner` + วาง `<Toaster>` ใน main.tsx ✅
- [x] **F1** — สร้าง `SkeletonCard` component ✅ (+ `SkeletonStatsGrid`, `SkeletonTableRows`, `SkeletonPage`)
- [x] **F3** — สร้าง `ConfirmDialog` component ✅ (+ `useConfirmDialog` hook)
- [x] **W2** — Route-level Lazy Loading + Suspense ✅ (+ vite `manualChunks` สำหรับ Firebase/React vendor)
- [x] **Y2** — `useSubmitGuard` hook + `debounce` + `withRetry` utilities ✅ (`src/utils/asyncUtils.ts`)
- [x] **Z1** — Session history subcollection ✅ (`users/{uid}/stats/{levelId}/sessions`) + Firestore rules
- [x] **SA1** — เพิ่ม `admin` role ใน types.ts + firestore.rules + route guard ✅ (admin เปลี่ยน role student↔teacher ได้, ดู classrooms ทั้งระบบ)
- [x] **X1** — `toThaiDate()` utility ✅ (`src/utils/dateUtils.ts` — รองรับ Firestore Timestamp, Date, ms, relative)
- [x] **G1** — `copyToClipboard()` utility ✅ + **X4** `getJoinLink()` ✅ (`src/utils/clipboardUtils.ts`)

### Sprint UX-0b — Security & Research Integrity ✅ เสร็จแล้ว (2026-05-22)
> งานที่ส่งผลต่อ anti-cheat และความน่าเชื่อถือของข้อมูลวิจัย

- [x] **P2** — Research data lock (`isLocked` อัตโนมัติเมื่อมีผลแรก — ป้องกันครูแก้ชุดข้อสอบ) ✅
- [x] **P1** — Multi-tab prevention (`BroadcastChannel` ping/pong ข้าม tab) ✅
- [x] **V2** — Exam auto-submit เมื่อครู force-close (`onSnapshot` บน `isOpen`) ✅
- [x] **SA9** — Audit trail: เพิ่ม `openedAt/closedAt/openedBy` บน exam + prePostTest ✅
- [x] **SA2** — SuperAdmin UI แต่งตั้ง/ถอด Admin (dropdown ใน user table) ✅
- [x] **R1** — Pre/Post comparison dashboard (tab เปรียบเทียบ O1 vs O2 เคียงกัน + Δ WPM) ✅
- [x] **R2** — Result published notification ชัดเจนสำหรับนักเรียน (banner สีเขียว) ✅
- [x] **S2** — ดูผลสอบ/ทดสอบย้อนหลังตัวเอง (modal แสดง WPM/accuracy/คะแนน/ผ่าน) ✅
- [x] **S6** + **S7** — เพิ่มข้อมูล briefing card (retake ที่เหลือ + assignedSet) ✅
- [x] **T8** — Practice deadline (เพิ่ม `dueDate` date picker บน LessonManager + แสดงในบัตรบทเรียน) ✅
- [x] **P6** — `updatedAt` + `updatedBy` บน CustomLesson (auto-inject ใน useClassroom.updateLesson) ✅

### Sprint UX-1 — Quick Wins (effort น้อย impact มาก)
> รายการที่เปลี่ยนแปลงชัดเจน ทำได้เร็ว

- [x] **U1** — Wrong char highlight แทน line-through ✅
- [x] **U2** — เปรียบเทียบ WPM กับครั้งก่อน + Personal Best ✅
- [x] **U3** — Progress bar full-width เหนือ textarea ✅
- [x] **U4** — ปุ่ม "ถัดไป" / "ลองอีกครั้ง" หลังจบ ✅
- [x] **U15** — Smooth number transitions (WPM, accuracy) ✅ (rAF ease-out cubic)
- [x] **A1** — Empty state actionable ✅ (TeacherPage + StudentClassroomPage มี next step อยู่แล้ว)
- [x] **A2** — First-join onboarding card ✅ (localStorage flag + dismiss button)
- [x] **B1** — Cursor & extra-char feedback ✅
- [x] **D1** — Notification badge บน nav (pending items) ✅ (แดงบนปุ่มห้องเรียน เมื่อมีสอบ/ทดสอบเปิดอยู่)
- [x] **E2** — Teacher pinned quick action bar ✅ (+ บทเรียน / Pre-Post Test / จำนวนคน)
- [x] **H1** — ค้นหานักเรียนในตาราง ✅
- [x] **H3** — Duplicate lesson/exam ✅
- [x] **H6** — เรียงลำดับ lesson (↑ ↓) ✅ (order field + swap ใน LessonManager)
- [x] **P3** — Join code regeneration (ปุ่ม 🔄 ออก code ใหม่) ✅
- [x] **P4** — Lesson text preview ก่อน save ✅
- [x] **P5** — Export member list CSV ✅
- [x] **Z2** — Auto-number students ✅
- [x] **SA3** — ค้นหา user ใน AdminDashboard ✅ (filter name/email/role มีอยู่แล้ว)
- [x] **SA8** — System-wide stats header ✅ (role breakdown + active users strip)
- [ ] **S4** — แสดงว่าครั้งไหน "นับ" ต่อ requiredPlayCount (ต้องมี Z1 ก่อน)
- [x] **S5** — Leave classroom ✅ (ปุ่ม "ออกจากห้อง" มีอยู่แล้ว)
- [x] **X1** — Thai date format พ.ศ. ✅ (toThaiDate() ทำใน Sprint UX-0)

### Sprint UX-2 — Interaction Polish
> เพิ่ม layer การตอบสนองและ workflow ของครู/นักเรียน

- [x] **U5** — Shake animation เมื่อพิมพ์ผิด ✅ (rAF 0.25s ใน TypingArea + CSS keyframe)
- [x] **U6** — Pre-exam briefing card ✅ (มีอยู่แล้วใน ExamRoom + PrePostTestRoom พร้อม S6/S7)
- [x] **U7** — Lesson card states แยกชัดเจน 4 แบบ ✅ (notStarted/inProgress/completed/noReq + badge ✅)
- [x] **U10** — Unified Action Hub ✅ (3 banners รวมเป็น 1 hub สีเหลืองใน StudentClassroomPage)
- [x] **U12** — Quick stats header ในห้องครู ✅ (members + lessons + joinCode strip)
- [x] **U14** — Font size control ใน TypingArea ✅ (A− / A+ buttons + localStorage preset)
- [x] **B2** — Live stats smoothing ✅ (WPM อัปเดตทุก 3 วิผ่าน interval + accuracy mini bar ใน StatsDisplay)
- [x] **B3** — Red border flash เมื่อพิมพ์ผิด 3 ครั้งติดกัน ✅ (consecutiveErrRef ใน TypingArea)
- [x] **C1** — Enhanced result card (top 3 อักษรที่พิมพ์ผิดบ่อย) ✅ (errorCharFreqRef ใน useTypingGame + chips ใน GameResults)
- [x] **H2** — Drill-down: กดชื่อนักเรียน → ดูสถิติรายคน ✅ (modal แสดงสถิติรายบทเรียนของนักเรียน)
- [x] **H4** — Auto-close exam ตามวันที่/เวลา ✅ (datetime-local input ใน ExamCreate/PrePostTestCreate + closeAt timer enforcement ใน ExamRoom/PrePostTestRoom)
- [x] **H5** — แสดงนักเรียนที่ยังไม่ join ห้อง ✅ (importMembers คืน skipped emails + แสดงใน CSVImportPanel)
- [x] **H7** — Export PDF รายงาน ✅ (window.open + print-friendly HTML report พร้อม stats ทุกบทเรียน)
- [x] **SA4** — Deactivate account ✅ (toggle isDeactivated ใน AdminDashboard + enforce signOut ใน useAuth onSnapshot)
- [x] **SA5** — Tab "ห้องเรียน" ทั้งระบบ ใน AdminDashboard ✅ (classrooms tab + onSnapshot โหลดทุกห้องในระบบ + ตารางรายชื่อ)
- [x] **SA6** — Drill-down เข้าดูข้อมูลในห้อง ✅ (คลิก classroom → modal แสดง members list)
- [x] **SA7** — ย้าย classroom ไปครูคนอื่น ✅ (dropdown เลือกครูใหม่ + update Firestore + classroomIds ทั้งครูเก่า/ใหม่)
- [x] **S1** — หลายห้องเรียน + dropdown สลับ ✅ (auto-select ห้องแรก + dropdown switcher ใน detail panel header)
- [x] **S3** — Resume กลางสอบ ✅ (localStorage draft — save startedAt on start, compute remaining on load, timeLimitOverride → useTypingGame, banner "ต่อจากเดิม/เริ่มใหม่", clear on submit — ExamRoom + PrePostTestRoom)
- [x] **V1** — iOS Safari fullscreen fallback ✅ (check document.fullscreenEnabled — ข้ามการขอ fullscreen + ไม่นับ exit + แสดงข้อความแทน)
- [x] **X2** — Session timeout modal กลางสอบ ✅ (ProtectedRoute isExamRoute — modal sign-in แทน redirect)

### Sprint UX-3 — Visual Depth & Redesign (breaking changes — branch แยก)
> Layout และ visual ที่เปลี่ยนใหญ่ — ทำใน git branch แยก

- [x] **U8** — Live WPM Sparkline ✅ (wpmHistory ทุก 5s → SVG polyline ข้าง WPM card)
- [x] **U9** — Keyboard finger zone colors ✅ (fingerZoneColors map → inline style opacity 15% ทุก key ตามนิ้ว)
- [x] **U11** — Countdown ring timer ✅ (SVG CountdownRing แทน Timer icon ใน StatsDisplay เมื่อมี timeLimit)
- [x] **U13** — WPM History Chart ✅ (pure SVG polyline จาก stats.lastPlayed ใน 30 วัน → UserDashboard)
- [x] **E1** — Teacher full-width dashboard ✅ (sidebar → top dropdown selector + auto-select + quick stats strip + full-width tabs)
- [x] **Focus Mode** ✅ (PracticePage: aside fade opacity 0.08 + pointer-events none เมื่อ textarea focused; Esc เพื่อ unfocus)

### Sprint UX-4 — Advanced Features
> ใช้เวลา/effort มาก หรือ optional — ทำหลัง sprint หลักเสร็จ

- [x] **T9** — Clone classroom ข้ามเทอม ✅ (cloneClassroom ใน useClassroom — copy lessons only, ปุ่ม Copy ใน TeacherPage actions)
- [x] **T10** — Live exam oversight ✅ (onSnapshot ใน ExamList results modal — live status สด N/M ส่งแล้ว + progress bar + member list ✅/⬜)
- [x] **X5** — Classroom archive ✅ (isArchived ใน types + archiveClassroom/unarchiveClassroom ใน useClassroom + Archive button + ส่วน "ห้องที่เก็บถาวร" ใน TeacherPage)
- [x] **X6** — Leaderboard WPM รายห้อง ✅ (ปุ่ม "ดูกระดานอันดับ" + lesson selector + ranked list ใน StudentClassroomPage)
- [ ] **X3** — ลบ account ตัวเอง (PDPA — ต้องใช้ Cloud Function)

---

## หมายเหตุ

- ทุกรายการใช้ CSS vars ที่มีอยู่แล้ว — theme switch ทำงานได้ทันที
- Library ที่ต้อง install เพิ่มมีแค่: `sonner` (F2) และ `recharts` ถ้าเลือกใช้ใน U13
- **Sprint UX-0** ต้องเสร็จก่อน — W1, Y1, F1, F2, F3 เป็น dependency ของทุก sprint
- **Sprint UX-0b** ต้องเสร็จก่อน UX-1 — P2, P1, V2 ส่งผลต่อความน่าเชื่อถือของข้อมูลวิจัย
- **Z1** (session history) เป็น prerequisite ของ U2, U13, S4 — ต้องทำใน UX-0 ก่อน sprint ที่ใช้
- **SA1** (admin role) เป็น prerequisite ของ SA2, SA3, SA4, SA5, SA6, SA7
- **Sprint UX-3** เป็น breaking change ควรทำใน git branch แยก

---

*อัปเดตแผนนี้เมื่อทำแต่ละรายการเสร็จ — 2026-05-22*
