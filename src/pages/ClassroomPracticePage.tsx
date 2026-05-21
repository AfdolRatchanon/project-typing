// src/pages/ClassroomPracticePage.tsx
// หน้าฝึกพิมพ์สำหรับบทเรียนในห้องเรียน (Custom Lesson)

import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { User as FirebaseUser } from 'firebase/auth';
import type { CustomLesson } from '../types/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useStudentClassroom } from '../hooks/useStudentClassroom';
import { useTypingGame } from '../hooks/useTypingGame';
import { getScore10Point, getGrade } from '../utils/scoreUtils';

import StatsDisplay from '../components/practice/StatsDisplay';
import TypingArea from '../components/practice/TypingArea';
import GameControls from '../components/practice/GameControls';
import VirtualKeyboard from '../components/practice/VirtualKeyboard';
import NextCharGuidance from '../components/practice/NextCharGuidance';
import GameResults from '../components/practice/GameResults';

interface Props {
    user: FirebaseUser | null;
}

// dummy level id สำหรับ custom lesson (ไม่มีใน scoringCriteria → ใช้ default)
const CUSTOM_LEVEL_PREFIX = 'custom-lesson-';

const ClassroomPracticePage: React.FC<Props> = ({ user }) => {
    const { classroomId = '', lessonId = '' } = useParams<{ classroomId: string; lessonId: string }>();
    const navigate = useNavigate();
    const { saveStats } = useStudentClassroom(user);

    const [lesson, setLesson] = useState<CustomLesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [statsSaved, setStatsSaved] = useState(false);

    // โหลดบทเรียน
    useEffect(() => {
        if (!classroomId || !lessonId) return;
        getDoc(doc(db, 'classrooms', classroomId, 'lessons', lessonId))
            .then(snap => {
                setLesson(snap.exists() ? (snap.data() as CustomLesson) : null);
                setLoading(false);
            });
    }, [classroomId, lessonId]);

    const customLevelId = `${CUSTOM_LEVEL_PREFIX}${lessonId}`;
    const {
        fullTextContent,
        segments, currentSegmentIndex,
        textToType, typedText,
        isStarted, isPaused, isFinished,
        timer, totalErrors, totalCorrectChars, totalTypedChars,
        wpm, accuracy, remainingTime, isTimeUp,
        nextChar, activeFinger, highlightedKeys, keyboardLanguage,
        isShiftActive, isCapsLockActive, inputRef,
        handleInputChange, handleStartPause, handleResetGame,
    } = useTypingGame({
        currentLevelId: customLevelId,
        user,
        customText: lesson?.text,
        customTimeLimit: lesson?.timeLimit ?? undefined,
    });

    // บันทึก stats เมื่อจบ
    useEffect(() => {
        if (isFinished && !statsSaved && user && classroomId && lessonId) {
            setStatsSaved(true);
            saveStats(classroomId, lessonId, {
                wpm, accuracy, totalErrors,
                grade: getGrade(wpm, accuracy, totalErrors, customLevelId),
                score10Point: getScore10Point(wpm, accuracy, totalErrors, customLevelId),
            });
        }
        if (!isFinished) setStatsSaved(false);
    }, [isFinished]); // eslint-disable-line react-hooks/exhaustive-deps

    const effectiveTimeLimit = lesson?.timeLimit || null;

    const completedCharsReal = segments.slice(0, currentSegmentIndex).reduce((acc, seg) => acc + seg.length + 1, 0);
    const totalProgress = completedCharsReal + typedText.length;

    if (loading) {
        return (
            <div className="min-h-screen app-bg flex items-center justify-center">
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลดบทเรียน...</p>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen app-bg flex flex-col items-center justify-center gap-3">
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>ไม่พบบทเรียนนี้</p>
                <button onClick={() => navigate('/my-classroom')}
                    className="text-sm px-4 py-2 rounded-lg font-medium"
                    style={{ background: 'var(--color-primary)', color: '#fff' }}>
                    กลับ
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen app-bg p-2 sm:p-4 font-inter">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-4">
                <div className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--color-sidebar)', borderLeft: '4px solid var(--color-accent)' }}>
                    <button onClick={() => navigate('/my-classroom')}
                        className="p-1.5 rounded-lg transition-all hover:opacity-80"
                        style={{ background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)', color: 'var(--color-accent)' }}>
                        <ArrowLeft size={16} />
                    </button>
                    <BookOpen size={16} style={{ color: 'var(--color-accent)' }} />
                    <div className="min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: 'var(--color-sidebar-text)' }}>{lesson.title}</p>
                        {effectiveTimeLimit && (
                            <p className="text-xs" style={{ color: 'var(--color-sidebar-muted, #7B9EC0)' }}>
                                ⏱ เวลาจำกัด {Math.floor(effectiveTimeLimit / 60)} นาที
                                {effectiveTimeLimit % 60 ? ` ${effectiveTimeLimit % 60} วินาที` : ''}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main practice area */}
            <main className="max-w-4xl mx-auto p-4 lg:p-6 rounded-2xl shadow-2xl"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <StatsDisplay
                    timer={timer}
                    timeLimit={effectiveTimeLimit}
                    remainingTime={remainingTime}
                    wpm={wpm}
                    accuracy={accuracy}
                    totalErrors={totalErrors}
                    totalProgress={totalProgress}
                    totalCharsActual={fullTextContent.length}
                />

                <TypingArea
                    textToType={textToType}
                    typedText={typedText}
                    currentSegmentIndex={currentSegmentIndex}
                    segments={segments}
                    isFinished={isFinished}
                    isPaused={isPaused}
                    inputRef={inputRef}
                    handleInputChange={handleInputChange}
                />

                <GameControls
                    isStarted={isStarted}
                    isPaused={isPaused}
                    isFinished={isFinished}
                    handleStartPause={handleStartPause}
                    handleResetGame={handleResetGame}
                />

                <div className="flex flex-col-reverse lg:flex-row gap-3 lg:gap-4">
                    <VirtualKeyboard
                        highlightedKeys={highlightedKeys}
                        isShiftActive={isShiftActive}
                        isCapsLockActive={isCapsLockActive}
                        keyboardLanguage={keyboardLanguage}
                    />
                    <NextCharGuidance
                        nextChar={nextChar}
                        activeFinger={activeFinger}
                        typedTextLength={typedText.length}
                        textToTypeLength={textToType.length}
                        currentSegmentIndex={currentSegmentIndex}
                        segmentsLength={segments.length || 1}
                        isFinished={isFinished}
                        isPaused={isPaused}
                    />
                </div>

                <GameResults
                    isFinished={isFinished}
                    isTimeUp={isTimeUp}
                    timer={timer}
                    wpm={wpm}
                    accuracy={accuracy}
                    totalErrors={totalErrors}
                    totalCorrectChars={totalCorrectChars}
                    totalTypedChars={totalTypedChars}
                    fullTextContentLength={lesson.text.length}
                    currentLevelId={customLevelId}
                    user={user}
                    latestUserStats={null}
                />
            </main>
        </div>
    );
};

export default ClassroomPracticePage;
