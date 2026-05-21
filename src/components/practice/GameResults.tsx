// src/components/GameResults.tsx

import React from 'react';
import { formatTime } from '../../utils/timeUtils';
import { getGrade, getScore10Point } from '../../utils/scoreUtils';
import type { LevelStats } from '../../types/types';

interface GameResultsProps {
    isFinished: boolean;
    isTimeUp: boolean;
    timer: number;
    wpm: number;
    accuracy: number;
    totalErrors: number;
    totalCorrectChars: number;
    totalTypedChars: number;
    fullTextContentLength: number;
    currentLevelId: string;
    user: any; // Firebase User object
    latestUserStats: LevelStats | null;
}

/**
 * @component GameResults
 * @description Displays the game results after a session is finished.
 * Includes WPM, accuracy, errors, grade, and score.
 * Also shows latest user stats for the current level if available.
 * @param {GameResultsProps} props - Props for GameResults component.
 */
const GameResults: React.FC<GameResultsProps> = ({
    isFinished,
    isTimeUp,
    timer,
    wpm,
    accuracy,
    totalErrors,
    totalCorrectChars,
    totalTypedChars,
    fullTextContentLength,
    currentLevelId,
    user,
    latestUserStats,
}) => {
    if (!isFinished) {
        return null;
    }

    return (
        <>
            <div className="mt-4 lg:mt-6 p-4 lg:p-6 rounded-lg"
            style={{
                background: isTimeUp
                    ? 'color-mix(in srgb, var(--color-warning) 10%, var(--color-surface))'
                    : 'color-mix(in srgb, var(--color-success) 10%, var(--color-surface))',
                border: `1px solid ${isTimeUp ? 'color-mix(in srgb, var(--color-warning) 35%, transparent)' : 'color-mix(in srgb, var(--color-success) 35%, transparent)'}`,
            }}>
                <h3 className="text-xl font-bold mb-4 text-center" style={{ color: isTimeUp ? 'var(--color-warning)' : 'var(--color-success)' }}>
                    {isTimeUp ? '⏰ หมดเวลา!' : '🎉 ยินดีด้วย! คุณพิมพ์เสร็จแล้ว'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                    {[
                        { label: isTimeUp ? 'เวลาที่ใช้จริง' : 'เวลาที่ใช้', value: formatTime(timer) },
                        { label: 'คำต่อนาที', value: wpm },
                        { label: 'ความถูกต้อง', value: `${accuracy}%` },
                        { label: 'ข้อผิดพลาด', value: totalErrors },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <div className="text-2xl font-bold" style={{ color: isTimeUp ? 'var(--color-warning)' : 'var(--color-success)' }}>{value}</div>
                            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
                        </div>
                    ))}
                </div>
                {isTimeUp && (
                    <div className="mb-4 p-3 rounded-lg" style={{ background: 'color-mix(in srgb, var(--color-warning) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--color-warning) 40%, transparent)' }}>
                        <p className="text-center font-medium" style={{ color: 'var(--color-warning)' }}>
                            📊 คะแนนจากจำนวนที่พิมพ์ได้: {totalCorrectChars} ตัวอักษรถูกต้อง จาก {totalTypedChars} ตัวที่พิมพ์
                        </p>
                        <p className="text-center text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            ความคืบหน้า: {totalTypedChars} / {fullTextContentLength} ตัวอักษรทั้งหมด
                        </p>
                    </div>
                )}
                <p className="text-lg font-semibold text-center" style={{ color: 'var(--color-text)' }}>
                    เกรด: <span className="font-bold text-xl" style={{ color: isTimeUp ? 'var(--color-warning)' : 'var(--color-success)' }}>{getGrade(wpm, accuracy, totalErrors, currentLevelId)}</span>
                </p>
                <p className="text-lg font-semibold text-center mt-2" style={{ color: 'var(--color-text)' }}>
                    คะแนน: <span className="font-bold text-xl" style={{ color: isTimeUp ? 'var(--color-warning)' : 'var(--color-success)' }}>{getScore10Point(wpm, accuracy, totalErrors, currentLevelId)}/10</span>
                </p>
            </div>

            {user && latestUserStats && (
                <div className="mt-4 lg:mt-6 p-4 lg:p-6 rounded-lg"
                    style={{ background: 'var(--color-primary-light)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
                    <h3 className="text-xl font-bold mb-4 text-center" style={{ color: 'var(--color-primary)' }}>
                        สถิติการเล่นล่าสุดของแบบฝึกหัดนี้
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {[
                            { label: 'WPM', value: latestUserStats.wpm },
                            { label: 'ความแม่นยำ', value: `${latestUserStats.accuracy}%` },
                            { label: 'ข้อผิดพลาด', value: latestUserStats.totalErrors },
                            { label: 'จำนวนครั้งที่เล่น', value: latestUserStats.playCount },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{value}</div>
                                <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-lg font-semibold text-center mt-2" style={{ color: 'var(--color-text)' }}>
                        คะแนน: <span className="font-bold text-xl" style={{ color: 'var(--color-accent)' }}>{latestUserStats.score10Point}/10</span>
                    </p>
                    <p className="text-sm text-center mt-4" style={{ color: 'var(--color-text-muted)' }}>
                        เล่นล่าสุด: {new Date(latestUserStats.lastPlayed).toLocaleString()}
                    </p>
                </div>
            )}
        </>
    );
};

export default GameResults;
