// src/components/survey/SurveyResultsDashboard.tsx

import React from 'react';
import { X } from 'lucide-react';
import type { Survey, SurveySummary } from '../../types/types';
import { interpretLikert } from '../../utils/researchExport';

interface Props {
    survey: Survey;
    summary: SurveySummary;
    onClose: () => void;
}

const DIM_LABELS: Record<string, string> = {
    content: 'ด้านเนื้อหา',
    design: 'ด้านการออกแบบ',
    benefit: 'ด้านประโยชน์',
};

const MeanBar: React.FC<{ mean: number }> = ({ mean }) => (
    <div className="flex items-center gap-2">
        <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: 'var(--color-border)' }}>
            <div
                className="h-full rounded-full"
                style={{
                    width: `${(mean / 5) * 100}%`,
                    background: 'var(--color-primary)',
                }}
            />
        </div>
        <span className="text-xs font-bold w-8 text-right" style={{ color: 'var(--color-primary)' }}>
            {mean.toFixed(2)}
        </span>
    </div>
);

const SurveyResultsDashboard: React.FC<Props> = ({ survey, summary, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
                style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    maxHeight: '86vh',
                }}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-3"
                    style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                        <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                            ผลแบบสอบถาม
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                            {survey.title} · ตอบแล้ว {summary.totalResponses} คน
                        </p>
                    </div>
                    <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 flex flex-col gap-4">
                    {summary.totalResponses === 0 ? (
                        <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                            ยังไม่มีคำตอบ
                        </p>
                    ) : (
                        <>
                            {/* Dimension summary */}
                            <div>
                                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                    สรุปรายด้าน
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                                    {(['content', 'design', 'benefit'] as const).map(dim => {
                                        const mean = summary.dimensionMeans[dim];
                                        return (
                                            <div key={dim} className="p-3 rounded-xl text-center"
                                                style={{ background: 'var(--color-primary-light)' }}>
                                                <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                                                    {DIM_LABELS[dim]}
                                                </p>
                                                <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                                    {mean.toFixed(2)}
                                                </p>
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                                    {interpretLikert(mean)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-3 rounded-xl text-center"
                                    style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
                                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>ค่าเฉลี่ยรวม</p>
                                    <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                        {summary.overallMean.toFixed(2)}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                        {interpretLikert(summary.overallMean)} / 5.00
                                    </p>
                                </div>
                            </div>

                            {/* Per-question breakdown */}
                            <div>
                                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                    ค่าเฉลี่ยรายข้อ
                                </p>
                                <div className="flex flex-col gap-2">
                                    {survey.questions.map(q => (
                                        <div key={q.questionId} className="flex flex-col gap-1 p-2.5 rounded-lg"
                                            style={{ background: 'var(--color-primary-light)' }}>
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs font-bold shrink-0"
                                                    style={{ color: 'var(--color-primary)' }}>
                                                    {q.order}.
                                                </span>
                                                <span className="text-xs flex-1" style={{ color: 'var(--color-text)' }}>
                                                    {q.text}
                                                </span>
                                            </div>
                                            <MeanBar mean={summary.questionMeans[q.questionId] ?? 0} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SurveyResultsDashboard;
