// src/utils/timeUtils.ts

/**
 * @function formatTime
 * @description แปลงเวลา (วินาที) เป็นรูปแบบ MM:SS
 * @param {number} seconds - เวลาเป็นวินาที
 * @returns {string} - เวลาในรูปแบบ MM:SS
 */
export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * @function formatTimeWithColor
 * @description แปลงเวลาเป็นรูปแบบ MM:SS พร้อมกำหนดสีตามเวลาที่เหลือ
 * @param {number | null} seconds - เวลาเป็นวินาที หรือ null ถ้าไม่จำกัด
 * @param {boolean} isCountdown - true ถ้าเป็นโหมดนับถอยหลัง
 * @param {number | null} timeLimit - เวลาจำกัดทั้งหมด (ใช้สำหรับคำนวณสี)
 * @returns {{ time: string; color: string }} - ออบเจ็กต์ที่มีเวลาและคลาสสี
 */
export const formatTimeWithColor = (seconds: number | null, isCountdown: boolean = false, timeLimit: number | null = null): { time: string; color: string } => {
    if (seconds === null) return { time: '∞', color: 'text-blue-600' };

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    let colorClass = 'text-blue-600';
    if (isCountdown && timeLimit !== null) {
        const percentage = (seconds / timeLimit) * 100;
        if (percentage <= 10) colorClass = 'text-red-600 animate-pulse';
        else if (percentage <= 25) colorClass = 'text-orange-600';
        else if (percentage <= 50) colorClass = 'text-yellow-600';
    }

    return { time: timeString, color: colorClass };
};
