// src/components/StatsDisplay.tsx

import React from 'react';
import { Clock, Target, Award, CircleAlert, Timer } from 'lucide-react';
import { formatTime, formatTimeWithColor } from '../utils/timeUtils';

interface StatsDisplayProps {
    timer: number;
    timeLimit: number | null;
    remainingTime: number | null;
    wpm: number;
    accuracy: number;
    totalErrors: number;
    totalProgress: number;
    totalCharsActual: number;
}

/**
 * @component StatsDisplay
 * @description Displays the main game statistics like timer, WPM, accuracy, errors, and progress bar.
 * @param {StatsDisplayProps} props - Props for StatsDisplay component.
 */
const StatsDisplay: React.FC<StatsDisplayProps> = ({
    timer,
    timeLimit,
    remainingTime,
    wpm,
    accuracy,
    totalErrors,
    totalProgress,
    totalCharsActual,
}) => {
    const progress = totalCharsActual > 0 ? (totalProgress / totalCharsActual) * 100 : 0;

    return (
        <>
            {/* แถบแสดงสถิติ */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4 mb-4 lg:mb-6">
                <div className="bg-blue-50 p-3 lg:p-4 rounded-lg shadow-md border border-blue-200 flex items-center justify-center space-x-2">
                    <Clock className="text-blue-600" size={18} />
                    <p className="text-lg lg:text-xl font-bold text-blue-800">{formatTime(timer)}</p>
                    <p className="text-xs lg:text-sm font-medium text-blue-700">เวลาที่ใช้</p>
                </div>

                {/* ช่องแสดงเวลาที่เหลือ/จำกัด */}
                <div className="bg-indigo-50 p-3 lg:p-4 rounded-lg shadow-md border border-indigo-200 flex items-center justify-center space-x-2">
                    <Timer className="text-indigo-600" size={18} />
                    <p className={`text-lg lg:text-xl font-bold ${formatTimeWithColor(remainingTime, true, timeLimit).color}`}>
                        {formatTimeWithColor(remainingTime, true, timeLimit).time}
                    </p>
                    <p className="text-xs lg:text-sm font-medium text-indigo-700">
                        {timeLimit ? 'เหลือ' : 'ไม่จำกัด'}
                    </p>
                </div>

                <div className="bg-green-50 p-3 lg:p-4 rounded-lg shadow-md border border-green-200 flex items-center justify-center space-x-2">
                    <Target className="text-green-600" size={18} />
                    <p className="text-lg lg:text-xl font-bold text-green-800">{wpm}</p>
                    <p className="text-xs lg:text-sm font-medium text-green-700">WPM</p>
                </div>
                <div className="bg-purple-50 p-3 lg:p-4 rounded-lg shadow-md border border-purple-200 flex items-center justify-center space-x-2">
                    <Award className="text-purple-600" size={18} />
                    <p className="text-lg lg:text-xl font-bold text-purple-800">{accuracy}%</p>
                    <p className="text-xs lg:text-sm font-medium text-purple-700">ความแม่นยำ</p>
                </div>
                <div className="bg-red-50 p-3 lg:p-4 rounded-lg shadow-md border border-red-200 flex items-center justify-center space-x-2">
                    <CircleAlert className="text-red-600" size={18} />
                    <p className="text-lg lg:text-xl font-bold text-red-800">{totalErrors}</p>
                    <p className="text-xs lg:text-sm font-medium text-red-700">ข้อผิดพลาด</p>
                </div>
            </div>

            {/* แถบความคืบหน้า */}
            <div className="mb-4 lg:mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>ความคืบหน้า</span>
                    <span>{totalProgress} / {totalCharsActual} ตัวอักษร</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
            </div>
        </>
    );
};

export default StatsDisplay;
