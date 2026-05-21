// src/components/survey/SurveyCard.tsx

import React from 'react';
import { ToggleLeft, ToggleRight, BarChart2, Trash2, Users } from 'lucide-react';
import type { Survey } from '../../types/types';

interface Props {
    survey: Survey;
    responseCount: number;
    onToggleOpen: (surveyId: string, isOpen: boolean) => Promise<void>;
    onDelete: (surveyId: string) => Promise<void>;
    onViewResults: (survey: Survey) => void;
}

const SurveyCard: React.FC<Props> = ({ survey, responseCount, onToggleOpen, onDelete, onViewResults }) => {
    return (
        <div className="p-4 rounded-xl" style={{
            background: 'var(--color-primary-light)',
            border: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)',
        }}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#8b5cf6' }}>
                            แบบสอบถาม
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                            background: survey.isOpen
                                ? 'color-mix(in srgb, var(--color-success) 15%, transparent)'
                                : 'color-mix(in srgb, var(--color-text-muted) 15%, transparent)',
                            color: survey.isOpen ? 'var(--color-success)' : 'var(--color-text-muted)',
                        }}>
                            {survey.isOpen ? '● เปิด' : '○ ปิด'}
                        </span>
                        {survey.isAnonymous && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                                background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                                color: 'var(--color-accent)',
                            }}>
                                ไม่ระบุชื่อ
                            </span>
                        )}
                    </div>
                    <h4 className="font-semibold text-sm mt-1.5 truncate" style={{ color: 'var(--color-text)' }}>
                        {survey.title}
                    </h4>
                    <div className="flex flex-wrap gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            <Users size={11} /> {responseCount} คนตอบ
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {survey.questions.length} ข้อ
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                        onClick={() => onToggleOpen(survey.surveyId, !survey.isOpen)}
                        className="flex items-center justify-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-80 font-medium"
                        style={{
                            background: survey.isOpen
                                ? 'color-mix(in srgb, var(--color-error) 12%, transparent)'
                                : 'color-mix(in srgb, var(--color-success) 12%, transparent)',
                            color: survey.isOpen ? 'var(--color-error)' : 'var(--color-success)',
                        }}>
                        {survey.isOpen ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                        {survey.isOpen ? 'ปิด' : 'เปิด'}
                    </button>
                    <button
                        onClick={() => onViewResults(survey)}
                        className="flex items-center justify-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-80 font-medium"
                        style={{
                            background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                            color: 'var(--color-primary)',
                        }}>
                        <BarChart2 size={12} /> ดูผล
                    </button>
                    <button
                        onClick={async () => {
                            if (!confirm(`ลบ "${survey.title}"? คำตอบทั้งหมดจะหายไป`)) return;
                            await onDelete(survey.surveyId);
                        }}
                        className="p-1.5 rounded-lg hover:opacity-80 transition-all self-end"
                        style={{ color: 'var(--color-error)' }}>
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurveyCard;
