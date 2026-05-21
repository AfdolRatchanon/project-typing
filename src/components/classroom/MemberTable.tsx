// src/components/classroom/MemberTable.tsx

import React, { useState, useEffect } from 'react';
import { UserMinus, RefreshCw } from 'lucide-react';
import type { ClassroomMember, ClassroomLevelStats, CustomLesson } from '../../types/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

interface Props {
    classroomId: string;
    members: ClassroomMember[];
    lessons: CustomLesson[];
    onRemoveMember: (uid: string) => Promise<void>;
}

type StatsMap = Record<string, Record<string, ClassroomLevelStats>>; // uid → lessonId → stats

const MemberTable: React.FC<Props> = ({ classroomId, members, lessons, onRemoveMember }) => {
    const [stats, setStats] = useState<StatsMap>({});
    const [loadingStats, setLoadingStats] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<string>('');

    const loadStats = async () => {
        setLoadingStats(true);
        const result: StatsMap = {};
        await Promise.all(members.map(async (m) => {
            const snap = await getDocs(collection(db, 'users', m.uid, 'classroomStats'));
            snap.forEach(d => {
                const data = d.data() as ClassroomLevelStats;
                if (data.classroomId === classroomId) {
                    if (!result[m.uid]) result[m.uid] = {};
                    result[m.uid][data.lessonId] = data;
                }
            });
        }));
        setStats(result);
        setLoadingStats(false);
    };

    useEffect(() => {
        if (members.length > 0) loadStats();
    }, [classroomId, members.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const getStatForMember = (uid: string): ClassroomLevelStats | null => {
        if (!selectedLesson) return null;
        return stats[uid]?.[selectedLesson] || null;
    };

    if (members.length === 0) {
        return (
            <div className="text-center py-8 rounded-xl" style={{ border: '1px dashed var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีนักเรียนในห้องนี้</p>
            </div>
        );
    }

    return (
        <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <select
                        value={selectedLesson}
                        onChange={e => setSelectedLesson(e.target.value)}
                        className="text-xs rounded-lg px-2 py-1.5"
                        style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
                        <option value="">— ดูสถิติตามบทเรียน —</option>
                        {lessons.map(l => <option key={l.lessonId} value={l.lessonId}>{l.title}</option>)}
                    </select>
                </div>
                <button onClick={loadStats} disabled={loadingStats}
                    className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
                    <RefreshCw size={12} className={loadingStats ? 'animate-spin' : ''} /> รีเฟรช
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--color-border)' }}>
                <table className="min-w-full text-sm">
                    <thead>
                        <tr style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                            <th className="text-center py-2.5 px-3 text-xs font-semibold" style={{ color: 'var(--color-text)' }}>เลขที่</th>
                            <th className="text-left py-2.5 px-3 text-xs font-semibold" style={{ color: 'var(--color-text)' }}>ชื่อ</th>
                            <th className="text-left py-2.5 px-3 text-xs font-semibold hidden md:table-cell" style={{ color: 'var(--color-text)' }}>อีเมล</th>
                            {selectedLesson && <>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold" style={{ color: 'var(--color-success)' }}>WPM</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>แม่นยำ</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>คะแนน</th>
                                <th className="text-center py-2.5 px-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>ครั้ง</th>
                            </>}
                            <th className="py-2.5 px-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...members]
                            .sort((a, b) => (a.studentNumber ?? 9999) - (b.studentNumber ?? 9999))
                            .map((m, i) => {
                            const s = getStatForMember(m.uid);
                            return (
                                <tr key={m.uid} className="transition-colors"
                                    style={{ borderTop: '1px solid var(--color-border)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                                    <td className="py-2.5 px-3 text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                                        {m.studentNumber ?? i + 1}
                                    </td>
                                    <td className="py-2.5 px-3 font-medium text-xs" style={{ color: 'var(--color-text)' }}>{m.displayName}</td>
                                    <td className="py-2.5 px-3 text-xs hidden md:table-cell" style={{ color: 'var(--color-text-muted)' }}>{m.email}</td>
                                    {selectedLesson && <>
                                        <td className="py-2.5 px-3 text-center text-xs font-bold" style={{ color: s ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                            {s ? s.wpm : '—'}
                                        </td>
                                        <td className="py-2.5 px-3 text-center text-xs" style={{ color: s ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                                            {s ? `${s.accuracy}%` : '—'}
                                        </td>
                                        <td className="py-2.5 px-3 text-center text-xs font-bold" style={{ color: s ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                                            {s ? `${s.score10Point}/10` : '—'}
                                        </td>
                                        <td className="py-2.5 px-3 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                            {s ? s.playCount : '—'}
                                        </td>
                                    </>}
                                    <td className="py-2.5 px-3 text-right">
                                        <button onClick={() => { if (confirm(`นำ ${m.displayName} ออกจากห้อง?`)) onRemoveMember(m.uid); }}
                                            className="p-1 rounded-md hover:opacity-80 transition-all"
                                            style={{ color: 'var(--color-error)' }}>
                                            <UserMinus size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MemberTable;
