// src/utils/asyncUtils.ts
// Y2 — Utilities สำหรับ Firestore write safety

/**
 * @hook useSubmitGuard
 * @description Hook ป้องกัน double-submit / double-click บน Firestore writes
 * ใช้กับปุ่ม submit ทุกตัวที่ทำ Firestore write
 *
 * @example
 * const { submitting, guard } = useSubmitGuard();
 *
 * const handleSubmit = guard(async () => {
 *   await setDoc(ref, data);
 *   toast.success('บันทึกแล้ว');
 * });
 *
 * <button onClick={handleSubmit} disabled={submitting}>
 *   {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
 * </button>
 */
import { useState, useCallback, useRef } from 'react';

export function useSubmitGuard() {
    const [submitting, setSubmitting] = useState(false);
    const abortRef = useRef(false);

    const guard = useCallback(
        <T>(fn: () => Promise<T>) =>
            async (): Promise<T | undefined> => {
                if (submitting) return undefined;
                setSubmitting(true);
                abortRef.current = false;
                try {
                    return await fn();
                } finally {
                    if (!abortRef.current) {
                        setSubmitting(false);
                    }
                }
            },
        [submitting]
    );

    // cleanup สำหรับ unmount ก่อน resolve
    const cancel = useCallback(() => {
        abortRef.current = true;
        setSubmitting(false);
    }, []);

    return { submitting, guard, cancel };
}

/**
 * @function debounce
 * @description Debounce function สำหรับ search inputs / live updates
 * ไม่ใช้ใน critical write path (ใช้ useSubmitGuard แทน)
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * @function withRetry
 * @description Retry wrapper สำหรับ Firestore operations ที่อาจ fail จาก network
 * ใช้ exponential backoff — max 3 attempts
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    baseDelayMs = 500
): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            if (attempt < maxAttempts - 1) {
                await new Promise(r => setTimeout(r, baseDelayMs * 2 ** attempt));
            }
        }
    }
    throw lastError;
}
