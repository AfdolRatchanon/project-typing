// src/hooks/useTypingGame.ts

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Level } from '../types/types';
// import type { LevelStats } from '../types/types';
import { languages } from '../data/data';
// import { scoringCriteria } from '../data/data';
import { getCharToKeyLabelMap, getRecommendedShiftKey } from '../utils/keyboardUtils';
import { segmentText, detectTextLanguage } from '../utils/textUtils';
import { calculateWPM, calculateAccuracy, getGrade, getScore10Point } from '../utils/scoreUtils';
// import {getDefaultCriteria} from '../utils/scoreUtils';
import { realtimeDb } from '../firebase/firebaseConfig';
import { ref, set, get } from 'firebase/database';
import { keyToFingerMap } from '../data/keyboardData';
// import {  fingerNamesDisplay } from '../data/keyboardData';

interface TypingGameProps {
  currentLevelId: string;
  user: any; // Firebase User object
  appId: string;
}

interface TypingGameState {
  fullTextContent: string;
  segments: string[];
  currentSegmentIndex: number;
  textToType: string;
  typedText: string;
  isStarted: boolean;
  isPaused: boolean;
  isFinished: boolean;
  timer: number;
  totalErrors: number;
  totalCorrectChars: number;
  totalTypedChars: number;
  wpm: number;
  accuracy: number;
  timeLimit: number | null;
  remainingTime: number | null;
  isTimeUp: boolean;
  nextChar: string;
  activeFinger: string | null;
  highlightedKeys: string[];
  keyboardLanguage: 'en' | 'th';
  isShiftActive: boolean;
  isCapsLockActive: boolean;
  // แก้ไขตรงนี้: เพิ่ม | null เพื่อให้ RefObject สามารถเป็น null ได้
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleStartPause: () => void;
  handleResetGame: () => void;
  getCurrentLevel: () => Level | null;
}

/**
 * @hook useTypingGame
 * @description Custom hook encapsulating all core typing game logic.
 * @param {TypingGameProps} props - Properties including currentLevelId, user, and appId.
 * @returns {TypingGameState} - An object containing all game states and functions.
 */
export const useTypingGame = ({ currentLevelId, user, appId }: TypingGameProps): TypingGameState => {
  // State for level content
  const [fullTextContent, setFullTextContent] = useState<string>('');
  const [segments, setSegments] = useState<string[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [textToType, setTextToType] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');

  // Game state
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isPaused, useStateIsPaused] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Timer and score
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [totalErrors, setTotalErrors] = useState<number>(0);
  const [totalCorrectChars, setTotalCorrectChars] = useState<number>(0);
  const [totalTypedChars, setTotalTypedChars] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);

  // Keyboard guidance
  const [nextChar, setNextChar] = useState<string>('');
  const [activeFinger, setActiveFinger] = useState<string | null>(null);
  const [highlightedKeys, setHighlightedKeys] = useState<string[]>([]);
  const [keyboardLanguage, setKeyboardLanguage] = useState<'en' | 'th'>('en');
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false);
  const [isCapsLockActive, setIsCapsLockActive] = useState<boolean>(false);

  // Refs for interval and input focus
  const intervalRef = useRef<number | null>(null);
  // แก้ไขตรงนี้: ระบุ type ชัดเจนว่าสามารถเป็น null ได้
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Refs for latest state values in setInterval/setTimeout
  const typedTextRef = useRef(typedText);
  const totalErrorsRef = useRef(totalErrors);
  const totalCorrectCharsRef = useRef(totalCorrectChars);
  const timerRef = useRef(timer);
  const currentSegmentIndexRef = useRef(currentSegmentIndex);
  const segmentsRef = useRef(segments);
  const textToTypeRef = useRef(textToType);
  const isPausedRef = useRef(isPaused);

  // Update refs when states change
  useEffect(() => { typedTextRef.current = typedText; }, [typedText]);
  useEffect(() => { totalErrorsRef.current = totalErrors; }, [totalErrors]);
  useEffect(() => { totalCorrectCharsRef.current = totalCorrectChars; }, [totalCorrectChars]);
  useEffect(() => { timerRef.current = timer; }, [timer]);
  useEffect(() => { currentSegmentIndexRef.current = currentSegmentIndex; }, [currentSegmentIndex]);
  useEffect(() => { segmentsRef.current = segments; }, [segments]);
  useEffect(() => { textToTypeRef.current = textToType; }, [textToType]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  /**
   * @memo typingGuidance
   * @description Calculates all necessary typing guidance information.
   */
  const typingGuidance = useMemo(() => {
    const mainLanguage = detectTextLanguage(textToType);
    const char = textToType[typedText.length];

    if (typedText.length === textToType.length && currentSegmentIndex + 1 < segments.length) {
      return { char: ' ', keysToHighlight: ['Space'], baseKey: 'Space', language: mainLanguage };
    }

    if (!char) {
      return { char: '', keysToHighlight: [], baseKey: null, language: mainLanguage };
    }

    let detectedLanguage: 'en' | 'th' = mainLanguage;
    if (char !== ' ') {
      const charCode = char.charCodeAt(0);
      detectedLanguage = (charCode >= 0x0E00 && charCode <= 0x0E7F) ? 'th' : 'en';
    }

    let baseKey: string | undefined;
    let needsShift = false;
    const unshiftedMap = getCharToKeyLabelMap(detectedLanguage, false);
    baseKey = unshiftedMap[char];

    if (!baseKey) {
      const shiftedMap = getCharToKeyLabelMap(detectedLanguage, true);
      baseKey = shiftedMap[char];
      if (baseKey) needsShift = true;
    }

    const keysToHighlight: string[] = [];
    if (baseKey) {
      keysToHighlight.push(baseKey);
      const isCharUpperCase = detectedLanguage === 'en' && char.match(/[A-Z]/);
      if (needsShift || (isCharUpperCase && !isCapsLockActive) || (!isCharUpperCase && isCapsLockActive && char.match(/[a-z]/i))) {
        keysToHighlight.push(getRecommendedShiftKey(baseKey));
      }
    }

    return {
      char: char,
      keysToHighlight: keysToHighlight,
      baseKey: baseKey || null,
      language: detectedLanguage,
    };
  }, [textToType, typedText, isCapsLockActive, currentSegmentIndex, segments]);

  /**
   * @function saveUserStats
   * @description Saves user typing statistics to Realtime Database.
   */
  const saveUserStats = useCallback(async (
    finalWPM: number,
    finalAccuracy: number,
    finalTotalErrors: number,
    finalGrade: string,
    finalScore10Point: number
  ) => {
    if (user && realtimeDb) {
      const userStatsPath = `artifacts/${appId}/users/${user.uid}/stats/${currentLevelId}`;
      const userStatsRef = ref(realtimeDb, userStatsPath);

      try {
        const snapshot = await get(userStatsRef);
        let currentPlayCount = 0;
        if (snapshot.exists()) {
          currentPlayCount = snapshot.val().playCount || 0;
        }

        await set(userStatsRef, {
          wpm: finalWPM,
          accuracy: finalAccuracy,
          totalErrors: finalTotalErrors,
          grade: finalGrade,
          score10Point: finalScore10Point,
          lastPlayed: Date.now(),
          playCount: currentPlayCount + 1,
        });
        console.log("User stats saved successfully!");
      } catch (error) {
        console.error("Error saving user stats:", error);
      }
    }
  }, [user, realtimeDb, currentLevelId, appId]);

  /**
   * @callback handleTimeUp
   * @description Handles game logic when time runs out.
   */
  const handleTimeUp = useCallback(() => {
    if (isTimeUp || isFinished) return;

    setIsTimeUp(true);
    setIsStarted(false);
    setIsFinished(true);

    let completedCharsFromPreviousSegments = 0;
    for (let i = 0; i < currentSegmentIndexRef.current; i++) {
      completedCharsFromPreviousSegments += segmentsRef.current[i].length + 1;
    }
    const currentTotalProgress = completedCharsFromPreviousSegments + typedTextRef.current.length;

    const currentCorrectChars = typedTextRef.current.split('')
      .filter((char, index) => char === textToTypeRef.current[index]).length;
    const currentActualErrors = typedTextRef.current.length - currentCorrectChars;

    const finalTotalCorrect = totalCorrectCharsRef.current + currentCorrectChars;
    const finalActualErrors = totalErrorsRef.current + currentActualErrors;

    const actualTimeUsed = startTime ? (Date.now() - startTime) / 1000 : timeLimit || timerRef.current;

    const finalWPM = calculateWPM(finalTotalCorrect, currentTotalProgress, finalActualErrors, actualTimeUsed, 'th');
    const finalAccuracy = calculateAccuracy(finalTotalCorrect, currentTotalProgress);

    setTotalCorrectChars(finalTotalCorrect);
    setTotalTypedChars(currentTotalProgress);
    setTotalErrors(finalActualErrors);
    setWpm(finalWPM);
    setAccuracy(finalAccuracy);

    saveUserStats(
      finalWPM,
      finalAccuracy,
      finalActualErrors,
      getGrade(finalWPM, finalAccuracy, finalActualErrors, currentLevelId),
      getScore10Point(finalWPM, finalAccuracy, finalActualErrors, currentLevelId)
    );
  }, [isTimeUp, isFinished, timeLimit, startTime, saveUserStats, currentLevelId]);

  /**
   * @function resetGameStates
   * @description Resets all game states to initial values.
   */
  const resetGameStates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTypedText('');
    typedTextRef.current = '';
    setStartTime(null);
    setTimer(0);
    timerRef.current = 0;
    setTotalErrors(0);
    totalErrorsRef.current = 0;
    setTotalCorrectChars(0);
    totalCorrectCharsRef.current = 0;
    setTotalTypedChars(0);
    setIsStarted(false);
    useStateIsPaused(false);
    isPausedRef.current = false;
    setIsFinished(false);
    setIsTimeUp(false);
    setWpm(0);
    setAccuracy(0);
    setRemainingTime(timeLimit);

    setCurrentSegmentIndex(0);
    currentSegmentIndexRef.current = 0;
  }, [timeLimit]);

  // Effect: Load new level text when currentLevelId changes
  useEffect(() => {
    for (const language of languages) {
      for (const unit of language.units) {
        for (const session of unit.sessions) {
          const selectedLevel = session.levels.find(level => level.id === currentLevelId);
          if (selectedLevel) {
            setFullTextContent(selectedLevel.text);
            return;
          }
        }
      }
    }
  }, [currentLevelId]);

  // Effect: Segment text and reset game when fullTextContent changes
  useEffect(() => {
    if (fullTextContent) {
      const newSegments = segmentText(fullTextContent);
      setSegments(newSegments);
      segmentsRef.current = newSegments;
      setCurrentSegmentIndex(0);
      setTextToType(newSegments[0] || '');
      textToTypeRef.current = (newSegments[0] || '');
      resetGameStates();

      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
    }
  }, [fullTextContent, resetGameStates]);

  // Effect: Update keyboard guidance states
  useEffect(() => {
    setNextChar(typingGuidance.char);
    setHighlightedKeys(typingGuidance.keysToHighlight);
    setActiveFinger(typingGuidance.baseKey ? keyToFingerMap[typingGuidance.baseKey] : null);
    setKeyboardLanguage(typingGuidance.language);
  }, [typingGuidance]);

  // Effect: Add keyboard event listeners for Shift and CapsLock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftActive(true);
      else if (e.key === 'CapsLock') setIsCapsLockActive(e.getModifierState('CapsLock'));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftActive(false);
      else if (e.key === 'CapsLock') setIsCapsLockActive(e.getModifierState('CapsLock'));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyUp);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Effect: Load time limit when level changes
  useEffect(() => {
    for (const language of languages) {
      for (const unit of language.units) {
        for (const session of unit.sessions) {
          const selectedLevel = session.levels.find(level => level.id === currentLevelId);
          if (selectedLevel) {
            const limit = selectedLevel.timeLimit || null;
            setTimeLimit(limit);
            setRemainingTime(limit);
            setIsTimeUp(false);
            return;
          }
        }
      }
    }
  }, [currentLevelId]);

  // Effect: Timer logic
  useEffect(() => {
    if (isStarted && !isPaused && !isFinished && !isTimeUp) {
      intervalRef.current = window.setInterval(() => {
        setTimer(prevTimer => {
          timerRef.current = prevTimer + 1;
          return prevTimer + 1;
        });

        if (timeLimit !== null) {
          setRemainingTime(prevTime => {
            if (prevTime !== null && prevTime <= 1) {
              handleTimeUp();
              return 0;
            }
            return prevTime !== null ? prevTime - 1 : null;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStarted, isPaused, isFinished, isTimeUp, timeLimit, handleTimeUp, startTime]);

  // Effect: Focus textarea when game is ready
  useEffect(() => {
    if (!isStarted && !isPaused && !isFinished && !isTimeUp && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isStarted, isPaused, isFinished, isTimeUp]);

  /**
   * @function handleResetGame
   * @description Handles the "Reset" button click.
   */
  const handleResetGame = useCallback(() => {
    for (const language of languages) {
      for (const unit of language.units) {
        for (const session of unit.sessions) {
          const selectedLevel = session.levels.find(l => l.id === currentLevelId);
          if (selectedLevel) {
            const newSegments = segmentText(selectedLevel.text);
            setSegments(newSegments);
            segmentsRef.current = newSegments;
            setTextToType(newSegments[0] || '');
            textToTypeRef.current = (newSegments[0] || '');
            resetGameStates();
            return;
          }
        }
      }
    }
  }, [currentLevelId, resetGameStates]);

  /**
   * @function handleStartPause
   * @description Handles the "Start/Pause/Resume" button click.
   */
  const handleStartPause = useCallback(() => {
    if (!isStarted) {
      setIsStarted(true);
      useStateIsPaused(false);
      setStartTime(Date.now());
    } else {
      useStateIsPaused(!isPaused);
    }
  }, [isStarted, isPaused]);

  /**
   * @function handleInputChange
   * @description Main game logic, triggered on every input change in the textarea.
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (!isStarted && value.length > 0) {
      setIsStarted(true);
      useStateIsPaused(false);
      setStartTime(Date.now());
    }

    if (isPaused || isFinished || isTimeUp) return;

    // Case 1: Typed the current segment completely and pressed space
    if (value.length === textToType.length + 1 && value.endsWith(' ')) {
      const typedSegment = value.substring(0, textToType.length);
      const correctCharsInSegment = typedSegment.split('').filter((char, index) => char === textToType[index]).length;
      const actualErrorsInSegment = typedSegment.length - correctCharsInSegment;

      const newTotalCorrectChars = totalCorrectChars + correctCharsInSegment + 1; // +1 for the space
      const newTotalTypedChars = totalTypedChars + textToType.length + 1; // Include space
      const newTotalErrors = totalErrors + actualErrorsInSegment;

      setTotalCorrectChars(newTotalCorrectChars);
      totalCorrectCharsRef.current = newTotalCorrectChars;
      setTotalTypedChars(newTotalTypedChars);
      setTotalErrors(newTotalErrors);
      totalErrorsRef.current = newTotalErrors;

      if (currentSegmentIndex + 1 < segments.length) {
        setCurrentSegmentIndex(prev => prev + 1);
        currentSegmentIndexRef.current = currentSegmentIndex + 1;
        setTextToType(segments[currentSegmentIndex + 1]);
        textToTypeRef.current = segments[currentSegmentIndex + 1];
        setTypedText('');
        typedTextRef.current = '';
      } else {
        // End of game
        setIsFinished(true);
        setIsStarted(false);
        const timeTaken = (Date.now() - (startTime || Date.now())) / 1000;

        const finalWPM = calculateWPM(newTotalCorrectChars, newTotalTypedChars, newTotalErrors, timeTaken, 'th');
        const finalAccuracy = calculateAccuracy(newTotalCorrectChars, newTotalTypedChars);

        setWpm(finalWPM);
        setAccuracy(finalAccuracy);

        saveUserStats(
          finalWPM,
          finalAccuracy,
          newTotalErrors,
          getGrade(finalWPM, finalAccuracy, newTotalErrors, currentLevelId),
          getScore10Point(finalWPM, finalAccuracy, newTotalErrors, currentLevelId)
        );
      }
      return;
    }

    // Prevent typing beyond current segment length
    if (value.length > textToType.length) {
      return;
    }

    setTypedText(value);
    typedTextRef.current = value;

    // Case 2: Typed the last segment completely (game ends)
    if (value.length === textToType.length && currentSegmentIndex === segments.length - 1) {
      const correctCharsInSegment = value.split('').filter((char, index) => char === textToType[index]).length;
      const actualErrorsInSegment = value.length - correctCharsInSegment;

      const newTotalCorrectChars = totalCorrectChars + correctCharsInSegment;
      const newTotalTypedChars = totalTypedChars + textToType.length;
      const newTotalErrors = totalErrors + actualErrorsInSegment;

      setTotalCorrectChars(newTotalCorrectChars);
      totalCorrectCharsRef.current = newTotalCorrectChars;
      setTotalTypedChars(newTotalTypedChars);
      setTotalErrors(newTotalErrors);
      totalErrorsRef.current = newTotalErrors;

      setIsFinished(true);
      setIsStarted(false);

      const timeTaken = (Date.now() - (startTime || Date.now())) / 1000;
      const finalWPM = calculateWPM(newTotalCorrectChars, newTotalTypedChars, newTotalErrors, timeTaken, 'th');
      const finalAccuracy = calculateAccuracy(newTotalCorrectChars, newTotalTypedChars);

      setWpm(finalWPM);
      setAccuracy(finalAccuracy);

      saveUserStats(
        finalWPM,
        finalAccuracy,
        newTotalErrors,
        getGrade(finalWPM, finalAccuracy, newTotalErrors, currentLevelId),
        getScore10Point(finalWPM, finalAccuracy, newTotalErrors, currentLevelId)
      );
    }
  }, [isStarted, isPaused, isFinished, isTimeUp, textToType, totalCorrectChars, totalTypedChars, totalErrors, segments, currentSegmentIndex, startTime, calculateWPM, calculateAccuracy, saveUserStats, currentLevelId]);

  /**
   * @function getCurrentLevel
   * @description Finds and returns the current level object.
   * @returns {Level | null} - The current level object or null if not found.
   */
  const getCurrentLevel = useCallback((): Level | null => {
    for (const language of languages) {
      for (const unit of language.units) {
        for (const session of unit.sessions) {
          const level = session.levels.find(l => l.id === currentLevelId);
          if (level) return level;
        }
      }
    }
    return null;
  }, [currentLevelId]);

  return {
    fullTextContent,
    segments,
    currentSegmentIndex,
    textToType,
    typedText,
    isStarted,
    isPaused,
    isFinished,
    timer,
    totalErrors,
    totalCorrectChars,
    totalTypedChars,
    wpm,
    accuracy,
    timeLimit,
    remainingTime,
    isTimeUp,
    nextChar,
    activeFinger,
    highlightedKeys,
    keyboardLanguage,
    isShiftActive,
    isCapsLockActive,
    inputRef,
    handleInputChange,
    handleStartPause,
    handleResetGame,
    getCurrentLevel,
  };
};
