// src/components/survey/ResearchExport.tsx

import React, { useState } from 'react';
import { Download, FlaskConical } from 'lucide-react';
import type { ClassroomMember, CustomLesson } from '../../types/types';
import { useSurvey } from '../../hooks/useSurvey';
import { usePrePostTest } from '../../hooks/usePrePostTest';
import { exportResearchCSV } from '../../utils/researchExport';

interface Props {
    classroomId: string;
    members: ClassroomMember[];
    lessons: CustomLesson[];
}

const ResearchExport: React.FC<Props> = ({ classroomId, members, lessons }) => {
    const { tests } = usePrePostTest(classroomId);
    const { surveys, buildResearchData } = useSurvey(classroomId);

    const preTests = tests.filter(t => t.type === 'pre');
    const postTests = tests.filter(t => t.type === 'post');

    const [preTestId, setPreTestId] = useState('');
    const [postTestId, setPostTestId] = useState('');
    const [surveyId, setSurveyId] = useState('');
    const [exporting, setExporting] = useState(false);

    const selectStyle: React.CSSProperties = {
        padding: '0.5rem 0.75rem',
        borderRadius: '0.5rem',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        fontSize: '0.875rem',
        flex: 1,
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const rows = await buildResearchData({
                members,
                lessons,
                preTestId: preTestId || null,
                postTestId: postTestId || null,
                surveyId: surveyId || null,
            });
            exportResearchCSV(rows, `research_${classroomId}.csv`);
        } finally {
            setExporting(false);
        }
    };

    const studentCount = members.filter(m => m.role === 'student').length;

    return (
        <div className="mt-6 p-4 rounded-xl" style={{
            background: 'color-mix(in srgb, var(--color-accent) 6%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-accent) 18%, transparent)',
        }}>
            <div className="flex items-center gap-2 mb-3">
                <FlaskConical size={15} style={{ color: 'var(--color-accent)' }} />
                <h4 className="font-bold text-sm" style={{ color: 'var(--color-accent)' }}>
                    ส่งออกข้อมูลวิจัย (CSV)
                </h4>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                รวม E1/E2, Pre/Post WPM, ค่าเฉลี่ยแบบสอบถาม — นำเข้า SPSS ได้ทันที
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                    <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Pre-test</label>
                    <select style={selectStyle} value={preTestId} onChange={e => setPreTestId(e.target.value)}>
                        <option value="">— ไม่เลือก —</option>
                        {preTests.map(t => (
                            <option key={t.testId} value={t.testId}>{t.title}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                    <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Post-test</label>
                    <select style={selectStyle} value={postTestId} onChange={e => setPostTestId(e.target.value)}>
                        <option value="">— ไม่เลือก —</option>
                        {postTests.map(t => (
                            <option key={t.testId} value={t.testId}>{t.title}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                    <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>แบบสอบถาม</label>
                    <select style={selectStyle} value={surveyId} onChange={e => setSurveyId(e.target.value)}>
                        <option value="">— ไม่เลือก —</option>
                        {surveys.map(s => (
                            <option key={s.surveyId} value={s.surveyId}>{s.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={handleExport}
                disabled={exporting || studentCount === 0}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'var(--color-accent)' }}>
                <Download size={14} />
                {exporting ? 'กำลังสร้าง...' : `ดาวน์โหลด CSV (${studentCount} คน)`}
            </button>
        </div>
    );
};

export default ResearchExport;
