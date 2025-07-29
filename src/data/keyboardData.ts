// src/data/keyboardData.ts

import type { KeyDisplays, KeyToFingerMap, FingerNamesDisplay } from '../types/types';

/**
 * @constant keyboardRows
 * @description โครงสร้างแถวของคีย์บอร์ดแบบกายภาพ
 */
export const keyboardRows: string[][] = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'ShiftRight'],
    ['Control', 'Alt', 'Space', 'AltGr', 'ControlRight'],
];

/**
 * @constant keyDisplays
 * @description ออบเจ็กต์สำหรับจับคู่ key label กับตัวอักษรที่จะแสดงผล
 * สำหรับภาษาไทยและอังกฤษ ทั้งในสถานะปกติ (unshifted) และกด Shift (shifted)
 */
export const keyDisplays: KeyDisplays = {
    en: {
        unshifted: {
            '`': '`', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '0': '0', '-': '-', '=': '=',
            'q': 'q', 'w': 'w', 'e': 'e', 'r': 'r', 't': 't', 'y': 'y', 'u': 'u', 'i': 'i', 'o': 'o', 'p': 'p', '[': '[', ']': '}', '\\': '\\',
            'a': 'a', 's': 's', 'd': 'd', 'f': 'f', 'g': 'g', 'h': 'h', 'j': 'j', 'k': 'k', 'l': 'l', ';': ';', "'": "'",
            'z': 'z', 'x': 'x', 'c': 'c', 'v': 'v', 'b': 'b', 'n': 'n', 'm': 'm', ',': ',', '.': '.', '/': '/',
            'Space': ' ',
        },
        shifted: {
            '`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*', '9': '(', '0': ')', '-': '_', '=': '+',
            'q': 'Q', 'w': 'W', 'e': 'E', 'r': 'R', 't': 'T', 'y': 'Y', 'u': 'U', 'i': 'I', 'o': 'O', 'p': 'P', '[': '{', ']': '}', '\\': '|',
            'a': 'A', 's': 'S', 'd': 'D', 'f': 'F', 'g': 'G', 'h': 'H', 'j': 'J', 'k': 'K', 'l': 'L', ';': ':', "'": '"',
            'z': 'Z', 'x': 'X', 'c': 'C', 'v': 'V', 'b': 'B', 'n': 'N', 'm': 'M', ',': '<', '.': '>', '/': '?',
            'Space': ' ',
        }
    },
    th: {
        unshifted: {
            '`': '_', '1': 'ๅ', '2': '/', '3': '-', '4': 'ภ', '5': 'ถ', '6': 'ุ', '7': 'ึ', '8': 'ค', '9': 'ต', '0': 'จ', '-': 'ข', '=': 'ช',
            'q': 'ๆ', 'w': 'ไ', 'e': 'ำ', 'r': 'พ', 't': 'ะ', 'y': 'ั', 'u': 'ี', 'i': 'ร', 'o': 'น', 'p': 'ย', '[': 'บ', ']': 'ล', '\\': 'ฃ',
            'a': 'ฟ', 's': 'ห', 'd': 'ก', 'f': 'ด', 'g': 'เ', 'h': '้', 'j': '่', 'k': 'า', 'l': 'ส', ';': 'ว', "'": 'ง',
            'z': 'ผ', 'x': 'ป', 'c': 'แ', 'v': 'อ', 'b': 'ิ', 'n': 'ื', 'm': 'ท', ',': 'ม', '.': 'ใ', '/': 'ฝ',
            'Space': ' ',
        },
        shifted: {
            '`': '+', '1': '%', '2': '๑', '3': '๒', '4': '๓', '5': '๔', '6': 'ู', '7': '฿', '8': '๕', '9': '๖', '0': '๗', '-': '๘', '=': '๙',
            'q': '๐', 'w': '"', 'e': 'ฎ', 'r': 'ฑ', 't': 'ธ', 'y': 'ํ', 'u': '๊', 'i': 'ณ', 'o': 'ฯ', 'p': 'ญ', '[': 'ฐ', ']': ',', '\\': 'ฅ',
            'a': 'ฤ', 's': 'ฆ', 'd': 'ฏ', 'f': 'โ', 'g': 'ฌ', 'h': '็', 'j': '๋', 'k': 'ษ', 'l': 'ศ', ';': 'ซ', "'": '.',
            'z': '(', 'x': ')', 'c': 'ฉ', 'v': 'ฮ', 'b': 'ฺ', 'n': '์', 'm': '?', ',': 'ฒ', '.': 'ฬ', '/': 'ฦ',
            'Space': ' ',
        }
    }
};

/**
 * @constant keyToFingerMap
 * @description ออบเจ็กต์สำหรับจับคู่ key label กับนิ้วที่ควรใช้ในการพิมพ์
 */
export const keyToFingerMap: KeyToFingerMap = {
    '`': 'leftPinky', '1': 'leftPinky', 'q': 'leftPinky', 'a': 'leftPinky', 'z': 'leftPinky', 'Tab': 'leftPinky', 'CapsLock': 'leftPinky', 'Shift': 'leftPinky', 'Control': 'leftPinky',
    '2': 'leftRing', 'w': 'leftRing', 's': 'leftRing', 'x': 'leftRing',
    '3': 'leftMiddle', 'e': 'leftMiddle', 'd': 'leftMiddle', 'c': 'leftMiddle',
    '4': 'leftIndex', 'r': 'leftIndex', 'f': 'leftIndex', 'v': 'leftIndex',
    '5': 'leftIndex', 't': 'leftIndex', 'g': 'leftIndex', 'b': 'leftIndex',
    '6': 'rightIndex', 'y': 'rightIndex', 'h': 'rightIndex', 'n': 'rightIndex',
    '7': 'rightIndex', 'u': 'rightIndex', 'j': 'rightIndex', 'm': 'rightIndex',
    '8': 'rightMiddle', 'i': 'rightMiddle', 'k': 'rightMiddle', ',': 'rightMiddle',
    '9': 'rightRing', 'o': 'rightRing', 'l': 'rightRing', '.': 'rightRing',
    '0': 'rightPinky', '-': 'rightPinky', '=': 'rightPinky', 'p': 'rightPinky', '[': 'rightPinky', ']': 'rightPinky', '\\': 'rightPinky', ';': 'rightPinky', "'": 'rightPinky', '/': 'rightPinky', 'Backspace': 'rightPinky', 'Enter': 'rightPinky', 'ShiftRight': 'rightPinky', 'ControlRight': 'rightPinky',
    'Space': 'thumb',
    'Alt': 'leftThumb',
    'AltGr': 'rightThumb',
};

/**
 * @constant fingerNamesDisplay
 * @description ออบเจ็กต์สำหรับแสดงชื่อนิ้วเป็นภาษาไทย
 */
export const fingerNamesDisplay: FingerNamesDisplay = {
    leftPinky: 'นิ้วก้อยซ้าย',
    leftRing: 'นิ้วนางซ้าย',
    leftMiddle: 'นิ้วกลางซ้าย',
    leftIndex: 'นิ้วชี้ซ้าย',
    leftThumb: 'นิ้วโป้งซ้าย',
    rightIndex: 'นิ้วชี้ขวา',
    rightMiddle: 'นิ้วกลางขวา',
    rightRing: 'นิ้วนางขวา',
    rightPinky: 'นิ้วก้อยขวา',
    rightThumb: 'นิ้วโป้งขวา',
    thumb: 'นิ้วโป้ง (ซ้าย/ขวา)',
};
