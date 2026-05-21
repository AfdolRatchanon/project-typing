// src/pages/TeacherPage.tsx

import React, { useState, useEffect } from 'react';
import { PlusCircle, Users, BookOpen, Upload, LayoutDashboard, ClipboardList, MessageSquare, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserRole, ClassroomMember, CustomLesson } from '../types/types';
import { useClassroom } from '../hooks/useClassroom';
import ClassroomCard from '../components/classroom/ClassroomCard';
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
        createLesson, updateLesson, deleteLesson, getLessons, importMembers } = useClassroom(user?.uid || null);

    const [showCreate, setShowCreate] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>('members');
    const [members, setMembers] = useState<ClassroomMember[]>([]);
    const [lessons, setLessons] = useState<CustomLesson[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const selected = classrooms.find(c => c.classroomId === selectedId) || null;

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

    const handleSelectClassroom = (id: string) => {
        setSelectedId(id === selectedId ? null : id);
        setTab('members');
    };

    const handleDelete = async (classroomId: string) => {
        if (!confirm('ลบห้องเรียนนี้? ข้อมูลทั้งหมดจะหายไป')) return;
        await deleteClassroom(classroomId);
        if (selectedId === classroomId) setSelectedId(null);
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
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>จัดการห้องเรียน</h1>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                            {userRole === 'superAdmin' ? 'SuperAdmin' : 'ครู'} — {user?.displayName}
                        </p>
                    </div>
                    <div className="flex gap-2">
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
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Classroom list */}
                    <aside className="lg:w-72 xl:w-80 shrink-0">
                        <h2 className="text-xs font-semibold uppercase mb-2 px-1" style={{ color: 'var(--color-text-muted)' }}>
                            ห้องเรียนของฉัน ({classrooms.length})
                        </h2>
                        {loading ? (
                            <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลด...</div>
                        ) : classrooms.length === 0 ? (
                            <div className="text-center py-8 rounded-xl" style={{ border: '1px dashed var(--color-border)' }}>
                                <Users size={32} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีห้องเรียน</p>
                                <button onClick={() => setShowCreate(true)}
                                    className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg"
                                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                    สร้างห้องแรก
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {classrooms.map(c => (
                                    <ClassroomCard
                                        key={c.classroomId}
                                        classroom={c}
                                        memberCount={selectedId === c.classroomId ? members.length : undefined}
                                        isTeacher
                                        isSelected={selectedId === c.classroomId}
                                        onClick={() => handleSelectClassroom(c.classroomId)}
                                        onDelete={() => handleDelete(c.classroomId)}
                                    />
                                ))}
                            </div>
                        )}
                    </aside>

                    {/* Detail panel */}
                    <main className="flex-1 min-w-0 rounded-2xl p-4 lg:p-5"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        {!selected ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center">
                                <BookOpen size={40} className="mb-3" style={{ color: 'var(--color-text-muted)' }} />
                                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>เลือกห้องเรียนทางซ้ายเพื่อดูรายละเอียด</p>
                            </div>
                        ) : (
                            <>
                                {/* Room header */}
                                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{selected.name}</h2>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                        {selected.subject} · {selected.gradeLevel} · ภาค {selected.semester}/{selected.academicYear}
                                    </p>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit"
                                    style={{ background: 'var(--color-primary-light)' }}>
                                    {tabs.map(t => (
                                        <button key={t.key} onClick={() => setTab(t.key)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
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
                                                <SurveyList
                                                    classroomId={selected.classroomId}
                                                    teacherUid={user!.uid}
                                                />
                                                <ResearchExport
                                                    classroomId={selected.classroomId}
                                                    members={members}
                                                    lessons={lessons}
                                                />
                                            </>
                                        )}
                                        {tab === 'import' && (
                                            <CSVImportPanel
                                                classroomId={selected.classroomId}
                                                onImport={async (cid, mems) => {
                                                    await importMembers(cid, mems);
                                                    const updated = await getMembers(cid);
                                                    setMembers(updated);
                                                }}
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </main>
                </div>
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
