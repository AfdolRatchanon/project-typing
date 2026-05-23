// src/components/classroom/MemberTable.tsx

import React, { useState, useEffect } from 'react';
import { UserMinus, RefreshCw, Search, Download, Hash, X, ChevronRight, Printer } from 'lucide-react';
import type { ClassroomMember, ClassroomLevelStats, CustomLesson } from '../../types/types';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

interface Props {
    classroomId: string;
    classroomName?: string;
    members: ClassroomMember[];
    lessons: CustomLesson[];
    onRemoveMember: (uid: string) => Promise<void>;
}

type StatsMap = Record<string, Record<string, ClassroomLevelStats>>; // uid → lessonId → stats

const MemberTable: React.FC<Props> = ({ classroomId, classroomName, members, lessons, onRemoveMember }) => {
    const [stats, setStats] = useState<StatsMap>({});
    const [loadingStats, setLoadingStats] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<string>('');
    // H1 — ค้นหา
    const [searchQuery, setSearchQuery] = useState('');
    // Z2 — กำลัง auto-number
    const [autoNumbering, setAutoNumbering] = useState(false);
    // H2 — drill-down member
    const [drillMember, setDrillMember] = useState<ClassroomMember | null>(null);

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

    // Z2 — กำหนดเลขที่อัตโนมัติ (เรียง A-Z → 1, 2, 3...)
    const handleAutoNumber = async () => {
        if (!confirm('กำหนดเลขที่อัตโนมัติตามลำดับชื่อ ก-ฮ?')) return;
        setAutoNumbering(true);
        const sorted = [...members].sort((a, b) =>
            (a.displayName ?? '').localeCompare(b.displayName ?? '', 'th')
        );
        await Promise.all(sorted.map((m, i) =>
            updateDoc(doc(db, 'classrooms', classroomId, 'members', m.uid), { studentNumber: i + 1 })
        ));
        setAutoNumbering(false);
    };

    // P5 — Export member list CSV
    const handleExportCSV = () => {
        const sorted = [...members].sort((a, b) => (a.studentNumber ?? 9999) - (b.studentNumber ?? 9999));
        const rows = [
            ['เลขที่', 'ชื่อ-นามสกุล', 'อีเมล'],
            ...sorted.map(m => [
                String(m.studentNumber ?? ''),
                m.displayName ?? '',
                m.email ?? '',
            ]),
        ];
        const csv = '﻿' + rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `สมาชิก_${classroomId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // H7 — print PDF report
    const handlePrint = () => {
        const sorted = [...members].sort((a, b) => (a.studentNumber ?? 9999) - (b.studentNumber ?? 9999));
        const headerRow = `<tr><th>เลขที่</th><th>ชื่อ</th><th>อีเมล</th>${lessons.map(l => `<th>${l.title}</th>`).join('')}</tr>`;
        const bodyRows = sorted.map(m => {
            const cells = lessons.map(l => {
                const s = stats[m.uid]?.[l.lessonId];
                return s ? `<td>${s.wpm} WPM / ${s.accuracy}% / ${s.score10Point}/10</td>` : '<td>—</td>';
            }).join('');
            return `<tr><td>${m.studentNumber ?? ''}</td><td>${m.displayName ?? ''}</td><td>${m.email ?? ''}</td>${cells}</tr>`;
        }).join('');
        const html = `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>รายงาน ${classroomName ?? classroomId}</title>
<style>body{font-family:sans-serif;font-size:12px;padding:20px}h1{font-size:18px;margin-bottom:4px}p{color:#666;margin-bottom:16px}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 10px;text-align:left}th{background:#f3f4f6;font-weight:600}
tr:nth-child(even){background:#f9fafb}@media print{body{padding:0}}</style>
</head><body><h1>รายงาน: ${classroomName ?? classroomId}</h1>
<p>วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}</p>
<table><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table>
<script>window.onload=function(){window.print();window.close();}<\/script></body></html>`;
        const w = window.open('', '_blank');
        if (w) { w.document.write(html); w.document.close(); }
    };

    // H1 — filter ตาม searchQuery
    const filteredMembers = members.filter(m => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (m.displayName ?? '').toLowerCase().includes(q) ||
               (m.email ?? '').toLowerCase().includes(q);
    });

    if (members.length === 0) {
        return (
            <div className="text-center py-8 rounded-xl" style={{ border: '1px dashed var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีนักเรียนในห้องนี้</p>
            </div>
        );
    }

    return (
        <>
        <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* H1 — ค้นหา */}
                <div className="flex items-center gap-1.5 flex-1 min-w-[140px] rounded-lg px-2 py-1.5"
                    style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                    <Search size={12} style={{ color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="ค้นหาชื่อ / อีเมล"
                        className="flex-1 text-xs bg-transparent outline-none"
                        style={{ color: 'var(--color-text)' }}
                    />
                </div>
                <select
                    value={selectedLesson}
                    onChange={e => setSelectedLesson(e.target.value)}
                    className="text-xs rounded-lg px-2 py-1.5"
                    style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
                    <option value="">— ดูสถิติตามบทเรียน —</option>
                    {lessons.map(l => <option key={l.lessonId} value={l.lessonId}>{l.title}</option>)}
                </select>
                <button onClick={loadStats} disabled={loadingStats}
                    className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
                    <RefreshCw size={12} className={loadingStats ? 'animate-spin' : ''} /> รีเฟรช
                </button>
                {/* Z2 — auto-number */}
                <button onClick={handleAutoNumber} disabled={autoNumbering}
                    className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                    <Hash size={12} /> เลขที่อัตโนมัติ
                </button>
                {/* P5 — export CSV */}
                <button onClick={handleExportCSV}
                    className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                    <Download size={12} /> Export CSV
                </button>
                {/* H7 — print PDF */}
                <button onClick={handlePrint}
                    className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                    <Printer size={12} /> Print PDF
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
                        {[...filteredMembers]
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
                                    <td className="py-2.5 px-3 font-medium text-xs">
                                        <button onClick={() => setDrillMember(m)}
                                            className="flex items-center gap-1 hover:underline text-left"
                                            style={{ color: 'var(--color-primary)' }}>
                                            {m.displayName}
                                            <ChevronRight size={11} />
                                        </button>
                                    </td>
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

            {/* H2 — member drill-down modal */}
            {drillMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setDrillMember(null)}>
                    <div className="w-full max-w-lg rounded-2xl shadow-2xl max-h-[80vh] flex flex-col"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-start justify-between p-4 pb-3"
                            style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <div>
                                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                    สถิติรายบทเรียน
                                </p>
                                <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                                    {drillMember.displayName}
                                </h3>
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{drillMember.email}</p>
                            </div>
                            <button onClick={() => setDrillMember(null)}
                                className="p-1.5 rounded-lg transition-all hover:opacity-70"
                                style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                                <X size={14} />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-4">
                            {lessons.length === 0 ? (
                                <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีบทเรียน</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {lessons.map(l => {
                                        const s = stats[drillMember.uid]?.[l.lessonId];
                                        return (
                                            <div key={l.lessonId} className="flex items-center justify-between gap-3 p-3 rounded-xl"
                                                style={{
                                                    background: s ? 'color-mix(in srgb, var(--color-success) 6%, var(--color-surface))' : 'var(--color-primary-light)',
                                                    border: `1px solid ${s ? 'color-mix(in srgb, var(--color-success) 25%, transparent)' : 'var(--color-border)'}`,
                                                }}>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{l.title}</p>
                                                    {s && (
                                                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                                            เล่น {s.playCount} ครั้ง
                                                        </p>
                                                    )}
                                                </div>
                                                {s ? (
                                                    <div className="flex items-center gap-3 shrink-0 text-xs">
                                                        <span className="font-bold" style={{ color: 'var(--color-success)' }}>{s.wpm} WPM</span>
                                                        <span style={{ color: 'var(--color-accent)' }}>{s.accuracy}%</span>
                                                        <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{s.score10Point}/10</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>ยังไม่ได้ฝึก</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MemberTable;
