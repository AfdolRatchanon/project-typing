// src/components/exam/ExamCreate.tsx

import React, { useState } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import type { Exam, ExamSet, SetAssignmentMethod, ScorePolicy } from '../../types/types';
import ExamSetEditor from '../prepost/ExamSetEditor';

interface Props {
    classroomId: string;
    teacherUid: string;
    initial?: Exam;
    onClose: () => void;
    onSave: (data: Omit<Exam, 'examId' | 'createdAt'>) => Promise<void>;
}

const defaultSets = (): ExamSet[] =>
    ([1, 2, 3, 4, 5] as const).map(n => ({ setNumber: n, text: '' }));

const field: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: '0.875rem',
};

const ExamCreate: React.FC<Props> = ({ classroomId, teacherUid, initial, onClose, onSave }) => {
    const [title, setTitle] = useState(initial?.title ?? '');
    const [timeLimit, setTimeLimit] = useState(String(initial?.timeLimit ?? 600));
    const [passingScore, setPassingScore] = useState(String(initial?.passingScore ?? 5));
    const [passingWPM, setPassingWPM] = useState(String(initial?.passingWPM ?? 0));
    const [method, setMethod] = useState<SetAssignmentMethod>(
        initial?.setAssignmentMethod ?? 'by-student-number',
    );
    const [scorePolicy, setScorePolicy] = useState<ScorePolicy>(initial?.scorePolicy ?? 'best');
    const [allowRetake, setAllowRetake] = useState(initial?.allowRetake ?? false);
    const [maxRetake, setMaxRetake] = useState(String(initial?.maxRetake ?? 0));
    const [examSets, setExamSets] = useState<ExamSet[]>(initial?.examSets ?? defaultSets());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const filledCount = examSets.filter(s => s.text.trim().length > 0).length;

    const handleSave = async () => {
        if (!title.trim()) { setError('กรุณาใส่ชื่อการสอบ'); return; }
        const tl = parseInt(timeLimit);
        if (isNaN(tl) || tl < 60) { setError('เวลาต้องไม่น้อยกว่า 60 วินาที'); return; }
        const ps = parseInt(passingScore);
        if (isNaN(ps) || ps < 0 || ps > 10) { setError('คะแนนผ่านต้องอยู่ระหว่าง 0–10'); return; }
        const pw = parseInt(passingWPM);
        if (isNaN(pw) || pw < 0) { setError('WPM ผ่านต้องเป็น 0 หรือมากกว่า'); return; }
        const mr = parseInt(maxRetake);
        if (isNaN(mr) || mr < 0) { setError('จำนวนครั้งทำซ้ำต้องเป็น 0 หรือมากกว่า'); return; }
        if (filledCount === 0) { setError('กรุณาใส่ข้อความอย่างน้อย 1 ชุด'); return; }

        setSaving(true);
        setError('');
        try {
            await onSave({
                classroomId,
                title: title.trim(),
                examSets,
                setAssignmentMethod: method,
                timeLimit: tl,
                passingScore: ps,
                passingWPM: pw,
                scorePolicy,
                createdBy: teacherUid,
                isOpen: initial?.isOpen ?? false,
                openAt: null,
                closeAt: null,
                allowRetake,
                maxRetake: allowRetake ? mr : 0,
                isResultPublished: initial?.isResultPublished ?? false,
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
                className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
                style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    maxHeight: '92vh',
                }}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                        {initial ? 'แก้ไขการสอบ' : 'สร้างการสอบใหม่'}
                    </h3>
                    <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-5 flex flex-col gap-4">
                    {/* Title */}
                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                            ชื่อการสอบ *
                        </label>
                        <input
                            style={field}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="เช่น สอบปลายภาค ภาคเรียน 1/2568"
                        />
                    </div>

                    {/* Time + Passing criteria */}
                    <div className="flex gap-3 flex-wrap">
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                                เวลาจำกัด (วินาที) *
                            </label>
                            <input
                                style={{ ...field, width: '150px' }}
                                type="number"
                                min="60"
                                value={timeLimit}
                                onChange={e => setTimeLimit(e.target.value)}
                                placeholder="600 = 10 นาที"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                                คะแนนผ่านขั้นต่ำ (0–10)
                            </label>
                            <input
                                style={{ ...field, width: '120px' }}
                                type="number"
                                min="0"
                                max="10"
                                value={passingScore}
                                onChange={e => setPassingScore(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                                WPM ผ่านขั้นต่ำ (0 = ไม่บังคับ)
                            </label>
                            <input
                                style={{ ...field, width: '120px' }}
                                type="number"
                                min="0"
                                value={passingWPM}
                                onChange={e => setPassingWPM(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Assignment method + Score policy */}
                    <div className="flex gap-3 flex-wrap">
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                                วิธีกำหนดชุดข้อสอบ
                            </label>
                            <select
                                style={{ ...field, width: '230px' }}
                                value={method}
                                onChange={e => setMethod(e.target.value as SetAssignmentMethod)}>
                                <option value="by-student-number">ตามเลขที่นักเรียน (แนะนำ)</option>
                                <option value="random">สุ่ม (คงที่ต่อนักเรียน)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                                นโยบายคะแนน
                            </label>
                            <select
                                style={{ ...field, width: '200px' }}
                                value={scorePolicy}
                                onChange={e => setScorePolicy(e.target.value as ScorePolicy)}>
                                <option value="best">ใช้คะแนนสูงสุด</option>
                                <option value="last">ใช้คะแนนครั้งหลังสุด</option>
                                <option value="average">ใช้คะแนนเฉลี่ย</option>
                            </select>
                        </div>
                    </div>

                    {/* Allow retake */}
                    <div className="flex items-start gap-4 flex-wrap">
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="checkbox"
                                id="allowRetake"
                                checked={allowRetake}
                                onChange={e => setAllowRetake(e.target.checked)}
                                className="w-4 h-4 rounded"
                            />
                            <label htmlFor="allowRetake" className="text-sm" style={{ color: 'var(--color-text)' }}>
                                อนุญาตให้ทำซ้ำ
                            </label>
                        </div>
                        {allowRetake && (
                            <div>
                                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                                    จำนวนครั้งสูงสุด (0 = ไม่จำกัด)
                                </label>
                                <input
                                    style={{ ...field, width: '120px' }}
                                    type="number"
                                    min="0"
                                    value={maxRetake}
                                    onChange={e => setMaxRetake(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Exam sets */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                                ข้อความสำหรับแต่ละชุด *
                            </label>
                            {filledCount < 5 && (
                                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-accent)' }}>
                                    <AlertTriangle size={11} />
                                    กรอกแล้ว {filledCount}/5 ชุด
                                    {filledCount < 5 && ' — นักเรียนที่เหลืออาจได้ชุดซ้ำกัน'}
                                </span>
                            )}
                        </div>
                        <ExamSetEditor
                            sets={examSets}
                            onChange={setExamSets}
                            assignmentMethod={method}
                        />
                    </div>

                    {error && (
                        <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-2 p-5 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
                        style={{ background: 'var(--color-primary)' }}>
                        <Save size={14} />
                        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamCreate;
