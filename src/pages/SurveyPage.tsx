// src/pages/SurveyPage.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Survey, SurveyResponse } from '../types/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useSurvey } from '../hooks/useSurvey';

interface Props {
    user: FirebaseUser | null;
}

type Phase = 'loading' | 'not-found' | 'closed' | 'submitted' | 'form';

const LIKERT_LABELS = ['', 'น้อยที่สุด', 'น้อย', 'ปานกลาง', 'มาก', 'มากที่สุด'];

const SurveyPage: React.FC<Props> = ({ user }) => {
    const { surveyId } = useParams<{ surveyId: string }>();
    const navigate = useNavigate();

    const [phase, setPhase] = useState<Phase>('loading');
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [existingResponse, setExistingResponse] = useState<SurveyResponse | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { submitResponse, getMyResponse } = useSurvey(survey?.classroomId ?? null);

    useEffect(() => {
        if (!surveyId || !user) return;
        (async () => {
            const snap = await getDoc(doc(db, 'surveys', surveyId));
            if (!snap.exists()) { setPhase('not-found'); return; }
            const s = snap.data() as Survey;
            setSurvey(s);
            if (!s.isOpen) { setPhase('closed'); return; }
            const myResp = await getMyResponse(surveyId, user.uid);
            if (myResp) {
                setExistingResponse(myResp);
                setPhase('submitted');
                return;
            }
            setPhase('form');
        })();
    }, [surveyId, user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

    const allAnswered = survey
        ? survey.questions.every(q => (answers[q.questionId] ?? 0) > 0)
        : false;

    const handleSubmit = async () => {
        if (!survey || !user || !surveyId) return;
        if (!allAnswered) { setError('กรุณาตอบทุกข้อ'); return; }
        setSubmitting(true);
        setError('');
        try {
            const memberSnap = await getDoc(doc(db, 'classrooms', survey.classroomId, 'members', user.uid));
            const studentNumber = memberSnap.exists() ? (memberSnap.data()?.studentNumber ?? 0) : 0;
            await submitResponse(surveyId, user.uid, studentNumber, user.displayName ?? '', answers);
            setPhase('submitted');
        } catch {
            setError('ส่งไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setSubmitting(false);
        }
    };

    if (phase === 'loading') {
        return (
            <div className="min-h-screen app-bg flex items-center justify-center">
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลด...</p>
            </div>
        );
    }

    if (phase === 'not-found') {
        return (
            <div className="min-h-screen app-bg flex flex-col items-center justify-center gap-3 p-4">
                <p className="font-bold" style={{ color: 'var(--color-text)' }}>ไม่พบแบบสอบถาม</p>
                <button onClick={() => navigate('/my-classroom')}
                    className="text-sm px-4 py-2 rounded-lg text-white"
                    style={{ background: 'var(--color-primary)' }}>
                    กลับ
                </button>
            </div>
        );
    }

    if (phase === 'closed') {
        return (
            <div className="min-h-screen app-bg flex flex-col items-center justify-center gap-3 p-4">
                <p className="font-bold" style={{ color: 'var(--color-text)' }}>แบบสอบถามนี้ปิดรับคำตอบแล้ว</p>
                <button onClick={() => navigate('/my-classroom')}
                    className="text-sm px-4 py-2 rounded-lg text-white"
                    style={{ background: 'var(--color-primary)' }}>
                    กลับห้องเรียน
                </button>
            </div>
        );
    }

    if (phase === 'submitted') {
        return (
            <div className="min-h-screen app-bg flex flex-col items-center justify-center gap-4 p-4">
                <CheckCircle2 size={48} style={{ color: 'var(--color-success)' }} />
                <div className="text-center">
                    <p className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>ส่งคำตอบแล้ว</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{survey?.title}</p>
                    {existingResponse && (
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            ส่งเมื่อ {new Date(existingResponse.submittedAt).toLocaleString('th-TH')}
                        </p>
                    )}
                </div>
                <button onClick={() => navigate('/my-classroom')}
                    className="text-sm px-4 py-2 rounded-lg text-white"
                    style={{ background: 'var(--color-primary)' }}>
                    กลับห้องเรียน
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen app-bg p-3 sm:p-5">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <button onClick={() => navigate('/my-classroom')}
                        className="p-2 rounded-lg transition-all hover:opacity-80"
                        style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                            {survey?.title}
                        </h1>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                            โปรดตอบทุกข้อตามความเป็นจริง · Likert 5 ระดับ
                        </p>
                    </div>
                </div>

                {/* Questions */}
                <div className="flex flex-col gap-4">
                    {survey?.questions.map(q => (
                        <div key={q.questionId} className="p-4 rounded-xl"
                            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                                <span style={{ color: 'var(--color-primary)' }}>{q.order}. </span>
                                {q.text}
                            </p>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(v => {
                                    const selected = answers[q.questionId] === v;
                                    return (
                                        <button
                                            key={v}
                                            onClick={() => setAnswers(prev => ({ ...prev, [q.questionId]: v }))}
                                            className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl flex-1 transition-all font-medium"
                                            style={{
                                                background: selected ? 'var(--color-primary)' : 'var(--color-primary-light)',
                                                color: selected ? '#fff' : 'var(--color-text-muted)',
                                                border: selected
                                                    ? '2px solid var(--color-primary)'
                                                    : '2px solid transparent',
                                            }}>
                                            <span className="text-lg leading-none">{v}</span>
                                            <span className="text-[9px] leading-none text-center">
                                                {LIKERT_LABELS[v]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit */}
                <div className="mt-5">
                    {error && (
                        <p className="text-xs mb-2 text-center" style={{ color: 'var(--color-error)' }}>{error}</p>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={!allAnswered || submitting}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
                        style={{ background: 'var(--color-primary)' }}>
                        <Send size={15} />
                        {submitting ? 'กำลังส่ง...' : 'ส่งแบบสอบถาม'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurveyPage;
