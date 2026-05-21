// src/components/exam/ExamCard.tsx

import React from 'react';
import { Clock, Users, Pencil, Trash2, BarChart2, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import type { Exam, ScorePolicy } from '../../types/types';

interface Props {
    exam: Exam;
    resultCount: number;
    onToggleOpen: (examId: string, isOpen: boolean) => Promise<void>;
    onEdit: (exam: Exam) => void;
    onDelete: (examId: string) => Promise<void>;
    onViewResults: (exam: Exam) => void;
}

const scorePolicyLabel: Record<ScorePolicy, string> = {
    best: 'ใช้คะแนนสูงสุด',
    last: 'ใช้คะแนนครั้งหลัง',
    average: 'ใช้คะแนนเฉลี่ย',
};

const ExamCard: React.FC<Props> = ({
    exam, resultCount, onToggleOpen, onEdit, onDelete, onViewResults,
}) => {
    return (
        <div className="p-4 rounded-xl" style={{
            background: 'var(--color-primary-light)',
            border: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)',
        }}>
            <div className="flex items-start justify-between gap-2">
                {/* Left: info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white bg-orange-500">
                            การสอบ
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                            background: exam.isOpen
                                ? 'color-mix(in srgb, var(--color-success) 15%, transparent)'
                                : 'color-mix(in srgb, var(--color-text-muted) 15%, transparent)',
                            color: exam.isOpen ? 'var(--color-success)' : 'var(--color-text-muted)',
                        }}>
                            {exam.isOpen ? '● เปิดรับสอบ' : '○ ปิด'}
                        </span>
                        {exam.isResultPublished && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                                background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                                color: 'var(--color-primary)',
                            }}>
                                เผยแพร่ผลแล้ว
                            </span>
                        )}
                        {exam.allowRetake && (
                            <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full" style={{
                                background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                                color: 'var(--color-accent)',
                            }}>
                                <RefreshCw size={10} />
                                {exam.maxRetake > 0 ? `ทำซ้ำได้ ${exam.maxRetake}×` : 'ทำซ้ำได้'}
                            </span>
                        )}
                    </div>
                    <h4 className="font-semibold text-sm mt-1.5 truncate" style={{ color: 'var(--color-text)' }}>
                        {exam.title}
                    </h4>
                    <div className="flex flex-wrap gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            <Clock size={11} />
                            {Math.floor(exam.timeLimit / 60)} นาที{exam.timeLimit % 60 ? ` ${exam.timeLimit % 60} วิ` : ''}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            <Users size={11} /> {resultCount} ผล
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            ผ่าน ≥ {exam.passingScore}/10{exam.passingWPM > 0 ? ` · ${exam.passingWPM} WPM` : ''}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {scorePolicyLabel[exam.scorePolicy]}
                        </span>
                    </div>
                </div>

                {/* Right: actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                        onClick={() => onToggleOpen(exam.examId, !exam.isOpen)}
                        className="flex items-center justify-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-80 font-medium"
                        style={{
                            background: exam.isOpen
                                ? 'color-mix(in srgb, var(--color-error) 12%, transparent)'
                                : 'color-mix(in srgb, var(--color-success) 12%, transparent)',
                            color: exam.isOpen ? 'var(--color-error)' : 'var(--color-success)',
                        }}>
                        {exam.isOpen ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                        {exam.isOpen ? 'ปิด' : 'เปิด'}
                    </button>
                    <button
                        onClick={() => onViewResults(exam)}
                        className="flex items-center justify-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-80 font-medium"
                        style={{
                            background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                            color: 'var(--color-primary)',
                        }}>
                        <BarChart2 size={12} /> ดูผล
                    </button>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onEdit(exam)}
                            className="p-1.5 rounded-lg hover:opacity-80 transition-all"
                            style={{ color: 'var(--color-primary)' }}>
                            <Pencil size={13} />
                        </button>
                        <button
                            onClick={async () => {
                                if (!confirm(`ลบ "${exam.title}"? ผลการสอบทั้งหมดจะหายไป`)) return;
                                await onDelete(exam.examId);
                            }}
                            className="p-1.5 rounded-lg hover:opacity-80 transition-all"
                            style={{ color: 'var(--color-error)' }}>
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamCard;
