// src/components/LevelSelector.tsx

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Lock } from 'lucide-react';
import type { Language, LevelStats } from '../types/types';

interface LevelSelectorProps {
    languages: Language[];
    currentLevelId: string;
    setCurrentLevelId: (levelId: string) => void;
    isStarted: boolean;
    isPaused: boolean;
    expandedLanguage: string;
    setExpandedLanguage: (langId: string) => void;
    expandedUnits: { [key: string]: boolean };
    setExpandedUnits: (units: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void;
    expandedSessions: { [key: string]: boolean };
    setExpandedSessions: (sessions: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void;
    isLevelUnlocked: (levelId: string) => boolean;
    userLevelProgress: { [levelId: string]: LevelStats | undefined };
    isUserProgressLoaded: boolean;
    user: any; // Firebase User object
}

/**
 * @component LevelSelector
 * @description Displays the collapsible menu for selecting typing lessons (languages, units, sessions, levels).
 * @param {LevelSelectorProps} props - Props for LevelSelector component.
 */
const LevelSelector: React.FC<LevelSelectorProps> = ({
    languages,
    currentLevelId,
    setCurrentLevelId,
    isStarted,
    isPaused,
    expandedLanguage,
    setExpandedLanguage,
    expandedUnits,
    setExpandedUnits,
    expandedSessions,
    setExpandedSessions,
    isLevelUnlocked,
    userLevelProgress,
    isUserProgressLoaded,
    user,
}) => {
    // State สำหรับควบคุมการเลื่อนด่านอัตโนมัติ
    const [autoAdvance, setAutoAdvance] = useState<boolean>(false);

    // Effect สำหรับจัดการการเลื่อนด่านอัตโนมัติเมื่อด่านปัจจุบันผ่านแล้ว
    useEffect(() => {
        // ตรวจสอบเงื่อนไขที่จำเป็นสำหรับการเลื่อนด่านอัตโนมัติ
        if (!user || !isUserProgressLoaded || !autoAdvance) {
            return;
        }

        const currentLevelStats = userLevelProgress[currentLevelId];
        const requiredPlayCount = 1;
        const requiredScore = 0;

        // ตรวจสอบว่าด่านปัจจุบัน "ผ่าน" หรือไม่
        const isCurrentLevelPassed =
            currentLevelStats &&
            currentLevelStats.playCount >= requiredPlayCount &&
            currentLevelStats.score10Point >= requiredScore;

        if (isCurrentLevelPassed) {
            // รวบรวมด่านทั้งหมดเป็นอาร์เรย์เดียว
            const allLevels = languages.flatMap(lang =>
                lang.units.flatMap(unit =>
                    unit.sessions.flatMap(session => session.levels)
                )
            );
            const currentLevelIndex = allLevels.findIndex(level => level.id === currentLevelId);

            // หากด่านปัจจุบันถูกพบและไม่ใช่ด่านสุดท้าย
            if (currentLevelIndex !== -1 && currentLevelIndex < allLevels.length - 1) {
                const nextLevel = allLevels[currentLevelIndex + 1];
                // ตรวจสอบว่าด่านถัดไปปลดล็อกแล้วและไม่ใช่ด่านปัจจุบัน (เพื่อป้องกัน loop)
                if (isLevelUnlocked(nextLevel.id) && nextLevel.id !== currentLevelId) {
                    setCurrentLevelId(nextLevel.id);
                    console.log(`Auto-advancing to next level: ${nextLevel.name}`);
                }
            }
        }
    }, [currentLevelId, userLevelProgress, autoAdvance, user, isUserProgressLoaded, languages, isLevelUnlocked, setCurrentLevelId]);

    const toggleUnit = (unitId: string) => {
        setExpandedUnits(prev => {
            const newState = { ...prev, [unitId]: !prev[unitId] };
            console.log(`Toggle Unit: ${unitId}, New State:`, newState[unitId]);
            console.log('Current expandedUnits state:', newState);
            return newState;
        });
    };

    const toggleSession = (sessionId: string) => {
        setExpandedSessions(prev => {
            const newState = { ...prev, [sessionId]: !prev[sessionId] };
            console.log(`Toggle Session: ${sessionId}, New State:`, newState[sessionId]);
            console.log('Current expandedSessions state:', newState);
            return newState;
        });
    };

    return (
        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            {/* Auto Advance Toggle - Compact & Elegant */}
            <div className="mb-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm border border-blue-100/50 rounded-xl p-3 shadow-sm">
                <label htmlFor="autoAdvanceToggle" className="flex items-center justify-center cursor-pointer group">
                    <input
                        type="checkbox"
                        id="autoAdvanceToggle"
                        className="sr-only peer"
                        checked={autoAdvance}
                        onChange={(e) => setAutoAdvance(e.target.checked)}
                    />
                    <div className="relative w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300/50 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                        ไปบทเรียนล่าสุดและถัดไปอัตโนมัติ
                    </span>
                </label>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
                {!isUserProgressLoaded ? (
                    <div className="text-center text-gray-500 py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-sm">กำลังโหลดบทเรียน...</p>
                    </div>
                ) : (
                    languages.map((language) => {
                        const isLanguageActive = language.units.some(unit =>
                            unit.sessions.some(session =>
                                session.levels.some(level => level.id === currentLevelId)
                            )
                        );

                        return (
                            <div key={language.id} className="border border-gray-200/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-white/70 backdrop-blur-sm">
                                <button
                                    onClick={() => setExpandedLanguage(expandedLanguage === language.id ? '' : language.id)}
                                    className={`w-full flex items-center justify-between p-3.5 transition-all duration-300 ${isLanguageActive
                                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500'
                                        : 'bg-gray-50/80 hover:bg-gray-100/80'
                                        }`}
                                >
                                    <span className={`font-bold text-base ${isLanguageActive ? 'text-blue-700' : 'text-gray-800'
                                        }`}>
                                        {language.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {isLanguageActive && (
                                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
                                        )}
                                        {expandedLanguage === language.id ? (
                                            <ChevronDown size={18} className={`transition-transform duration-200 ${isLanguageActive ? 'text-blue-600' : 'text-gray-600'
                                                }`} />
                                        ) : (
                                            <ChevronRight size={18} className={`transition-transform duration-200 ${isLanguageActive ? 'text-blue-600' : 'text-gray-600'
                                                }`} />
                                        )}
                                    </div>
                                </button>

                                {expandedLanguage === language.id && (
                                    <div className="bg-white/90 border-t border-gray-100">
                                        <div className="space-y-1 p-2">
                                            {language.units.map((unit) => {
                                                const isUnitActive = unit.sessions.some(session =>
                                                    session.levels.some(level => level.id === currentLevelId)
                                                );

                                                return (
                                                    <div key={unit.id} className="border border-gray-150/60 rounded-lg overflow-hidden shadow-sm bg-white/50">
                                                        <button
                                                            onClick={() => toggleUnit(unit.id)}
                                                            className={`w-full flex items-center justify-between p-3 transition-all duration-300 ${isUnitActive
                                                                ? 'bg-gradient-to-r from-blue-25 to-blue-50 border-l-3 border-l-blue-400'
                                                                : 'bg-gray-25/80 hover:bg-gray-50/80'
                                                                }`}
                                                        >
                                                            <span className={`font-semibold text-sm ${isUnitActive ? 'text-blue-700' : 'text-gray-700'
                                                                }`}>
                                                                {unit.name}
                                                            </span>
                                                            <div className="flex items-center gap-1.5">
                                                                {isUnitActive && (
                                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                                                )}
                                                                {expandedUnits[unit.id] ? (
                                                                    <ChevronDown size={16} className={`transition-transform duration-200 ${isUnitActive ? 'text-blue-600' : 'text-gray-500'
                                                                        }`} />
                                                                ) : (
                                                                    <ChevronRight size={16} className={`transition-transform duration-200 ${isUnitActive ? 'text-blue-600' : 'text-gray-500'
                                                                        }`} />
                                                                )}
                                                            </div>
                                                        </button>

                                                        {expandedUnits[unit.id] && (
                                                            <div className="bg-white/95 border-t border-gray-100/60">
                                                                <div className="space-y-0.5 p-1.5">
                                                                    {unit.sessions.map((session) => {
                                                                        const isSessionActive = session.levels.some(level => level.id === currentLevelId);

                                                                        return (
                                                                            <div key={session.id} className="border border-gray-100/80 rounded-md overflow-hidden bg-white/40">
                                                                                <button
                                                                                    onClick={() => toggleSession(session.id)}
                                                                                    className={`w-full flex items-center justify-between p-2.5 transition-all duration-300 ${isSessionActive
                                                                                        ? 'bg-gradient-to-r from-blue-25 to-indigo-25 border-l-2 border-l-blue-300'
                                                                                        : 'bg-gray-25/60 hover:bg-gray-50/60'
                                                                                        }`}
                                                                                >
                                                                                    <span className={`font-medium text-sm ${isSessionActive ? 'text-blue-600' : 'text-gray-600'
                                                                                        }`}>
                                                                                        {session.name}
                                                                                    </span>
                                                                                    <div className="flex items-center gap-1">
                                                                                        {isSessionActive && (
                                                                                            <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse"></div>
                                                                                        )}
                                                                                        {expandedSessions[session.id] ? (
                                                                                            <ChevronDown size={14} className={`transition-transform duration-200 ${isSessionActive ? 'text-blue-500' : 'text-gray-400'
                                                                                                }`} />
                                                                                        ) : (
                                                                                            <ChevronRight size={14} className={`transition-transform duration-200 ${isSessionActive ? 'text-blue-500' : 'text-gray-400'
                                                                                                }`} />
                                                                                        )}
                                                                                    </div>
                                                                                </button>

                                                                                {expandedSessions[session.id] && (
                                                                                    <div className="bg-white border-t border-gray-50/80 p-1.5">
                                                                                        <div className="space-y-1">
                                                                                            {session.levels.map((level) => {
                                                                                                const unlocked = isLevelUnlocked(level.id);
                                                                                                const playCountForLevel = userLevelProgress[level.id]?.playCount || 0;
                                                                                                const requiredPlayCount = 1;
                                                                                                const requiredScore = 0;
                                                                                                const isFirstLevel = level.id === 'thai-practice-1-1-1';

                                                                                                let tooltipText = '';
                                                                                                if (!user) {
                                                                                                    tooltipText = 'กรุณาเข้าสู่ระบบเพื่อปลดล็อกด่าน';
                                                                                                } else if (!unlocked && !isFirstLevel) {
                                                                                                    const currentLevelStats = userLevelProgress[level.id];
                                                                                                    const currentLevelScore = currentLevelStats?.score10Point || 0;

                                                                                                    if (playCountForLevel < requiredPlayCount) {
                                                                                                        tooltipText = `ต้องเล่นด่านก่อนหน้า ${requiredPlayCount} ครั้ง (เล่นแล้ว ${playCountForLevel} ครั้ง)`;
                                                                                                    } else if (currentLevelScore <= requiredScore) {
                                                                                                        tooltipText = `ต้องได้คะแนนด่านก่อนหน้ามากกว่า ${requiredScore} คะแนน (ได้ ${currentLevelScore} คะแนน)`;
                                                                                                    } else {
                                                                                                        tooltipText = 'ด่านนี้ยังไม่ถูกปลดล็อก';
                                                                                                    }
                                                                                                }

                                                                                                return (
                                                                                                    <button
                                                                                                        key={level.id}
                                                                                                        onClick={() => {
                                                                                                            if (unlocked) {
                                                                                                                setCurrentLevelId(level.id);
                                                                                                            }
                                                                                                        }}
                                                                                                        disabled={!unlocked || (isStarted && !isPaused)}
                                                                                                        className={`w-full text-left p-2.5 rounded-lg border transition-all duration-300 ease-in-out text-sm font-medium relative group ${currentLevelId === level.id
                                                                                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg transform scale-[1.01] ring-2 ring-blue-200/50'
                                                                                                            : 'bg-white/80 text-gray-600 border-gray-200/60 hover:bg-blue-50/80 hover:border-blue-300/60 hover:shadow-md hover:transform hover:scale-[1.005]'
                                                                                                            } ${(!unlocked || (isStarted && !isPaused)) ? 'opacity-50 cursor-not-allowed' : ''
                                                                                                            }`}
                                                                                                        title={!unlocked ? tooltipText : ''}
                                                                                                    >
                                                                                                        <div className="flex items-center justify-between">
                                                                                                            <span className="leading-relaxed">{level.name}</span>
                                                                                                            <div className="flex items-center gap-1.5">
                                                                                                                {currentLevelId === level.id && (
                                                                                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                                                                                )}
                                                                                                                {!unlocked && (
                                                                                                                    <Lock size={14} className="text-gray-400" />
                                                                                                                )}
                                                                                                                {currentLevelId === level.id && (
                                                                                                                    <span className="text-xs opacity-90 hidden sm:inline font-normal">
                                                                                                                        กำลังเรียน
                                                                                                                    </span>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </button>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default LevelSelector;