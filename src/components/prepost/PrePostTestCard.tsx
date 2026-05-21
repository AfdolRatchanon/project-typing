// src/components/prepost/PrePostTestCard.tsx

import React from 'react';
import { Clock, Users, Pencil, Trash2, BarChart2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { PrePostTest } from '../../types/types';

interface Props {
    test: PrePostTest;
    resultCount: number;
    onToggleOpen: (testId: string, isOpen: boolean) => Promise<void>;
    onEdit: (test: PrePostTest) => void;
    onDelete: (testId: string) => Promise<void>;
    onViewResults: (test: PrePostTest) => void;
}

const PrePostTestCard: React.FC<Props> = ({
    test, resultCount, onToggleOpen, onEdit, onDelete, onViewResults,
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
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${test.type === 'pre' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                            {test.type === 'pre' ? 'Pre-test' : 'Post-test'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                            background: test.isOpen
                                ? 'color-mix(in srgb, var(--color-success) 15%, transparent)'
                                : 'color-mix(in srgb, var(--color-text-muted) 15%, transparent)',
                            color: test.isOpen ? 'var(--color-success)' : 'var(--color-text-muted)',
                        }}>
                            {test.isOpen ? '● เปิดรับสอบ' : '○ ปิด'}
                        </span>
                        {test.isResultPublished && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                                background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                                color: 'var(--color-primary)',
                            }}>
                                เผยแพร่ผลแล้ว
                            </span>
                        )}
                    </div>
                    <h4 className="font-semibold text-sm mt-1.5 truncate" style={{ color: 'var(--color-text)' }}>
                        {test.title}
                    </h4>
                    <div className="flex flex-wrap gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            <Clock size={11} />
                            {Math.floor(test.timeLimit / 60)} นาที{test.timeLimit % 60 ? ` ${test.timeLimit % 60} วิ` : ''}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            <Users size={11} /> {resultCount} ผล
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            ผ่าน ≥ {test.passingScore}/10{test.passingWPM > 0 ? ` · ${test.passingWPM} WPM` : ''}
                        </span>
                    </div>
                </div>

                {/* Right: actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                        onClick={() => onToggleOpen(test.testId, !test.isOpen)}
                        className="flex items-center justify-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-80 font-medium"
                        style={{
                            background: test.isOpen
                                ? 'color-mix(in srgb, var(--color-error) 12%, transparent)'
                                : 'color-mix(in srgb, var(--color-success) 12%, transparent)',
                            color: test.isOpen ? 'var(--color-error)' : 'var(--color-success)',
                        }}>
                        {test.isOpen ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                        {test.isOpen ? 'ปิด' : 'เปิด'}
                    </button>
                    <button
                        onClick={() => onViewResults(test)}
                        className="flex items-center justify-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-80 font-medium"
                        style={{
                            background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                            color: 'var(--color-primary)',
                        }}>
                        <BarChart2 size={12} /> ดูผล
                    </button>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onEdit(test)}
                            className="p-1.5 rounded-lg hover:opacity-80 transition-all"
                            style={{ color: 'var(--color-primary)' }}>
                            <Pencil size={13} />
                        </button>
                        <button
                            onClick={async () => {
                                if (!confirm(`ลบ "${test.title}"? ผลการสอบทั้งหมดจะหายไป`)) return;
                                await onDelete(test.testId);
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

export default PrePostTestCard;
