import { useState, useEffect } from 'react';
import {
    collection, doc, getDoc, getDocs, setDoc, deleteDoc,
    onSnapshot, updateDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { db } from '../firebase/firebaseConfig';
import type { Classroom, ClassroomMember, CustomLesson, ClassroomLevelStats } from '../types/types';
import { normalizeJoinCode, isJoinCodeValid } from '../utils/classroomUtils';

interface UseStudentClassroomReturn {
    myClassrooms: Classroom[];
    loading: boolean;
    joinClassroom: (joinCode: string) => Promise<{ success: boolean; classroomName?: string; error?: string }>;
    leaveClassroom: (classroomId: string) => Promise<void>;
    getLessons: (classroomId: string) => Promise<CustomLesson[]>;
    saveStats: (classroomId: string, lessonId: string, stats: Omit<ClassroomLevelStats, 'lastPlayed' | 'playCount' | 'classroomId' | 'lessonId'>) => Promise<void>;
    getMyStats: (classroomId: string, lessonId: string) => Promise<ClassroomLevelStats | null>;
}

export const useStudentClassroom = (user: FirebaseUser | null): UseStudentClassroomReturn => {
    const [myClassrooms, setMyClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);

    // subscribe profile → classroomIds เปลี่ยนเมื่อ join/leave
    useEffect(() => {
        if (!user) {
            setMyClassrooms([]);
            setLoading(false);
            return;
        }

        const profileRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(profileRef, async (snap) => {
            if (!snap.exists()) {
                setMyClassrooms([]);
                setLoading(false);
                return;
            }
            const ids: string[] = snap.data().classroomIds || [];
            if (ids.length === 0) {
                setMyClassrooms([]);
                setLoading(false);
                return;
            }
            const results = await Promise.all(
                ids.map(async (id) => {
                    const s = await getDoc(doc(db, 'classrooms', id));
                    return s.exists() ? (s.data() as Classroom) : null;
                })
            );
            setMyClassrooms(
                results
                    .filter((c): c is Classroom => c !== null && c.isActive)
                    .sort((a, b) => b.createdAt - a.createdAt)
            );
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const joinClassroom = async (rawCode: string): Promise<{ success: boolean; classroomName?: string; error?: string }> => {
        if (!user) return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' };

        const code = normalizeJoinCode(rawCode);
        if (!isJoinCodeValid(code)) return { success: false, error: 'รหัสต้องมี 6 ตัวอักษร (A–Z, 0–9)' };

        const codeSnap = await getDoc(doc(db, 'joinCodes', code));
        if (!codeSnap.exists()) return { success: false, error: 'ไม่พบรหัสห้องเรียน กรุณาตรวจสอบอีกครั้ง' };

        const { classroomId } = codeSnap.data() as { classroomId: string };

        const classroomSnap = await getDoc(doc(db, 'classrooms', classroomId));
        if (!classroomSnap.exists() || !classroomSnap.data().isActive) {
            return { success: false, error: 'ห้องเรียนนี้ไม่ได้เปิดใช้งาน' };
        }
        const info = classroomSnap.data() as Classroom;

        const memberSnap = await getDoc(doc(db, 'classrooms', classroomId, 'members', user.uid));
        if (memberSnap.exists()) return { success: false, error: 'คุณเป็นสมาชิกห้องนี้อยู่แล้ว' };

        const member: ClassroomMember = {
            uid: user.uid,
            displayName: user.displayName || 'นักเรียน',
            email: user.email || '',
            joinedAt: Date.now(),
            role: 'student',
        };
        await setDoc(doc(db, 'classrooms', classroomId, 'members', user.uid), member);
        await updateDoc(doc(db, 'users', user.uid), { classroomIds: arrayUnion(classroomId) });

        return { success: true, classroomName: info.name };
    };

    const leaveClassroom = async (classroomId: string): Promise<void> => {
        if (!user) return;
        await deleteDoc(doc(db, 'classrooms', classroomId, 'members', user.uid));
        await updateDoc(doc(db, 'users', user.uid), { classroomIds: arrayRemove(classroomId) });
    };

    const getLessons = async (classroomId: string): Promise<CustomLesson[]> => {
        const snap = await getDocs(collection(db, 'classrooms', classroomId, 'lessons'));
        return snap.docs
            .map(d => d.data() as CustomLesson)
            .sort((a, b) => a.createdAt - b.createdAt);
    };

    const saveStats = async (
        classroomId: string,
        lessonId: string,
        stats: Omit<ClassroomLevelStats, 'lastPlayed' | 'playCount' | 'classroomId' | 'lessonId'>
    ): Promise<void> => {
        if (!user) return;
        const statsRef = doc(db, 'users', user.uid, 'classroomStats', `${classroomId}_${lessonId}`);
        const existing = await getDoc(statsRef);
        const playCount = existing.exists() ? (existing.data().playCount || 0) + 1 : 1;
        await setDoc(statsRef, { ...stats, classroomId, lessonId, lastPlayed: Date.now(), playCount });
    };

    const getMyStats = async (classroomId: string, lessonId: string): Promise<ClassroomLevelStats | null> => {
        if (!user) return null;
        const snap = await getDoc(doc(db, 'users', user.uid, 'classroomStats', `${classroomId}_${lessonId}`));
        return snap.exists() ? (snap.data() as ClassroomLevelStats) : null;
    };

    return { myClassrooms, loading, joinClassroom, leaveClassroom, getLessons, saveStats, getMyStats };
};
