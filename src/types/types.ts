
export interface Level {
    id: string;
    name: string;
    text: string;
    timeLimit?: number; // เวลาจำกัดเป็นวินาที (ถ้าไม่กำหนดจะเป็น infinity)
}

export interface Session {
    id: string;
    name: string;
    levels: Level[];
}

export interface Unit {
    id: string;
    name: string;
    sessions: Session[];
}

export interface Language {
    id: string;
    name: string;
    units: Unit[];
}

export interface ScoringCriterion {
    minWPM: number;
    minAccuracy?: number;
    maxErrors: number;
    grade?: string;
    score10Point: number;
}

export interface LevelScoring {
    [levelId: string]: ScoringCriterion[];
}

export interface TimerConfig {
    [levelId: string]: number; // เวลาเป็นวินาที
}