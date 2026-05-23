// src/components/shared/SkeletonCard.tsx
// F1 — Skeleton loading states

import React from 'react';

interface SkeletonLineProps {
    width?: string;
    height?: string;
    className?: string;
}

const SkeletonLine: React.FC<SkeletonLineProps> = ({
    width = 'w-full',
    height = 'h-4',
    className = '',
}) => (
    <div
        className={`${width} ${height} ${className} rounded-md animate-pulse`}
        style={{ background: 'color-mix(in srgb, var(--color-border) 80%, transparent)' }}
    />
);

interface SkeletonCardProps {
    lines?: number;       // จำนวนบรรทัด skeleton (default 3)
    showAvatar?: boolean; // แสดง avatar circle ด้านซ้าย
    className?: string;
}

/**
 * @component SkeletonCard
 * @description Placeholder แสดงขณะรอโหลดข้อมูล Firestore
 * ใช้เป็น fallback ของ React.lazy Suspense ด้วย
 *
 * @example
 * // Firestore loading state
 * if (loading) return <SkeletonCard lines={4} />;
 *
 * // Lazy loading fallback
 * <Suspense fallback={<SkeletonCard lines={5} />}>
 *   <HeavyPage />
 * </Suspense>
 */
const SkeletonCard: React.FC<SkeletonCardProps> = ({
    lines = 3,
    showAvatar = false,
    className = '',
}) => (
    <div
        className={`rounded-xl p-4 lg:p-6 w-full ${className}`}
        style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
        }}
    >
        {showAvatar ? (
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-full flex-shrink-0 animate-pulse"
                    style={{ background: 'color-mix(in srgb, var(--color-border) 80%, transparent)' }}
                />
                <div className="flex-1 space-y-2">
                    <SkeletonLine width="w-1/3" height="h-3.5" />
                    <SkeletonLine width="w-1/2" height="h-3" />
                </div>
            </div>
        ) : (
            <SkeletonLine width="w-2/5" height="h-5" className="mb-4" />
        )}
        <div className="space-y-2.5">
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonLine
                    key={i}
                    width={i === lines - 1 ? 'w-3/5' : 'w-full'}
                />
            ))}
        </div>
    </div>
);

/** Skeleton สำหรับ stats grid (ใช้ใน Teacher/Student pages) */
export const SkeletonStatsGrid: React.FC<{ cols?: number }> = ({ cols = 4 }) => (
    <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-3`}>
        {Array.from({ length: cols }).map((_, i) => (
            <div
                key={i}
                className="rounded-xl p-4 animate-pulse"
                style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                }}
            >
                <SkeletonLine width="w-1/2" height="h-7" className="mx-auto mb-2" />
                <SkeletonLine width="w-2/3" height="h-3" className="mx-auto" />
            </div>
        ))}
    </div>
);

/** Skeleton สำหรับ table rows */
export const SkeletonTableRows: React.FC<{ rows?: number; cols?: number }> = ({
    rows = 5,
    cols = 4,
}) => (
    <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={`grid grid-cols-${cols} gap-3 px-3 py-2`}>
                {Array.from({ length: cols }).map((_, j) => (
                    <SkeletonLine key={j} width="w-full" height="h-4" />
                ))}
            </div>
        ))}
    </div>
);

/** Full page loading skeleton — ใช้เป็น fallback ของ Suspense */
export const SkeletonPage: React.FC = () => (
    <div className="min-h-screen app-bg p-4 lg:p-8 space-y-4">
        <SkeletonCard lines={1} className="max-w-sm" />
        <SkeletonStatsGrid cols={4} />
        <SkeletonCard lines={6} />
    </div>
);

export default SkeletonCard;
