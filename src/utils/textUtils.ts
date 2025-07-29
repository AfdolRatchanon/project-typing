// src/utils/textUtils.ts

/**
 * @function segmentText
 * @description แบ่งข้อความยาวๆ ออกเป็นส่วนๆ (segments) เพื่อให้แสดงผลบนจอได้พอดี
 * @param {string} text - ข้อความต้นฉบับ
 * @param {number} maxCharsPerLine - จำนวนตัวอักษรสูงสุดต่อบรรทัด
 * @returns {string[]} - อาร์เรย์ของข้อความที่ถูกแบ่งแล้ว
 */
export const segmentText = (text: string, maxCharsPerLine: number = 70): string[] => {
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const words = normalizedText.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const potentialNewLine = currentLine ? (currentLine + ' ' + word) : word;
        if (potentialNewLine.length <= maxCharsPerLine) {
            currentLine = potentialNewLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        }
    }
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines;
};

/**
 * @function detectTextLanguage
 * @description ตรวจจับภาษาหลักของข้อความ (ไทยหรืออังกฤษ)
 * @param {string} text - ข้อความที่ต้องการตรวจจับ
 * @returns {'en' | 'th'} - 'th' ถ้าเป็นภาษาไทย, 'en' ถ้าเป็นภาษาอังกฤษ
 */
export const detectTextLanguage = (text: string): 'en' | 'th' => {
    let thaiCount = 0;
    let englishCount = 0;
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        if (charCode >= 0x0E00 && charCode <= 0x0E7F) thaiCount++;
        else if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) englishCount++;
    }
    return thaiCount >= englishCount ? 'th' : 'en';
};
