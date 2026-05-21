// src/pages/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile } from '../types/types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

interface Props {
    user: FirebaseUser | null;
    userProfile: UserProfile | null;
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

const ProfilePage: React.FC<Props> = ({ user, userProfile }) => {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setFirstName(userProfile.firstName || '');
            setLastName(userProfile.lastName || '');
            setStudentId(userProfile.studentId || '');
        }
    }, [userProfile]);

    const handleSave = async () => {
        if (!user) return;
        if (!firstName.trim()) { setError('กรุณาใส่ชื่อ'); return; }
        if (!lastName.trim()) { setError('กรุณาใส่นามสกุล'); return; }

        setSaving(true);
        setError('');
        setSaved(false);
        try {
            const displayName = `${firstName.trim()} ${lastName.trim()}`;
            const update: Partial<UserProfile> = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                displayName,
            };
            if (userProfile?.role === 'student') {
                update.studentId = studentId.trim();
            }
            await updateDoc(doc(db, 'users', user.uid), update);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setError('บันทึกไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen app-bg p-3 sm:p-5">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate(-1)}
                        className="p-2 rounded-lg transition-all hover:opacity-80"
                        style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                        <ArrowLeft size={16} />
                    </button>
                    <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                        แก้ไขโปรไฟล์
                    </h1>
                </div>

                <div className="rounded-2xl p-5 flex flex-col gap-4"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>

                    {/* Avatar */}
                    <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        {userProfile?.photoURL ? (
                            <img
                                src={userProfile.photoURL}
                                alt={userProfile.displayName}
                                className="w-14 h-14 rounded-full object-cover ring-2"
                                style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                <User size={24} />
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                                {userProfile?.displayName || user?.displayName || '—'}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                {user?.email}
                            </p>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block" style={{
                                background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                                color: 'var(--color-primary)',
                            }}>
                                {userProfile?.role === 'superAdmin' ? 'SuperAdmin' :
                                    userProfile?.role === 'teacher' ? 'ครู' : 'นักเรียน'}
                            </span>
                        </div>
                    </div>

                    {/* Name fields */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                                ชื่อ *
                            </label>
                            <input
                                style={field}
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                placeholder="ชื่อ"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                                นามสกุล *
                            </label>
                            <input
                                style={field}
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                placeholder="นามสกุล"
                            />
                        </div>
                    </div>

                    {/* Student ID — students only */}
                    {userProfile?.role === 'student' && (
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                                รหัสนักเรียน
                            </label>
                            <input
                                style={field}
                                value={studentId}
                                onChange={e => setStudentId(e.target.value)}
                                placeholder="เช่น 6601234"
                            />
                        </div>
                    )}

                    {/* Email (read-only) */}
                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                            อีเมล (จาก Google — ไม่สามารถแก้ได้)
                        </label>
                        <input
                            style={{ ...field, opacity: 0.6, cursor: 'not-allowed' }}
                            value={user?.email || ''}
                            readOnly
                        />
                    </div>

                    {error && (
                        <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>
                    )}
                    {saved && (
                        <p className="text-xs" style={{ color: 'var(--color-success)' }}>บันทึกสำเร็จแล้ว</p>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
                        style={{ background: 'var(--color-primary)' }}>
                        <Save size={14} />
                        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
