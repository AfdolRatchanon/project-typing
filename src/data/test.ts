import type { Language, LevelScoring } from '../types/types' // Import the interfaces

export const languages: Language[] = [
    {
        id: 'thai',
        name: 'ภาษาไทย',
        units: [
            {
                id: 'thai-unit-12',
                name: 'หน่วยที่ 12: การพิมพ์แป้นอักษร ณ ศ ฒ ญ ฐ',
                sessions: [
                    {
                        id: 'thai-session-12-4',
                        name: 'แบบฝึกหัดที่ 12.4: เพื่อพัฒนา ณ ศ ฒ ญ ฐ',
                        levels: [
                            {
                                id: 'thai-practice-12-4-1',
                                name: 'ครั้งที่ 1 การพัฒนาประเทศชาติ',
                                text: 'การพัฒนาประเทศชาติ ทำให้มีความเจริญรุ่งเรือง ประชาชนคนไทยทุกคน จึงควรมีส่วนร่วมในการพัฒนาประเทศร่วมกัน',
                                timeLimit: 60
                            },
                            {
                                id: 'thai-practice-12-4-2',
                                name: 'ครั้งที่ 2 ศาลอาญาเป็นศาลที่ทำการพิจารณาคดีต่าง ๆ',
                                text: 'ศาลอาญาเป็นศาลที่ทำการพิจารณาคดีต่าง ๆ คนที่ทำผิดจึงต้องไปที่ศาลอาญา ถ้าทำผิดหลายครั้ง ศาลอาญาจะพิจารณาฐานแห่งความผิดอย่างละเอียดรอบคอบ',
                                timeLimit: 60
                            },
                            {
                                id: 'thai-practice-12-4-3',
                                name: 'ครั้งที่ 3 หญิงไทยสมัยนี้',
                                text: 'หญิงไทยสมัยนี้ ไม่ว่าจะมีฐานะอย่างไร มีความน่ารัก เรียบร้อย แต่จะมีความกล้าหาญมากยิ่งขึ้น เพราะหญิงไทยต้องทำมาหากิน หาเลี้ยงครอบครัวด้วย',
                                timeLimit: 60
                            },
                            {
                                id: 'thai-practice-12-4-4',
                                name: 'ครั้งที่ 4 ปัญหาคุณแม่วัยใส',
                                text: 'ปัญหาคุณแม่วัยใสที่เรียกชื่อกันในปัจจุบัน เพราะเกิดจากวัยรุ่นที่ไม่ระมัดระวัง เมื่อพลาดแล้ว ปัญหาสังคมจะมีเพิ่มมากขึ้น',
                                timeLimit: 60
                            },
                            {
                                id: 'thai-practice-12-4-5',
                                name: 'ครั้งที่ 5 การทำคุณงามความดี',
                                text: 'การทำคุณงามความดี มีคุณค่าอย่างยิ่ง ทุกคนจะสรรเสริญ ชื่นชมในคุณงามความดีนั้น ๆ ไม่ว่าจะมีฐานะอะไร สามารถนำไปใช้กับชีวิตประจำวันได้',
                                timeLimit: 60
                            },
                        ]
                    },

                ]
            },
        ]
    }
]

export const scoringCriteria: LevelScoring = {
    // Thai Basic Session 1
    'thai-practice-12-4-1': [
        { minWPM: 20, minAccuracy: 95, maxErrors: 1, grade: 'ยอดเยี่ยม!', score10Point: 10 },
        { minWPM: 18, minAccuracy: 90, maxErrors: 2, grade: 'ดีมาก', score10Point: 9 },
        { minWPM: 16, minAccuracy: 85, maxErrors: 3, grade: 'ดี', score10Point: 8 },
        { minWPM: 14, minAccuracy: 80, maxErrors: 4, grade: 'ค่อนข้างดี', score10Point: 7 },
        { minWPM: 12, minAccuracy: 75, maxErrors: 5, grade: 'พอใช้', score10Point: 6 },
        { minWPM: 10, minAccuracy: 70, maxErrors: 6, grade: 'ปานกลาง', score10Point: 5 },
        { minWPM: 8, minAccuracy: 65, maxErrors: 7, grade: 'อ่อน', score10Point: 4 },
        { minWPM: 6, minAccuracy: 60, maxErrors: 8, grade: 'ต้องปรับปรุง', score10Point: 3 },
        { minWPM: 4, minAccuracy: 55, maxErrors: 9, grade: 'ต้องฝึกเพิ่ม', score10Point: 2 },
        { minWPM: 2, minAccuracy: 50, maxErrors: 10, grade: 'เริ่มต้น', score10Point: 1 },
    ],
    'thai-practice-12-4-2': [
        { minWPM: 20, minAccuracy: 95, maxErrors: 2, grade: 'ยอดเยี่ยม!', score10Point: 10 },
        { minWPM: 18, minAccuracy: 90, maxErrors: 3, grade: 'ดีมาก', score10Point: 9 },
        { minWPM: 16, minAccuracy: 85, maxErrors: 4, grade: 'ดี', score10Point: 8 },
        { minWPM: 14, minAccuracy: 80, maxErrors: 5, grade: 'ค่อนข้างดี', score10Point: 7 },
        { minWPM: 12, minAccuracy: 75, maxErrors: 6, grade: 'พอใช้', score10Point: 6 },
        { minWPM: 10, minAccuracy: 70, maxErrors: 7, grade: 'ปานกลาง', score10Point: 5 },
        { minWPM: 8, minAccuracy: 65, maxErrors: 8, grade: 'อ่อน', score10Point: 4 },
        { minWPM: 6, minAccuracy: 60, maxErrors: 9, grade: 'ต้องปรับปรุง', score10Point: 3 },
        { minWPM: 4, minAccuracy: 55, maxErrors: 10, grade: 'ต้องฝึกเพิ่ม', score10Point: 2 },
        { minWPM: 2, minAccuracy: 50, maxErrors: 12, grade: 'เริ่มต้น', score10Point: 1 },
    ],
    'thai-practice-12-4-3': [
        { minWPM: 20, minAccuracy: 95, maxErrors: 2, grade: 'ยอดเยี่ยม!', score10Point: 10 },
        { minWPM: 18, minAccuracy: 90, maxErrors: 3, grade: 'ดีมาก', score10Point: 9 },
        { minWPM: 16, minAccuracy: 85, maxErrors: 4, grade: 'ดี', score10Point: 8 },
        { minWPM: 14, minAccuracy: 80, maxErrors: 5, grade: 'ค่อนข้างดี', score10Point: 7 },
        { minWPM: 12, minAccuracy: 75, maxErrors: 6, grade: 'พอใช้', score10Point: 6 },
        { minWPM: 10, minAccuracy: 70, maxErrors: 7, grade: 'ปานกลาง', score10Point: 5 },
        { minWPM: 8, minAccuracy: 65, maxErrors: 8, grade: 'อ่อน', score10Point: 4 },
        { minWPM: 6, minAccuracy: 60, maxErrors: 9, grade: 'ต้องปรับปรุง', score10Point: 3 },
        { minWPM: 4, minAccuracy: 55, maxErrors: 10, grade: 'ต้องฝึกเพิ่ม', score10Point: 2 },
        { minWPM: 2, minAccuracy: 50, maxErrors: 12, grade: 'เริ่มต้น', score10Point: 1 },
    ],
    'thai-practice-12-4-4': [
        { minWPM: 20, minAccuracy: 95, maxErrors: 2, grade: 'ยอดเยี่ยม!', score10Point: 10 },
        { minWPM: 18, minAccuracy: 90, maxErrors: 3, grade: 'ดีมาก', score10Point: 9 },
        { minWPM: 16, minAccuracy: 85, maxErrors: 4, grade: 'ดี', score10Point: 8 },
        { minWPM: 14, minAccuracy: 80, maxErrors: 5, grade: 'ค่อนข้างดี', score10Point: 7 },
        { minWPM: 12, minAccuracy: 75, maxErrors: 6, grade: 'พอใช้', score10Point: 6 },
        { minWPM: 10, minAccuracy: 70, maxErrors: 7, grade: 'ปานกลาง', score10Point: 5 },
        { minWPM: 8, minAccuracy: 65, maxErrors: 8, grade: 'อ่อน', score10Point: 4 },
        { minWPM: 6, minAccuracy: 60, maxErrors: 9, grade: 'ต้องปรับปรุง', score10Point: 3 },
        { minWPM: 4, minAccuracy: 55, maxErrors: 10, grade: 'ต้องฝึกเพิ่ม', score10Point: 2 },
        { minWPM: 2, minAccuracy: 50, maxErrors: 12, grade: 'เริ่มต้น', score10Point: 1 },
    ],
    'thai-practice-12-4-5': [
        { minWPM: 20, minAccuracy: 95, maxErrors: 2, grade: 'ยอดเยี่ยม!', score10Point: 10 },
        { minWPM: 18, minAccuracy: 90, maxErrors: 3, grade: 'ดีมาก', score10Point: 9 },
        { minWPM: 16, minAccuracy: 85, maxErrors: 4, grade: 'ดี', score10Point: 8 },
        { minWPM: 14, minAccuracy: 80, maxErrors: 5, grade: 'ค่อนข้างดี', score10Point: 7 },
        { minWPM: 12, minAccuracy: 75, maxErrors: 6, grade: 'พอใช้', score10Point: 6 },
        { minWPM: 10, minAccuracy: 70, maxErrors: 7, grade: 'ปานกลาง', score10Point: 5 },
        { minWPM: 8, minAccuracy: 65, maxErrors: 8, grade: 'อ่อน', score10Point: 4 },
        { minWPM: 6, minAccuracy: 60, maxErrors: 9, grade: 'ต้องปรับปรุง', score10Point: 3 },
        { minWPM: 4, minAccuracy: 55, maxErrors: 10, grade: 'ต้องฝึกเพิ่ม', score10Point: 2 },
        { minWPM: 2, minAccuracy: 50, maxErrors: 12, grade: 'เริ่มต้น', score10Point: 1 },
    ],
}