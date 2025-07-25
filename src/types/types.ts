
// Define types for better type safety and code readability
export interface Level {
    id: string;
    name: string;
    text: string;
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

export interface TimerConfig {
    duration: number; // milliseconds, Infinity สำหรับไม่จำกัดเวลา
    label: string;
}

export interface ScoringCriteria {
    minWPM: number;
    minAccuracy: number;
    maxErrors: number;
    grade: string;
}

export interface LevelScoring {
    [levelId: string]: ScoringCriteria[];
}