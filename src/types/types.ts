// ============================================================
// Role System
// ============================================================

export type UserRole = 'student' | 'teacher' | 'superAdmin';

export interface UserProfile {
  uid: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string | null;
  originalPhotoURL?: string | null;
  role: UserRole;
  studentId?: string;
  classroomIds?: string[];
  isProfileComplete: boolean;
  createdAt: number;
  lastPhotoUpdate?: number;
}

// ============================================================
// Lesson Structure
// ============================================================

export interface Level {
  id: string;
  name: string;
  text: string;
  timeLimit?: number; // เวลาจำกัดเป็นวินาที (ถ้าไม่กำหนดจะเป็น infinity)
}

export interface Session {
  id: string;
  name: string;
  levels: Level[];
}

export interface Unit {
  id: string;
  name: string;
  sessions: Session[];
}

export interface Language {
  id: string;
  name: string;
  units: Unit[];
}

// ============================================================
// Scoring
// ============================================================

export interface ScoringCriteria {
  minWPM: number;
  maxErrors: number;
  minAccuracy?: number;
  grade?: string;
  score10Point: number;
}

export interface LevelScoring {
  [levelId: string]: ScoringCriteria[];
}

// ============================================================
// Stats
// ============================================================

export interface LevelStats {
  wpm: number;
  accuracy: number;
  totalErrors: number;
  grade: string;
  score10Point: number;
  lastPlayed: number;
  playCount: number;
}

// ============================================================
// Keyboard
// ============================================================

export interface KeyDisplayLayout {
  [key: string]: string;
}

export interface KeyDisplays {
  en: {
    unshifted: KeyDisplayLayout;
    shifted: KeyDisplayLayout;
  };
  th: {
    unshifted: KeyDisplayLayout;
    shifted: KeyDisplayLayout;
  };
}

export interface KeyToFingerMap {
  [key: string]: string;
}

export interface FingerNamesDisplay {
  [key: string]: string;
}

// ============================================================
// Classroom System
// ============================================================

export type GradeLevel = 'ปวช.1' | 'ปวช.2' | 'ปวช.3' | 'ปวส.1' | 'ปวส.2';
export type Semester = '1' | '2';

export interface Classroom {
  classroomId: string;
  name: string;
  subject: string;
  gradeLevel: GradeLevel;
  semester: Semester;
  academicYear: string; // e.g. "2568"
  joinCode: string;     // 6-char UPPERCASE alphanumeric
  teacherUid: string;
  createdAt: number;
  isActive: boolean;
}

export interface ClassroomMember {
  uid: string;
  displayName: string;
  email: string;
  joinedAt: number;
  role: 'student' | 'teacher';
  studentNumber?: number; // เลขที่นักเรียนในห้อง
}

export interface CustomLesson {
  lessonId: string;
  title: string;
  text: string;
  timeLimit: number | null;
  requiredPlayCount?: number | null; // จำนวนครั้งขั้นต่ำที่ต้องฝึก (null = ไม่บังคับ)
  classroomId: string;
  createdBy: string; // teacherUid
  createdAt: number;
}

export interface ClassroomLevelStats {
  wpm: number;
  accuracy: number;
  totalErrors: number;
  grade: string;
  score10Point: number;
  lastPlayed: number;
  playCount: number;
  classroomId: string;
  lessonId: string;
}

// ============================================================
// Pre-test / Post-test System
// ============================================================

export type TestType = 'pre' | 'post';
export type SetAssignmentMethod = 'by-student-number' | 'random';

export interface ExamSet {
  setNumber: 1 | 2 | 3 | 4 | 5;
  text: string;
  label?: string;
}

export interface PrePostTest {
  testId: string;
  classroomId: string;
  title: string;
  type: TestType;
  pairId: string | null;
  examSets: ExamSet[];
  setAssignmentMethod: SetAssignmentMethod;
  timeLimit: number;       // วินาที (บังคับ)
  passingScore: number;    // คะแนนขั้นต่ำ 0–10
  passingWPM: number;      // WPM ขั้นต่ำ (0 = ไม่บังคับ)
  createdBy: string;
  createdAt: number;
  isOpen: boolean;
  openAt: number | null;
  closeAt: number | null;
  allowRetake: boolean;
  isResultPublished: boolean;
}

export interface PrePostTestResult {
  uid: string;
  wpm: number;
  accuracy: number;
  totalErrors: number;
  score10Point: number;
  grade: string;
  assignedSet: number;         // ชุดที่ได้รับ (1–5)
  timeUsed: number;            // วินาทีที่ใช้
  startedAt: number;
  submittedAt: number;
  attemptCount: number;
  isPassed: boolean;
  fullscreenExitCount: number;
}

export interface PrePostComparison {
  uid: string;
  studentNumber: number;
  displayName: string;
  preResult: PrePostTestResult | null;
  postResult: PrePostTestResult | null;
  wpmGain: number;
  accuracyGain: number;
  scoreGain: number;
  isPassed: boolean;
}

// ============================================================
// Survey System (Phase R)
// ============================================================

export type SurveyDimension = 'content' | 'design' | 'benefit';

export interface SurveyQuestion {
  questionId: string;
  dimension: SurveyDimension;
  text: string;
  order: number;
}

export interface Survey {
  surveyId: string;
  classroomId: string;
  title: string;
  linkedPostTestId: string | null;
  questions: SurveyQuestion[];
  createdBy: string;
  createdAt: number;
  isOpen: boolean;
  isAnonymous: boolean;
}

export interface SurveyResponse {
  uid: string;
  studentNumber: number;
  displayName: string;
  submittedAt: number;
  answers: Record<string, number>; // questionId → 1–5
}

export interface SurveySummary {
  totalResponses: number;
  dimensionMeans: Record<SurveyDimension, number>;
  overallMean: number;
  questionMeans: Record<string, number>; // questionId → mean
}

// ============================================================
// Exam System (Phase 4)
// ============================================================

export type ScorePolicy = 'best' | 'last' | 'average';

export interface Exam {
  examId: string;
  classroomId: string;
  title: string;
  examSets: ExamSet[];
  setAssignmentMethod: SetAssignmentMethod;
  timeLimit: number;
  passingScore: number;
  passingWPM: number;
  scorePolicy: ScorePolicy;
  createdBy: string;
  createdAt: number;
  isOpen: boolean;
  openAt: number | null;
  closeAt: number | null;
  allowRetake: boolean;
  maxRetake: number;           // 0 = unlimited
  isResultPublished: boolean;
}

export interface ExamResult {
  uid: string;
  wpm: number;
  accuracy: number;
  totalErrors: number;
  score10Point: number;
  grade: string;
  assignedSet: number;
  timeUsed: number;
  startedAt: number;
  submittedAt: number;
  attemptCount: number;
  isPassed: boolean;
  fullscreenExitCount: number;
}

// ============================================================
// Research Export (Phase R)
// ============================================================

export interface ResearchExportRow {
  studentNumber: number;
  displayName: string;
  // E1 / E2
  e1Score: number | null;    // avg classroomStats score10Point × 10 = percent
  e2Score: number | null;    // post-test score10Point × 10 = percent
  e1Passed: boolean | null;  // e1Score >= 80
  e2Passed: boolean | null;  // e2Score >= 80
  // Pre / Post
  preWpm: number | null;
  postWpm: number | null;
  preScore10: number | null;
  postScore10: number | null;
  preAssignedSet: number | null;
  postAssignedSet: number | null;
  // Survey
  surveyContentMean: number | null;
  surveyDesignMean: number | null;
  surveyBenefitMean: number | null;
  surveyOverallMean: number | null;
}
