// src/components/survey/SurveyCreate.tsx

import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Survey, PrePostTest } from '../../types/types';
import { SURVEY_TEMPLATE_QUESTIONS } from '../../utils/researchExport';

interface Props {
    classroomId: string;
    teacherUid: string;
    postTests: PrePostTest[];
    initial?: Survey;
    onClose: () => void;
    onSave: (data: Omit<Survey, 'surveyId' | 'createdAt'>) => Promise<void>;
}

const field: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: '0.875rem',
};

const SurveyCreate: React.FC<Props> = ({ classroomId, teacherUid, postTests, initial, onClose, onSave }) => {
    const [title, setTitle] = useState(initial?.title ?? 'แบบสอบถามความพึงพอใจ');
    const [linkedPostTestId, setLinkedPostTestId] = useState(initial?.linkedPostTestId ?? '');
    const [isAnonymous, setIsAnonymous] = useState(initial?.isAnonymous ?? false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!title.trim()) { setError('กรุณาใส่ชื่อแบบสอบถาม'); return; }
        setSaving(true);
        setError('');
        try {
            await onSave({
                classroomId,
                title: title.trim(),
                linkedPostTestId: linkedPostTestId || null,
                questions: initial?.questions ?? SURVEY_TEMPLATE_QUESTIONS,
                createdBy: teacherUid,
                isOpen: initial?.isOpen ?? false,
                isAnonymous,
            });
            onClose();
        } catch {
            setError('บันทึกไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className="w-full max-w-xl rounded-2xl shadow-2xl flex flex-col"
                style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    maxHeight: '88vh',
                }}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                        {initial ? 'แก้ไขแบบสอบถาม' : 'สร้างแบบสอบถามใหม่'}
                    </h3>
                    <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}><X size={18} /></button>
                </div>

                <div className="overflow-y-auto p-5 flex flex-col gap-4">
                    {/* Title */}
                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                            ชื่อแบบสอบถาม *
                        </label>
                        <input
                            style={field}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="เช่น แบบสอบถามความพึงพอใจต่อระบบ"
                        />
                    </div>

                    {/* Linked post-test */}
                    {postTests.length > 0 && (
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                                เชื่อมกับ Post-test (ไม่บังคับ)
                            </label>
                            <select
                                style={field}
                                value={linkedPostTestId}
                                onChange={e => setLinkedPostTestId(e.target.value)}>
                                <option value="">— ไม่เชื่อม —</option>
                                {postTests.map(t => (
                                    <option key={t.testId} value={t.testId}>{t.title}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Anonymous */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isAnonymous"
                            checked={isAnonymous}
                            onChange={e => setIsAnonymous(e.target.checked)}
                            className="w-4 h-4 rounded"
                        />
                        <label htmlFor="isAnonymous" className="text-sm" style={{ color: 'var(--color-text)' }}>
                            ไม่แสดงชื่อผู้ตอบ (anonymous)
                        </label>
                    </div>

                    {/* Question preview */}
                    <div>
                        <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
                            ข้อคำถาม (มาตรฐาน 10 ข้อ — Likert 5 ระดับ)
                        </p>
                        <div className="flex flex-col gap-1.5 rounded-xl p-3"
                            style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-border)' }}>
                            {SURVEY_TEMPLATE_QUESTIONS.map(q => (
                                <div key={q.questionId} className="flex items-start gap-2">
                                    <span className="text-xs font-bold mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }}>
                                        {q.order}.
                                    </span>
                                    <span className="text-xs flex-1" style={{ color: 'var(--color-text)' }}>{q.text}</span>
                                    <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0 ml-1"
                                        style={{
                                            background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
                                            color: 'var(--color-accent)',
                                        }}>
                                        {q.dimension}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-2 p-5 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                        style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                        style={{ background: 'var(--color-primary)' }}>
                        <Save size={14} />
                        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurveyCreate;
