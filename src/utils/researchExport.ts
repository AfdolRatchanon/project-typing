// src/utils/researchExport.ts
// Template questions + CSV export utility for Phase R research

import type {
    SurveyQuestion, SurveyResponse, SurveySummary, SurveyDimension, ResearchExportRow,
} from '../types/types';

// ─── Standard 10-question template ───────────────────────────────────────────

export const SURVEY_TEMPLATE_QUESTIONS: SurveyQuestion[] = [
    { questionId: 'q1',  dimension: 'content', text: 'เนื้อหาบทเรียนในระบบมีความเหมาะสมกับระดับทักษะของคุณ',              order: 1  },
    { questionId: 'q2',  dimension: 'content', text: 'ระดับความยากของบทเรียนมีความเหมาะสมและเพิ่มขึ้นตามลำดับ',            order: 2  },
    { questionId: 'q3',  dimension: 'content', text: 'ข้อความที่ใช้ฝึกพิมพ์มีความเกี่ยวข้องกับการใช้งานจริง',             order: 3  },
    { questionId: 'q4',  dimension: 'design',  text: 'การแสดงผลและรูปแบบหน้าจอมีความสวยงามและชัดเจน',                     order: 4  },
    { questionId: 'q5',  dimension: 'design',  text: 'ระบบใช้งานได้ง่ายและสะดวก',                                          order: 5  },
    { questionId: 'q6',  dimension: 'design',  text: 'การแสดงผลความเร็ว (WPM) และความถูกต้องเข้าใจง่าย',                  order: 6  },
    { questionId: 'q7',  dimension: 'design',  text: 'ผลลัพธ์และสถิติที่แสดงช่วยให้เข้าใจพัฒนาการของตัวเอง',             order: 7  },
    { questionId: 'q8',  dimension: 'benefit', text: 'การฝึกด้วยระบบนี้ช่วยพัฒนาทักษะการพิมพ์ดีดได้จริง',                order: 8  },
    { questionId: 'q9',  dimension: 'benefit', text: 'คุณอยากใช้ระบบนี้ฝึกพิมพ์ดีดต่อไปในอนาคต',                          order: 9  },
    { questionId: 'q10', dimension: 'benefit', text: 'คุณคิดว่าระบบนี้เป็นประโยชน์ต่อการเรียนอาชีวศึกษา',                 order: 10 },
];

// ─── Likert interpretation (Boonchom Srisa-ard) ──────────────────────────────

export const interpretLikert = (mean: number): string => {
    if (mean >= 4.51) return 'มากที่สุด';
    if (mean >= 3.51) return 'มาก';
    if (mean >= 2.51) return 'ปานกลาง';
    if (mean >= 1.51) return 'น้อย';
    return 'น้อยที่สุด';
};

// ─── Survey summary computation ───────────────────────────────────────────────

export const computeSurveySummary = (
    responses: SurveyResponse[],
    questions: SurveyQuestion[],
): SurveySummary => {
    if (responses.length === 0) {
        const emptyMeans: Record<string, number> = {};
        questions.forEach(q => { emptyMeans[q.questionId] = 0; });
        return {
            totalResponses: 0,
            dimensionMeans: { content: 0, design: 0, benefit: 0 },
            overallMean: 0,
            questionMeans: emptyMeans,
        };
    }

    // Question means
    const questionMeans: Record<string, number> = {};
    questions.forEach(q => {
        const vals = responses.map(r => r.answers[q.questionId] ?? 0).filter(v => v > 0);
        questionMeans[q.questionId] = vals.length > 0
            ? vals.reduce((s, v) => s + v, 0) / vals.length
            : 0;
    });

    // Dimension means
    const dims: SurveyDimension[] = ['content', 'design', 'benefit'];
    const dimensionMeans = {} as Record<SurveyDimension, number>;
    dims.forEach(dim => {
        const qs = questions.filter(q => q.dimension === dim);
        const means = qs.map(q => questionMeans[q.questionId]).filter(m => m > 0);
        dimensionMeans[dim] = means.length > 0 ? means.reduce((s, v) => s + v, 0) / means.length : 0;
    });

    const allMeans = Object.values(questionMeans).filter(m => m > 0);
    const overallMean = allMeans.length > 0 ? allMeans.reduce((s, v) => s + v, 0) / allMeans.length : 0;

    return { totalResponses: responses.length, dimensionMeans, overallMean, questionMeans };
};

// ─── CSV export ──────────────────────────────────────────────────────────────

const fmt = (v: number | null, decimals = 2): string => {
    if (v === null) return '';
    return v.toFixed(decimals);
};

export const exportResearchCSV = (rows: ResearchExportRow[], filename = 'research_export.csv'): void => {
    const headers = [
        'เลขที่', 'ชื่อ-แสดง',
        'E1(%)', 'E2(%)', 'E1/E2≥80',
        'Pre WPM', 'Post WPM', '+WPM',
        'Pre คะแนน(/10)', 'Post คะแนน(/10)', '+คะแนน',
        'Pre ชุดที่', 'Post ชุดที่',
        'ด้านเนื้อหา', 'ด้านออกแบบ', 'ด้านประโยชน์', 'รวมเฉลี่ย',
    ];

    const dataRows = rows.map(r => [
        r.studentNumber,
        r.displayName,
        fmt(r.e1Score, 2),
        fmt(r.e2Score, 2),
        r.e1Passed !== null && r.e2Passed !== null
            ? (r.e1Passed && r.e2Passed ? 'ผ่าน' : 'ไม่ผ่าน')
            : '',
        r.preWpm ?? '',
        r.postWpm ?? '',
        r.preWpm !== null && r.postWpm !== null ? r.postWpm - r.preWpm : '',
        r.preScore10 ?? '',
        r.postScore10 ?? '',
        r.preScore10 !== null && r.postScore10 !== null ? r.postScore10 - r.preScore10 : '',
        r.preAssignedSet ?? '',
        r.postAssignedSet ?? '',
        fmt(r.surveyContentMean),
        fmt(r.surveyDesignMean),
        fmt(r.surveyBenefitMean),
        fmt(r.surveyOverallMean),
    ]);

    // Summary row
    const n = rows.length;
    const avg = (vals: (number | null)[]) => {
        const v = vals.filter((x): x is number => x !== null);
        return v.length > 0 ? v.reduce((s, x) => s + x, 0) / v.length : null;
    };
    const summaryRow = [
        '', 'ค่าเฉลี่ย',
        fmt(avg(rows.map(r => r.e1Score))),
        fmt(avg(rows.map(r => r.e2Score))),
        `${rows.filter(r => r.e1Passed && r.e2Passed).length}/${n}`,
        fmt(avg(rows.map(r => r.preWpm)), 1),
        fmt(avg(rows.map(r => r.postWpm)), 1),
        '',
        fmt(avg(rows.map(r => r.preScore10)), 2),
        fmt(avg(rows.map(r => r.postScore10)), 2),
        '',
        '', '',
        fmt(avg(rows.map(r => r.surveyContentMean))),
        fmt(avg(rows.map(r => r.surveyDesignMean))),
        fmt(avg(rows.map(r => r.surveyBenefitMean))),
        fmt(avg(rows.map(r => r.surveyOverallMean))),
    ];

    const csvContent = [headers, ...dataRows, summaryRow]
        .map(row => row.map(cell => {
            const s = String(cell);
            return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
        }).join(','))
        .join('\n');

    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};
