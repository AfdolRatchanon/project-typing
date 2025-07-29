// src/components/NextCharGuidance.tsx

import React from 'react';
import { fingerNamesDisplay } from '../data/keyboardData';

interface NextCharGuidanceProps {
    nextChar: string;
    activeFinger: string | null;
    typedTextLength: number;
    textToTypeLength: number;
    currentSegmentIndex: number;
    segmentsLength: number;
    isFinished: boolean;
    isPaused: boolean;
}

/**
 * @component NextCharGuidance
 * @description Displays the next character to type and the recommended finger.
 * @param {NextCharGuidanceProps} props - Props for NextCharGuidance component.
 */
const NextCharGuidance: React.FC<NextCharGuidanceProps> = ({
    nextChar,
    activeFinger,
    typedTextLength,
    textToTypeLength,
    currentSegmentIndex,
    segmentsLength,
    isFinished,
    isPaused,
}) => {
    const showGuidance = (nextChar || (typedTextLength === textToTypeLength && currentSegmentIndex + 1 < segmentsLength)) && !isFinished && !isPaused;

    if (!showGuidance) {
        return null;
    }

    return (
        <div className="lg:w-64 p-2 lg:p-3 bg-green-50 rounded-lg border border-green-200 text-center lg:text-left flex flex-col ">
            <p className="text-sm lg:text-base font-semibold text-green-800 mb-1 text-center">ตัวอักษรถัดไป:</p>
            <p className="text-xl lg:text-2xl font-bold text-green-900 mb-2 text-center">
                {typedTextLength === textToTypeLength && currentSegmentIndex + 1 < segmentsLength ? '[Space] เพื่อดำเนินต่อ' : (nextChar === ' ' ? '[Space]' : nextChar)}
            </p>
            {activeFinger && (
                <p className="text-xs lg:text-sm text-green-700 text-center">
                    ใช้นิ้ว: <span className="font-bold">{fingerNamesDisplay[activeFinger]}</span>
                </p>
            )}
        </div>
    );
};

export default NextCharGuidance;
