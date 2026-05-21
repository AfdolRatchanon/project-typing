// src/pages/StudentClassroomPage.tsx

import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Play, LogOut, ArrowLeft, CheckCircle2, ClipboardList, MessageSquare, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User as FirebaseUser } from 'firebase/auth';
import type { CustomLesson, ClassroomLevelStats, PrePostTest, Survey, Exam } from '../types/types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useStudentClassroom } from '../hooks/useStudentClassroom';
import ClassroomCard from '../components/classroom/ClassroomCard';
import JoinClassroomForm from '../components/classroom/JoinClassroomForm';

interface Props {
    user: FirebaseUser | null;
}

const StudentClassroomPage: React.FC<Props> = ({ user }) => {
    const navigate = useNavigate();
    const { myClassrooms, loading, joinClassroom, leaveClassroom, getLessons, getMyStats } = useStudentClassroom(user);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [lessons, setLessons] = useState<CustomLesson[]>([]);
    const [stats, setStats] = useState<Record<string, ClassroomLevelStats | null>>({});
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [openTests, setOpenTests] = useState<PrePostTest[]>([]);
    const [loadingTests, setLoadingTests] = useState(false);
    const [openSurveys, setOpenSurveys] = useState<Survey[]>([]);
    const [loadingSurveys, setLoadingSurveys] = useState(false);
    const [openExams, setOpenExams] = useState<Exam[]>([]);
    const [loadingExams, setLoadingExams] = useState(false);

    const selected = myClassrooms.find(c => c.classroomId === selectedId) || null;

    // โหลดการทดสอบที่เปิดอยู่
    useEffect(() => {
        if (!selectedId) { setOpenTests([]); setOpenSurveys([]); setOpenExams([]); return; }
        setLoadingTests(true);
        setLoadingSurveys(true);
        setLoadingExams(true);
        getDocs(query(
            collection(db, 'prePostTests'),
            where('classroomId', '==', selectedId),
            where('isOpen', '==', true),
        )).then(snap => {
            setOpenTests(snap.docs.map(d => d.data() as PrePostTest));
            setLoadingTests(false);
        }).catch(() => setLoadingTests(false));
        getDocs(query(
            collection(db, 'surveys'),
            where('classroomId', '==', selectedId),
            where('isOpen', '==', true),
        )).then(snap => {
            setOpenSurveys(snap.docs.map(d => d.data() as Survey));
            setLoadingSurveys(false);
        }).catch(() => setLoadingSurveys(false));
        getDocs(query(
            collection(db, 'exams'),
            where('classroomId', '==', selectedId),
            where('isOpen', '==', true),
        )).then(snap => {
            setOpenExams(snap.docs.map(d => d.data() as Exam));
            setLoadingExams(false);
        }).catch(() => setLoadingExams(false));
    }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!selectedId) return;
        setLoadingLessons(true);
        getLessons(selectedId).then(async (ls) => {
            setLessons(ls);
            // โหลด stats ของแต่ละบทเรียน
            const s: Record<string, ClassroomLevelStats | null> = {};
            await Promise.all(ls.map(async (l) => {
                s[l.lessonId] = await getMyStats(selectedId, l.lessonId);
            }));
            setStats(s);
            setLoadingLessons(false);
        });
    }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleLeave = async (classroomId: string, name: string) => {
        if (!confirm(`ออกจาก "${name}"?`)) return;
        await leaveClassroom(classroomId);
        if (selectedId === classroomId) setSelectedId(null);
    };

    return (
        <div className="min-h-screen app-bg p-3 sm:p-5">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <button onClick={() => navigate('/practice')}
                        className="p-2 rounded-lg transition-all hover:opacity-80"
                        style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>ห้องเรียนของฉัน</h1>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{user?.displayName}</p>
                    </div>
                </div>

                {/* Join form */}
                <div className="mb-4">
                    <JoinClassroomForm onJoin={joinClassroom} />
                </div>

                {loading ? (
                    <div className="text-center py-12 text-sm" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลด...</div>
                ) : myClassrooms.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl" style={{ border: '1px dashed var(--color-border)' }}>
                        <BookOpen size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>ยังไม่ได้เข้าร่วมห้องเรียนใด</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>ขอรหัสห้องจากครูแล้วกรอกด้านบน</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Classroom list */}
                        <aside className="lg:w-64 shrink-0">
                            <h2 className="text-xs font-semibold uppercase mb-2 px-1" style={{ color: 'var(--color-text-muted)' }}>
                                ห้องที่เข้าร่วม ({myClassrooms.length})
                            </h2>
                            <div className="flex flex-col gap-2">
                                {myClassrooms.map(c => (
                                    <div key={c.classroomId}>
                                        <ClassroomCard
                                            classroom={c}
                                            isTeacher={false}
                                            isSelected={selectedId === c.classroomId}
                                            onClick={() => setSelectedId(c.classroomId === selectedId ? null : c.classroomId)}
                                        />
                                        <button onClick={() => handleLeave(c.classroomId, c.name)}
                                            className="w-full flex items-center justify-center gap-1 text-xs py-1 mt-1 rounded-lg transition-all hover:opacity-80"
                                            style={{ color: 'var(--color-error)' }}>
                                            <LogOut size={11} /> ออกจากห้อง
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </aside>

                        {/* Lesson panel */}
                        <main className="flex-1 min-w-0 rounded-2xl p-4"
                            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            {!selected ? (
                                <div className="flex flex-col items-center justify-center h-40 text-center">
                                    <BookOpen size={36} className="mb-2" style={{ color: 'var(--color-text-muted)' }} />
                                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>เลือกห้องเรียนเพื่อดูบทเรียน</p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{selected.name}</h2>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                            {selected.subject} · {selected.gradeLevel} · ภาค {selected.semester}/{selected.academicYear}
                                        </p>
                                    </div>

                                    {/* Pending tests banner */}
                                    {!loadingTests && openTests.length > 0 && (
                                        <div className="mb-4 p-3 rounded-xl" style={{
                                            background: 'color-mix(in srgb, #3b82f6 8%, transparent)',
                                            border: '1px solid color-mix(in srgb, #3b82f6 20%, transparent)',
                                        }}>
                                            <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: '#3b82f6' }}>
                                                <ClipboardList size={13} />
                                                การทดสอบที่รอดำเนินการ ({openTests.length})
                                            </p>
                                            <div className="flex flex-col gap-1.5">
                                                {openTests.map(t => (
                                                    <div key={t.testId} className="flex items-center justify-between gap-2 p-2 rounded-lg"
                                                        style={{ background: 'color-mix(in srgb, #3b82f6 10%, transparent)' }}>
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full text-white shrink-0 ${t.type === 'pre' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                                                {t.type === 'pre' ? 'Pre' : 'Post'}
                                                            </span>
                                                            <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                                                                {t.title}
                                                            </span>
                                                            <span className="flex items-center gap-0.5 text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                                                                <Clock size={10} />
                                                                {Math.floor(t.timeLimit / 60)} นาที
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => navigate(`/test/${t.testId}`)}
                                                            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg text-white shrink-0 transition-all hover:opacity-90"
                                                            style={{ background: '#3b82f6' }}>
                                                            <Play size={10} /> เข้าสอบ
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Open exams banner */}
                                    {!loadingExams && openExams.length > 0 && (
                                        <div className="mb-4 p-3 rounded-xl" style={{
                                            background: 'color-mix(in srgb, #f97316 8%, transparent)',
                                            border: '1px solid color-mix(in srgb, #f97316 20%, transparent)',
                                        }}>
                                            <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: '#f97316' }}>
                                                <FileText size={13} />
                                                การสอบที่เปิดอยู่ ({openExams.length})
                                            </p>
                                            <div className="flex flex-col gap-1.5">
                                                {openExams.map(e => (
                                                    <div key={e.examId} className="flex items-center justify-between gap-2 p-2 rounded-lg"
                                                        style={{ background: 'color-mix(in srgb, #f97316 10%, transparent)' }}>
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                                                                {e.title}
                                                            </span>
                                                            <span className="flex items-center gap-0.5 text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                                                                <Clock size={10} />
                                                                {Math.floor(e.timeLimit / 60)} นาที
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => navigate(`/exam/${e.examId}`)}
                                                            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg text-white shrink-0 transition-all hover:opacity-90"
                                                            style={{ background: '#f97316' }}>
                                                            <Play size={10} /> เข้าสอบ
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Open surveys banner */}
                                    {!loadingSurveys && openSurveys.length > 0 && (
                                        <div className="mb-4 p-3 rounded-xl" style={{
                                            background: 'color-mix(in srgb, #8b5cf6 8%, transparent)',
                                            border: '1px solid color-mix(in srgb, #8b5cf6 20%, transparent)',
                                        }}>
                                            <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: '#8b5cf6' }}>
                                                <MessageSquare size={13} />
                                                แบบสอบถามที่รอตอบ ({openSurveys.length})
                                            </p>
                                            <div className="flex flex-col gap-1.5">
                                                {openSurveys.map(s => (
                                                    <div key={s.surveyId} className="flex items-center justify-between gap-2 p-2 rounded-lg"
                                                        style={{ background: 'color-mix(in srgb, #8b5cf6 10%, transparent)' }}>
                                                        <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                                                            {s.title}
                                                        </span>
                                                        <button
                                                            onClick={() => navigate(`/survey/${s.surveyId}`)}
                                                            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg text-white shrink-0 transition-all hover:opacity-90"
                                                            style={{ background: '#8b5cf6' }}>
                                                            <Play size={10} /> ตอบ
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {loadingLessons ? (
                                        <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลด...</p>
                                    ) : lessons.length === 0 ? (
                                        <div className="text-center py-8 rounded-xl" style={{ border: '1px dashed var(--color-border)' }}>
                                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีบทเรียนในห้องนี้</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {lessons.map((l) => {
                                                const s = stats[l.lessonId];
                                                return (
                                                    <div key={l.lessonId} className="flex items-start gap-3 p-4 rounded-xl transition-all"
                                                        style={{ background: 'var(--color-primary-light)', border: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)' }}>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{l.title}</h3>
                                                            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{l.text}</p>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {l.timeLimit && (
                                                                    <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--color-accent)' }}>
                                                                        <Clock size={11} /> {Math.floor(l.timeLimit / 60)} นาที
                                                                    </span>
                                                                )}
                                                                {s && (
                                                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                                        style={{ background: 'color-mix(in srgb, var(--color-success) 12%, transparent)', color: 'var(--color-success)' }}>
                                                                        WPM {s.wpm} · {s.accuracy}% · {s.score10Point}/10
                                                                    </span>
                                                                )}
                                                                {(() => {
                                                                    const played = s?.playCount ?? 0;
                                                                    const required = l.requiredPlayCount;
                                                                    if (!required) return null;
                                                                    const done = played >= required;
                                                                    return (
                                                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                                                                            style={{
                                                                                background: done
                                                                                    ? 'color-mix(in srgb, var(--color-success) 15%, transparent)'
                                                                                    : 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                                                                                color: done ? 'var(--color-success)' : 'var(--color-accent)',
                                                                            }}>
                                                                            {done && <CheckCircle2 size={11} />}
                                                                            ฝึกแล้ว {played}/{required} ครั้ง
                                                                        </span>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => navigate(`/classroom/${selected.classroomId}/lesson/${l.lessonId}`)}
                                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white shrink-0 transition-all hover:opacity-90"
                                                            style={{ background: 'var(--color-primary)' }}>
                                                            <Play size={12} /> {s ? 'ฝึกอีก' : 'เริ่ม'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </main>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentClassroomPage;
