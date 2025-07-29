// src/components/GameResults.tsx

import React from 'react';
import { formatTime } from '../utils/timeUtils';
import { getGrade, getScore10Point } from '../utils/scoreUtils';
import type { LevelStats } from '../types/types';

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
            <div className={`mt-4 lg:mt-6 p-4 lg:p-6 rounded-lg ${isTimeUp ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
                <h3 className={`text-xl font-bold mb-4 text-center ${isTimeUp ? 'text-orange-800' : 'text-green-800'}`}>
                    {isTimeUp ? '⏰ หมดเวลา!' : '🎉 ยินดีด้วย! คุณพิมพ์เสร็จแล้ว'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                    <div>
                        <div className={`text-2xl font-bold ${isTimeUp ? 'text-orange-600' : 'text-green-600'}`}>
                            {formatTime(timer)}
                        </div>
                        <div className="text-sm text-gray-600">
                            {isTimeUp ? 'เวลาที่ใช้จริง' : 'เวลาที่ใช้'}
                        </div>
                    </div>
                    <div>
                        <div className={`text-2xl font-bold ${isTimeUp ? 'text-orange-600' : 'text-green-600'}`}>{wpm}</div>
                        <div className="text-sm text-gray-600">คำต่อนาที</div>
                    </div>
                    <div>
                        <div className={`text-2xl font-bold ${isTimeUp ? 'text-orange-600' : 'text-green-600'}`}>{accuracy}%</div>
                        <div className="text-sm text-gray-600">ความถูกต้อง</div>
                    </div>
                    <div>
                        <div className={`text-2xl font-bold ${isTimeUp ? 'text-orange-600' : 'text-green-600'}`}>{totalErrors}</div>
                        <div className="text-sm text-gray-600">ข้อผิดพลาด</div>
                    </div>
                </div>
                {isTimeUp && (
                    <div className="mb-4 p-3 bg-orange-100 rounded-lg border border-orange-300">
                        <p className="text-orange-800 text-center font-medium">
                            📊 คะแนนจากจำนวนที่พิมพ์ได้: {totalCorrectChars} ตัวอักษรถูกต้อง จาก {totalTypedChars} ตัวที่พิมพ์
                        </p>
                        <p className="text-orange-700 text-center text-sm mt-1">
                            ความคืบหน้า: {totalTypedChars} / {fullTextContentLength} ตัวอักษรทั้งหมด
                        </p>
                    </div>
                )}
                <p className={`text-lg font-semibold text-center ${isTimeUp ? 'text-orange-700' : 'text-green-700'}`}>
                    เกรด: <span className={`font-bold text-xl ${isTimeUp ? 'text-orange-900' : 'text-green-900'}`}>{getGrade(wpm, accuracy, totalErrors, currentLevelId)}</span>
                </p>
                <p className={`text-lg font-semibold text-center mt-2 ${isTimeUp ? 'text-orange-700' : 'text-green-700'}`}>
                    คะแนน: <span className={`font-bold text-xl ${isTimeUp ? 'text-orange-900' : 'text-green-900'}`}>{getScore10Point(wpm, accuracy, totalErrors, currentLevelId)}/10</span>
                </p>
            </div>

            {user && latestUserStats && (
                <div className="mt-4 lg:mt-6 p-4 lg:p-6 rounded-lg bg-blue-50 border border-blue-200">
                    <h3 className="text-xl font-bold mb-4 text-center text-blue-800">
                        สถิติการเล่นล่าสุดของแบบฝึกหัดนี้
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{latestUserStats.wpm}</div>
                            <div className="text-sm text-gray-600">WPM</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{latestUserStats.accuracy}%</div>
                            <div className="text-sm text-gray-600">ความแม่นยำ</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{latestUserStats.totalErrors}</div>
                            <div className="text-sm text-gray-600">ข้อผิดพลาด</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{latestUserStats.playCount}</div>
                            <div className="text-sm text-gray-600">จำนวนครั้งที่เล่น</div>
                        </div>
                    </div>
                    <p className={`text-lg font-semibold text-center mt-2 text-blue-600`}>
                        คะแนน: <span className={`font-bold text-xl text-blue-600`}>{latestUserStats.score10Point}/10</span>
                    </p>
                    <p className="text-sm text-gray-600 text-center mt-4">
                        เล่นล่าสุด: {new Date(latestUserStats.lastPlayed).toLocaleString()}
                    </p>
                </div>
            )}
        </>
    );
};

export default GameResults;
