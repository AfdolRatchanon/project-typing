// src/components/prepost/PrePostTestList.tsx

import React, { useState, useEffect } from 'react';
import { PlusCircle, ClipboardList, X, ArrowRightLeft } from 'lucide-react';
import type { PrePostTest, ClassroomMember, PrePostTestResult } from '../../types/types';
import { usePrePostTest } from '../../hooks/usePrePostTest';
import PrePostTestCard from './PrePostTestCard';
import PrePostTestCreate from './PrePostTestCreate';

interface Props {
    classroomId: string;
    teacherUid: string;
    members: ClassroomMember[];
}

const PrePostTestList: React.FC<Props> = ({ classroomId, teacherUid, members }) => {
    const {
        tests, loading,
        createTest, updateTest, deleteTest, toggleOpen, publishResults,
        getTestResults,
    } = usePrePostTest(classroomId);

    const [showCreate, setShowCreate] = useState(false);
    const [editTest, setEditTest] = useState<PrePostTest | null>(null);
    const [resultCounts, setResultCounts] = useState<Record<string, number>>({});
    const [viewResultsTest, setViewResultsTest] = useState<PrePostTest | null>(null);
    const [viewResults, setViewResults] = useState<Record<string, PrePostTestResult>>({});
    const [loadingResults, setLoadingResults] = useState(false);
    // R1 — Pre/Post comparison
    const [activeTab, setActiveTab] = useState<'list' | 'compare'>('list');
    type ComparisonPair = {
        pairId: string;
        preTest: PrePostTest | null;
        postTest: PrePostTest | null;
        rows: { uid: string; preResult: PrePostTestResult | null; postResult: PrePostTestResult | null }[];
    };
    const [comparisons, setComparisons] = useState<ComparisonPair[]>([]);
    const [loadingComparison, setLoadingComparison] = useState(false);

    // โหลดจำนวนผลทุกครั้งที่รายการเปลี่ยน
    useEffect(() => {
        if (tests.length === 0) return;
        (async () => {
            const counts: Record<string, number> = {};
            await Promise.all(tests.map(async t => {
                const r = await getTestResults(t.testId);
                counts[t.testId] = Object.keys(r).length;
            }));
            setResultCounts(counts);
        })();
    }, [tests.map(t => t.testId).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleViewResults = async (test: PrePostTest) => {
        setViewResultsTest(test);
        setLoadingResults(true);
        const r = await getTestResults(test.testId);
        setViewResults(r);
        setLoadingResults(false);
    };

    const memberByUid = Object.fromEntries(members.map(m => [m.uid, m]));

    // R1 — pairs that share the same pairId
    const pairedPairIds = Array.from(new Set(
        tests.filter(t => t.pairId).map(t => t.pairId as string)
    )).filter(pid => tests.filter(t => t.pairId === pid).length >= 2);

    useEffect(() => {
        if (activeTab !== 'compare' || pairedPairIds.length === 0) return;
        setLoadingComparison(true);
        (async () => {
            const allUids = Array.from(new Set(members.map(m => m.uid)));
            const pairs: ComparisonPair[] = await Promise.all(pairedPairIds.map(async (pid) => {
                const preTest = tests.find(t => t.pairId === pid && t.type === 'pre') ?? null;
                const postTest = tests.find(t => t.pairId === pid && t.type === 'post') ?? null;
                const [preAll, postAll] = await Promise.all([
                    preTest ? getTestResults(preTest.testId) : Promise.resolve({}),
                    postTest ? getTestResults(postTest.testId) : Promise.resolve({}),
                ]);
                const rows = allUids
                    .filter(uid => preAll[uid] || postAll[uid])
                    .map(uid => ({ uid, preResult: preAll[uid] ?? null, postResult: postAll[uid] ?? null }));
                return { pairId: pid, preTest, postTest, rows };
            }));
            setComparisons(pairs);
            setLoadingComparison(false);
        })();
    }, [activeTab, pairedPairIds.join(','), tests.map(t => t.testId).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                กำลังโหลด...
            </p>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                        การทดสอบ Pre/Post
                    </h3>
                    {pairedPairIds.length > 0 && (
                        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--color-border)' }}>
                            <button
                                onClick={() => setActiveTab('list')}
                                className="text-xs px-2.5 py-1 rounded-md font-medium transition-all"
                                style={activeTab === 'list'
                                    ? { background: 'var(--color-surface)', color: 'var(--color-primary)', fontWeight: 700 }
                                    : { color: 'var(--color-text-muted)' }}>
                                รายการ
                            </button>
                            <button
                                onClick={() => setActiveTab('compare')}
                                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium transition-all"
                                style={activeTab === 'compare'
                                    ? { background: 'var(--color-surface)', color: 'var(--color-primary)', fontWeight: 700 }
                                    : { color: 'var(--color-text-muted)' }}>
                                <ArrowRightLeft size={11} /> Pre/Post
                            </button>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                    style={{ background: 'var(--color-primary)' }}>
                    <PlusCircle size={13} /> สร้างการทดสอบ
                </button>
            </div>

            {/* R1 — Comparison tab */}
            {activeTab === 'compare' && (
                <div>
                    {loadingComparison ? (
                        <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลด...</p>
                    ) : comparisons.length === 0 ? (
                        <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีคู่ Pre/Post ที่จับคู่กัน</p>
                    ) : comparisons.map(({ pairId, preTest, postTest, rows }) => (
                        <div key={pairId} className="mb-6">
                            <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                คู่: {preTest?.title ?? '—'} → {postTest?.title ?? '—'}
                            </p>
                            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--color-border)' }}>
                                <table className="min-w-full text-xs">
                                    <thead>
                                        <tr style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                                            {['เลขที่', 'ชื่อ', 'Pre WPM', 'Post WPM', 'Δ WPM', 'Pre คะแนน', 'Post คะแนน', 'ผ่าน Post'].map(h => (
                                                <th key={h} className="py-2 px-3 font-semibold text-center" style={{ color: 'var(--color-text)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows
                                            .sort((a, b) => (memberByUid[a.uid]?.studentNumber ?? 9999) - (memberByUid[b.uid]?.studentNumber ?? 9999))
                                            .map(({ uid, preResult, postResult }) => {
                                                const m = memberByUid[uid];
                                                const delta = preResult && postResult ? postResult.wpm - preResult.wpm : null;
                                                return (
                                                    <tr key={uid} style={{ borderTop: '1px solid var(--color-border)' }}>
                                                        <td className="py-2 px-3 text-center" style={{ color: 'var(--color-text-muted)' }}>{m?.studentNumber ?? '—'}</td>
                                                        <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-text)' }}>{m?.displayName ?? uid.slice(0, 8)}</td>
                                                        <td className="py-2 px-3 text-center" style={{ color: 'var(--color-text-muted)' }}>{preResult?.wpm ?? '—'}</td>
                                                        <td className="py-2 px-3 text-center font-bold" style={{ color: 'var(--color-success)' }}>{postResult?.wpm ?? '—'}</td>
                                                        <td className="py-2 px-3 text-center font-bold" style={{
                                                            color: delta === null ? 'var(--color-text-muted)' : delta >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                                                        }}>
                                                            {delta === null ? '—' : (delta >= 0 ? `+${delta}` : String(delta))}
                                                        </td>
                                                        <td className="py-2 px-3 text-center" style={{ color: 'var(--color-text-muted)' }}>{preResult ? `${preResult.score10Point}/10` : '—'}</td>
                                                        <td className="py-2 px-3 text-center font-bold" style={{ color: 'var(--color-primary)' }}>{postResult ? `${postResult.score10Point}/10` : '—'}</td>
                                                        <td className="py-2 px-3 text-center font-medium" style={{ color: postResult?.isPassed ? 'var(--color-success)' : 'var(--color-error)' }}>
                                                            {postResult ? (postResult.isPassed ? '✓ ผ่าน' : '✗ ไม่ผ่าน') : '—'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'list' && (
                tests.length === 0 ? (
                    <div className="text-center py-8 rounded-xl" style={{ border: '1px dashed var(--color-border)' }}>
                        <ClipboardList size={28} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีการทดสอบในห้องนี้</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            กด "สร้างการทดสอบ" เพื่อเพิ่ม Pre-test หรือ Post-test
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {tests.map(t => (
                            <PrePostTestCard
                                key={t.testId}
                                test={t}
                                resultCount={resultCounts[t.testId] ?? 0}
                                onToggleOpen={toggleOpen}
                                onEdit={setEditTest}
                                onDelete={deleteTest}
                                onViewResults={handleViewResults}
                            />
                        ))}
                    </div>
                )
            )}

            {/* Create / Edit modal */}
            {(showCreate || editTest) && (
                <PrePostTestCreate
                    classroomId={classroomId}
                    teacherUid={teacherUid}
                    existingTests={tests}
                    initial={editTest || undefined}
                    onClose={() => { setShowCreate(false); setEditTest(null); }}
                    onSave={async (data) => {
                        if (editTest) {
                            await updateTest(editTest.testId, data);
                        } else {
                            await createTest(data);
                        }
                    }}
                />
            )}

            {/* Results modal */}
            {viewResultsTest && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
                        style={{
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            maxHeight: '82vh',
                        }}>
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <div>
                                <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                                    ผลการทดสอบ
                                </h3>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                    {viewResultsTest.title}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!viewResultsTest.isResultPublished && (
                                    <button
                                        onClick={async () => {
                                            await publishResults(viewResultsTest.testId);
                                            setViewResultsTest({ ...viewResultsTest, isResultPublished: true });
                                        }}
                                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80"
                                        style={{ background: 'color-mix(in srgb, var(--color-success) 12%, transparent)', color: 'var(--color-success)' }}>
                                        เผยแพร่ผลให้นักเรียน
                                    </button>
                                )}
                                <button onClick={() => setViewResultsTest(null)} style={{ color: 'var(--color-text-muted)' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Modal body */}
                        <div className="overflow-y-auto p-4">
                            {loadingResults ? (
                                <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                                    กำลังโหลด...
                                </p>
                            ) : Object.keys(viewResults).length === 0 ? (
                                <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                                    ยังไม่มีนักเรียนส่งผลสอบ
                                </p>
                            ) : (
                                <>
                                    {/* Summary row */}
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

                                    {/* Table */}
                                    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--color-border)' }}>
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-text)' }}>เลขที่</th>
                                                    <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-text)' }}>ชื่อ</th>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>ชุด</th>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-success)' }}>WPM</th>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>แม่นยำ</th>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>คะแนน</th>
                                                    <th className="text-center py-2 px-3 text-xs font-semibold">ผล</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(viewResults)
                                                    .sort(([uidA], [uidB]) => {
                                                        const na = memberByUid[uidA]?.studentNumber ?? 9999;
                                                        const nb = memberByUid[uidB]?.studentNumber ?? 9999;
                                                        return na - nb;
                                                    })
                                                    .map(([uid, r]) => {
                                                        const m = memberByUid[uid];
                                                        return (
                                                            <tr key={uid} style={{ borderTop: '1px solid var(--color-border)' }}>
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

export default PrePostTestList;
