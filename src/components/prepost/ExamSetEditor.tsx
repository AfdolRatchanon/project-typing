// src/components/prepost/ExamSetEditor.tsx

import React from 'react';
import type { ExamSet, SetAssignmentMethod } from '../../types/types';

interface Props {
    sets: ExamSet[];
    onChange: (sets: ExamSet[]) => void;
    assignmentMethod: SetAssignmentMethod;
}

const setHints: Record<number, string> = {
    1: 'เลขที่ 1, 6, 11, 16, ...',
    2: 'เลขที่ 2, 7, 12, 17, ...',
    3: 'เลขที่ 3, 8, 13, 18, ...',
    4: 'เลขที่ 4, 9, 14, 19, ...',
    5: 'เลขที่ 5, 10, 15, 20, ...',
};

const fieldBase: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: '0.8125rem',
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit',
};

const ExamSetEditor: React.FC<Props> = ({ sets, onChange, assignmentMethod }) => {
    const getSetText = (num: number) => sets.find(s => s.setNumber === num)?.text ?? '';

    const updateSet = (num: 1 | 2 | 3 | 4 | 5, text: string) => {
        const existing = sets.find(s => s.setNumber === num);
        if (existing) {
            onChange(sets.map(s => s.setNumber === num ? { ...s, text } : s));
        } else {
            onChange([...sets, { setNumber: num, text }]);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {([1, 2, 3, 4, 5] as const).map(num => {
                const text = getSetText(num);
                return (
                    <div key={num} className="p-3 rounded-xl" style={{ background: 'var(--color-primary-light)', border: '1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                                ชุดที่ {num}
                            </label>
                            {assignmentMethod === 'by-student-number' && (
                                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    → {setHints[num]}
                                </span>
                            )}
                        </div>
                        <textarea
                            style={fieldBase}
                            value={text}
                            onChange={e => updateSet(num, e.target.value)}
                            placeholder={`ข้อความที่นักเรียนต้องพิมพ์ในชุดที่ ${num}...`}
                        />
                        <p className="text-xs mt-0.5 text-right" style={{
                            color: text.length > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        }}>
                            {text.length} ตัวอักษร
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default ExamSetEditor;
