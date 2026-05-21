// src/components/classroom/ClassroomCard.tsx

import React, { useState } from 'react';
import { Users, BookOpen, Copy, Check, ChevronRight, Trash2 } from 'lucide-react';
import type { Classroom } from '../../types/types';

interface Props {
    classroom: Classroom;
    memberCount?: number;
    isTeacher?: boolean;
    isSelected?: boolean;
    onClick?: () => void;
    onDelete?: () => void;
}

const ClassroomCard: React.FC<Props> = ({
    classroom, memberCount, isTeacher, isSelected, onClick, onDelete,
}) => {
    const [copied, setCopied] = useState(false);

    const copyCode = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(classroom.joinCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            onClick={onClick}
            className="rounded-xl p-4 transition-all cursor-pointer hover:shadow-md"
            style={{
                background: isSelected ? 'color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))' : 'var(--color-surface)',
                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                boxShadow: isSelected ? '0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent)' : undefined,
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                        {classroom.name}
                    </h3>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {classroom.subject}
                    </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {isTeacher && onDelete && (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-1 rounded-md hover:opacity-80 transition-all"
                            style={{ color: 'var(--color-error)' }}>
                            <Trash2 size={14} />
                        </button>
                    )}
                    {onClick && <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
                </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}>
                    {classroom.gradeLevel}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent)' }}>
                    ภาคเรียน {classroom.semester}/{classroom.academicYear}
                </span>
                {memberCount !== undefined && (
                    <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium"
                        style={{ background: 'color-mix(in srgb, var(--color-success) 12%, transparent)', color: 'var(--color-success)' }}>
                        <Users size={11} />{memberCount} คน
                    </span>
                )}
            </div>

            {/* Join Code */}
            {isTeacher && (
                <div className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ background: 'var(--color-primary-light)', border: '1px dashed color-mix(in srgb, var(--color-primary) 35%, transparent)' }}>
                    <div className="flex items-center gap-2">
                        <BookOpen size={13} style={{ color: 'var(--color-primary)' }} />
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>รหัสห้อง:</span>
                        <span className="font-mono font-bold tracking-widest text-sm" style={{ color: 'var(--color-primary)' }}>
                            {classroom.joinCode}
                        </span>
                    </div>
                    <button onClick={copyCode}
                        className="p-1.5 rounded-md transition-all hover:opacity-80"
                        style={{ color: copied ? 'var(--color-success)' : 'var(--color-primary)' }}>
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClassroomCard;
