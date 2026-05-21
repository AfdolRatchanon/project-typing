// src/components/survey/SurveyList.tsx

import React, { useState, useEffect } from 'react';
import { PlusCircle, MessageSquare } from 'lucide-react';
import type { Survey, SurveySummary } from '../../types/types';
import { useSurvey } from '../../hooks/useSurvey';
import { usePrePostTest } from '../../hooks/usePrePostTest';
import SurveyCard from './SurveyCard';
import SurveyCreate from './SurveyCreate';
import SurveyResultsDashboard from './SurveyResultsDashboard';

interface Props {
    classroomId: string;
    teacherUid: string;
}

const SurveyList: React.FC<Props> = ({ classroomId, teacherUid }) => {
    const {
        surveys, loading,
        createSurvey, deleteSurvey, toggleOpen,
        getSurveyResponses,
    } = useSurvey(classroomId);

    const { tests } = usePrePostTest(classroomId);
    const postTests = tests.filter(t => t.type === 'post');

    const [showCreate, setShowCreate] = useState(false);
    const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
    const [viewSurvey, setViewSurvey] = useState<Survey | null>(null);
    const [viewSummary, setViewSummary] = useState<SurveySummary | null>(null);
    const [loadingResults, setLoadingResults] = useState(false);

    useEffect(() => {
        if (surveys.length === 0) return;
        (async () => {
            const counts: Record<string, number> = {};
            await Promise.all(surveys.map(async s => {
                const { responses } = await getSurveyResponses(s.surveyId, s.questions);
                counts[s.surveyId] = responses.length;
            }));
            setResponseCounts(counts);
        })();
    }, [surveys.map(s => s.surveyId).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleViewResults = async (survey: Survey) => {
        setViewSurvey(survey);
        setLoadingResults(true);
        const { summary } = await getSurveyResponses(survey.surveyId, survey.questions);
        setViewSummary(summary);
        setLoadingResults(false);
    };

    if (loading) {
        return (
            <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>กำลังโหลด...</p>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                    แบบสอบถามความพึงพอใจ
                </h3>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                    style={{ background: 'var(--color-primary)' }}>
                    <PlusCircle size={13} /> สร้างแบบสอบถาม
                </button>
            </div>

            {surveys.length === 0 ? (
                <div className="text-center py-8 rounded-xl" style={{ border: '1px dashed var(--color-border)' }}>
                    <MessageSquare size={28} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีแบบสอบถามในห้องนี้</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        กด "สร้างแบบสอบถาม" เพื่อสร้างแบบสอบถาม Likert 10 ข้อ
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {surveys.map(s => (
                        <SurveyCard
                            key={s.surveyId}
                            survey={s}
                            responseCount={responseCounts[s.surveyId] ?? 0}
                            onToggleOpen={toggleOpen}
                            onDelete={deleteSurvey}
                            onViewResults={handleViewResults}
                        />
                    ))}
                </div>
            )}

            {showCreate && (
                <SurveyCreate
                    classroomId={classroomId}
                    teacherUid={teacherUid}
                    postTests={postTests}
                    onClose={() => setShowCreate(false)}
                    onSave={async (data) => { await createSurvey(data); }}
                />
            )}

            {viewSurvey && loadingResults && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <p className="text-white text-sm">กำลังโหลดผล...</p>
                </div>
            )}

            {viewSurvey && !loadingResults && viewSummary && (
                <SurveyResultsDashboard
                    survey={viewSurvey}
                    summary={viewSummary}
                    onClose={() => { setViewSurvey(null); setViewSummary(null); }}
                />
            )}
        </div>
    );
};

export default SurveyList;
