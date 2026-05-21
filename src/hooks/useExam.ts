// src/hooks/useExam.ts

import { useState, useEffect } from 'react';
import {
    collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    query, where, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { Exam, ExamResult } from '../types/types';

interface UseExamReturn {
    exams: Exam[];
    loading: boolean;
    createExam: (data: Omit<Exam, 'examId' | 'createdAt'>) => Promise<string>;
    updateExam: (examId: string, patch: Partial<Omit<Exam, 'examId' | 'createdAt'>>) => Promise<void>;
    deleteExam: (examId: string) => Promise<void>;
    toggleOpen: (examId: string, isOpen: boolean) => Promise<void>;
    publishResults: (examId: string) => Promise<void>;
    getExamResults: (examId: string) => Promise<Record<string, ExamResult>>;
    getMyResult: (examId: string, uid: string) => Promise<ExamResult | null>;
    submitResult: (
        examId: string,
        uid: string,
        result: Omit<ExamResult, 'uid' | 'attemptCount'>,
        scorePolicy?: import('../types/types').ScorePolicy,
    ) => Promise<ExamResult>;
}

export const useExam = (classroomId: string | null): UseExamReturn => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!classroomId) {
            setExams([]);
            setLoading(false);
            return;
        }
        const q = query(collection(db, 'exams'), where('classroomId', '==', classroomId));
        const unsub = onSnapshot(
            q,
            (snap) => {
                setExams(
                    snap.docs
                        .map(d => d.data() as Exam)
                        .sort((a, b) => b.createdAt - a.createdAt),
                );
                setLoading(false);
            },
            () => setLoading(false),
        );
        return () => unsub();
    }, [classroomId]);

    const createExam = async (data: Omit<Exam, 'examId' | 'createdAt'>): Promise<string> => {
        const ref = doc(collection(db, 'exams'));
        const exam: Exam = { ...data, examId: ref.id, createdAt: Date.now() };
        await setDoc(ref, exam);
        return ref.id;
    };

    const updateExam = async (
        examId: string,
        patch: Partial<Omit<Exam, 'examId' | 'createdAt'>>,
    ): Promise<void> => {
        await updateDoc(doc(db, 'exams', examId), patch);
    };

    const deleteExam = async (examId: string): Promise<void> => {
        const resultsSnap = await getDocs(collection(db, 'exams', examId, 'results'));
        await Promise.all(resultsSnap.docs.map(d => deleteDoc(d.ref)));
        await deleteDoc(doc(db, 'exams', examId));
    };

    const toggleOpen = async (examId: string, isOpen: boolean): Promise<void> => {
        await updateDoc(doc(db, 'exams', examId), { isOpen });
    };

    const publishResults = async (examId: string): Promise<void> => {
        await updateDoc(doc(db, 'exams', examId), { isResultPublished: true });
    };

    const getExamResults = async (examId: string): Promise<Record<string, ExamResult>> => {
        const snap = await getDocs(collection(db, 'exams', examId, 'results'));
        const results: Record<string, ExamResult> = {};
        snap.forEach(d => { results[d.id] = d.data() as ExamResult; });
        return results;
    };

    const getMyResult = async (examId: string, uid: string): Promise<ExamResult | null> => {
        const snap = await getDoc(doc(db, 'exams', examId, 'results', uid));
        return snap.exists() ? (snap.data() as ExamResult) : null;
    };

    const submitResult = async (
        examId: string,
        uid: string,
        result: Omit<ExamResult, 'uid' | 'attemptCount'>,
        scorePolicy: import('../types/types').ScorePolicy = 'last',
    ): Promise<ExamResult> => {
        const ref = doc(db, 'exams', examId, 'results', uid);
        const existing = await getDoc(ref);
        const attemptCount = existing.exists() ? (existing.data().attemptCount || 0) + 1 : 1;

        let finalResult: ExamResult;
        if (existing.exists() && scorePolicy === 'best') {
            const prev = existing.data() as ExamResult;
            // เก็บผลที่ดีกว่า (score10Point สูงกว่า หรือเท่ากันแต่ WPM สูงกว่า)
            const useNew = result.score10Point > prev.score10Point ||
                (result.score10Point === prev.score10Point && result.wpm > prev.wpm);
            finalResult = { ...(useNew ? result : prev), uid, attemptCount };
        } else if (existing.exists() && scorePolicy === 'average') {
            const prev = existing.data() as ExamResult;
            // คะแนนเฉลี่ยสะสม (running average)
            finalResult = {
                ...result,
                uid,
                attemptCount,
                wpm: Math.round((prev.wpm * (attemptCount - 1) + result.wpm) / attemptCount),
                accuracy: Math.round((prev.accuracy * (attemptCount - 1) + result.accuracy) / attemptCount),
                score10Point: Math.round((prev.score10Point * (attemptCount - 1) + result.score10Point) / attemptCount),
                totalErrors: Math.round((prev.totalErrors * (attemptCount - 1) + result.totalErrors) / attemptCount),
            };
            finalResult.isPassed = finalResult.score10Point >= result.score10Point; // recheck pass
        } else {
            finalResult = { ...result, uid, attemptCount };
        }

        await setDoc(ref, finalResult);
        return finalResult;
    };

    return {
        exams, loading,
        createExam, updateExam, deleteExam, toggleOpen, publishResults,
        getExamResults, getMyResult, submitResult,
    };
};

// คำนวณชุดข้อสอบที่นักเรียนจะได้รับ (reuse pattern จาก usePrePostTest)
export { computeAssignedSet } from './usePrePostTest';
