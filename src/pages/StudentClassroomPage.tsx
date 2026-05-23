// src/pages/StudentClassroomPage.tsx

import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Play, LogOut, ArrowLeft, CheckCircle2, Trophy, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User as FirebaseUser } from 'firebase/auth';
import type { CustomLesson, ClassroomLevelStats, PrePostTest, PrePostTestResult, Survey, Exam, ExamResult, ClassroomMember } from '../types/types';
import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
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
    // R2 + S2 — ผลที่ครูประกาศแล้ว
    type PublishedTest  = { test: PrePostTest;  result: PrePostTestResult | null };
    type PublishedExam  = { exam: Exam;         result: ExamResult | null };
    const [publishedTests, setPublishedTests]   = useState<PublishedTest[]>([]);
    const [publishedExams, setPublishedExams]   = useState<PublishedExam[]>([]);
    const [viewingResult, setViewingResult] = useState<
        { title: string; wpm: number; accuracy: number; score10Point: number; isPassed: boolean; type: string } | null
    >(null);
    // A2 — first-join onboarding card
    const [showOnboarding, setShowOnboarding] = useState(false);

    // X6 — Leaderboard
    type LeaderboardEntry = { member: ClassroomMember; stats: ClassroomLevelStats };
    const [leaderboardOpen, setLeaderboardOpen] = useState(false);
    const [leaderboardLesson, setLeaderboardLesson] = useState<string>('');
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    const fetchLeaderboard = async (cid: string, lessonId: string) => {
        setLoadingLeaderboard(true);
        setLeaderboardData([]);
        const membersSnap = await getDocs(collection(db, 'classrooms', cid, 'members'));
        const memberList = membersSnap.docs.map(d => d.data() as ClassroomMember);
        const entries = await Promise.all(
            memberList.map(async (m) => {
                const snap = await getDoc(doc(db, 'users', m.uid, 'classroomStats', `${cid}_${lessonId}`));
                return snap.exists() ? { member: m, stats: snap.data() as ClassroomLevelStats } : null;
            })
        );
        setLeaderboardData(
            (entries.filter(Boolean) as LeaderboardEntry[])
                .sort((a, b) => b.stats.wpm - a.stats.wpm)
        );
        setLoadingLeaderboard(false);
    };

    const selected = myClassrooms.find(c => c.classroomId === selectedId) || null;

    // โหลดการทดสอบที่เปิดอยู่
    useEffect(() => {
        setLeaderboardOpen(false);
        setLeaderboardLesson('');
        setLeaderboardData([]);
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

    // R2 + S2 — โหลดผลที่ครูประกาศแล้ว
    useEffect(() => {
        if (!selectedId || !user) { setPublishedTests([]); setPublishedExams([]); return; }
        getDocs(query(
            collection(db, 'prePostTests'),
            where('classroomId', '==', selectedId),
            where('isResultPublished', '==', true),
        )).then(async (snap) => {
            const items: PublishedTest[] = await Promise.all(snap.docs.map(async (d) => {
                const test = d.data() as PrePostTest;
                const rSnap = await getDoc(doc(db, 'prePostTests', test.testId, 'results', user.uid));
                return { test, result: rSnap.exists() ? rSnap.data() as PrePostTestResult : null };
            }));
            setPublishedTests(items.filter(i => i.result !== null));
        }).catch(() => {});
        getDocs(query(
            collection(db, 'exams'),
            where('classroomId', '==', selectedId),
            where('isResultPublished', '==', true),
        )).then(async (snap) => {
            const items: PublishedExam[] = await Promise.all(snap.docs.map(async (d) => {
                const exam = d.data() as Exam;
                const rSnap = await getDoc(doc(db, 'exams', exam.examId, 'results', user.uid));
                return { exam, result: rSnap.exists() ? rSnap.data() as ExamResult : null };
            }));
            setPublishedExams(items.filter(i => i.result !== null));
        }).catch(() => {});
    }, [selectedId, user]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!selectedId) return;
        const key = `onboarded-${selectedId}`;
        if (!localStorage.getItem(key)) setShowOnboarding(true);
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

    // S1 — Auto-select first classroom on load
    useEffect(() => {
        if (myClassrooms.length > 0 && !selectedId) {
            setSelectedId(myClassrooms[0].classroomId);
        }
    }, [myClassrooms]); // eslint-disable-line react-hooks/exhaustive-deps

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
                                        {/* S1 — Classroom switcher dropdown (visible on all screens) */}
                                        {myClassrooms.length > 1 ? (
                                            <select
                                                value={selectedId ?? ''}
                                                onChange={e => setSelectedId(e.target.value)}
                                                className="text-base font-bold mb-0.5 w-full max-w-xs rounded-lg px-2 py-1 cursor-pointer"
                                                style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                                                {myClassrooms.map(c => (
                                                    <option key={c.classroomId} value={c.classroomId}>{c.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{selected.name}</h2>
                                        )}
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                            {selected.subject} · {selected.gradeLevel} · ภาค {selected.semester}/{selected.academicYear}
                                        </p>
                                    </div>

                                    {/* A2 — First-join onboarding card */}
                                    {showOnboarding && (
                                        <div className="mb-4 p-4 rounded-xl flex items-start gap-3"
                                            style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
                                            <Trophy size={20} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                                                    ยินดีต้อนรับสู่ {selected.name}!
                                                </p>
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                                    มี {lessons.length > 0 ? `${lessons.length} บทเรียน` : 'บทเรียน'} รอคุณอยู่ — เริ่มฝึกพิมพ์ได้เลย
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setShowOnboarding(false);
                                                    localStorage.setItem(`onboarded-${selected.classroomId}`, '1');
                                                }}
                                                className="p-1 rounded-md hover:opacity-70 transition-all"
                                                style={{ color: 'var(--color-text-muted)' }}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}

                                    {/* U10 — Unified Action Hub */}
                                    {(!loadingTests || !loadingExams || !loadingSurveys) &&
                                        (openTests.length + openExams.length + openSurveys.length > 0) && (
                                        <div className="mb-4 rounded-xl overflow-hidden"
                                            style={{ border: '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)' }}>
                                            <div className="flex items-center gap-2 px-3 py-2"
                                                style={{ background: 'color-mix(in srgb, var(--color-warning) 12%, transparent)' }}>
                                                <Play size={13} style={{ color: 'var(--color-warning)' }} />
                                                <span className="text-xs font-bold" style={{ color: 'var(--color-warning)' }}>
                                                    รายการที่ต้องทำ ({openTests.length + openExams.length + openSurveys.length})
                                                </span>
                                            </div>
                                            <div className="flex flex-col" style={{ borderTop: '1px solid var(--color-border)' }}>
                                                {openTests.map(t => (
                                                    <div key={t.testId} className="flex items-center justify-between gap-2 px-3 py-2"
                                                        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full text-white shrink-0 ${t.type === 'pre' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                                                {t.type === 'pre' ? 'Pre' : 'Post'}
                                                            </span>
                                                            <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{t.title}</span>
                                                            <span className="flex items-center gap-0.5 text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                                                                <Clock size={10} />{Math.floor(t.timeLimit / 60)} นาที
                                                            </span>
                                                        </div>
                                                        <button onClick={() => navigate(`/test/${t.testId}`)}
                                                            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg text-white shrink-0 transition-all hover:opacity-90"
                                                            style={{ background: '#3b82f6' }}>
                                                            <Play size={10} /> เข้าสอบ
                                                        </button>
                                                    </div>
                                                ))}
                                                {openExams.map(e => (
                                                    <div key={e.examId} className="flex items-center justify-between gap-2 px-3 py-2"
                                                        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white bg-orange-500 shrink-0">สอบ</span>
                                                            <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{e.title}</span>
                                                            <span className="flex items-center gap-0.5 text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                                                                <Clock size={10} />{Math.floor(e.timeLimit / 60)} นาที
                                                            </span>
                                                        </div>
                                                        <button onClick={() => navigate(`/exam/${e.examId}`)}
                                                            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg text-white shrink-0 transition-all hover:opacity-90"
                                                            style={{ background: '#f97316' }}>
                                                            <Play size={10} /> เข้าสอบ
                                                        </button>
                                                    </div>
                                                ))}
                                                {openSurveys.map(s => (
                                                    <div key={s.surveyId} className="flex items-center justify-between gap-2 px-3 py-2"
                                                        style={{ background: 'var(--color-surface)' }}>
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white bg-violet-500 shrink-0">สำรวจ</span>
                                                            <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{s.title}</span>
                                                        </div>
                                                        <button onClick={() => navigate(`/survey/${s.surveyId}`)}
                                                            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg text-white shrink-0 transition-all hover:opacity-90"
                                                            style={{ background: '#8b5cf6' }}>
                                                            <Play size={10} /> ตอบ
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* R2 — ผลที่ครูประกาศแล้ว */}
                                    {(publishedTests.length > 0 || publishedExams.length > 0) && (
                                        <div className="mb-4 p-3 rounded-xl" style={{
                                            background: 'color-mix(in srgb, #10b981 8%, transparent)',
                                            border: '1px solid color-mix(in srgb, #10b981 20%, transparent)',
                                        }}>
                                            <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: '#10b981' }}>
                                                <Trophy size={13} />
                                                ผลที่ครูประกาศแล้ว ({publishedTests.length + publishedExams.length})
                                            </p>
                                            <div className="flex flex-col gap-1.5">
                                                {publishedTests.map(({ test, result }) => result && (
                                                    <div key={test.testId} className="flex items-center justify-between gap-2 p-2 rounded-lg"
                                                        style={{ background: 'color-mix(in srgb, #10b981 10%, transparent)' }}>
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full text-white shrink-0 ${test.type === 'pre' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                                                {test.type === 'pre' ? 'Pre' : 'Post'}
                                                            </span>
                                                            <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{test.title}</span>
                                                        </div>
                                                        <button onClick={() => setViewingResult({
                                                            title: test.title, type: test.type === 'pre' ? 'Pre-test' : 'Post-test',
                                                            wpm: result.wpm, accuracy: result.accuracy,
                                                            score10Point: result.score10Point, isPassed: result.isPassed,
                                                        })} className="text-xs font-bold px-2.5 py-1 rounded-lg text-white shrink-0"
                                                            style={{ background: '#10b981' }}>
                                                            ดูผล
                                                        </button>
                                                    </div>
                                                ))}
                                                {publishedExams.map(({ exam, result }) => result && (
                                                    <div key={exam.examId} className="flex items-center justify-between gap-2 p-2 rounded-lg"
                                                        style={{ background: 'color-mix(in srgb, #10b981 10%, transparent)' }}>
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white bg-orange-500 shrink-0">สอบ</span>
                                                            <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{exam.title}</span>
                                                        </div>
                                                        <button onClick={() => setViewingResult({
                                                            title: exam.title, type: 'การสอบ',
                                                            wpm: result.wpm, accuracy: result.accuracy,
                                                            score10Point: result.score10Point, isPassed: result.isPassed,
                                                        })} className="text-xs font-bold px-2.5 py-1 rounded-lg text-white shrink-0"
                                                            style={{ background: '#10b981' }}>
                                                            ดูผล
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* X6 — Leaderboard WPM รายห้อง */}
                                    {lessons.length > 0 && (
                                        <div className="mb-4">
                                            <button
                                                onClick={() => setLeaderboardOpen(o => !o)}
                                                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80 mb-2"
                                                style={{
                                                    background: leaderboardOpen ? 'var(--color-primary)' : 'var(--color-primary-light)',
                                                    color: leaderboardOpen ? '#fff' : 'var(--color-primary)',
                                                }}>
                                                <Trophy size={12} /> {leaderboardOpen ? 'ซ่อนกระดานอันดับ' : 'ดูกระดานอันดับ'}
                                            </button>

                                            {leaderboardOpen && (
                                                <div className="p-3 rounded-xl" style={{ background: 'var(--color-primary-light)', border: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)' }}>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <select
                                                            value={leaderboardLesson}
                                                            onChange={e => {
                                                                setLeaderboardLesson(e.target.value);
                                                                if (e.target.value && selectedId) fetchLeaderboard(selectedId, e.target.value);
                                                            }}
                                                            className="flex-1 text-xs px-2 py-1.5 rounded-lg cursor-pointer"
                                                            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                                                            <option value="">— เลือกบทเรียน —</option>
                                                            {lessons.map(l => (
                                                                <option key={l.lessonId} value={l.lessonId}>{l.title}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {!leaderboardLesson ? (
                                                        <p className="text-xs text-center py-3" style={{ color: 'var(--color-text-muted)' }}>เลือกบทเรียนเพื่อดูอันดับ</p>
                                                    ) : loadingLeaderboard ? (
                                                        <p className="text-xs text-center py-3" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลด...</p>
                                                    ) : leaderboardData.length === 0 ? (
                                                        <p className="text-xs text-center py-3" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีข้อมูล</p>
                                                    ) : (
                                                        <div className="flex flex-col gap-1">
                                                            {leaderboardData.map((entry, idx) => (
                                                                <div key={entry.member.uid}
                                                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                                                                    style={{ background: idx < 3 ? 'color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))' : 'var(--color-surface)' }}>
                                                                    <span className="text-xs font-bold w-5 text-center shrink-0" style={{
                                                                        color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#a16207' : 'var(--color-text-muted)',
                                                                    }}>
                                                                        {idx + 1}
                                                                    </span>
                                                                    <span className="text-xs flex-1 truncate font-medium" style={{ color: 'var(--color-text)' }}>
                                                                        {entry.member.studentNumber ? `${entry.member.studentNumber}. ` : ''}{entry.member.displayName}
                                                                    </span>
                                                                    <span className="text-xs font-bold shrink-0" style={{ color: 'var(--color-success)' }}>
                                                                        {entry.stats.wpm} WPM
                                                                    </span>
                                                                    <span className="text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                                                                        {entry.stats.accuracy}%
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
                                                const played = s?.playCount ?? 0;
                                                const required = l.requiredPlayCount ?? null;
                                                // U7 — 4 lesson states
                                                const isCompleted  = required !== null && played >= required;
                                                const isInProgress = required !== null && played > 0 && !isCompleted;
                                                const isNotStarted = played === 0;
                                                const cardStyle: React.CSSProperties = isCompleted
                                                    ? { background: 'color-mix(in srgb, var(--color-success) 8%, var(--color-surface))', border: '2px solid color-mix(in srgb, var(--color-success) 40%, transparent)' }
                                                    : isInProgress
                                                    ? { background: 'color-mix(in srgb, var(--color-accent) 8%, var(--color-surface))', border: '1.5px solid color-mix(in srgb, var(--color-accent) 35%, transparent)' }
                                                    : isNotStarted
                                                    ? { background: 'var(--color-surface)', border: '1px solid var(--color-border)' }
                                                    : { background: 'var(--color-primary-light)', border: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)' };
                                                return (
                                                    <div key={l.lessonId} className="relative flex items-start gap-3 p-4 rounded-xl transition-all"
                                                        style={cardStyle}>
                                                        {isCompleted && (
                                                            <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                                                style={{ background: 'color-mix(in srgb, var(--color-success) 15%, transparent)', color: 'var(--color-success)' }}>
                                                                <CheckCircle2 size={10} /> ครบแล้ว
                                                            </span>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-sm pr-16" style={{ color: 'var(--color-text)' }}>{l.title}</h3>
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
                                                                {required && (
                                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                                                                        style={{
                                                                            background: isCompleted
                                                                                ? 'color-mix(in srgb, var(--color-success) 15%, transparent)'
                                                                                : 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                                                                            color: isCompleted ? 'var(--color-success)' : 'var(--color-accent)',
                                                                        }}>
                                                                        ฝึกแล้ว {played}/{required} ครั้ง
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => navigate(`/classroom/${selected.classroomId}/lesson/${l.lessonId}`)}
                                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white shrink-0 transition-all hover:opacity-90"
                                                            style={{ background: isCompleted ? 'var(--color-success)' : isInProgress ? 'var(--color-accent)' : 'var(--color-primary)' }}>
                                                            <Play size={12} /> {isNotStarted ? 'เริ่ม' : isCompleted ? 'ฝึกอีก' : 'ฝึกต่อ'}
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

            {/* S2 — modal แสดงผลของนักเรียน */}
            {viewingResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setViewingResult(null)}>
                    <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
                                    {viewingResult.type}
                                </p>
                                <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                                    {viewingResult.title}
                                </h3>
                            </div>
                            <button onClick={() => setViewingResult(null)}
                                className="p-1.5 rounded-lg transition-all hover:opacity-70"
                                style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                                <X size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                                { label: 'WPM', value: viewingResult.wpm },
                                { label: 'ความแม่นยำ', value: `${viewingResult.accuracy}%` },
                                { label: 'คะแนน', value: `${viewingResult.score10Point}/10` },
                            ].map(({ label, value }) => (
                                <div key={label} className="text-center p-3 rounded-xl"
                                    style={{ background: 'var(--color-primary-light)' }}>
                                    <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>{value}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                                </div>
                            ))}
                        </div>

                        <div className={`text-center py-2 rounded-xl text-sm font-bold ${viewingResult.isPassed ? 'text-emerald-600' : 'text-red-500'}`}
                            style={{
                                background: viewingResult.isPassed
                                    ? 'color-mix(in srgb, #10b981 12%, transparent)'
                                    : 'color-mix(in srgb, #ef4444 12%, transparent)',
                            }}>
                            {viewingResult.isPassed ? '✓ ผ่านเกณฑ์' : '✗ ไม่ผ่านเกณฑ์'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentClassroomPage;
