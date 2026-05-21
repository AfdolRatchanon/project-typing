// src/components/dashboard/TeacherDashboard.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, BookOpen, BarChart2, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import type { Classroom, ClassroomMember, CustomLesson, ClassroomLevelStats } from '../../types/types';
import type { User as FirebaseUser } from 'firebase/auth';

interface Props {
    user: FirebaseUser | null;
    setShowTeacherDashboard: () => void;
}

interface ClassroomStats {
    classroom: Classroom;
    members: ClassroomMember[];
    lessons: CustomLesson[];
    memberStats: Record<string, Record<string, ClassroomLevelStats>>; // uid → lessonId → stats
}

const TeacherDashboard: React.FC<Props> = ({ user, setShowTeacherDashboard }) => {
    const [data, setData] = useState<ClassroomStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        (async () => {
            // Load all classrooms created by this teacher
            const classSnap = await getDocs(collection(db, 'classrooms'));
            const classrooms = classSnap.docs
                .map(d => d.data() as Classroom)
                .filter(c => c.teacherUid === user.uid);

            const results: ClassroomStats[] = await Promise.all(
                classrooms.map(async (classroom) => {
                    const cid = classroom.classroomId;

                    const [memberSnap, lessonSnap] = await Promise.all([
                        getDocs(collection(db, 'classrooms', cid, 'members')),
                        getDocs(collection(db, 'classrooms', cid, 'lessons')),
                    ]);

                    const members = memberSnap.docs.map(d => d.data() as ClassroomMember);
                    const lessons = lessonSnap.docs.map(d => d.data() as CustomLesson);
                    const students = members.filter(m => m.role === 'student');

                    // Load classroomStats per student per lesson
                    const memberStats: Record<string, Record<string, ClassroomLevelStats>> = {};
                    await Promise.all(students.map(async (m) => {
                        memberStats[m.uid] = {};
                        await Promise.all(lessons.map(async (l) => {
                            const snap = await getDoc(
                                doc(db, 'users', m.uid, 'classroomStats', `${cid}_${l.lessonId}`)
                            );
                            if (snap.exists()) memberStats[m.uid][l.lessonId] = snap.data() as ClassroomLevelStats;
                        }));
                    }));

                    return { classroom, members, lessons, memberStats };
                })
            );

            results.sort((a, b) => b.classroom.createdAt - a.classroom.createdAt);
            setData(results);
            setLoading(false);
        })();
    }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

    const getClassroomSummary = (cs: ClassroomStats) => {
        const students = cs.members.filter(m => m.role === 'student');
        if (students.length === 0 || cs.lessons.length === 0) {
            return { avgWpm: null, completionPct: null };
        }

        let totalWpm = 0;
        let wpmCount = 0;
        let fullyCompletedStudents = 0;

        students.forEach(m => {
            const stats = cs.memberStats[m.uid] ?? {};
            let completedAll = true;
            cs.lessons.forEach(l => {
                const s = stats[l.lessonId];
                if (s) {
                    totalWpm += s.wpm;
                    wpmCount++;
                } else {
                    completedAll = false;
                }
                const required = l.requiredPlayCount ?? 1;
                if (!s || s.playCount < required) completedAll = false;
            });
            if (completedAll) fullyCompletedStudents++;
        });

        return {
            avgWpm: wpmCount > 0 ? Math.round(totalWpm / wpmCount) : null,
            completionPct: Math.round((fullyCompletedStudents / students.length) * 100),
        };
    };

    return (
        <div className="min-h-screen app-bg p-3 sm:p-5">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <button onClick={setShowTeacherDashboard}
                        className="p-2 rounded-lg transition-all hover:opacity-80"
                        style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                            ภาพรวมห้องเรียน
                        </h1>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                            {user?.displayName}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <p className="text-sm text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
                        กำลังโหลด...
                    </p>
                ) : data.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl" style={{ border: '1px dashed var(--color-border)' }}>
                        <BookOpen size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีห้องเรียน</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {data.map(cs => {
                            const students = cs.members.filter(m => m.role === 'student');
                            const summary = getClassroomSummary(cs);
                            const isOpen = expanded === cs.classroom.classroomId;

                            return (
                                <div key={cs.classroom.classroomId} className="rounded-2xl overflow-hidden"
                                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                    {/* Classroom header */}
                                    <button
                                        className="w-full text-left p-4 flex items-center justify-between gap-3 transition-all hover:opacity-90"
                                        onClick={() => setExpanded(isOpen ? null : cs.classroom.classroomId)}>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                                                {cs.classroom.name}
                                            </h3>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                                {cs.classroom.subject} · {cs.classroom.gradeLevel} · ภาค {cs.classroom.semester}/{cs.classroom.academicYear}
                                            </p>
                                        </div>

                                        {/* Quick stats */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                <Users size={12} /> {students.length}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                <BookOpen size={12} /> {cs.lessons.length}
                                            </div>
                                            {summary.avgWpm !== null && (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: 'color-mix(in srgb, var(--color-success) 12%, transparent)', color: 'var(--color-success)' }}>
                                                    {summary.avgWpm} WPM
                                                </span>
                                            )}
                                            {summary.completionPct !== null && (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}>
                                                    {summary.completionPct}%
                                                </span>
                                            )}
                                            {isOpen ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} />
                                                : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
                                        </div>
                                    </button>

                                    {/* Expanded: member progress table */}
                                    {isOpen && (
                                        <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                                            {students.length === 0 ? (
                                                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                                                    ยังไม่มีนักเรียน
                                                </p>
                                            ) : cs.lessons.length === 0 ? (
                                                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                                                    ยังไม่มีบทเรียน
                                                </p>
                                            ) : (
                                                <div className="mt-3 overflow-x-auto rounded-xl" style={{ border: '1px solid var(--color-border)' }}>
                                                    <table className="min-w-full text-xs">
                                                        <thead>
                                                            <tr style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                                                                <th className="text-center py-2 px-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>เลขที่</th>
                                                                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text)' }}>ชื่อ</th>
                                                                {cs.lessons.map(l => (
                                                                    <th key={l.lessonId} className="text-center py-2 px-3 font-semibold max-w-[80px]"
                                                                        style={{ color: 'var(--color-primary)' }}>
                                                                        <span className="truncate block max-w-[72px]" title={l.title}>{l.title}</span>
                                                                    </th>
                                                                ))}
                                                                <th className="text-center py-2 px-3 font-semibold" style={{ color: 'var(--color-accent)' }}>
                                                                    <BarChart2 size={12} className="mx-auto" />
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {students
                                                                .sort((a, b) => (a.studentNumber ?? 9999) - (b.studentNumber ?? 9999))
                                                                .map(m => {
                                                                    const stats = cs.memberStats[m.uid] ?? {};
                                                                    let wpmSum = 0, wpmCount = 0;
                                                                    return (
                                                                        <tr key={m.uid} style={{ borderTop: '1px solid var(--color-border)' }}>
                                                                            <td className="py-2 px-3 text-center" style={{ color: 'var(--color-text-muted)' }}>
                                                                                {m.studentNumber ?? '—'}
                                                                            </td>
                                                                            <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-text)' }}>
                                                                                {m.displayName}
                                                                            </td>
                                                                            {cs.lessons.map(l => {
                                                                                const s = stats[l.lessonId];
                                                                                const required = l.requiredPlayCount ?? 1;
                                                                                const played = s?.playCount ?? 0;
                                                                                const done = played >= required;
                                                                                if (s) { wpmSum += s.wpm; wpmCount++; }
                                                                                return (
                                                                                    <td key={l.lessonId} className="py-2 px-3 text-center">
                                                                                        {s ? (
                                                                                            <div>
                                                                                                <span className="font-bold" style={{ color: done ? 'var(--color-success)' : 'var(--color-accent)' }}>
                                                                                                    {s.wpm}
                                                                                                </span>
                                                                                                <span className="ml-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                                                                                    ({played}/{required})
                                                                                                </span>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                                                                                        )}
                                                                                    </td>
                                                                                );
                                                                            })}
                                                                            {/* avg WPM */}
                                                                            <td className="py-2 px-3 text-center font-bold" style={{ color: 'var(--color-accent)' }}>
                                                                                {wpmCount > 0 ? Math.round(wpmSum / wpmCount) : '—'}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
                                                แต่ละช่อง: WPM (ฝึกแล้ว/ต้องฝึก) · สีเขียว = ครบตามกำหนด
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Summary row */}
                {!loading && data.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        {[
                            { label: 'ห้องเรียนทั้งหมด', value: data.length, icon: <ClipboardList size={16} /> },
                            { label: 'นักเรียนทั้งหมด', value: data.reduce((s, cs) => s + cs.members.filter(m => m.role === 'student').length, 0), icon: <Users size={16} /> },
                            { label: 'บทเรียนทั้งหมด', value: data.reduce((s, cs) => s + cs.lessons.length, 0), icon: <BookOpen size={16} /> },
                        ].map(({ label, value, icon }) => (
                            <div key={label} className="p-3 rounded-xl text-center"
                                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                <div className="flex justify-center mb-1" style={{ color: 'var(--color-primary)' }}>{icon}</div>
                                <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{value}</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
