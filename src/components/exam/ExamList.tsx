// src/components/exam/ExamList.tsx

import React, { useState, useEffect } from 'react';
import { PlusCircle, FileText, X } from 'lucide-react';
import type { Exam, ExamResult, ClassroomMember, ScorePolicy } from '../../types/types';
import { useExam } from '../../hooks/useExam';
import ExamCard from './ExamCard';
import ExamCreate from './ExamCreate';

interface Props {
    classroomId: string;
    teacherUid: string;
    members: ClassroomMember[];
}

const scorePolicyLabel: Record<ScorePolicy, string> = {
    best: 'คะแนนสูงสุด',
    last: 'คะแนนครั้งหลัง',
    average: 'คะแนนเฉลี่ย',
};

const ExamList: React.FC<Props> = ({ classroomId, teacherUid, members }) => {
    const {
        exams, loading,
        createExam, updateExam, deleteExam, toggleOpen, publishResults,
        getExamResults,
    } = useExam(classroomId);

    const [showCreate, setShowCreate] = useState(false);
    const [editExam, setEditExam] = useState<Exam | null>(null);
    const [resultCounts, setResultCounts] = useState<Record<string, number>>({});
    const [viewExam, setViewExam] = useState<Exam | null>(null);
    const [viewResults, setViewResults] = useState<Record<string, ExamResult>>({});
    const [loadingResults, setLoadingResults] = useState(false);

    useEffect(() => {
        if (exams.length === 0) return;
        (async () => {
            const counts: Record<string, number> = {};
            await Promise.all(exams.map(async e => {
                const r = await getExamResults(e.examId);
                counts[e.examId] = Object.keys(r).length;
            }));
            setResultCounts(counts);
        })();
    }, [exams.map(e => e.examId).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleViewResults = async (exam: Exam) => {
        setViewExam(exam);
        setLoadingResults(true);
        const r = await getExamResults(exam.examId);
        setViewResults(r);
        setLoadingResults(false);
    };

    const memberByUid = Object.fromEntries(members.map(m => [m.uid, m]));

    if (loading) {
        return <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลด...</p>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>การสอบ</h3>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                    style={{ background: 'var(--color-primary)' }}>
                    <PlusCircle size={13} /> สร้างการสอบ
                </button>
            </div>

            {exams.length === 0 ? (
                <div className="text-center py-8 rounded-xl" style={{ border: '1px dashed var(--color-border)' }}>
                    <FileText size={28} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีการสอบในห้องนี้</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        กด "สร้างการสอบ" เพื่อสร้างข้อสอบใหม่
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {exams.map(e => (
                        <ExamCard
                            key={e.examId}
                            exam={e}
                            resultCount={resultCounts[e.examId] ?? 0}
                            onToggleOpen={toggleOpen}
                            onEdit={setEditExam}
                            onDelete={deleteExam}
                            onViewResults={handleViewResults}
                        />
                    ))}
                </div>
            )}

            {/* Create / Edit modal */}
            {(showCreate || editExam) && (
                <ExamCreate
                    classroomId={classroomId}
                    teacherUid={teacherUid}
                    initial={editExam || undefined}
                    onClose={() => { setShowCreate(false); setEditExam(null); }}
                    onSave={async (data) => {
                        if (editExam) {
                            await updateExam(editExam.examId, data);
                        } else {
                            await createExam(data);
                        }
                    }}
                />
            )}

            {/* Results modal */}
            {viewExam && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
                        style={{
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            maxHeight: '82vh',
                        }}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <div>
                                <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>ผลการสอบ</h3>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                    {viewExam.title} · {scorePolicyLabel[viewExam.scorePolicy]}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!viewExam.isResultPublished && (
                                    <button
                                        onClick={async () => {
                                            await publishResults(viewExam.examId);
                                            setViewExam({ ...viewExam, isResultPublished: true });
                                        }}
                                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80"
                                        style={{ background: 'color-mix(in srgb, var(--color-success) 12%, transparent)', color: 'var(--color-success)' }}>
                                        เผยแพร่ผลให้นักเรียน
                                    </button>
                                )}
                                <button onClick={() => setViewExam(null)} style={{ color: 'var(--color-text-muted)' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto p-4">
                            {loadingResults ? (
                                <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลด...</p>
                            ) : Object.keys(viewResults).length === 0 ? (
                                <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีนักเรียนส่งผลสอบ</p>
                            ) : (
                                <>
                                    {/* Summary */}
                                    {(() => {
                                        const results = Object.values(viewResults);
                                        const passCount = results.filter(r => r.isPassed).length;
                                        const avgWPM = Math.round(results.reduce((s, r) => s + r.wpm, 0) / results.length);
                                        const avgScore = (results.reduce((s, r) => s + r.score10Point, 0) / results.length).toFixed(1);
                                        return (
                                            <div className="flex gap-3 mb-3 flex-wrap">
                                                {[
                                                    { label: 'ส่งผลแล้ว', value: `${results.length} คน`, color: 'var(--color-text)' },
                                                    { label: 'ผ่าน', value: `${passCount}/${results.length}`, color: 'var(--color-success)' },
                                                    { label: 'avg WPM', value: String(avgWPM), color: 'var(--color-accent)' },
                                                    { label: 'avg คะแนน', value: `${avgScore}/10`, color: 'var(--color-primary)' },
                                                ].map(({ label, value, color }) => (
                                                    <div key={label} className="flex-1 min-w-[80px] p-2 rounded-lg text-center" style={{ background: 'var(--color-primary-light)' }}>
                                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                                                        <p className="text-base font-bold" style={{ color }}>{value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}

                                    {/* Grade distribution */}
                                    {(() => {
                                        const results = Object.values(viewResults);
                                        const dist: Record<string, number> = {};
                                        results.forEach(r => { dist[r.grade] = (dist[r.grade] || 0) + 1; });
                                        const grades = Object.entries(dist).sort((a, b) => b[1] - a[1]);
                                        if (grades.length === 0) return null;
                                        return (
                                            <div className="mb-3 p-3 rounded-xl flex flex-wrap gap-2" style={{ background: 'var(--color-primary-light)' }}>
                                                <span className="text-xs font-semibold w-full" style={{ color: 'var(--color-text-muted)' }}>
                                                    การกระจายเกรด
                                                </span>
                                                {grades.map(([grade, count]) => (
                                                    <span key={grade} className="text-xs px-2.5 py-1 rounded-full font-bold"
                                                        style={{ background: 'var(--color-surface)', color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}>
                                                        {grade}: {count} คน
                                                    </span>
                                                ))}
                                            </div>
                                        );
                                    })()}

                                    {/* Table sorted by score desc (ranking) */}
                                    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--color-border)' }}>
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>อันดับ</th>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>เลขที่</th>
                                                    <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-text)' }}>ชื่อ</th>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>ชุด</th>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-success)' }}>WPM</th>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>แม่นยำ</th>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>คะแนน</th>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold">ผล</th>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>ครั้ง</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(viewResults)
                                                    .sort(([, a], [, b]) => b.score10Point - a.score10Point || b.wpm - a.wpm)
                                                    .map(([uid, r], idx) => {
                                                        const m = memberByUid[uid];
                                                        return (
                                                            <tr key={uid} style={{ borderTop: '1px solid var(--color-border)' }}>
                                                                <td className="py-2 px-3 text-xs text-center font-bold" style={{
                                                                    color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#a16207' : 'var(--color-text-muted)',
                                                                }}>
                                                                    {idx + 1}
                                                                </td>
                                                                <td className="py-2 px-3 text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                                                                    {m?.studentNumber ?? '—'}
                                                                </td>
                                                                <td className="py-2 px-3 text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                                                                    {m?.displayName ?? uid.slice(0, 8)}
                                                                </td>
                                                                <td className="py-2 px-3 text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                                                                    {r.assignedSet}
                                                                </td>
                                                                <td className="py-2 px-3 text-xs text-center font-bold" style={{ color: 'var(--color-success)' }}>
                                                                    {r.wpm}
                                                                </td>
                                                                <td className="py-2 px-3 text-xs text-center" style={{ color: 'var(--color-accent)' }}>
                                                                    {r.accuracy}%
                                                                </td>
                                                                <td className="py-2 px-3 text-xs text-center font-bold" style={{ color: 'var(--color-primary)' }}>
                                                                    {r.score10Point}/10
                                                                </td>
                                                                <td className="py-2 px-3 text-xs text-center font-medium" style={{
                                                                    color: r.isPassed ? 'var(--color-success)' : 'var(--color-error)',
                                                                }}>
                                                                    {r.isPassed ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
                                                                </td>
                                                                <td className="py-2 px-3 text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                                                                    {r.attemptCount}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamList;
