// src/utils/classroomUtils.ts

const JOIN_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ตัดตัวอักษรที่สับสนออก (O,0,1,I)

/**
 * สร้าง Join Code 6 ตัวอักษร UPPERCASE + ตัวเลข
 */
export const generateJoinCode = (): string => {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += JOIN_CODE_CHARS[Math.floor(Math.random() * JOIN_CODE_CHARS.length)];
    }
    return code;
};

/**
 * ตรวจสอบรูปแบบ Join Code (6 ตัว, ตัวพิมพ์ใหญ่/ตัวเลข)
 */
export const isJoinCodeValid = (code: string): boolean => {
    return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
};

/**
 * Normalize Join Code — แปลงเป็น UPPERCASE และตัดช่องว่าง
 */
export const normalizeJoinCode = (code: string): string => {
    return code.trim().toUpperCase();
};

/**
 * รายการระดับชั้น
 */
export const GRADE_LEVELS = ['ปวช.1', 'ปวช.2', 'ปวช.3', 'ปวส.1', 'ปวส.2'] as const;

/**
 * ภาคเรียน
 */
export const SEMESTERS = ['1', '2'] as const;

/**
 * สร้าง Academic Year ปัจจุบัน (พ.ศ.)
 */
export const getCurrentAcademicYear = (): string => {
    return (new Date().getFullYear() + 543).toString();
};

/**
 * รายการ Academic Year ย้อนหลัง 3 ปี + ปีปัจจุบัน + ปีหน้า
 */
export const getAcademicYearOptions = (): string[] => {
    const current = parseInt(getCurrentAcademicYear());
    return [current - 2, current - 1, current, current + 1].map(String);
};

/**
 * แปลงข้อมูลแถว CSV เป็น partial member profile
 * รองรับ column: name/ชื่อ, email/อีเมล, เลขที่/no/number/ลำดับ
 */
export const csvRowToMember = (
    row: Record<string, string>
): { displayName: string; email: string; studentNumber?: number } | null => {
    const nameKey = Object.keys(row).find(k =>
        ['name', 'ชื่อ', 'displayname', 'ชื่อ-นามสกุล'].includes(k.toLowerCase().trim())
    );
    const emailKey = Object.keys(row).find(k =>
        ['email', 'อีเมล', 'e-mail', 'gmail'].includes(k.toLowerCase().trim())
    );
    const numberKey = Object.keys(row).find(k =>
        ['เลขที่', 'no', 'number', 'ลำดับ', '#', 'num'].includes(k.toLowerCase().trim())
    );

    if (!nameKey || !emailKey) return null;

    const displayName = row[nameKey]?.trim();
    const email = row[emailKey]?.trim().toLowerCase();

    if (!displayName || !email || !email.includes('@')) return null;

    const studentNumber = numberKey ? (parseInt(row[numberKey]) || undefined) : undefined;
    return { displayName, email, ...(studentNumber !== undefined ? { studentNumber } : {}) };
};

/**
 * สรุปสถิติรวมของนักเรียนในห้อง (ใช้ใน MemberTable)
 */
export const calcMemberAvg = (stats: { wpm: number; accuracy: number; score10Point: number }[]) => {
    if (stats.length === 0) return { avgWpm: 0, avgAccuracy: 0, avgScore: 0 };
    const n = stats.length;
    return {
        avgWpm: Math.round(stats.reduce((s, x) => s + x.wpm, 0) / n),
        avgAccuracy: Math.round(stats.reduce((s, x) => s + x.accuracy, 0) / n),
        avgScore: Math.round((stats.reduce((s, x) => s + x.score10Point, 0) / n) * 10) / 10,
    };
};
