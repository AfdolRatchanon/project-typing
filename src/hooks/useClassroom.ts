import { useState, useEffect } from 'react';
import {
    collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    onSnapshot, query, where, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { Classroom, ClassroomMember, CustomLesson } from '../types/types';
import { generateJoinCode } from '../utils/classroomUtils';

interface UseClassroomReturn {
    classrooms: Classroom[];
    loading: boolean;
    error: string | null;
    createClassroom: (data: Omit<Classroom, 'classroomId' | 'joinCode' | 'createdAt' | 'isActive'>) => Promise<string>;
    updateClassroom: (classroomId: string, patch: Partial<Classroom>) => Promise<void>;
    deleteClassroom: (classroomId: string) => Promise<void>;
    getMembers: (classroomId: string) => Promise<ClassroomMember[]>;
    removeMember: (classroomId: string, uid: string) => Promise<void>;
    createLesson: (classroomId: string, data: Omit<CustomLesson, 'lessonId' | 'createdAt' | 'classroomId' | 'createdBy'>, createdBy: string) => Promise<string>;
    updateLesson: (classroomId: string, lessonId: string, patch: Partial<CustomLesson>) => Promise<void>;
    deleteLesson: (classroomId: string, lessonId: string) => Promise<void>;
    getLessons: (classroomId: string) => Promise<CustomLesson[]>;
    importMembers: (classroomId: string, members: { displayName: string; email: string; studentNumber?: number }[]) => Promise<{ added: number; skipped: string[] }>;
    regenerateJoinCode: (classroomId: string, oldCode: string) => Promise<string>;
    cloneClassroom: (sourceId: string, newName: string) => Promise<string>;
    archiveClassroom: (classroomId: string) => Promise<void>;
    unarchiveClassroom: (classroomId: string) => Promise<void>;
}

export const useClassroom = (teacherUid: string | null): UseClassroomReturn => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!teacherUid) {
            setClassrooms([]);
            setLoading(false);
            return;
        }
        const q = query(collection(db, 'classrooms'), where('teacherUid', '==', teacherUid));
        const unsubscribe = onSnapshot(q, (snap) => {
            const mine = snap.docs
                .map(d => d.data() as Classroom)
                .sort((a, b) => b.createdAt - a.createdAt);
            setClassrooms(mine);
            setLoading(false);
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [teacherUid]);

    const createClassroom = async (
        data: Omit<Classroom, 'classroomId' | 'joinCode' | 'createdAt' | 'isActive'>
    ): Promise<string> => {
        const classroomRef = doc(collection(db, 'classrooms'));
        const classroomId = classroomRef.id;

        let joinCode = '';
        for (let i = 0; i < 10; i++) {
            const candidate = generateJoinCode();
            const snap = await getDoc(doc(db, 'joinCodes', candidate));
            if (!snap.exists()) { joinCode = candidate; break; }
        }
        if (!joinCode) throw new Error('ไม่สามารถสร้างรหัสห้องได้ กรุณาลองใหม่');

        const classroom: Classroom = { ...data, classroomId, joinCode, createdAt: Date.now(), isActive: true };
        await setDoc(classroomRef, classroom);
        await setDoc(doc(db, 'joinCodes', joinCode), { classroomId, createdBy: data.teacherUid, createdAt: Date.now() });
        await updateDoc(doc(db, 'users', data.teacherUid), { classroomIds: arrayUnion(classroomId) });

        return classroomId;
    };

    const updateClassroom = async (classroomId: string, patch: Partial<Classroom>): Promise<void> => {
        await updateDoc(doc(db, 'classrooms', classroomId), patch);
    };

    const deleteClassroom = async (classroomId: string): Promise<void> => {
        const infoSnap = await getDoc(doc(db, 'classrooms', classroomId));
        if (!infoSnap.exists()) return;
        const info = infoSnap.data() as Classroom;

        // ลบ members ออกจาก subcollection + ลบ classroomId จาก user profile
        const membersSnap = await getDocs(collection(db, 'classrooms', classroomId, 'members'));
        await Promise.all(membersSnap.docs.map(async (d) => {
            await deleteDoc(d.ref);
            await updateDoc(doc(db, 'users', d.id), { classroomIds: arrayRemove(classroomId) }).catch(() => {});
        }));

        // ลบ lessons ทั้งหมด
        const lessonsSnap = await getDocs(collection(db, 'classrooms', classroomId, 'lessons'));
        await Promise.all(lessonsSnap.docs.map(d => deleteDoc(d.ref)));

        await deleteDoc(doc(db, 'joinCodes', info.joinCode));
        await deleteDoc(doc(db, 'classrooms', classroomId));
        await updateDoc(doc(db, 'users', info.teacherUid), { classroomIds: arrayRemove(classroomId) }).catch(() => {});
    };

    const getMembers = async (classroomId: string): Promise<ClassroomMember[]> => {
        const snap = await getDocs(collection(db, 'classrooms', classroomId, 'members'));
        return snap.docs
            .map(d => d.data() as ClassroomMember)
            .sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? '', 'th'));
    };

    const removeMember = async (classroomId: string, uid: string): Promise<void> => {
        await deleteDoc(doc(db, 'classrooms', classroomId, 'members', uid));
        await updateDoc(doc(db, 'users', uid), { classroomIds: arrayRemove(classroomId) }).catch(() => {});
    };

    const createLesson = async (
        classroomId: string,
        data: Omit<CustomLesson, 'lessonId' | 'createdAt' | 'classroomId' | 'createdBy'>,
        createdBy: string,
    ): Promise<string> => {
        const lessonRef = doc(collection(db, 'classrooms', classroomId, 'lessons'));
        const lessonId = lessonRef.id;
        const lesson: CustomLesson = { ...data, lessonId, classroomId, createdBy, createdAt: Date.now() };
        await setDoc(lessonRef, lesson);
        return lessonId;
    };

    const updateLesson = async (classroomId: string, lessonId: string, patch: Partial<CustomLesson>): Promise<void> => {
        await updateDoc(doc(db, 'classrooms', classroomId, 'lessons', lessonId), {
            ...patch,
            updatedAt: Date.now(),
            ...(teacherUid ? { updatedBy: teacherUid } : {}),
        });
    };

    const deleteLesson = async (classroomId: string, lessonId: string): Promise<void> => {
        await deleteDoc(doc(db, 'classrooms', classroomId, 'lessons', lessonId));
    };

    const getLessons = async (classroomId: string): Promise<CustomLesson[]> => {
        const snap = await getDocs(collection(db, 'classrooms', classroomId, 'lessons'));
        return snap.docs
            .map(d => d.data() as CustomLesson)
            .sort((a, b) => {
                if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
                if (a.order !== undefined) return -1;
                if (b.order !== undefined) return 1;
                return a.createdAt - b.createdAt;
            });
    };

    const importMembers = async (classroomId: string, members: { displayName: string; email: string; studentNumber?: number }[]): Promise<{ added: number; skipped: string[] }> => {
        const classroomSnap = await getDoc(doc(db, 'classrooms', classroomId));
        if (!classroomSnap.exists()) throw new Error('ไม่พบห้องเรียน');
        if (members.length === 0) return { added: 0, skipped: [] };

        // Firestore 'in' query รองรับสูงสุด 30 ค่าต่อครั้ง
        const emails = members.map(m => m.email);
        const chunks: string[][] = [];
        for (let i = 0; i < emails.length; i += 30) chunks.push(emails.slice(i, i + 30));

        const emailToUser = new Map<string, { uid: string; displayName: string }>();
        await Promise.all(chunks.map(async (chunk) => {
            const q = query(collection(db, 'users'), where('email', 'in', chunk));
            const snap = await getDocs(q);
            snap.forEach(d => {
                const data = d.data();
                emailToUser.set(data.email, { uid: d.id, displayName: data.displayName || '' });
            });
        }));

        // H5 — track skipped emails (no Firebase account found)
        const skipped: string[] = members.filter(m => !emailToUser.has(m.email)).map(m => m.email);

        await Promise.all(members.map(async (m) => {
            const found = emailToUser.get(m.email);
            if (!found) return;
            const member: ClassroomMember = {
                uid: found.uid,
                displayName: found.displayName || m.displayName,
                email: m.email,
                joinedAt: Date.now(),
                role: 'student',
                ...(m.studentNumber !== undefined ? { studentNumber: m.studentNumber } : {}),
            };
            await setDoc(doc(db, 'classrooms', classroomId, 'members', found.uid), member);
            await updateDoc(doc(db, 'users', found.uid), { classroomIds: arrayUnion(classroomId) });
        }));

        return { added: members.length - skipped.length, skipped };
    };

    // T9 — Clone classroom (copy lessons only, no members/results/surveys)
    const cloneClassroom = async (sourceId: string, newName: string): Promise<string> => {
        const sourceSnap = await getDoc(doc(db, 'classrooms', sourceId));
        if (!sourceSnap.exists()) throw new Error('ไม่พบห้องเรียนต้นฉบับ');
        const source = sourceSnap.data() as Classroom;
        const newId = await createClassroom({
            name: newName,
            subject: source.subject,
            gradeLevel: source.gradeLevel,
            semester: source.semester,
            academicYear: source.academicYear,
            teacherUid: source.teacherUid,
        });
        const lessonsSnap = await getDocs(collection(db, 'classrooms', sourceId, 'lessons'));
        await Promise.all(lessonsSnap.docs.map(async (d) => {
            const lesson = d.data() as CustomLesson;
            const newLessonRef = doc(collection(db, 'classrooms', newId, 'lessons'));
            await setDoc(newLessonRef, { ...lesson, lessonId: newLessonRef.id, classroomId: newId, createdAt: Date.now() });
        }));
        return newId;
    };

    // X5 — Archive / Unarchive classroom
    const archiveClassroom = async (classroomId: string): Promise<void> => {
        await updateDoc(doc(db, 'classrooms', classroomId), { isArchived: true });
    };

    const unarchiveClassroom = async (classroomId: string): Promise<void> => {
        await updateDoc(doc(db, 'classrooms', classroomId), { isArchived: false });
    };

    // P3 — ออก join code ใหม่ (ยกเลิก code เดิม)
    const regenerateJoinCode = async (classroomId: string, oldCode: string): Promise<string> => {
        let newCode = '';
        for (let i = 0; i < 10; i++) {
            const candidate = generateJoinCode();
            const snap = await getDoc(doc(db, 'joinCodes', candidate));
            if (!snap.exists()) { newCode = candidate; break; }
        }
        if (!newCode) throw new Error('ไม่สามารถสร้างรหัสใหม่ได้');
        await deleteDoc(doc(db, 'joinCodes', oldCode));
        await setDoc(doc(db, 'joinCodes', newCode), { classroomId, createdBy: teacherUid, createdAt: Date.now() });
        await updateDoc(doc(db, 'classrooms', classroomId), { joinCode: newCode });
        return newCode;
    };

    return {
        classrooms, loading, error,
        createClassroom, updateClassroom, deleteClassroom,
        getMembers, removeMember,
        createLesson, updateLesson, deleteLesson, getLessons,
        importMembers, regenerateJoinCode,
        cloneClassroom, archiveClassroom, unarchiveClassroom,
    };
};
