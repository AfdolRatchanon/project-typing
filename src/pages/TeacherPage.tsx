// src/pages/TeacherPage.tsx

import React, { useState, useEffect } from 'react';
import { PlusCircle, Users, BookOpen, Upload, LayoutDashboard, ClipboardList, MessageSquare, FileText, ChevronDown, RefreshCw, Trash2, Copy, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserRole, ClassroomMember, CustomLesson } from '../types/types';
import { useClassroom } from '../hooks/useClassroom';
import CreateClassroomModal from '../components/classroom/CreateClassroomModal';
import LessonManager from '../components/classroom/LessonManager';
import MemberTable from '../components/classroom/MemberTable';
import CSVImportPanel from '../components/classroom/CSVImportPanel';
import PrePostTestList from '../components/prepost/PrePostTestList';
import SurveyList from '../components/survey/SurveyList';
import ResearchExport from '../components/survey/ResearchExport';
import ExamList from '../components/exam/ExamList';

interface Props {
    user: FirebaseUser | null;
    userRole: UserRole | null;
}

type Tab = 'members' | 'lessons' | 'import' | 'tests' | 'exam' | 'survey';

const TeacherPage: React.FC<Props> = ({ user, userRole }) => {
    const navigate = useNavigate();
    const { classrooms, loading, createClassroom, deleteClassroom, getMembers, removeMember,
        createLesson, updateLesson, deleteLesson, getLessons, importMembers, regenerateJoinCode,
        cloneClassroom, archiveClassroom, unarchiveClassroom } = useClassroom(user?.uid || null);

    const [showCreate, setShowCreate] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>('members');
    const [members, setMembers] = useState<ClassroomMember[]>([]);
    const [lessons, setLessons] = useState<CustomLesson[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const selected = classrooms.find(c => c.classroomId === selectedId) || null;

    // E1 — auto-select first active classroom on load
    useEffect(() => {
        if (activeClassrooms.length > 0 && !selectedId) setSelectedId(activeClassrooms[0].classroomId);
    }, [classrooms]); // eslint-disable-line react-hooks/exhaustive-deps

    // โหลดข้อมูลห้องที่เลือก
    useEffect(() => {
        if (!selectedId) return;
        setLoadingDetail(true);
        Promise.all([getMembers(selectedId), getLessons(selectedId)]).then(([m, l]) => {
            setMembers(m);
            setLessons(l);
            setLoadingDetail(false);
        });
    }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

    const activeClassrooms = classrooms.filter(c => !c.isArchived);
    const archivedClassrooms = classrooms.filter(c => c.isArchived);

    const handleDelete = async (classroomId: string) => {
        if (!confirm('ลบห้องเรียนนี้? ข้อมูลทั้งหมดจะหายไป')) return;
        await deleteClassroom(classroomId);
        if (selectedId === classroomId) setSelectedId(null);
    };

    const handleClone = async () => {
        if (!selected) return;
        const newName = window.prompt('ชื่อห้องเรียนใหม่:', selected.name + ' (สำเนา)');
        if (!newName?.trim()) return;
        await cloneClassroom(selected.classroomId, newName.trim());
    };

    const handleArchive = async () => {
        if (!selected) return;
        if (!confirm(`เก็บถาวรห้อง "${selected.name}"?\nห้องจะถูกซ่อนจากมุมมองหลัก`)) return;
        await archiveClassroom(selected.classroomId);
        setSelectedId(null);
    };

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'members', label: `นักเรียน (${members.length})`, icon: <Users size={14} /> },
        { key: 'lessons', label: 'บทเรียน', icon: <BookOpen size={14} /> },
        { key: 'tests', label: 'การทดสอบ', icon: <ClipboardList size={14} /> },
        { key: 'exam', label: 'การสอบ', icon: <FileText size={14} /> },
        { key: 'survey', label: 'แบบสอบถาม', icon: <MessageSquare size={14} /> },
        { key: 'import', label: 'นำเข้า CSV', icon: <Upload size={14} /> },
    ];

    return (
        <div className="min-h-screen app-bg p-3 sm:p-5">
            <div className="max-w-7xl mx-auto">
                {/* ── Top bar ── */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className="mr-auto">
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>จัดการห้องเรียน</h1>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                            {userRole === 'superAdmin' ? 'SuperAdmin' : 'ครู'} — {user?.displayName}
                        </p>
                    </div>
                    <button onClick={() => navigate('/practice')}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all hover:opacity-90"
                        style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                        <LayoutDashboard size={13} /> หน้าฝึก
                    </button>
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg text-white transition-all hover:opacity-90"
                        style={{ background: 'var(--color-primary)' }}>
                        <PlusCircle size={13} /> สร้างห้องใหม่
                    </button>
                </div>

                {/* ── Classroom selector strip ── */}
                <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-2xl"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    {loading ? (
                        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลด...</span>
                    ) : activeClassrooms.length === 0 && archivedClassrooms.length === 0 ? (
                        <div className="flex items-center gap-3">
                            <Users size={20} style={{ color: 'var(--color-text-muted)' }} />
                            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีห้องเรียน</span>
                            <button onClick={() => setShowCreate(true)}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg"
                                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                สร้างห้องแรก
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* E1 — Classroom dropdown (active only) */}
                            <div className="relative">
                                <select
                                    value={selectedId ?? ''}
                                    onChange={e => { setSelectedId(e.target.value || null); setTab('members'); }}
                                    className="appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-semibold cursor-pointer"
                                    style={{
                                        background: 'var(--color-primary-light)',
                                        border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                                        color: 'var(--color-text)',
                                        minWidth: '180px',
                                    }}>
                                    <option value="">— เลือกห้องเรียน —</option>
                                    {activeClassrooms.map(c => (
                                        <option key={c.classroomId} value={c.classroomId}>{c.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--color-primary)' }} />
                            </div>

                            {/* U12 — quick stats */}
                            {selected && !loadingDetail && (
                                <div className="flex items-center gap-4 text-sm flex-wrap">
                                    <span><span className="font-bold" style={{ color: 'var(--color-primary)' }}>{members.length}</span> <span style={{ color: 'var(--color-text-muted)' }}>คน</span></span>
                                    <span><span className="font-bold" style={{ color: 'var(--color-accent)' }}>{lessons.length}</span> <span style={{ color: 'var(--color-text-muted)' }}>บทเรียน</span></span>
                                    <span className="font-mono text-xs px-2 py-0.5 rounded-lg"
                                        style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                                        {selected.subject} · {selected.gradeLevel}
                                    </span>
                                    <span data-testid="join-code" className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg"
                                        style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                        {selected.joinCode}
                                    </span>
                                </div>
                            )}

                            {/* Classroom actions */}
                            {selected && (
                                <div className="ml-auto flex gap-1.5 shrink-0">
                                    <button
                                        onClick={handleClone}
                                        title="คัดลอกห้องเรียน (บทเรียนเท่านั้น)"
                                        className="p-2 rounded-lg transition-all hover:opacity-80"
                                        style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                                        <Copy size={13} />
                                    </button>
                                    <button
                                        onClick={handleArchive}
                                        title="เก็บถาวรห้องเรียน"
                                        className="p-2 rounded-lg transition-all hover:opacity-80"
                                        style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                                        <Archive size={13} />
                                    </button>
                                    <button
                                        onClick={() => regenerateJoinCode(selected.classroomId, selected.joinCode)}
                                        title="สร้าง Join Code ใหม่"
                                        className="p-2 rounded-lg transition-all hover:opacity-80"
                                        style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                                        <RefreshCw size={13} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selected.classroomId)}
                                        title="ลบห้องเรียน"
                                        className="p-2 rounded-lg transition-all hover:opacity-80"
                                        style={{ background: 'color-mix(in srgb, var(--color-error) 10%, transparent)', color: 'var(--color-error)' }}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Full-width content panel ── */}
                {selected ? (
                    <div className="rounded-2xl p-4 lg:p-5"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        {/* E2 — Quick action bar */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            <button onClick={() => setTab('lessons')}
                                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                                style={{ background: 'var(--color-primary)' }}>
                                <BookOpen size={12} /> + บทเรียน
                            </button>
                            <button onClick={() => setTab('tests')}
                                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
                                style={{ background: 'color-mix(in srgb, #3b82f6 12%, transparent)', color: '#3b82f6', border: '1px solid color-mix(in srgb, #3b82f6 25%, transparent)' }}>
                                <ClipboardList size={12} /> Pre/Post Test
                            </button>
                            <button onClick={() => setTab('exam')}
                                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
                                style={{ background: 'color-mix(in srgb, #f97316 12%, transparent)', color: '#f97316', border: '1px solid color-mix(in srgb, #f97316 25%, transparent)' }}>
                                <FileText size={12} /> + สอบ
                            </button>
                        </div>

                        {/* Tabs — full width */}
                        <div className="flex gap-1 mb-5 p-1 rounded-xl overflow-x-auto"
                            style={{ background: 'var(--color-primary-light)' }}>
                            {tabs.map(t => (
                                <button key={t.key} onClick={() => setTab(t.key)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                                    style={{
                                        background: tab === t.key ? 'var(--color-primary)' : 'transparent',
                                        color: tab === t.key ? '#fff' : 'var(--color-text-muted)',
                                    }}>
                                    {t.icon}{t.label}
                                </button>
                            ))}
                        </div>

                        {loadingDetail ? (
                            <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลด...</p>
                        ) : (
                            <>
                                {tab === 'members' && (
                                    <MemberTable
                                        classroomId={selected.classroomId}
                                        classroomName={selected.name}
                                        members={members}
                                        lessons={lessons}
                                        onRemoveMember={async (uid) => {
                                            await removeMember(selected.classroomId, uid);
                                            setMembers(prev => prev.filter(m => m.uid !== uid));
                                        }}
                                    />
                                )}
                                {tab === 'lessons' && (
                                    <LessonManager
                                        classroomId={selected.classroomId}
                                        teacherUid={user!.uid}
                                        getLessons={getLessons}
                                        createLesson={createLesson}
                                        updateLesson={updateLesson}
                                        deleteLesson={deleteLesson}
                                    />
                                )}
                                {tab === 'tests' && (
                                    <PrePostTestList
                                        classroomId={selected.classroomId}
                                        teacherUid={user!.uid}
                                        members={members}
                                    />
                                )}
                                {tab === 'exam' && (
                                    <ExamList
                                        classroomId={selected.classroomId}
                                        teacherUid={user!.uid}
                                        members={members}
                                    />
                                )}
                                {tab === 'survey' && (
                                    <>
                                        <SurveyList classroomId={selected.classroomId} teacherUid={user!.uid} />
                                        <ResearchExport classroomId={selected.classroomId} members={members} lessons={lessons} />
                                    </>
                                )}
                                {tab === 'import' && (
                                    <CSVImportPanel
                                        classroomId={selected.classroomId}
                                        onImport={async (cid, mems) => {
                                            const result = await importMembers(cid, mems);
                                            const updated = await getMembers(cid);
                                            setMembers(updated);
                                            return result;
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    activeClassrooms.length > 0 && (
                        <div className="flex flex-col items-center justify-center h-40 rounded-2xl"
                            style={{ border: '1px dashed var(--color-border)' }}>
                            <BookOpen size={32} className="mb-2" style={{ color: 'var(--color-text-muted)' }} />
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>เลือกห้องเรียนด้านบนเพื่อดูรายละเอียด</p>
                        </div>
                    )
                )}

                {/* X5 — Archived classrooms section */}
                {archivedClassrooms.length > 0 && (
                    <details className="mt-3 rounded-2xl overflow-hidden"
                        style={{ border: '1px solid var(--color-border)' }}>
                        <summary className="flex items-center gap-2 p-3 cursor-pointer text-sm font-medium select-none"
                            style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', listStyle: 'none' }}>
                            <Archive size={14} /> ห้องที่เก็บถาวร ({archivedClassrooms.length})
                        </summary>
                        <div className="flex flex-col gap-1.5 p-3"
                            style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
                            {archivedClassrooms.map(c => (
                                <div key={c.classroomId}
                                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl"
                                    style={{ background: 'var(--color-primary-light)' }}>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-muted)' }}>{c.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{c.subject} · {c.gradeLevel}</p>
                                    </div>
                                    <button
                                        onClick={() => unarchiveClassroom(c.classroomId)}
                                        className="text-xs px-2.5 py-1 rounded-lg font-medium shrink-0 transition-all hover:opacity-80"
                                        style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                                        ยกเลิกเก็บถาวร
                                    </button>
                                </div>
                            ))}
                        </div>
                    </details>
                )}
            </div>

            {/* Create modal */}
            {showCreate && user && (
                <CreateClassroomModal
                    teacherUid={user.uid}
                    onClose={() => setShowCreate(false)}
                    onCreate={async (data) => {
                        await createClassroom(data);
                    }}
                />
            )}
        </div>
    );
};

export default TeacherPage;
