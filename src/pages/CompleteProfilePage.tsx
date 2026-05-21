import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Save } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserRole } from '../types/types';

interface Props {
    user: FirebaseUser | null;
    userRole: UserRole | null;
}

const CompleteProfilePage: React.FC<Props> = ({ user, userRole }) => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'superAdmin';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!firstName.trim() || !lastName.trim()) {
            setError('กรุณากรอกชื่อและนามสกุล');
            return;
        }
        if (!isTeacherOrAdmin && !studentId.trim()) {
            setError('กรุณากรอกรหัสนักเรียน');
            return;
        }

        setSaving(true);
        setError('');
        try {
            const patch = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                displayName: `${firstName.trim()} ${lastName.trim()}`,
                isProfileComplete: true,
                ...(studentId.trim() ? { studentId: studentId.trim() } : {}),
            };

            await updateDoc(doc(db, 'users', user.uid), patch);
            navigate('/practice', { replace: true });
        } catch (err) {
            console.error(err);
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'var(--gradient-landing)' }}>
            <div className="w-full max-w-md rounded-2xl shadow-2xl p-8"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ background: 'var(--color-primary-light)', border: '2px solid var(--color-primary)' }}>
                        <UserCircle size={36} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                        กรอกข้อมูลโปรไฟล์
                    </h1>
                    <p className="text-sm mt-1 text-center" style={{ color: 'var(--color-text-muted)' }}>
                        กรุณากรอกข้อมูลก่อนเริ่มใช้งานระบบ
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1.5"
                            style={{ color: 'var(--color-text)' }}>
                            ชื่อจริง <span style={{ color: 'var(--color-error)' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            placeholder="เช่น สมชาย"
                            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                            style={{
                                background: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text)',
                            }}
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1.5"
                            style={{ color: 'var(--color-text)' }}>
                            นามสกุล <span style={{ color: 'var(--color-error)' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            placeholder="เช่น ใจดี"
                            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                            style={{
                                background: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text)',
                            }}
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1.5"
                            style={{ color: 'var(--color-text)' }}>
                            รหัสนักเรียน / รหัสครู
                            {!isTeacherOrAdmin && (
                                <span style={{ color: 'var(--color-error)' }}> *</span>
                            )}
                            {isTeacherOrAdmin && (
                                <span className="ml-1 text-xs font-normal"
                                    style={{ color: 'var(--color-text-muted)' }}>
                                    (ไม่บังคับ)
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={studentId}
                            onChange={e => setStudentId(e.target.value)}
                            placeholder="เช่น 66001234"
                            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                            style={{
                                background: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text)',
                            }}
                            disabled={saving}
                        />
                    </div>

                    {error && (
                        <p className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 btn-primary mt-2"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        {saving ? 'กำลังบันทึก...' : 'บันทึกและเริ่มใช้งาน'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfilePage;
