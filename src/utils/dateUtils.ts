// src/utils/dateUtils.ts
// X1 — Thai date format พ.ศ. utility

/**
 * แปลงค่า timestamp → วันที่ภาษาไทยพร้อม พ.ศ.
 *
 * @param value - timestamp (ms), Date object, หรือ Firestore Timestamp
 * @param options - ตัวเลือกการแสดงผล
 * @returns string เช่น "22 พ.ค. 2569" หรือ "22 พ.ค. 2569 เวลา 19:30 น."
 *
 * @example
 * toThaiDate(Date.now())              // "22 พ.ค. 2569"
 * toThaiDate(ts, { time: true })      // "22 พ.ค. 2569 เวลา 19:30 น."
 * toThaiDate(ts, { short: true })     // "22/05/2569"
 * toThaiDate(ts, { relative: true })  // "2 วันที่แล้ว"
 */
export function toThaiDate(
    value: number | Date | { toDate: () => Date } | null | undefined,
    options: {
        time?: boolean;    // แสดงเวลา HH:MM ด้วย
        short?: boolean;   // แสดงแบบ DD/MM/YYYY
        relative?: boolean; // แสดงแบบ relative เช่น "2 วันที่แล้ว"
    } = {}
): string {
    if (value == null) return '—';

    let date: Date;
    if (value instanceof Date) {
        date = value;
    } else if (typeof value === 'object' && 'toDate' in value) {
        // Firestore Timestamp
        date = value.toDate();
    } else {
        date = new Date(value as number);
    }

    if (isNaN(date.getTime())) return '—';

    // แปลงปี พ.ศ. = ค.ศ. + 543
    const buddhistYear = date.getFullYear() + 543;

    if (options.relative) {
        return toRelativeThai(date);
    }

    if (options.short) {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        return `${d}/${m}/${buddhistYear}`;
    }

    const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ];

    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    let result = `${day} ${month} ${buddhistYear}`;

    if (options.time) {
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        result += ` เวลา ${hh}:${mm} น.`;
    }

    return result;
}

/**
 * แปลงเป็น relative time ภาษาไทย
 */
function toRelativeThai(date: Date): string {
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr  = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60)  return 'เมื่อกี้';
    if (diffMin < 60)  return `${diffMin} นาทีที่แล้ว`;
    if (diffHr < 24)   return `${diffHr} ชั่วโมงที่แล้ว`;
    if (diffDay < 7)   return `${diffDay} วันที่แล้ว`;
    if (diffDay < 30)  return `${Math.floor(diffDay / 7)} สัปดาห์ที่แล้ว`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)} เดือนที่แล้ว`;
    return `${Math.floor(diffDay / 365)} ปีที่แล้ว`;
}

/**
 * แปลง timestamp → string สำหรับ datetime-local input
 */
export function toDatetimeLocalString(value: number | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    // Format: YYYY-MM-DDTHH:MM (required by datetime-local input)
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

/**
 * แปลง datetime-local string → ms timestamp
 */
export function fromDatetimeLocalString(value: string): number | null {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.getTime();
}
