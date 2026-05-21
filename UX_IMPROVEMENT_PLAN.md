# แผนพัฒนา UX/UI (UX Improvement Plan)

> สร้าง: 2026-05-21 | อัปเดต: 2026-05-21  
> สถานะ: วางแผนแล้ว — ยังไม่เริ่ม implement

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

### Sprint UX-1 — Quick Wins (effort น้อย impact มาก)
- [ ] **U1** — Wrong char highlight แทน line-through
- [ ] **U2** — เปรียบเทียบ WPM กับครั้งก่อน + Personal Best
- [ ] **U3** — Progress bar full-width เหนือ textarea
- [ ] **U4** — ปุ่ม "ถัดไป" / "ลองอีกครั้ง" หลังจบ
- [ ] **U15** — Smooth number transitions
- [ ] **A1** — Empty state actionable
- [ ] **A2** — First-join onboarding card
- [ ] **B1** — Cursor & extra-char feedback
- [ ] **D1** — Notification badge บน nav
- [ ] **E2** — Teacher pinned quick action bar

### Sprint UX-2 — Interaction Polish
- [ ] **U5** — Shake animation เมื่อพิมพ์ผิด
- [ ] **U6** — Pre-exam briefing card
- [ ] **U7** — Lesson card states แยกชัดเจน
- [ ] **U10** — Unified Action Hub (pending items)
- [ ] **U14** — Font size control
- [ ] **B2** — Live stats smoothing
- [ ] **B3** — Red border flash
- [ ] **C1** — Enhanced result card (top errors)
- [ ] **U12** — Quick stats header ในห้องครู

### Sprint UX-3 — Visual Depth & Redesign
- [ ] **E1** — Teacher full-width dashboard layout (restructure ใหญ่)
- [ ] **U8** — Live WPM Sparkline
- [ ] **U9** — Keyboard finger zone colors
- [ ] **U11** — Countdown ring timer
- [ ] **U13** — WPM History Chart (Dashboard)
- [ ] Theme system redesign (Light default + OS auto-detect + accent color picker)
- [ ] Focus Mode implementation (fade UI เมื่อ focus ช่องพิมพ์)

---

## หมายเหตุ

- ทุกรายการใช้ CSS vars ที่มีอยู่แล้ว (`--color-primary`, `--color-accent` ฯลฯ) — theme switch ทำงานได้ทันที
- ไม่ต้องติดตั้ง library เพิ่ม ยกเว้น U13 (recharts) ถ้าเลือกใช้
- Sprint UX-1 ทำใน session เดียวได้เกือบทั้งหมด
- Sprint UX-3 (E1 + Theme + Focus Mode) เป็น breaking change — ควรทำใน branch แยก

---

*อัปเดตแผนนี้เมื่อทำแต่ละรายการเสร็จ — 2026-05-21*
