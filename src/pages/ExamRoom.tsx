// src/pages/ExamRoom.tsx
// ห้องสอบทั่วไป (Exam System) — fullscreen + anti-cheat + auto-submit

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, Maximize2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Exam, ExamResult, ExamSet } from '../types/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { computeAssignedSet } from '../hooks/usePrePostTest';
import { useExam } from '../hooks/useExam';
import { useTypingGame } from '../hooks/useTypingGame';
import { getScore10Point, getGrade } from '../utils/scoreUtils';

import StatsDisplay from '../components/practice/StatsDisplay';
import TypingArea from '../components/practice/TypingArea';
import VirtualKeyboard from '../components/practice/VirtualKeyboard';
import NextCharGuidance from '../components/practice/NextCharGuidance';

interface Props {
    user: FirebaseUser | null;
}

type Phase = 'loading' | 'not-found' | 'closed' | 'ready' | 'exam' | 'submitting' | 'submitted';

const ExamRoom: React.FC<Props> = ({ user }) => {
    const { examId = '' } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const { submitResult } = useExam(null);

    const [exam, setExam] = useState<Exam | null>(null);
    const [assignedSet, setAssignedSet] = useState<ExamSet | null>(null);
    const [phase, setPhase] = useState<Phase>('loading');
    const [submittedResult, setSubmittedResult] = useState<ExamResult | null>(null);
    const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
    const [fsWarning, setFsWarning] = useState(false);

    const startedAtRef = useRef<number>(0);
    const submittedRef = useRef(false);
    const fsExitCountRef = useRef(0);

    // ─── Load exam + student info ───
    useEffect(() => {
        if (!examId || !user) return;
        (async () => {
            const examSnap = await getDoc(doc(db, 'exams', examId));
            if (!examSnap.exists()) { setPhase('not-found'); return; }

            const examData = examSnap.data() as Exam;
            setExam(examData);

            if (!examData.isOpen) { setPhase('closed'); return; }

            // ดึง studentNumber จาก classroom membership
            const memberSnap = await getDoc(
                doc(db, 'classrooms', examData.classroomId, 'members', user.uid),
            );
            const num = memberSnap.exists() ? (memberSnap.data().studentNumber ?? 1) : 1;

            const setNum = computeAssignedSet(num, user.uid, examId, examData.setAssignmentMethod);
            const found = examData.examSets.find(s => s.setNumber === setNum && s.text.trim());
            const fallback = examData.examSets.find(s => s.text.trim());
            setAssignedSet(found || fallback || examData.examSets[0]);

            // ตรวจผลที่มีอยู่แล้ว
            const resultSnap = await getDoc(doc(db, 'exams', examId, 'results', user.uid));
            if (resultSnap.exists() && !examData.allowRetake) {
                setSubmittedResult(resultSnap.data() as ExamResult);
                setPhase('submitted');
                return;
            }
            if (resultSnap.exists() && examData.allowRetake && examData.maxRetake > 0) {
                const attempt = resultSnap.data().attemptCount || 0;
                if (attempt >= examData.maxRetake) {
                    setSubmittedResult(resultSnap.data() as ExamResult);
                    setPhase('submitted');
                    return;
                }
            }
            setPhase('ready');
        })();
    }, [examId, user]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Fullscreen change ───
    useEffect(() => {
        const handler = () => {
            if (!document.fullscreenElement && phase === 'exam') {
                fsExitCountRef.current += 1;
                setFullscreenExitCount(fsExitCountRef.current);
                setFsWarning(true);
                setTimeout(() => setFsWarning(false), 5000);
            }
        };
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, [phase]);

    // ─── useTypingGame ───
    const customLevelId = `exam-${examId}`;
    const {
        fullTextContent, segments, currentSegmentIndex,
        textToType, typedText,
        isStarted, isPaused, isFinished,
        timer, totalErrors,
        wpm, accuracy, remainingTime, isTimeUp,
        nextChar, activeFinger, highlightedKeys, keyboardLanguage,
        isShiftActive, isCapsLockActive, inputRef,
        handleInputChange, handleStartPause,
    } = useTypingGame({
        currentLevelId: customLevelId,
        user,
        customText: assignedSet?.text ?? '',
        customTimeLimit: exam?.timeLimit,
    });

    // ─── Auto-submit ───
    useEffect(() => {
        if (!isFinished || phase !== 'exam' || submittedRef.current || !user || !exam || !assignedSet) return;
        submittedRef.current = true;
        setPhase('submitting');

        (async () => {
            if (document.fullscreenElement) {
                await document.exitFullscreen().catch(() => {});
            }

            const score10Point = getScore10Point(wpm, accuracy, totalErrors, customLevelId);
            const grade = getGrade(wpm, accuracy, totalErrors, customLevelId);
            const isPassed =
                score10Point >= exam.passingScore &&
                (exam.passingWPM === 0 || wpm >= exam.passingWPM);

            const result = await submitResult(examId, user.uid, {
                wpm, accuracy, totalErrors, score10Point, grade,
                assignedSet: assignedSet.setNumber,
                timeUsed: timer,
                startedAt: startedAtRef.current,
                submittedAt: Date.now(),
                isPassed,
                fullscreenExitCount: fsExitCountRef.current,
            }, exam.scorePolicy);
            setSubmittedResult(result);
            setPhase('submitted');
        })();
    }, [isFinished]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Start exam ───
    const handleStart = async () => {
        try { await document.documentElement.requestFullscreen(); } catch { /* proceed anyway */ }
        submittedRef.current = false;
        fsExitCountRef.current = 0;
        setFullscreenExitCount(0);
        startedAtRef.current = Date.now();
        setPhase('exam');
        handleStartPause();
    };

    const totalProgress =
        segments.slice(0, currentSegmentIndex).reduce((acc, seg) => acc + seg.length + 1, 0) +
        typedText.length;

    // ─── Loading ───
    if (phase === 'loading') {
        return (
            <div className="min-h-screen app-bg flex items-center justify-center">
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลดการสอบ...</p>
            </div>
        );
    }

    // ─── Not found / Closed ───
    if (phase === 'not-found' || phase === 'closed') {
        return (
            <div className="min-h-screen app-bg flex flex-col items-center justify-center gap-4 p-4">
                <p className="text-base font-semibold" style={{ color: 'var(--color-error)' }}>
                    {phase === 'not-found' ? 'ไม่พบการสอบนี้' : 'การสอบนี้ยังไม่เปิด'}
                </p>
                <button
                    onClick={() => navigate('/my-classroom')}
                    className="text-sm px-4 py-2 rounded-lg font-medium"
                    style={{ background: 'var(--color-primary)', color: '#fff' }}>
                    กลับหน้าห้องเรียน
                </button>
            </div>
        );
    }

    // ─── Ready ───
    if (phase === 'ready' && exam && assignedSet) {
        return (
            <div className="min-h-screen app-bg p-4 flex items-center justify-center">
                <div
                    className="w-full max-w-lg rounded-2xl shadow-xl p-6"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-3 mb-5">
                        <button
                            onClick={() => navigate('/my-classroom')}
                            className="p-1.5 rounded-lg hover:opacity-80 transition-all"
                            style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                            <ArrowLeft size={15} />
                        </button>
                        <div>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white bg-orange-500">
                                การสอบ
                            </span>
                            <h1 className="font-bold text-base mt-1" style={{ color: 'var(--color-text)' }}>
                                {exam.title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-5 p-4 rounded-xl" style={{ background: 'var(--color-primary-light)' }}>
                        {[
                            {
                                label: 'เวลาที่ได้รับ',
                                value: `${Math.floor(exam.timeLimit / 60)} นาที${exam.timeLimit % 60 ? ` ${exam.timeLimit % 60} วินาที` : ''}`,
                            },
                            {
                                label: 'เกณฑ์ผ่าน',
                                value: `${exam.passingScore}/10${exam.passingWPM > 0 ? ` · ${exam.passingWPM} WPM` : ''}`,
                            },
                            {
                                label: 'ชุดที่ได้รับ',
                                value: `ชุดที่ ${assignedSet.setNumber}`,
                                highlight: true,
                            },
                        ].map(({ label, value, highlight }) => (
                            <div key={label} className="flex items-center justify-between text-sm">
                                <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                                <span className="font-semibold" style={{ color: highlight ? 'var(--color-primary)' : 'var(--color-text)' }}>
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 rounded-xl mb-5" style={{
                        background: 'color-mix(in srgb, #f97316 8%, transparent)',
                        border: '1px solid color-mix(in srgb, #f97316 20%, transparent)',
                    }}>
                        <p className="text-xs font-semibold mb-1.5" style={{ color: '#f97316' }}>⚠️ ข้อควรทราบก่อนเริ่มสอบ</p>
                        <ul className="text-xs space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                            <li>• ระบบจะขอเข้าโหมดเต็มหน้าจอเมื่อกด "เริ่มสอบ"</li>
                            <li>• การออกจากหน้าจอเต็มจะถูกบันทึกและแจ้งให้ครูทราบ</li>
                            <li>• ผลสอบจะถูกส่งอัตโนมัติเมื่อพิมพ์ครบหรือหมดเวลา</li>
                            <li>• ห้ามคัดลอกหรือใช้ความช่วยเหลือจากภายนอก</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleStart}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                        style={{ background: '#f97316' }}>
                        <Maximize2 size={15} /> เริ่มสอบ
                    </button>
                </div>
            </div>
        );
    }

    // ─── Exam / Submitting ───
    if ((phase === 'exam' || phase === 'submitting') && exam) {
        return (
            <div className="min-h-screen app-bg p-2 sm:p-4 font-inter">
                <div className="max-w-4xl mx-auto mb-4">
                    <div
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: 'var(--color-sidebar)', borderLeft: '4px solid #f97316' }}>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white bg-orange-500">
                                การสอบ
                            </span>
                            <span className="font-bold text-sm truncate" style={{ color: 'var(--color-sidebar-text)' }}>
                                {exam.title}
                            </span>
                        </div>
                        {assignedSet && (
                            <span className="text-xs shrink-0" style={{ color: 'var(--color-sidebar-muted, #7B9EC0)' }}>
                                ชุดที่ {assignedSet.setNumber}
                            </span>
                        )}
                    </div>

                    {fsWarning && (
                        <div className="mt-2 p-2 rounded-lg flex items-center gap-2 text-xs font-medium animate-pulse"
                            style={{
                                background: 'color-mix(in srgb, var(--color-error) 12%, transparent)',
                                color: 'var(--color-error)',
                                border: '1px solid var(--color-error)',
                            }}>
                            <AlertTriangle size={13} />
                            ออกจากหน้าจอเต็มจอแล้ว (ครั้งที่ {fullscreenExitCount}) — ถูกบันทึกไว้
                        </div>
                    )}
                </div>

                <main
                    className="max-w-4xl mx-auto p-4 lg:p-6 rounded-2xl shadow-2xl"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    {phase === 'submitting' ? (
                        <div className="text-center py-12">
                            <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>กำลังส่งผลการสอบ...</p>
                        </div>
                    ) : (
                        <>
                            <StatsDisplay
                                timer={timer} timeLimit={exam.timeLimit} remainingTime={remainingTime}
                                wpm={wpm} accuracy={accuracy} totalErrors={totalErrors}
                                totalProgress={totalProgress} totalCharsActual={fullTextContent.length}
                            />
                            <TypingArea
                                textToType={textToType} typedText={typedText}
                                currentSegmentIndex={currentSegmentIndex} segments={segments}
                                isFinished={isFinished} isPaused={isPaused}
                                inputRef={inputRef} handleInputChange={handleInputChange}
                            />
                            <div className="flex items-center justify-center py-3 my-2 rounded-xl text-xs"
                                style={{ background: 'var(--color-primary-light)', color: 'var(--color-text-muted)' }}>
                                {isStarted && !isFinished && !isPaused && '⚡ กำลังสอบ — พิมพ์ข้อความด้านบนให้ครบ'}
                                {isPaused && '⏸ หยุดชั่วคราว'}
                                {isFinished && '✓ พิมพ์ครบแล้ว — กำลังส่งผล...'}
                                {isTimeUp && '⏰ หมดเวลา — กำลังส่งผล...'}
                            </div>
                            <div className="flex flex-col-reverse lg:flex-row gap-3 lg:gap-4">
                                <VirtualKeyboard
                                    highlightedKeys={highlightedKeys} isShiftActive={isShiftActive}
                                    isCapsLockActive={isCapsLockActive} keyboardLanguage={keyboardLanguage}
                                />
                                <NextCharGuidance
                                    nextChar={nextChar} activeFinger={activeFinger}
                                    typedTextLength={typedText.length} textToTypeLength={textToType.length}
                                    currentSegmentIndex={currentSegmentIndex} segmentsLength={segments.length || 1}
                                    isFinished={isFinished} isPaused={isPaused}
                                />
                            </div>
                        </>
                    )}
                </main>
            </div>
        );
    }

    // ─── Submitted ───
    if (phase === 'submitted' && submittedResult && exam) {
        const reachedLimit = exam.allowRetake && exam.maxRetake > 0 && submittedResult.attemptCount >= exam.maxRetake;
        const canRetake = exam.allowRetake && !reachedLimit;

        return (
            <div className="min-h-screen app-bg p-4 flex items-center justify-center">
                <div
                    className="w-full max-w-md rounded-2xl shadow-xl p-6 text-center"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    {submittedResult.isPassed ? (
                        <CheckCircle2 size={52} className="mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
                    ) : (
                        <XCircle size={52} className="mx-auto mb-3" style={{ color: 'var(--color-error)' }} />
                    )}

                    <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                        {submittedResult.isPassed ? 'ผ่านเกณฑ์ ✓' : 'ยังไม่ผ่านเกณฑ์'}
                    </h2>
                    <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>{exam.title}</p>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                            { label: 'WPM', value: String(submittedResult.wpm), color: 'var(--color-success)' },
                            { label: 'แม่นยำ', value: `${submittedResult.accuracy}%`, color: 'var(--color-accent)' },
                            { label: 'คะแนน', value: `${submittedResult.score10Point}/10`, color: 'var(--color-primary)' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="p-3 rounded-xl" style={{ background: 'var(--color-primary-light)' }}>
                                <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                                <p className="text-xl font-bold" style={{ color }}>{value}</p>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>
                        ชุดที่ {submittedResult.assignedSet} · ครั้งที่ {submittedResult.attemptCount}
                        {submittedResult.fullscreenExitCount > 0 && (
                            <span className="ml-2" style={{ color: 'var(--color-error)' }}>
                                · ออกหน้าจอเต็มจอ {submittedResult.fullscreenExitCount} ครั้ง
                            </span>
                        )}
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/my-classroom')}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                            style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                            กลับห้องเรียน
                        </button>
                        {canRetake && (
                            <button
                                onClick={() => {
                                    submittedRef.current = false;
                                    setPhase('ready');
                                }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                                style={{ background: '#f97316' }}>
                                ทำซ้ำ
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default ExamRoom;
