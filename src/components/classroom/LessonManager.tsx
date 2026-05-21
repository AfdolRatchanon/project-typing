// src/components/classroom/LessonManager.tsx

import React, { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, Clock, AlignLeft, X, Save } from 'lucide-react';
import type { CustomLesson } from '../../types/types';

interface Props {
    classroomId: string;
    teacherUid: string;
    getLessons: (classroomId: string) => Promise<CustomLesson[]>;
    createLesson: (classroomId: string, data: Omit<CustomLesson, 'lessonId' | 'createdAt' | 'classroomId' | 'createdBy'>, createdBy: string) => Promise<string>;
    updateLesson: (classroomId: string, lessonId: string, patch: Partial<CustomLesson>) => Promise<void>;
    deleteLesson: (classroomId: string, lessonId: string) => Promise<void>;
}

const emptyForm = { title: '', text: '', timeLimit: '', requiredPlayCount: '' };

const field: React.CSSProperties = {
    width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
    border: '1px solid var(--color-border)', background: 'var(--color-surface)',
    color: 'var(--color-text)', fontSize: '0.875rem',
};

const LessonManager: React.FC<Props> = ({ classroomId, teacherUid, getLessons, createLesson, updateLesson, deleteLesson }) => {
    const [lessons, setLessons] = useState<CustomLesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const reload = async () => {
        setLoading(true);
        setLessons(await getLessons(classroomId));
        setLoading(false);
    };

    useEffect(() => { reload(); }, [classroomId]); // eslint-disable-line react-hooks/exhaustive-deps

    const openCreate = () => { setEditId(null); setForm(emptyForm); setError(''); setShowForm(true); };
    const openEdit = (l: CustomLesson) => {
        setEditId(l.lessonId);
        setForm({
            title: l.title,
            text: l.text,
            timeLimit: l.timeLimit ? String(l.timeLimit) : '',
            requiredPlayCount: l.requiredPlayCount ? String(l.requiredPlayCount) : '',
        });
        setError('');
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.title.trim()) { setError('กรุณาใส่ชื่อบทเรียน'); return; }
        if (!form.text.trim()) { setError('กรุณาใส่เนื้อหาบทเรียน'); return; }
        const timeLimit = form.timeLimit ? parseInt(form.timeLimit) : null;
        if (form.timeLimit && (isNaN(timeLimit!) || timeLimit! <= 0)) { setError('เวลาจำกัดต้องเป็นตัวเลขที่มากกว่า 0'); return; }
        const requiredPlayCount = form.requiredPlayCount ? parseInt(form.requiredPlayCount) : null;
        if (form.requiredPlayCount && (isNaN(requiredPlayCount!) || requiredPlayCount! < 1)) { setError('จำนวนครั้งต้องเป็นตัวเลขที่มากกว่า 0'); return; }

        setSaving(true);
        setError('');
        try {
            const payload = {
                title: form.title.trim(),
                text: form.text.trim(),
                timeLimit,
                requiredPlayCount,
            };
            if (editId) {
                await updateLesson(classroomId, editId, payload);
            } else {
                await createLesson(classroomId, payload, teacherUid);
            }
            setShowForm(false);
            await reload();
        } catch {
            setError('บันทึกไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (lessonId: string) => {
        if (!confirm('ลบบทเรียนนี้?')) return;
        await deleteLesson(classroomId, lessonId);
        await reload();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>บทเรียนในห้อง</h3>
                <button onClick={openCreate}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                    style={{ background: 'var(--color-primary)' }}>
                    <PlusCircle size={13} /> สร้างบทเรียน
                </button>
            </div>

            {/* Lesson list */}
            {loading ? (
                <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลด...</p>
            ) : lessons.length === 0 ? (
                <div className="text-center py-6 rounded-xl" style={{ border: '1px dashed var(--color-border)' }}>
                    <AlignLeft size={28} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีบทเรียน</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {lessons.map((l) => (
                        <div key={l.lessonId} className="flex items-start gap-3 p-3 rounded-xl"
                            style={{ background: 'var(--color-primary-light)', border: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)' }}>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{l.title}</p>
                                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{l.text}</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {l.timeLimit && (
                                        <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--color-accent)' }}>
                                            <Clock size={11} /> {Math.floor(l.timeLimit / 60)} นาที {l.timeLimit % 60 ? `${l.timeLimit % 60} วินาที` : ''}
                                        </span>
                                    )}
                                    {l.requiredPlayCount && (
                                        <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
                                            style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}>
                                            ฝึกขั้นต่ำ {l.requiredPlayCount} ครั้ง
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => openEdit(l)}
                                    className="p-1.5 rounded-lg hover:opacity-80 transition-all"
                                    style={{ color: 'var(--color-primary)' }}>
                                    <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDelete(l.lessonId)}
                                    className="p-1.5 rounded-lg hover:opacity-80 transition-all"
                                    style={{ color: 'var(--color-error)' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-modal-fade-in"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                                {editId ? 'แก้ไขบทเรียน' : 'สร้างบทเรียนใหม่'}
                            </h3>
                            <button onClick={() => setShowForm(false)} style={{ color: 'var(--color-text-muted)' }}><X size={18} /></button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>ชื่อบทเรียน *</label>
                                <input style={field} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="เช่น บทที่ 1 — แถวนิ้วกลาง" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>เนื้อหาที่ให้พิมพ์ *</label>
                                <textarea style={{ ...field, minHeight: '120px', resize: 'vertical' }}
                                    value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                                    placeholder="พิมพ์ข้อความที่ต้องการให้นักเรียนฝึกพิมพ์ที่นี่..." />
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{form.text.length} ตัวอักษร</p>
                            </div>
                            <div className="flex gap-3">
                                <div>
                                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>เวลาจำกัด (วินาที) — ไม่บังคับ</label>
                                    <input style={{ ...field, width: '160px' }} type="number" min="30"
                                        value={form.timeLimit} onChange={e => setForm(p => ({ ...p, timeLimit: e.target.value }))}
                                        placeholder="เช่น 300 = 5 นาที" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>จำนวนครั้งขั้นต่ำ — ไม่บังคับ</label>
                                    <input style={{ ...field, width: '140px' }} type="number" min="1"
                                        value={form.requiredPlayCount} onChange={e => setForm(p => ({ ...p, requiredPlayCount: e.target.value }))}
                                        placeholder="เช่น 3" />
                                </div>
                            </div>
                            {error && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}
                            <div className="flex gap-2 mt-1">
                                <button onClick={() => setShowForm(false)}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                                    style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                                    ยกเลิก
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
                                    style={{ background: 'var(--color-primary)' }}>
                                    <Save size={14} />{saving ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonManager;
