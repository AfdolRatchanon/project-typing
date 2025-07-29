
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

// NEW INTERFACE: Define the structure for level statistics
export interface LevelStats {
  wpm: number;
  accuracy: number;
  totalErrors: number;
  grade: string;
  score10Point: number;
  lastPlayed: number;
  playCount: number;
}

// Interface for scoring criteria
export interface ScoringCriteria {
  minWPM: number;
  maxErrors: number;
  minAccuracy?: number; // Optional
  grade?: string; // Optional
  score10Point: number;
}

// Interfaces for data structure (languages, units, sessions, levels)
export interface Level {
  id: string;
  name: string;
  text: string;
  timeLimit?: number; // Optional time limit in seconds
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

export interface KeyDisplayLayout {
  [key: string]: string;
}

export interface KeyDisplays {
  en: {
    unshifted: KeyDisplayLayout;
    shifted: KeyDisplayLayout;
  };
  th: {
    unshifted: KeyDisplayLayout;
    shifted: KeyDisplayLayout;
  };
}

export interface KeyToFingerMap {
  [key: string]: string;
}

export interface FingerNamesDisplay {
  [key: string]: string;
}