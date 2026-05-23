import React, { useState, useEffect, useMemo } from 'react';
import { Target, RotateCcw, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

import AuthSection from '../components/auth/AuthSection';
import LevelSelector from '../components/practice/LevelSelector';
import StatsDisplay from '../components/practice/StatsDisplay';
import TypingArea from '../components/practice/TypingArea';
import GameControls from '../components/practice/GameControls';
import VirtualKeyboard from '../components/practice/VirtualKeyboard';
import NextCharGuidance from '../components/practice/NextCharGuidance';
import GameResults from '../components/practice/GameResults';
import LevelScoringCriteria from '../components/practice/LevelScoringCriteria';

import { useTypingGame } from '../hooks/useTypingGame';
import { languages } from '../data/data';
import type { UserRole } from '../types/types';
import type { User as FirebaseUser } from 'firebase/auth';

interface PracticePageProps {
    user: FirebaseUser | null;
    isAuthReady: boolean;
    userPhotoUrl: string | null;
    userRole: UserRole | null;
    isGuestMode: boolean;
    latestUserStats: any;
    userLevelProgress: { [levelId: string]: any };
    isUserProgressLoaded: boolean;
    handleGoogleSignIn: () => Promise<void>;
    handleSignOut: () => Promise<void>;
    isLevelUnlocked: (levelId: string) => boolean;
}

const PracticePage: React.FC<PracticePageProps> = ({
    user,
    isAuthReady,
    userPhotoUrl,
    userRole,
    isGuestMode,
    latestUserStats,
    userLevelProgress,
    isUserProgressLoaded,
    handleGoogleSignIn,
    handleSignOut,
    isLevelUnlocked,
}) => {
    const navigate = useNavigate();
    const [currentLevelId, setCurrentLevelId] = useState<string>(
        languages[0].units[0].sessions[0].levels[0].id
    );
    const [expandedLanguage, setExpandedLanguage] = useState<string>('');
    const [expandedUnits, setExpandedUnits] = useState<{ [key: string]: boolean }>({});
    const [expandedSessions, setExpandedSessions] = useState<{ [key: string]: boolean }>({});

    const {
        fullTextContent, segments, currentSegmentIndex,
        textToType, typedText, isStarted, isPaused, isFinished,
        timer, totalErrors, totalCorrectChars, totalTypedChars,
        wpm, accuracy, wpmHistory, timeLimit, remainingTime, isTimeUp,
        nextChar, activeFinger, highlightedKeys, keyboardLanguage,
        isShiftActive, isCapsLockActive, inputRef,
        handleInputChange, handleStartPause, handleResetGame, getCurrentLevel,
        topErrorChars,
    } = useTypingGame({ currentLevelId, user });

    const currentLevel = getCurrentLevel();

    // D1 — count pending tests/exams for student classrooms
    const [pendingClassroomCount, setPendingClassroomCount] = useState(0);
    useEffect(() => {
        if (!user || userRole !== 'student') { setPendingClassroomCount(0); return; }
        let cancelled = false;
        (async () => {
            try {
                const profileSnap = await getDoc(doc(db, 'users', user.uid));
                const classroomIds: string[] = profileSnap.data()?.classroomIds || [];
                if (!classroomIds.length) return;
                let total = 0;
                await Promise.all(classroomIds.map(async (cid) => {
                    const [tests, exams] = await Promise.all([
                        getDocs(query(collection(db, 'prePostTests'), where('classroomId', '==', cid), where('isOpen', '==', true))),
                        getDocs(query(collection(db, 'exams'), where('classroomId', '==', cid), where('isOpen', '==', true))),
                    ]);
                    total += tests.size + exams.size;
                }));
                if (!cancelled) setPendingClassroomCount(total);
            } catch { /* silently ignore */ }
        })();
        return () => { cancelled = true; };
    }, [user, userRole]);

    // U4 — หาด่านถัดไป (flatten all levels in order)
    const nextLevel = useMemo(() => {
        const allLevels = languages.flatMap(l => l.units.flatMap(u => u.sessions.flatMap(s => s.levels)));
        const idx = allLevels.findIndex(l => l.id === currentLevelId);
        return idx >= 0 && idx < allLevels.length - 1 ? allLevels[idx + 1] : null;
    }, [currentLevelId]);

    // Auto-expand to current level
    useEffect(() => {
        if (!currentLevel) return;
        let foundLangId = '';
        const newUnits: { [key: string]: boolean } = {};
        const newSessions: { [key: string]: boolean } = {};
        for (const lang of languages) {
            let isLangActive = false;
            for (const unit of lang.units) {
                let isUnitActive = false;
                for (const session of unit.sessions) {
                    const active = session.levels.some(l => l.id === currentLevelId);
                    newSessions[session.id] = active;
                    if (active) { isUnitActive = true; isLangActive = true; }
                }
                newUnits[unit.id] = isUnitActive;
            }
            if (isLangActive) foundLangId = lang.id;
        }
        setExpandedLanguage(foundLangId);
        setExpandedUnits(newUnits);
        setExpandedSessions(newSessions);
    }, [currentLevelId, currentLevel]);

    const completedCharsReal = segments.slice(0, currentSegmentIndex).reduce((acc, seg) => acc + seg.length + 1, 0);
    const totalProgress = completedCharsReal + typedText.length;

    // Focus Mode — fade sidebar when user is actively typing
    const [isFocused, setIsFocused] = useState(false);
    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        if (document.activeElement === el) setIsFocused(true);
        const onFocus = () => setIsFocused(true);
        const onBlur = () => setIsFocused(false);
        el.addEventListener('focus', onFocus);
        el.addEventListener('blur', onBlur);
        return () => { el.removeEventListener('focus', onFocus); el.removeEventListener('blur', onBlur); };
    }, [inputRef]);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') inputRef.current?.blur(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [inputRef]);

    return (
        <div className="min-h-screen flex flex-col lg:flex-row p-2 sm:p-4 font-inter gap-3 lg:gap-6 w-full app-bg">
            {/* ===== เมนูเลือกบทเรียน (ซ้าย) ===== */}
            <aside className="rounded-xl lg:rounded-2xl shadow-2xl shrink-0 w-full lg:w-64 xl:w-72 2xl:w-80 lg:max-h-[90vh] flex flex-col overflow-hidden"
                style={{
                    background: 'var(--color-sidebar)',
                    borderLeft: '4px solid var(--color-accent)',
                    opacity: isFocused ? 0.08 : 1,
                    pointerEvents: isFocused ? 'none' : 'auto',
                    transition: 'opacity 0.2s ease',
                }}>
                {/* Header */}
                <div className="px-4 py-4 flex items-center justify-between"
                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)' }}>
                    <div className="flex items-center gap-2" style={{ color: 'var(--color-sidebar-text)' }}>
                        <Target size={16} style={{ color: 'var(--color-accent)' }} />
                        <h2 className="text-base font-bold">เลือกบทเรียน</h2>
                    </div>
                    <div className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: 'var(--color-accent)', color: 'var(--color-sidebar)' }}>
                        LESSON
                    </div>
                </div>

                <AuthSection
                    isAuthReady={isAuthReady}
                    user={user}
                    userPhotoUrl={userPhotoUrl}
                    userRole={userRole}
                    isGuestMode={isGuestMode}
                    handleGoogleSignIn={handleGoogleSignIn}
                    handleSignOut={handleSignOut}
                    showAdminDashboard={false}
                    setShowAdminDashboard={() => navigate('/admin')}
                    showUserDashboard={false}
                    setShowUserDashboard={() => navigate('/dashboard')}
                    onGoToClassroom={() => navigate(
                        (userRole === 'teacher' || userRole === 'superAdmin') ? '/teacher' : '/my-classroom'
                    )}
                    onGoToProfile={() => navigate('/profile')}
                    pendingClassroomCount={pendingClassroomCount}
                />

                <LevelSelector
                    languages={languages}
                    currentLevelId={currentLevelId}
                    setCurrentLevelId={setCurrentLevelId}
                    isStarted={isStarted}
                    isPaused={isPaused}
                    expandedLanguage={expandedLanguage}
                    setExpandedLanguage={setExpandedLanguage}
                    expandedUnits={expandedUnits}
                    setExpandedUnits={setExpandedUnits}
                    expandedSessions={expandedSessions}
                    setExpandedSessions={setExpandedSessions}
                    isLevelUnlocked={isLevelUnlocked}
                    userLevelProgress={userLevelProgress}
                    isUserProgressLoaded={isUserProgressLoaded}
                    user={user}
                />

                <div className="p-3" style={{ borderTop: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-success)' }}></div>
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-sidebar-muted, #7B9EC0)' }}>กำลังเรียน</span>
                    </div>
                    <div className="font-bold text-xs truncate px-2 py-1.5 rounded-lg"
                        style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent)', border: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)' }}>
                        {currentLevel?.name || 'กำลังโหลด...'}
                    </div>
                    {isGuestMode && (
                        <div className="mt-2 text-xs text-center rounded-md px-2 py-1"
                            style={{ background: 'color-mix(in srgb, var(--color-warning) 15%, transparent)', color: 'var(--color-warning)', border: '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)' }}>
                            โหมดทดลอง — คะแนนไม่ถูกบันทึก
                        </div>
                    )}
                </div>
            </aside>

            {/* ===== ส่วนเนื้อหาหลัก (ขวา) ===== */}
            <main className="p-4 lg:p-8 rounded-xl lg:rounded-2xl shadow-2xl flex-1 min-h-0 min-w-0"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <StatsDisplay
                    timer={timer} timeLimit={timeLimit} remainingTime={remainingTime}
                    wpm={wpm} accuracy={accuracy} totalErrors={totalErrors}
                    totalProgress={totalProgress} totalCharsActual={fullTextContent.length}
                    wpmHistory={wpmHistory}
                />

                {/* U3 — Progress bar full-width */}
                {(isStarted || isFinished) && (
                    <div className="w-full h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: 'var(--color-border)' }}>
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${Math.min(100, (totalProgress / Math.max(1, fullTextContent.length)) * 100)}%`,
                                background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
                            }}
                        />
                    </div>
                )}

                <TypingArea
                    textToType={textToType} typedText={typedText}
                    currentSegmentIndex={currentSegmentIndex} segments={segments}
                    isFinished={isFinished} isPaused={isPaused}
                    inputRef={inputRef} handleInputChange={handleInputChange}
                />

                <GameControls
                    isStarted={isStarted} isPaused={isPaused} isFinished={isFinished}
                    handleStartPause={handleStartPause} handleResetGame={handleResetGame}
                />

                <div className="flex flex-col-reverse xl:flex-row gap-3 lg:gap-4">
                    <VirtualKeyboard
                        highlightedKeys={highlightedKeys} isShiftActive={isShiftActive}
                        isCapsLockActive={isCapsLockActive} keyboardLanguage={keyboardLanguage}
                    />
                    <NextCharGuidance
                        nextChar={nextChar} activeFinger={activeFinger}
                        typedTextLength={typedText.length} textToTypeLength={textToType.length}
                        currentSegmentIndex={currentSegmentIndex} segmentsLength={segments.length}
                        isFinished={isFinished} isPaused={isPaused}
                    />
                </div>

                <GameResults
                    isFinished={isFinished} isTimeUp={isTimeUp} timer={timer}
                    wpm={wpm} accuracy={accuracy} totalErrors={totalErrors}
                    totalCorrectChars={totalCorrectChars} totalTypedChars={totalTypedChars}
                    fullTextContentLength={fullTextContent.length}
                    currentLevelId={currentLevelId} user={user} latestUserStats={latestUserStats}
                    topErrorChars={topErrorChars}
                />

                {/* U4 — ปุ่ม "ลองอีกครั้ง" / "ถัดไป" หลังจบ */}
                {isFinished && (
                    <div className="flex gap-3 justify-center mt-4">
                        <button
                            onClick={handleResetGame}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                            style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                            <RotateCcw size={15} /> ลองอีกครั้ง
                        </button>
                        {nextLevel && (
                            <button
                                onClick={() => { setCurrentLevelId(nextLevel.id); handleResetGame(); }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                                style={{ background: 'var(--color-primary)' }}>
                                ถัดไป: {nextLevel.name} <ChevronRight size={15} />
                            </button>
                        )}
                    </div>
                )}

                <LevelScoringCriteria
                    currentLevelId={currentLevelId} timeLimit={timeLimit}
                    currentLevelName={currentLevel?.name || null}
                />

                {user && latestUserStats && (
                    <div className="p-4 rounded-xl shadow-inner mt-4"
                        style={{ background: 'var(--color-primary-light)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
                        <h3 className="text-lg font-bold mb-3 text-center" style={{ color: 'var(--color-primary)' }}>สถิติการเล่นล่าสุดของบทนี้</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[
                                { label: 'WPM', value: latestUserStats.wpm },
                                { label: 'ความแม่นยำ', value: `${latestUserStats.accuracy}%` },
                                { label: 'ข้อผิดพลาด', value: latestUserStats.totalErrors },
                                { label: 'จำนวนครั้งที่เล่น', value: latestUserStats.playCount },
                                { label: 'คะแนน (10)', value: latestUserStats.score10Point },
                                { label: 'เกรด', value: latestUserStats.grade },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center p-2 rounded-md shadow-sm"
                                    style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))' }}>
                                    <span className="font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}:</span>
                                    <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <footer className="w-full flex justify-center items-center py-4 text-sm rounded-xl shadow-inner mt-4"
                    style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>©</span>
                        <span className="font-medium">2025</span>
                        <div className="w-1 h-1 rounded-full" style={{ background: 'var(--color-border)' }}></div>
                        <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Ratchanon Semsayan</span>
                        <div className="w-1 h-1 rounded-full" style={{ background: 'var(--color-border)' }}></div>
                        <span>All Rights Reserved</span>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default PracticePage;
