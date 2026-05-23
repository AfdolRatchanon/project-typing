// src/utils/clipboardUtils.ts
// G1 — Copy to clipboard utility พร้อม toast feedback

import { toast } from 'sonner';

/**
 * @function copyToClipboard
 * @description คัดลอกข้อความไปยัง clipboard พร้อมแสดง toast
 * ใช้กับ Join Code, Direct Join Link, หรือข้อความอื่น ๆ
 *
 * @example
 * // G1: Copy Join Code
 * await copyToClipboard(joinCode, 'คัดลอก Join Code แล้ว');
 *
 * // X4: Copy direct join link
 * const link = getJoinLink(joinCode);
 * await copyToClipboard(link, 'คัดลอกลิงก์แล้ว');
 */
export async function copyToClipboard(
    text: string,
    successMessage = 'คัดลอกแล้ว',
): Promise<boolean> {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // fallback สำหรับ http/old browsers
            const el = document.createElement('textarea');
            el.value = text;
            el.style.position = 'fixed';
            el.style.opacity = '0';
            document.body.appendChild(el);
            el.focus();
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        toast.success(successMessage);
        return true;
    } catch {
        toast.error('ไม่สามารถคัดลอกได้ กรุณาคัดลอกด้วยตนเอง');
        return false;
    }
}

/**
 * @function getJoinLink
 * @description X4: สร้าง URL สำหรับ direct join link แทนการใช้ join code 6 หลัก
 * นักเรียนกดลิงก์ → redirect ไปหน้า join อัตโนมัติ
 *
 * @example
 * const link = getJoinLink('ABC123');
 * // → "https://yourapp.com/join/ABC123"
 */
export function getJoinLink(joinCode: string): string {
    const base = window.location.origin;
    return `${base}/join/${joinCode}`;
}
