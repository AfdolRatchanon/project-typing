// src/components/LevelScoringCriteria.tsx

import React from 'react';
// import type { ScoringCriteria } from '../../types/types';
import { scoringCriteria as allScoringCriteria } from '../../data/data';
import { getDefaultCriteria } from '../../utils/scoreUtils';

interface LevelScoringCriteriaProps {
    currentLevelId: string;
    timeLimit: number | null;
    currentLevelName: string | null;
}

/**
 * @component LevelScoringCriteria
 * @description Displays the scoring criteria table for the current level.
 * @param {LevelScoringCriteriaProps} props - Props for LevelScoringCriteria component.
 */
const LevelScoringCriteria: React.FC<LevelScoringCriteriaProps> = ({
    currentLevelId,
    timeLimit,
    currentLevelName,
}) => {
    const criteria = allScoringCriteria[currentLevelId] || getDefaultCriteria(currentLevelId);

    const showWPM = criteria.some(c => c.minWPM > 0);
    const showMaxErrors = criteria.some(c => c.maxErrors !== undefined && c.maxErrors > 0);
    const showAccuracy = criteria.some(c => c.minAccuracy !== undefined && c.minAccuracy > 0);
    const showGrade = criteria.some(c => c.grade && c.grade.trim() !== '');
    const showScore = true; // Always show score

    return (
        <div className="mt-4 lg:mt-6 p-4 lg:p-6 rounded-lg"
            style={{ background: 'var(--color-primary-light)', border: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)' }}>
            <h2 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 text-center" style={{ color: 'var(--color-text)' }}>
                เกณฑ์การให้คะแนนสำหรับ "{currentLevelName || 'กำลังโหลด...'}"
                {timeLimit && (
                    <div className="text-sm font-medium mt-1" style={{ color: 'var(--color-primary)' }}>
                        ⏱️ เวลาที่กำหนด: {Math.floor(timeLimit / 60)} นาที {timeLimit % 60 !== 0 ? `${timeLimit % 60} วินาที` : ''}
                    </div>
                )}
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full rounded-lg shadow-sm" style={{ background: 'var(--color-surface)' }}>
                    <thead>
                        <tr className="uppercase text-xs lg:text-sm leading-normal"
                            style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-text)' }}>
                            {showWPM && <th className="py-2 px-3 lg:py-3 lg:px-6 text-left rounded-tl-lg">WPM ขั้นต่ำ</th>}
                            {showMaxErrors && <th className="py-2 px-3 lg:py-3 lg:px-6 text-left">ข้อผิดพลาดสูงสุด</th>}
                            {showAccuracy && <th className="py-2 px-3 lg:py-3 lg:px-6 text-left">ความแม่นยำขั้นต่ำ (%)</th>}
                            {showGrade && <th className="py-2 px-3 lg:py-3 lg:px-6 text-left">เกรด</th>}
                            {showScore && <th className="py-2 px-3 lg:py-3 lg:px-6 text-left rounded-tr-lg">คะแนน</th>}
                        </tr>
                    </thead>
                    <tbody className="text-xs lg:text-sm font-light" style={{ color: 'var(--color-text-muted)' }}>
                        {criteria.map((c, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid var(--color-border)' }}
                                className="transition-colors hover:brightness-95"
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
                                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                                {showWPM && <td className="py-2 px-3 lg:py-3 lg:px-6 text-left font-bold" style={{ color: 'var(--color-error)' }}>{c.minWPM}</td>}
                                {showMaxErrors && <td className="py-2 px-3 lg:py-3 lg:px-6 text-left font-bold" style={{ color: 'var(--color-error)' }}>{c.maxErrors}</td>}
                                {showAccuracy && <td className="py-2 px-3 lg:py-3 lg:px-6 text-left">{c.minAccuracy || '-'}</td>}
                                {showGrade && <td className="py-2 px-3 lg:py-3 lg:px-6 text-left whitespace-nowrap font-medium" style={{ color: 'var(--color-text)' }}>{c.grade || '-'}</td>}
                                {showScore && <td className="py-2 px-3 lg:py-3 lg:px-6 text-left font-bold" style={{ color: 'var(--color-accent)' }}>{c.score10Point}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!allScoringCriteria[currentLevelId] && (
                    <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-text-muted)' }}>
                        * ใช้เกณฑ์การให้คะแนนพื้นฐาน {timeLimit ? '(มีเวลาจำกัด)' : '(ไม่จำกัดเวลา)'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LevelScoringCriteria;
