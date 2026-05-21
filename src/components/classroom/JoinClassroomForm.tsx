// src/components/classroom/JoinClassroomForm.tsx

import React, { useState } from 'react';
import { Hash, LogIn, CheckCircle } from 'lucide-react';

interface Props {
    onJoin: (code: string) => Promise<{ success: boolean; classroomName?: string; error?: string }>;
}

const JoinClassroomForm: React.FC<Props> = ({ onJoin }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        setLoading(true);
        setError('');
        setSuccess('');
        const result = await onJoin(code);
        if (result.success) {
            setSuccess(`เข้าร่วม "${result.classroomName}" สำเร็จ!`);
            setCode('');
        } else {
            setError(result.error || 'เกิดข้อผิดพลาด');
        }
        setLoading(false);
    };

    return (
        <div className="rounded-xl p-4" style={{ background: 'var(--color-primary-light)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                <Hash size={16} /> เข้าร่วมห้องเรียน
            </h3>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="รหัส 6 ตัว เช่น A3X9K2"
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-mono tracking-widest uppercase"
                    style={{
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                    }}
                />
                <button type="submit" disabled={loading || code.length < 6}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-40"
                    style={{ background: 'var(--color-primary)' }}>
                    <LogIn size={14} />
                    {loading ? '...' : 'เข้าร่วม'}
                </button>
            </form>
            {error && <p className="text-xs mt-2" style={{ color: 'var(--color-error)' }}>{error}</p>}
            {success && (
                <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                    <CheckCircle size={12} /> {success}
                </p>
            )}
        </div>
    );
};

export default JoinClassroomForm;
