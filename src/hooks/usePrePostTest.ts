// src/hooks/usePrePostTest.ts

import { useState, useEffect } from 'react';
import {
    collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    query, where, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { PrePostTest, PrePostTestResult, SetAssignmentMethod } from '../types/types';

// คำนวณชุดข้อสอบที่นักเรียนจะได้รับ
export const computeAssignedSet = (
    studentNumber: number,
    uid: string,
    testId: string,
    method: SetAssignmentMethod,
): number => {
    if (method === 'by-student-number') {
        return ((studentNumber - 1) % 5) + 1;
    }
    // สุ่มแบบ deterministic ต่อ (uid, testId) — นักเรียนคนเดียวกันได้ชุดเดิมทุกครั้ง
    const key = uid + testId;
    const hash = [...key].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0x7fffffff, 0);
    return (hash % 5) + 1;
};

interface UsePrePostTestReturn {
    tests: PrePostTest[];
    loading: boolean;
    createTest: (data: Omit<PrePostTest, 'testId' | 'createdAt'>) => Promise<string>;
    updateTest: (testId: string, patch: Partial<Omit<PrePostTest, 'testId' | 'createdAt'>>) => Promise<void>;
    deleteTest: (testId: string) => Promise<void>;
    toggleOpen: (testId: string, isOpen: boolean) => Promise<void>;
    publishResults: (testId: string) => Promise<void>;
    getTestResults: (testId: string) => Promise<Record<string, PrePostTestResult>>;
    getMyResult: (testId: string, uid: string) => Promise<PrePostTestResult | null>;
    submitResult: (
        testId: string,
        uid: string,
        result: Omit<PrePostTestResult, 'uid' | 'attemptCount'>,
    ) => Promise<PrePostTestResult>;
}

export const usePrePostTest = (classroomId: string | null): UsePrePostTestReturn => {
    const [tests, setTests] = useState<PrePostTest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!classroomId) {
            setTests([]);
            setLoading(false);
            return;
        }
        const q = query(collection(db, 'prePostTests'), where('classroomId', '==', classroomId));
        const unsub = onSnapshot(
            q,
            (snap) => {
                setTests(
                    snap.docs
                        .map(d => d.data() as PrePostTest)
                        .sort((a, b) => b.createdAt - a.createdAt),
                );
                setLoading(false);
            },
            () => setLoading(false),
        );
        return () => unsub();
    }, [classroomId]);

    const createTest = async (data: Omit<PrePostTest, 'testId' | 'createdAt'>): Promise<string> => {
        const ref = doc(collection(db, 'prePostTests'));
        const test: PrePostTest = { ...data, testId: ref.id, createdAt: Date.now() };
        await setDoc(ref, test);
        return ref.id;
    };

    const updateTest = async (
        testId: string,
        patch: Partial<Omit<PrePostTest, 'testId' | 'createdAt'>>,
    ): Promise<void> => {
        await updateDoc(doc(db, 'prePostTests', testId), patch);
    };

    const deleteTest = async (testId: string): Promise<void> => {
        const resultsSnap = await getDocs(collection(db, 'prePostTests', testId, 'results'));
        await Promise.all(resultsSnap.docs.map(d => deleteDoc(d.ref)));
        await deleteDoc(doc(db, 'prePostTests', testId));
    };

    const toggleOpen = async (testId: string, isOpen: boolean): Promise<void> => {
        await updateDoc(doc(db, 'prePostTests', testId), { isOpen });
    };

    const publishResults = async (testId: string): Promise<void> => {
        await updateDoc(doc(db, 'prePostTests', testId), { isResultPublished: true });
    };

    const getTestResults = async (testId: string): Promise<Record<string, PrePostTestResult>> => {
        const snap = await getDocs(collection(db, 'prePostTests', testId, 'results'));
        const results: Record<string, PrePostTestResult> = {};
        snap.forEach(d => { results[d.id] = d.data() as PrePostTestResult; });
        return results;
    };

    const getMyResult = async (testId: string, uid: string): Promise<PrePostTestResult | null> => {
        const snap = await getDoc(doc(db, 'prePostTests', testId, 'results', uid));
        return snap.exists() ? (snap.data() as PrePostTestResult) : null;
    };

    const submitResult = async (
        testId: string,
        uid: string,
        result: Omit<PrePostTestResult, 'uid' | 'attemptCount'>,
    ): Promise<PrePostTestResult> => {
        const ref = doc(db, 'prePostTests', testId, 'results', uid);
        const existing = await getDoc(ref);
        const attemptCount = existing.exists() ? (existing.data().attemptCount || 0) + 1 : 1;
        const full: PrePostTestResult = { ...result, uid, attemptCount };
        await setDoc(ref, full);
        return full;
    };

    return {
        tests, loading,
        createTest, updateTest, deleteTest, toggleOpen, publishResults,
        getTestResults, getMyResult, submitResult,
    };
};
