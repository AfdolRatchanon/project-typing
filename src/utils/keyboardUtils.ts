// src/utils/keyboardUtils.ts

// import type { KeyDisplayLayout, KeyDisplays } from '../types/types';
import { keyDisplays } from '../data/keyboardData';

/**
 * @function getCharToKeyLabelMap
 * @description สร้าง Map แบบย้อนกลับ เพื่อค้นหา key label จากตัวอักษร (ใช้สำหรับไฮไลท์ปุ่ม)
 * @param {'en' | 'th'} lang - ภาษาที่ต้องการ
 * @param {boolean} shifted - สถานะการกด Shift
 * @returns {{ [char: string]: string }} - ออบเจ็กต์ที่ map ตัวอักษรไปยัง key label
 */
export const getCharToKeyLabelMap = (lang: 'en' | 'th', shifted: boolean): { [char: string]: string } => {
    const map: { [char: string]: string } = {};
    const currentLayout = keyDisplays[lang][shifted ? 'shifted' : 'unshifted'];
    for (const keyLabel in currentLayout) {
        const char = currentLayout[keyLabel as keyof typeof currentLayout];
        map[char] = keyLabel;
    }
    return map;
};

/**
 * @function getRecommendedShiftKey
 * @description กำหนดว่าควรใช้ปุ่ม Shift ซ้ายหรือขวา โดยอิงจากตำแหน่งของปุ่มหลัก
 * @param {string} baseKey - Key label ของปุ่มที่ต้องการกด
 * @returns {'Shift' | 'ShiftRight'} - Key label ของปุ่ม Shift ที่แนะนำ
 */
export const getRecommendedShiftKey = (baseKey: string): 'Shift' | 'ShiftRight' => {
    const leftSideKeys = ['`', '1', '2', '3', '4', '5', 'Tab', 'q', 'w', 'e', 'r', 't', 'CapsLock', 'a', 's', 'd', 'f', 'g', 'Shift', 'z', 'x', 'c', 'v', 'b'];
    const rightSideKeys = ['6', '7', '8', '9', '0', '-', '=', 'Backspace', 'y', 'u', 'i', 'o', 'p', '[', '{', ']', '}', '\\', '|', 'h', 'j', 'k', 'l', ';', "'", 'Enter', 'n', 'm', ',', '.', '/', 'ShiftRight'];

    if (leftSideKeys.includes(baseKey)) {
        return 'ShiftRight'; // ปุ่มฝั่งซ้ายใช้นิ้วก้อยขวากด Shift
    } else if (rightSideKeys.includes(baseKey)) {
        return 'Shift'; // ปุ่มฝั่งขวาใช้นิ้วก้อยซ้ายกด Shift
    } else {
        return 'Shift'; // ค่าเริ่มต้น
    }
};
