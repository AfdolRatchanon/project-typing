// src/components/LevelScoringCriteria.tsx

import React from 'react';
// import type { ScoringCriteria } from '../types/types';
import { scoringCriteria as allScoringCriteria } from '../data/data';
import { getDefaultCriteria } from '../utils/scoreUtils';

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
        <div className="mt-4 lg:mt-6 bg-gray-50 p-4 lg:p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-3 lg:mb-4 text-center">
                เกณฑ์การให้คะแนนสำหรับ "{currentLevelName || 'กำลังโหลด...'}"
                {timeLimit && (
                    <div className="text-sm font-medium text-indigo-600 mt-1">
                        ⏱️ เวลาที่กำหนด: {Math.floor(timeLimit / 60)} นาที {timeLimit % 60 !== 0 ? `${timeLimit % 60} วินาที` : ''}
                    </div>
                )}
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-sm">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700 uppercase text-xs lg:text-sm leading-normal">
                            {showWPM && <th className="py-2 px-3 lg:py-3 lg:px-6 text-left rounded-tl-lg">WPM ขั้นต่ำ</th>}
                            {showMaxErrors && <th className="py-2 px-3 lg:py-3 lg:px-6 text-left">ข้อผิดพลาดสูงสุด</th>}
                            {showAccuracy && <th className="py-2 px-3 lg:py-3 lg:px-6 text-left">ความแม่นยำขั้นต่ำ (%)</th>}
                            {showGrade && <th className="py-2 px-3 lg:py-3 lg:px-6 text-left">เกรด</th>}
                            {showScore && <th className="py-2 px-3 lg:py-3 lg:px-6 text-left rounded-tr-lg">คะแนน</th>}
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-xs lg:text-sm font-light">
                        {criteria.map((c, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                                {showWPM && <td className="py-2 px-3 lg:py-3 lg:px-6 text-left font-bold text-red-600">{c.minWPM}</td>}
                                {showMaxErrors && <td className="py-2 px-3 lg:py-3 lg:px-6 text-left font-bold text-red-600">{c.maxErrors}</td>}
                                {showAccuracy && <td className="py-2 px-3 lg:py-3 lg:px-6 text-left">{c.minAccuracy || '-'}</td>}
                                {showGrade && <td className="py-2 px-3 lg:py-3 lg:px-6 text-left whitespace-nowrap font-medium">{c.grade || '-'}</td>}
                                {showScore && <td className="py-2 px-3 lg:py-3 lg:px-6 text-left font-bold text-blue-600">{c.score10Point}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!allScoringCriteria[currentLevelId] && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        * ใช้เกณฑ์การให้คะแนนพื้นฐาน {timeLimit ? '(มีเวลาจำกัด)' : '(ไม่จำกัดเวลา)'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LevelScoringCriteria;
