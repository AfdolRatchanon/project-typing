// src/components/classroom/CreateClassroomModal.tsx

import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import type { Classroom, GradeLevel, Semester } from '../../types/types';
import { GRADE_LEVELS, SEMESTERS, getAcademicYearOptions } from '../../utils/classroomUtils';

interface Props {
    teacherUid: string;
    onClose: () => void;
    onCreate: (data: Omit<Classroom, 'classroomId' | 'joinCode' | 'createdAt' | 'isActive'>) => Promise<void>;
}

const field: React.CSSProperties = {
    width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
    border: '1px solid var(--color-border)', background: 'var(--color-surface)',
    color: 'var(--color-text)', fontSize: '0.875rem',
};

const CreateClassroomModal: React.FC<Props> = ({ teacherUid, onClose, onCreate }) => {
    const years = getAcademicYearOptions();
    const [form, setForm] = useState({
        name: '',
        subject: 'การพิมพ์ดีดไทย',
        gradeLevel: 'ปวช.1' as GradeLevel,
        semester: '1' as Semester,
        academicYear: years[2], // ปีปัจจุบัน
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('กรุณาใส่ชื่อห้องเรียน'); return; }
        setLoading(true);
        setError('');
        try {
            await onCreate({ ...form, name: form.name.trim(), teacherUid });
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const set_ = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }));

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md rounded-2xl shadow-2xl p-6 animate-modal-fade-in"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>สร้างห้องเรียนใหม่</h2>
                    <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>ชื่อห้องเรียน *</label>
                        <input style={field} value={form.name} onChange={set_('name')}
                            placeholder="เช่น ห้อง ปวช.1/1 สาขาคอมพิวเตอร์ธุรกิจ" />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>วิชา</label>
                        <input style={field} value={form.subject} onChange={set_('subject')} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>ระดับชั้น</label>
                            <select style={field} value={form.gradeLevel} onChange={set_('gradeLevel')}>
                                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>ภาคเรียน</label>
                            <select style={field} value={form.semester} onChange={set_('semester')}>
                                {SEMESTERS.map(s => <option key={s} value={s}>ภาคเรียนที่ {s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>ปีการศึกษา (พ.ศ.)</label>
                        <select style={field} value={form.academicYear} onChange={set_('academicYear')}>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    {error && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}

                    <div className="flex gap-2 mt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                            style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                            ยกเลิก
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
                            style={{ background: 'var(--color-primary)' }}>
                            <PlusCircle size={15} />
                            {loading ? 'กำลังสร้าง...' : 'สร้างห้องเรียน'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateClassroomModal;
