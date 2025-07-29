// src/components/VirtualKeyboard.tsx

import React from 'react';
import { keyboardRows, keyDisplays } from '../data/keyboardData';

interface VirtualKeyboardProps {
    highlightedKeys: string[];
    isShiftActive: boolean;
    isCapsLockActive: boolean;
    keyboardLanguage: 'en' | 'th';
}

/**
 * @component VirtualKeyboard
 * @description Displays a virtual keyboard with highlighted keys based on typing guidance.
 * @param {VirtualKeyboardProps} props - Props for VirtualKeyboard component.
 */
const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
    highlightedKeys,
    isShiftActive,
    isCapsLockActive,
    keyboardLanguage,
}) => {
    return (
        <div className="flex-1 p-3 lg:p-4 bg-gray-100 rounded-lg shadow-inner border border-gray-200 overflow-x-auto">
            <h2 className="text-base lg:text-lg font-bold text-gray-800 mb-2 lg:mb-3 text-center">คีย์บอร์ด</h2>
            <div className="flex flex-col items-center justify-center">
                {keyboardRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex my-0.5 lg:my-1">
                        {row.map((keyLabel) => {
                            const isHighlighted = highlightedKeys.includes(keyLabel);
                            const isCapsActive = keyLabel === 'CapsLock' && isCapsLockActive;
                            const displayChar = keyLabel.length > 1 ? keyLabel : (isShiftActive || isCapsLockActive ? keyDisplays[keyboardLanguage].shifted[keyLabel as keyof typeof keyDisplays.en.shifted] : keyDisplays[keyboardLanguage].unshifted[keyLabel as keyof typeof keyDisplays.en.unshifted]) || keyLabel;
                            return (
                                <div key={keyLabel} className={`relative flex items-center justify-center m-0.5 rounded-md text-xs lg:text-sm font-semibold transition-all duration-100 ease-in-out border-b-4 ${isHighlighted ? 'bg-blue-400 text-white border-blue-600 -translate-y-1 shadow-xl' : isCapsActive ? 'bg-blue-300 text-white border-blue-500' : 'bg-gray-200 text-gray-800 border-gray-400 shadow-sm'} ${keyLabel === 'Backspace' ? 'w-16 xl:w-24' : ''} ${keyLabel === 'Tab' ? 'w-12 xl:w-20' : ''} ${keyLabel === '\\' ? 'w-12 xl:w-18' : ''} ${keyLabel === 'CapsLock' ? 'w-16 xl:w-26' : ''} ${keyLabel === 'Enter' ? 'w-16 xl:w-26' : ''} ${keyLabel === 'Shift' || keyLabel === 'ShiftRight' ? 'w-20 xl:w-32' : ''} ${keyLabel === 'Control' || keyLabel === 'ControlRight' ? 'w-20 xl:w-30' : ''} ${keyLabel === 'Alt' || keyLabel === 'AltGr' ? 'w-16 xl:w-18' : ''} ${keyLabel === 'Space' ? 'w-56 xl:w-96' : 'w-8 h-8 xl:w-12 xl:h-12'}`}>
                                    {displayChar}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VirtualKeyboard;
