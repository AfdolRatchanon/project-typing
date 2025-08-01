// src/components/LevelSelector.tsx

import React from 'react';
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
    // แก้ไข: อัปเดต Type ของ setExpandedUnits และ setExpandedSessions
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
    // เพิ่ม console.log เพื่อตรวจสอบการทำงานของ toggleUnit
    const toggleUnit = (unitId: string) => {
        // แก้ไข: Type ของ prev ถูกระบุใน interface แล้ว ไม่จำเป็นต้องระบุซ้ำตรงนี้
        setExpandedUnits(prev => {
            const newState = { ...prev, [unitId]: !prev[unitId] };
            console.log(`Toggle Unit: ${unitId}, New State:`, newState[unitId]);
            console.log('Current expandedUnits state:', newState);
            return newState;
        });
    };

    // เพิ่ม console.log เพื่อตรวจสอบการทำงานของ toggleSession
    const toggleSession = (sessionId: string) => {
        // แก้ไข: Type ของ prev ถูกระบุใน interface แล้ว ไม่จำเป็นต้องระบุซ้ำตรงนี้
        setExpandedSessions(prev => {
            const newState = { ...prev, [sessionId]: !prev[sessionId] };
            console.log(`Toggle Session: ${sessionId}, New State:`, newState[sessionId]);
            console.log('Current expandedSessions state:', newState);
            return newState;
        });
    };

    return (
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            <div className="space-y-2 sm:space-y-3">
                {!isUserProgressLoaded ? (
                    <div className="text-center text-gray-500 py-8">
                        <p className="animate-pulse">กำลังโหลดบทเรียน...</p>
                    </div>
                ) : (
                    languages.map((language) => {
                        const isLanguageActive = language.units.some(unit => unit.sessions.some(session => session.levels.some(level => level.id === currentLevelId)));
                        return (
                            <div key={language.id} className="border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                <button
                                    onClick={() => setExpandedLanguage(expandedLanguage === language.id ? '' : language.id)}
                                    className={`w-full flex items-center justify-between p-2.5 sm:p-3 lg:p-4 transition-all duration-300 ${isLanguageActive ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                                >
                                    <span className={`font-bold text-sm sm:text-base ${isLanguageActive ? 'text-blue-700' : 'text-gray-800'}`}>{language.name}</span>
                                    <div className="flex items-center gap-2">
                                        {isLanguageActive && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>}
                                        {expandedLanguage === language.id ? <ChevronDown size={16} className={`sm:w-5 sm:h-5 transition-transform duration-200 ${isLanguageActive ? 'text-blue-600' : 'text-gray-600'}`} /> : <ChevronRight size={16} className={`sm:w-5 sm:h-5 transition-transform duration-200 ${isLanguageActive ? 'text-blue-600' : 'text-gray-600'}`} />}
                                    </div>
                                </button>
                                {expandedLanguage === language.id && (
                                    <div className="bg-white border-t border-gray-100">
                                        <div className="space-y-1.5 sm:space-y-2 p-1.5 sm:p-2">
                                            {language.units.map((unit) => {
                                                const isUnitActive = unit.sessions.some(session => session.levels.some(level => level.id === currentLevelId));
                                                return (
                                                    <div key={unit.id} className="border border-gray-150 rounded-md sm:rounded-lg overflow-hidden shadow-sm">
                                                        <button onClick={() => toggleUnit(unit.id)} className={`w-full flex items-center justify-between p-2 sm:p-2.5 lg:p-3 transition-all duration-300 ${isUnitActive ? 'bg-gradient-to-r from-blue-25 to-blue-50 border-l-3 border-l-blue-400' : 'bg-gray-25 hover:bg-gray-50'}`}>
                                                            <span className={`font-semibold text-xs sm:text-sm ${isUnitActive ? 'text-blue-700' : 'text-gray-700'}`}>{unit.name}</span>
                                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                                {isUnitActive && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse"></div>}
                                                                {expandedUnits[unit.id] ? <ChevronDown size={14} className={`sm:w-4 sm:h-4 transition-transform duration-200 ${isUnitActive ? 'text-blue-600' : 'text-gray-500'}`} /> : <ChevronRight size={14} className={`sm:w-4 sm:h-4 transition-transform duration-200 ${isUnitActive ? 'text-blue-600' : 'text-gray-500'}`} />}
                                                            </div>
                                                        </button>
                                                        {expandedUnits[unit.id] && (
                                                            <div className="bg-white border-t border-gray-100">
                                                                <div className="space-y-1 sm:space-y-1.5 p-1.5 sm:p-2">
                                                                    {unit.sessions.map((session) => {
                                                                        const isSessionActive = session.levels.some(level => level.id === currentLevelId);
                                                                        return (
                                                                            <div key={session.id} className="border border-gray-100 rounded-sm sm:rounded-md overflow-hidden">
                                                                                <button onClick={() => toggleSession(session.id)} className={`w-full flex items-center justify-between p-2 sm:p-2.5 transition-all duration-300 ${isSessionActive ? 'bg-gradient-to-r from-blue-25 to-indigo-25 border-l-2 border-l-blue-300' : 'bg-gray-25 hover:bg-gray-50'}`}>
                                                                                    <span className={`font-medium text-xs ${isSessionActive ? 'text-blue-600' : 'text-gray-600'}`}>{session.name}</span>
                                                                                    <div className="flex items-center gap-1 sm:gap-1.5">
                                                                                        {isSessionActive && <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-300 rounded-full animate-pulse"></div>}
                                                                                        {expandedSessions[session.id] ? <ChevronDown size={12} className={`sm:w-4 sm:h-4 transition-transform duration-200 ${isSessionActive ? 'text-blue-500' : 'text-gray-400'}`} /> : <ChevronRight size={12} className={`sm:w-4 sm:h-4 transition-transform duration-200 ${isSessionActive ? 'text-blue-500' : 'text-gray-400'}`} />}
                                                                                    </div>
                                                                                </button>
                                                                                {expandedSessions[session.id] && (
                                                                                    <div className="bg-white border-t border-gray-50 p-1.5 sm:p-2">
                                                                                        <div className="space-y-1 sm:space-y-1.5">
                                                                                            {session.levels.map((level) => {
                                                                                                const unlocked = isLevelUnlocked(level.id);
                                                                                                const playCountForLevel = userLevelProgress[level.id]?.playCount || 0;
                                                                                                const requiredPlayCount = 3;
                                                                                                const requiredScore = 5; // Required score for unlocking
                                                                                                const isFirstLevel = level.id === 'thai-practice-1-1-1';

                                                                                                let tooltipText = '';
                                                                                                if (!user) {
                                                                                                    tooltipText = 'กรุณาเข้าสู่ระบบเพื่อปลดล็อกด่าน';
                                                                                                } else if (!unlocked && !isFirstLevel) {
                                                                                                    // อัปเดต tooltipText ให้แสดงเงื่อนไขคะแนนด้วย
                                                                                                    const currentLevelStats = userLevelProgress[level.id];
                                                                                                    const currentLevelScore = currentLevelStats?.score10Point || 0;

                                                                                                    if (playCountForLevel < requiredPlayCount) {
                                                                                                        tooltipText = `ต้องเล่นด่านก่อนหน้า ${requiredPlayCount} ครั้ง (เล่นแล้ว ${playCountForLevel} ครั้ง)`;
                                                                                                    } else if (currentLevelScore <= requiredScore) {
                                                                                                        tooltipText = `ต้องได้คะแนนด่านก่อนหน้ามากกว่า ${requiredScore} คะแนน (ได้ ${currentLevelScore} คะแนน)`;
                                                                                                    } else {
                                                                                                        tooltipText = 'ด่านนี้ยังไม่ถูกปลดล็อก'; // กรณี fallback
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
                                                                                                        className={`w-full text-left p-2 sm:p-2.5 lg:p-3 rounded-md sm:rounded-lg border transition-all duration-300 ease-in-out text-xs font-medium relative
                                                        ${currentLevelId === level.id ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg transform scale-[1.02] ring-2 ring-blue-200 ring-opacity-50' : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md hover:transform hover:scale-[1.01]'}
                                                        ${(!unlocked || (isStarted && !isPaused)) ? 'opacity-50 cursor-not-allowed' : ''}
                                                    `}
                                                                                                        title={!unlocked ? tooltipText : ''}
                                                                                                    >
                                                                                                        <div className="flex items-center justify-between">
                                                                                                            <span className="leading-relaxed">{level.name}</span>
                                                                                                            <div className="flex items-center gap-1">
                                                                                                                {currentLevelId === level.id && (<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>)}
                                                                                                                {!unlocked && <Lock size={14} className="text-gray-400 ml-1" />}
                                                                                                                {currentLevelId === level.id && (<span className="text-xs opacity-90 hidden sm:inline">กำลังเรียน</span>)}
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
