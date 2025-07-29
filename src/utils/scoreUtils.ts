// src/utils/scoreUtils.ts

import type { ScoringCriteria } from '../types/types';
// import type { Language } from '../types/types';
import { languages, scoringCriteria } from '../data/data';

/**
 * @function calculateWPM
 * @description คำนวณความเร็วในการพิมพ์ (Words Per Minute)
 * สำหรับภาษาไทยใช้ NWAM (Net Words a Minute) = (จำนวนดีดทั้งหมด/4 - จำนวนคำผิด*10) / เวลา(นาที)
 * สำหรับภาษาอังกฤษใช้วิธีเดิม = ตัวอักษรถูกต้อง/5 / เวลา(นาที)
 * @param {number} correctChars - จำนวนตัวอักษรที่พิมพ์ถูกต้อง
 * @param {number} totalTypedCharsCount - จำนวนตัวอักษรทั้งหมดที่พิมพ์ (รวมผิด)
 * @param {number} actualErrors - จำนวนข้อผิดพลาดจริง
 * @param {number} timeInSeconds - เวลาที่ใช้ในการพิมพ์ (วินาที)
 * @param {'th' | 'en'} language - ภาษาที่กำลังพิมพ์
 * @returns {number} - WPM ที่คำนวณได้
 */
export const calculateWPM = (correctChars: number, totalTypedCharsCount: number, actualErrors: number, timeInSeconds: number, language: 'th' | 'en' = 'th'): number => {
    if (timeInSeconds === 0) return 0;
    const minutes = timeInSeconds / 60;

    if (language === 'th') {
        // NWAM สำหรับภาษาไทย - ใช้จำนวนที่พิมพ์ได้จริงเป็นฐาน
        const totalWords = totalTypedCharsCount / 4; // จำนวนดีดที่พิมพ์ได้จริงหารด้วย 4
        const errorPenalty = actualErrors * 10; // จำนวนข้อผิดจริง (พิมพ์ผิด) คูณ 10
        const netWords = Math.max(0, totalWords - errorPenalty); // ป้องกันค่าติดลบ
        return Math.round(netWords / minutes);
    } else {
        // วิธีเดิมสำหรับภาษาอังกฤษ
        const words = correctChars / 5;
        return Math.round(words / minutes);
    }
};

/**
 * @function calculateAccuracy
 * @description คำนวณความแม่นยำในการพิมพ์
 * @param {number} correctChars - จำนวนตัวอักษรที่พิมพ์ถูกต้อง
 * @param {number} totalChars - จำนวนตัวอักษรทั้งหมดที่พิมพ์ (รวมผิด)
 * @returns {number} - ความแม่นยำเป็นเปอร์เซ็นต์
 */
export const calculateAccuracy = (correctChars: number, totalChars: number): number => {
    if (totalChars === 0) return 0;
    return Math.round((correctChars / totalChars) * 100);
};

/**
 * @function getDefaultCriteria
 * @description สร้างเกณฑ์การให้คะแนนพื้นฐานตามประเภทของด่าน (มีเวลาจำกัด/ไม่มีเวลาจำกัด)
 * @param {string} currentLevelId - ID ของด่านปัจจุบัน
 * @returns {ScoringCriteria[]} - อาร์เรย์ของเกณฑ์การให้คะแนน
 */
export const getDefaultCriteria = (currentLevelId: string): ScoringCriteria[] => {
    let currentLevelTimeLimit: number | null = null;
    for (const language of languages) {
        for (const unit of language.units) {
            for (const session of unit.sessions) {
                const selectedLevel = session.levels.find(level => level.id === currentLevelId);
                if (selectedLevel) {
                    currentLevelTimeLimit = selectedLevel.timeLimit || null;
                    break;
                }
            }
        }
    }

    // ถ้าไม่มีเวลาจำกัด ใช้เกณฑ์ตามจำนวนข้อผิดพลาด
    if (!currentLevelTimeLimit) {
        return [
            { minWPM: 0, maxErrors: 0, score10Point: 10, grade: 'ดีเยี่ยม' },
            { minWPM: 0, maxErrors: 1, score10Point: 9, grade: 'ดีมาก' },
            { minWPM: 0, maxErrors: 2, score10Point: 8, grade: 'ดี' },
            { minWPM: 0, maxErrors: 3, score10Point: 7, grade: 'พอใช้' },
            { minWPM: 0, maxErrors: 4, score10Point: 6, grade: 'ต้องฝึกเพิ่ม' },
            { minWPM: 0, maxErrors: 5, score10Point: 5, grade: 'ต้องฝึกเพิ่ม' },
            { minWPM: 0, maxErrors: 6, score10Point: 4, grade: 'ต้องฝึกเพิ่ม' },
            { minWPM: 0, maxErrors: 7, score10Point: 3, grade: 'ต้องฝึกเพิ่ม' },
            { minWPM: 0, maxErrors: 8, score10Point: 2, grade: 'ต้องฝึกเพิ่ม' },
            { minWPM: 0, maxErrors: 9, score10Point: 1, grade: 'ต้องฝึกเพิ่ม' },
            { minWPM: 0, maxErrors: 10, score10Point: 0, grade: 'ไม่ผ่าน' },
        ];
    }

    // ถ้ามีเวลาจำกัด ใช้เกณฑ์ตาม WPM
    return [
        { minWPM: 20, maxErrors: 0, score10Point: 10, grade: 'ดีเยี่ยม' },
        { minWPM: 18, maxErrors: 0, score10Point: 9, grade: 'ดีมาก' },
        { minWPM: 16, maxErrors: 0, score10Point: 8, grade: 'ดี' },
        { minWPM: 14, maxErrors: 0, score10Point: 7, grade: 'พอใช้' },
        { minWPM: 12, maxErrors: 0, score10Point: 6, grade: 'ต้องฝึกเพิ่ม' },
        { minWPM: 10, maxErrors: 0, score10Point: 5, grade: 'ต้องฝึกเพิ่ม' },
        { minWPM: 8, maxErrors: 0, score10Point: 4, grade: 'ต้องฝึกเพิ่ม' },
        { minWPM: 6, maxErrors: 0, score10Point: 3, grade: 'ต้องฝึกเพิ่ม' },
        { minWPM: 4, maxErrors: 0, score10Point: 2, grade: 'ต้องฝึกเพิ่ม' },
        { minWPM: 2, maxErrors: 0, score10Point: 1, grade: 'ต้องฝึกเพิ่ม' },
        { minWPM: 0, maxErrors: 0, score10Point: 0, grade: 'ไม่ผ่าน' },
    ];
};

/**
 * @function getGrade
 * @description คำนวณเกรดที่ได้ตามเกณฑ์ของด่านปัจจุบัน (รองรับ optional fields และเกณฑ์พื้นฐาน)
 * @param {number} currentWPM - WPM ที่คำนวณได้
 * @param {number} currentAccuracy - ความแม่นยำที่คำนวณได้
 * @param {number} currentTotalErrors - จำนวนข้อผิดพลาดที่คำนวณได้
 * @param {string} levelId - ID ของด่านปัจจุบัน
 * @returns {string} - เกรดที่ได้
 */
export const getGrade = (currentWPM: number, currentAccuracy: number, currentTotalErrors: number, levelId: string): string => {
    const currentLevelCriteria = scoringCriteria[levelId] || getDefaultCriteria(levelId);

    for (const criteria of currentLevelCriteria) {
        const wpmPassed = currentWPM >= criteria.minWPM;
        const errorsPassed = currentTotalErrors <= criteria.maxErrors;
        const accuracyPassed = criteria.minAccuracy === undefined || currentAccuracy >= criteria.minAccuracy;

        if (wpmPassed && errorsPassed && accuracyPassed) {
            return criteria.grade || `${criteria.score10Point} คะแนน`;
        }
    }
    return 'ต้องฝึกเพิ่ม';
};

/**
 * @function getScore10Point
 * @description คำนวณคะแนน 10 คะแนนตาม WPM ที่ได้ (รองรับ optional fields และเกณฑ์พื้นฐาน)
 * @param {number} currentWPM - WPM ที่คำนวณได้
 * @param {number} currentAccuracy - ความแม่นยำที่คำนวณได้
 * @param {number} currentTotalErrors - จำนวนข้อผิดพลาดที่คำนวณได้
 * @param {string} levelId - ID ของด่านปัจจุบัน
 * @returns {number} - คะแนน 10 คะแนนที่ได้
 */
export const getScore10Point = (currentWPM: number, currentAccuracy: number, currentTotalErrors: number, levelId: string): number => {
    const currentLevelCriteria = scoringCriteria[levelId] || getDefaultCriteria(levelId);

    // หาเกณฑ์ที่ตรงกับผลการพิมพ์
    for (const criteria of currentLevelCriteria) {
        const wpmPassed = currentWPM >= criteria.minWPM;
        const errorsPassed = currentTotalErrors <= criteria.maxErrors;
        const accuracyPassed = criteria.minAccuracy === undefined || currentAccuracy >= criteria.minAccuracy;

        if (wpmPassed && errorsPassed && accuracyPassed) {
            return criteria.score10Point;
        }
    }
    return 0; // ถ้าไม่เข้าเกณฑ์ใดเลย
};
