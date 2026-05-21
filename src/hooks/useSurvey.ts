// src/hooks/useSurvey.ts

import { useState, useEffect } from 'react';
import {
    collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    query, where, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type {
    Survey, SurveyResponse, ClassroomMember, CustomLesson,
    ClassroomLevelStats, PrePostTestResult, ResearchExportRow,
} from '../types/types';
import { computeSurveySummary } from '../utils/researchExport';

export const useSurvey = (classroomId: string | null) => {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!classroomId) { setSurveys([]); setLoading(false); return; }
        const q = query(collection(db, 'surveys'), where('classroomId', '==', classroomId));
        const unsub = onSnapshot(
            q,
            (snap) => {
                setSurveys(
                    snap.docs
                        .map(d => d.data() as Survey)
                        .sort((a, b) => b.createdAt - a.createdAt),
                );
                setLoading(false);
            },
            () => setLoading(false),
        );
        return () => unsub();
    }, [classroomId]);

    // ─── Teacher CRUD ───

    const createSurvey = async (data: Omit<Survey, 'surveyId' | 'createdAt'>): Promise<string> => {
        const ref = doc(collection(db, 'surveys'));
        const survey: Survey = { ...data, surveyId: ref.id, createdAt: Date.now() };
        await setDoc(ref, survey);
        return ref.id;
    };

    const updateSurvey = async (surveyId: string, patch: Partial<Survey>): Promise<void> => {
        await updateDoc(doc(db, 'surveys', surveyId), patch);
    };

    const deleteSurvey = async (surveyId: string): Promise<void> => {
        const respSnap = await getDocs(collection(db, 'surveys', surveyId, 'responses'));
        await Promise.all(respSnap.docs.map(d => deleteDoc(d.ref)));
        await deleteDoc(doc(db, 'surveys', surveyId));
    };

    const toggleOpen = async (surveyId: string, isOpen: boolean): Promise<void> => {
        await updateDoc(doc(db, 'surveys', surveyId), { isOpen });
    };

    const getSurveyResponses = async (surveyId: string, questions: Survey['questions']) => {
        const snap = await getDocs(collection(db, 'surveys', surveyId, 'responses'));
        const responses = snap.docs.map(d => d.data() as SurveyResponse);
        return { responses, summary: computeSurveySummary(responses, questions) };
    };

    // ─── Student ───

    const submitResponse = async (
        surveyId: string,
        uid: string,
        studentNumber: number,
        displayName: string,
        answers: Record<string, number>,
    ): Promise<void> => {
        const response: SurveyResponse = {
            uid,
            studentNumber,
            displayName,
            submittedAt: Date.now(),
            answers,
        };
        await setDoc(doc(db, 'surveys', surveyId, 'responses', uid), response);
    };

    const getMyResponse = async (surveyId: string, uid: string): Promise<SurveyResponse | null> => {
        const snap = await getDoc(doc(db, 'surveys', surveyId, 'responses', uid));
        return snap.exists() ? (snap.data() as SurveyResponse) : null;
    };

    // ─── Research Export ───

    const buildResearchData = async (config: {
        members: ClassroomMember[];
        lessons: CustomLesson[];
        preTestId: string | null;
        postTestId: string | null;
        surveyId: string | null;
    }): Promise<ResearchExportRow[]> => {
        const { members, lessons, preTestId, postTestId, surveyId } = config;

        // 1. E1 — classroomStats per student (per lesson)
        const classroomIdVal = classroomId ?? '';
        const memberStatsMap: Record<string, ClassroomLevelStats[]> = {};
        await Promise.all(members.filter(m => m.role === 'student').map(async (m) => {
            const statsPerLesson: ClassroomLevelStats[] = [];
            await Promise.all(lessons.map(async (l) => {
                const snap = await getDoc(
                    doc(db, 'users', m.uid, 'classroomStats', `${classroomIdVal}_${l.lessonId}`),
                );
                if (snap.exists()) statsPerLesson.push(snap.data() as ClassroomLevelStats);
            }));
            memberStatsMap[m.uid] = statsPerLesson;
        }));

        // 2. Pre-test results
        const preResults: Record<string, PrePostTestResult> = {};
        if (preTestId) {
            const snap = await getDocs(collection(db, 'prePostTests', preTestId, 'results'));
            snap.forEach(d => { preResults[d.id] = d.data() as PrePostTestResult; });
        }

        // 3. Post-test results
        const postResults: Record<string, PrePostTestResult> = {};
        if (postTestId) {
            const snap = await getDocs(collection(db, 'prePostTests', postTestId, 'results'));
            snap.forEach(d => { postResults[d.id] = d.data() as PrePostTestResult; });
        }

        // 4. Survey responses
        let surveyData: { answers: Record<string, number>; questions: Survey['questions'] } | null = null;
        if (surveyId) {
            const surveySnap = await getDoc(doc(db, 'surveys', surveyId));
            if (surveySnap.exists()) {
                const survey = surveySnap.data() as Survey;
                const respSnap = await getDocs(collection(db, 'surveys', surveyId, 'responses'));
                const respMap: Record<string, SurveyResponse> = {};
                respSnap.forEach(d => { respMap[d.id] = d.data() as SurveyResponse; });
                surveyData = { answers: {} as Record<string, number>, questions: survey.questions };
                // store full responses map for later per-student lookup
                (surveyData as unknown as { respMap: Record<string, SurveyResponse> }).respMap = respMap;
            }
        }

        // 5. Build rows
        const lessonCount = lessons.length;
        return members
            .filter(m => m.role === 'student')
            .sort((a, b) => (a.studentNumber ?? 9999) - (b.studentNumber ?? 9999))
            .map(m => {
                // E1
                const stats = memberStatsMap[m.uid] ?? [];
                let e1Score: number | null = null;
                if (lessonCount > 0 && stats.length > 0) {
                    const sum = stats.reduce((s, st) => s + st.score10Point, 0);
                    e1Score = parseFloat(((sum / (lessonCount * 10)) * 100).toFixed(2));
                }

                // E2
                const postResult = postResults[m.uid] ?? null;
                const e2Score = postResult ? parseFloat((postResult.score10Point * 10).toFixed(2)) : null;

                // Pre
                const preResult = preResults[m.uid] ?? null;

                // Survey
                let surveyContentMean: number | null = null;
                let surveyDesignMean: number | null = null;
                let surveyBenefitMean: number | null = null;
                let surveyOverallMean: number | null = null;

                if (surveyData) {
                    const respMap = (surveyData as unknown as { respMap: Record<string, SurveyResponse> }).respMap;
                    const myResp = respMap[m.uid];
                    if (myResp) {
                        const qs = surveyData.questions;
                        const dimMean = (dim: string) => {
                            const qd = qs.filter(q => q.dimension === dim);
                            const vals = qd.map(q => myResp.answers[q.questionId] ?? 0).filter(v => v > 0);
                            return vals.length > 0
                                ? parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2))
                                : null;
                        };
                        surveyContentMean = dimMean('content');
                        surveyDesignMean  = dimMean('design');
                        surveyBenefitMean = dimMean('benefit');
                        const all = qs.map(q => myResp.answers[q.questionId] ?? 0).filter(v => v > 0);
                        surveyOverallMean = all.length > 0
                            ? parseFloat((all.reduce((s, v) => s + v, 0) / all.length).toFixed(2))
                            : null;
                    }
                }

                return {
                    studentNumber: m.studentNumber ?? 0,
                    displayName: m.displayName,
                    e1Score,
                    e2Score,
                    e1Passed: e1Score !== null ? e1Score >= 80 : null,
                    e2Passed: e2Score !== null ? e2Score >= 80 : null,
                    preWpm: preResult?.wpm ?? null,
                    postWpm: postResult?.wpm ?? null,
                    preScore10: preResult?.score10Point ?? null,
                    postScore10: postResult?.score10Point ?? null,
                    preAssignedSet: preResult?.assignedSet ?? null,
                    postAssignedSet: postResult?.assignedSet ?? null,
                    surveyContentMean,
                    surveyDesignMean,
                    surveyBenefitMean,
                    surveyOverallMean,
                } satisfies ResearchExportRow;
            });
    };

    return {
        surveys, loading,
        createSurvey, updateSurvey, deleteSurvey, toggleOpen,
        getSurveyResponses,
        submitResponse, getMyResponse,
        buildResearchData,
    };
};
