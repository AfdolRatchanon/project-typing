import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Clock, Target, Award, RotateCcw, Play, Pause, ChevronDown, ChevronRight, CircleAlert } from 'lucide-react';
import './App.css'

// import type { Language, Unit, Session, Level, ScoringCriteria, LevelScoring } from './types/types'
import { languages, scoringCriteria } from './data/data'


// Define types for better type safety and code readability


// --- Keyboard Layout Data ---
const keyboardRows = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'ShiftRight'],
  ['Control', 'Alt', 'Space', 'AltGr', 'ControlRight'],
];

// Define key displays for English and Thai layouts
const keyDisplays = {
  en: {
    unshifted: {
      '`': '`', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '0': '0', '-': '-', '=': '=',
      'q': 'q', 'w': 'w', 'e': 'e', 'r': 'r', 't': 't', 'y': 'y', 'u': 'u', 'i': 'i', 'o': 'o', 'p': 'p', '[': '[', ']': ']', '\\': '\\',
      'a': 'a', 's': 's', 'd': 'd', 'f': 'f', 'g': 'g', 'h': 'h', 'j': 'j', 'k': 'k', 'l': 'l', ';': ';', "'": "'",
      'z': 'z', 'x': 'x', 'c': 'c', 'v': 'v', 'b': 'b', 'n': 'n', 'm': 'm', ',': ',', '.': '.', '/': '/',
      'Space': ' ',
    },
    shifted: {
      '`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*', '9': '(', '0': ')', '-': '_', '=': '+',
      'q': 'Q', 'w': 'W', 'e': 'E', 'r': 'R', 't': 'T', 'y': 'Y', 'u': 'U', 'i': 'I', 'o': 'O', 'p': 'P', '[': '{', ']': '}', '\\': '|',
      'a': 'A', 's': 'S', 'd': 'D', 'f': 'F', 'g': 'G', 'h': 'H', 'j': 'J', 'k': 'K', 'l': 'L', ';': ':', "'": '"',
      'z': 'Z', 'x': 'X', 'c': 'C', 'v': 'V', 'b': 'B', 'n': 'N', 'm': 'M', ',': '<', '.': '>', '/': '?',
      'Space': ' ',
    }
  },
  th: {
    unshifted: {
      '`': '_', '1': 'ๅ', '2': '/', '3': '-', '4': 'ภ', '5': 'ถ', '6': 'ุ', '7': 'ึ', '8': 'ค', '9': 'ต', '0': 'จ', '-': 'ข', '=': 'ช',
      'q': 'ๆ', 'w': 'ไ', 'e': 'ำ', 'r': 'พ', 't': 'ะ', 'y': 'ั', 'u': 'ี', 'i': 'ร', 'o': 'น', 'p': 'ย', '[': 'บ', ']': 'ล', '\\': 'ฃ',
      'a': 'ฟ', 's': 'ห', 'd': 'ก', 'f': 'ด', 'g': 'เ', 'h': '้', 'j': '่', 'k': 'า', 'l': 'ส', ';': 'ว', "'": 'ง',
      'z': 'ผ', 'x': 'ป', 'c': 'แ', 'v': 'อ', 'b': 'ิ', 'n': 'ื', 'm': 'ท', ',': 'ม', '.': 'ใ', '/': 'ฝ',
      'Space': ' ',
    },
    shifted: {
      '`': '+', '1': '%', '2': '๑', '3': '๒', '4': '๓', '5': '๔', '6': 'ู', '7': '฿', '8': '๕', '9': '๖', '0': '๗', '-': '๘', '=': '๙',
      'q': '๐', 'w': '"', 'e': 'ฎ', 'r': 'ฑ', 't': 'ธ', 'y': 'ํ', 'u': '๊', 'i': 'ณ', 'o': 'ฯ', 'p': 'ญ', '[': 'ฐ', ']': ',', '\\': 'ฅ',
      'a': 'ฤ', 's': 'ฆ', 'd': 'ฏ', 'f': 'โ', 'g': 'ฌ', 'h': '็', 'j': '๋', 'k': 'ษ', 'l': 'ศ', ';': 'ซ', "'": '.',
      'z': '(', 'x': ')', 'c': 'ฉ', 'v': 'ฮ', 'b': 'ฺ', 'n': '์', 'm': '?', ',': 'ฒ', '.': 'ฬ', '/': 'ฦ',
      'Space': ' ',
    }
  }
};

// Reverse map for finding key from character (for highlighting)
const getCharToKeyLabelMap = (lang: 'en' | 'th', shifted: boolean): { [char: string]: string } => {
  const map: { [char: string]: string } = {};
  const currentLayout = keyDisplays[lang][shifted ? 'shifted' : 'unshifted'];
  for (const keyLabel in currentLayout) {
    const char = currentLayout[keyLabel as keyof typeof currentLayout];
    map[char] = keyLabel;
  }
  return map;
};

// Map of key labels to finger names (physical key based)
const keyToFingerMap: { [key: string]: string } = {
  '`': 'leftPinky', '1': 'leftPinky', 'q': 'leftPinky', 'a': 'leftPinky', 'z': 'leftPinky', 'Tab': 'leftPinky', 'CapsLock': 'leftPinky', 'Shift': 'leftPinky', 'Control': 'leftPinky',
  '2': 'leftRing', 'w': 'leftRing', 's': 'leftRing', 'x': 'leftRing',
  '3': 'leftMiddle', 'e': 'leftMiddle', 'd': 'leftMiddle', 'c': 'leftMiddle',
  '4': 'leftIndex', 'r': 'leftIndex', 'f': 'leftIndex', 'v': 'leftIndex',
  '5': 'leftIndex', 't': 'leftIndex', 'g': 'leftIndex', 'b': 'leftIndex',
  '6': 'rightIndex', 'y': 'rightIndex', 'h': 'rightIndex', 'n': 'rightIndex',
  '7': 'rightIndex', 'u': 'rightIndex', 'j': 'rightIndex', 'm': 'rightIndex',
  '8': 'rightMiddle', 'i': 'rightMiddle', 'k': 'rightMiddle', ',': 'rightMiddle',
  '9': 'rightRing', 'o': 'rightRing', 'l': 'rightRing', '.': 'rightRing',
  '0': 'rightPinky', '-': 'rightPinky', '=': 'rightPinky', 'p': 'rightPinky', '[': 'rightPinky', ']': 'rightPinky', '\\': 'rightPinky', ';': 'rightPinky', "'": 'rightPinky', '/': 'rightPinky', 'Backspace': 'rightPinky', 'Enter': 'rightPinky', 'ShiftRight': 'rightPinky', 'ControlRight': 'rightPinky',
  'Space': 'thumb',
  'Alt': 'leftThumb',
  'AltGr': 'rightThumb',
};

// Function to determine which Shift key to use based on key position
// Function to determine which Shift key to use based on key position
const getRecommendedShiftKey = (baseKey: string): 'Shift' | 'ShiftRight' => {
  // Left side keys (handled by left hand) use right Shift
  const leftSideKeys = ['`', '1', '2', '3', '4', '5', 'Tab', 'q', 'w', 'e', 'r', 't', 'CapsLock', 'a', 's', 'd', 'f', 'g', 'Shift', 'z', 'x', 'c', 'v', 'b'];

  // Right side keys (handled by right hand) use left Shift  
  const rightSideKeys = ['6', '7', '8', '9', '0', '-', '=', 'Backspace', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\', 'h', 'j', 'k', 'l', ';', "'", 'Enter', 'n', 'm', ',', '.', '/', 'ShiftRight'];

  if (leftSideKeys.includes(baseKey)) {
    return 'ShiftRight';
  } else if (rightSideKeys.includes(baseKey)) {
    return 'Shift';
  } else {
    // Default fallback
    return 'Shift';
  }
};

// Finger names for display
const fingerNamesDisplay: { [key: string]: string } = {
  leftPinky: 'นิ้วก้อยซ้าย',
  leftRing: 'นิ้วนางซ้าย',
  leftMiddle: 'นิ้วกลางซ้าย',
  leftIndex: 'นิ้วชี้ซ้าย',
  leftThumb: 'นิ้วโป้งซ้าย',
  rightIndex: 'นิ้วชี้ขวา',
  rightMiddle: 'นิ้วกลางขวา',
  rightRing: 'นิ้วนางขวา',
  rightPinky: 'นิ้วก้อยขวา',
  rightThumb: 'นิ้วโป้งขวา',
  thumb: 'นิ้วโป้ง (ซ้าย/ขวา)',
};

// Helper function to segment text into displayable lines/chunks
const segmentText = (text: string, maxCharsPerLine: number = 70): string[] => {
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const words = normalizedText.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const potentialNewLine = currentLine ? (currentLine + ' ' + word) : word;
    if (potentialNewLine.length <= maxCharsPerLine) {
      currentLine = potentialNewLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
};

// --- Main App Component ---
const App: React.FC = () => {
  // State variables for the typing game
  const [currentLevelId, setCurrentLevelId] = useState<string>(languages[0].units[0].sessions[0].levels[0].id);
  const [fullTextContent, setFullTextContent] = useState<string>(languages[0].units[0].sessions[0].levels[0].text);

  const [expandedSessions, setExpandedSessions] = useState<{ [key: string]: boolean }>({
    'thai-basic-session-1': true
  });

  const [segments, setSegments] = useState<string[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [textToType, setTextToType] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');

  const [startTime, setStartTime] = useState<number | null>(null);
  const [timer, setTimer] = useState<number>(0);

  const [totalErrors, setTotalErrors] = useState<number>(0);
  const [totalCorrectChars, setTotalCorrectChars] = useState<number>(0);
  const [totalTypedChars, setTotalTypedChars] = useState<number>(0);

  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);

  const intervalRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // State for Keyboard and Finger Guidance
  const [nextChar, setNextChar] = useState<string>('');
  const [activeFinger, setActiveFinger] = useState<string | null>(null);
  const [highlightedKeys, setHighlightedKeys] = useState<string[]>([]);
  const [keyboardLanguage, setKeyboardLanguage] = useState<'en' | 'th'>('en');
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false);
  const [isCapsLockActive, setIsCapsLockActive] = useState<boolean>(false);

  // State for collapsible menu
  const [expandedLanguage, setExpandedLanguage] = useState<string>('thai');
  const [expandedUnits, setExpandedUnits] = useState<{ [key: string]: boolean }>({
    'thai-basic': true
  });

  // Effect hook to update fullTextContent when currentLevelId changes
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

  // Effect hook to segment text and set initial segment when fullTextContent changes
  useEffect(() => {
    if (fullTextContent) {
      const newSegments = segmentText(fullTextContent);
      setSegments(newSegments);
      setCurrentSegmentIndex(0);
      setTextToType(newSegments[0] || '');
      resetGameStates();
    }
  }, [fullTextContent]);

  // Effect hook for the timer
  useEffect(() => {
    if (isStarted && !isPaused && !isFinished) {
      intervalRef.current = window.setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStarted, isPaused, isFinished]);

  // Event listeners for physical keyboard Shift/CapsLock state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftActive(true);
      } else if (e.key === 'CapsLock') {
        setIsCapsLockActive(e.getModifierState('CapsLock'));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftActive(false);
      } else if (e.key === 'CapsLock') {
        setIsCapsLockActive(e.getModifierState('CapsLock'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // useMemo to calculate all typing guidance values in one place for efficiency.
  const typingGuidance = useMemo(() => {
    // ตรวจสอบภาษาหลักของข้อความทั้งหมดเพื่อกำหนดภาษาของแป้นพิมพ์
    const detectTextLanguage = (text: string): 'en' | 'th' => {
      // นับจำนวนตัวอักษรไทยและอังกฤษ
      let thaiCount = 0;
      let englishCount = 0;

      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        if (charCode >= 0x0E00 && charCode <= 0x0E7F) {
          thaiCount++;
        } else if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) {
          englishCount++;
        }
      }

      // ถ้ามีตัวอักษรไทยมากกว่าหรือเท่ากับอังกฤษ ให้ใช้ภาษาไทย
      return thaiCount >= englishCount ? 'th' : 'en';
    };

    const mainLanguage = detectTextLanguage(textToType);

    // ตรวจสอบก่อนว่าพิมพ์ครบแล้วและต้องกด space bar เพื่อไปข้อความถัดไป
    if (typedText.length === textToType.length && currentSegmentIndex + 1 < segments.length) {
      // ถ้าข้อความถัดไปขึ้นต้นด้วย space ให้แสดงการนำทาง space bar
      const nextSegment = segments[currentSegmentIndex + 1];
      if (nextSegment && nextSegment[0] === ' ') {
        return {
          char: ' ',
          keysToHighlight: ['Space'],
          baseKey: 'Space',
          language: mainLanguage,
        };
      }
      // ถ้าไม่ขึ้นต้นด้วย space ก็ยังแสดง space bar สำหรับการขึ้นบรรทัดใหม่
      return {
        char: ' ',
        keysToHighlight: ['Space'],
        baseKey: 'Space',
        language: mainLanguage,
      };
    }

    const char = textToType[typedText.length];
    if (!char) {
      return {
        char: '',
        keysToHighlight: [],
        baseKey: null,
        language: mainLanguage,
      };
    }

    // สำหรับ space และตัวอักษรปกติ ใช้ภาษาหลักของข้อความ
    let detectedLanguage: 'en' | 'th' = mainLanguage;

    // เฉพาะตัวอักษรที่ไม่ใช่ space ค่อยตรวจจับภาษาจากตัวอักษรนั้น
    if (char !== ' ') {
      const charCode = char.charCodeAt(0);
      detectedLanguage = (charCode >= 0x0E00 && charCode <= 0x0E7F) ? 'th' : 'en';
    }

    let baseKey: string | undefined;
    let needsShift = false;

    const unshiftedCharToKeyMap = getCharToKeyLabelMap(detectedLanguage, false);
    baseKey = unshiftedCharToKeyMap[char];

    if (!baseKey) {
      const shiftedCharToKeyMap = getCharToKeyLabelMap(detectedLanguage, true);
      baseKey = shiftedCharToKeyMap[char];
      if (baseKey) {
        needsShift = true;
      }
    }

    const keysToHighlight: string[] = [];
    if (baseKey) {
      keysToHighlight.push(baseKey);

      const isCharUpperCase = detectedLanguage === 'en' && char.match(/[A-Z]/);
      const isSymbolRequiringShift = needsShift;

      if (isSymbolRequiringShift || (isCharUpperCase && !isCapsLockActive) || (!isCharUpperCase && isCapsLockActive && char.match(/[a-z]/i))) {
        // Use appropriate Shift key based on the base key position
        const recommendedShiftKey = getRecommendedShiftKey(baseKey);
        keysToHighlight.push(recommendedShiftKey);  // ใช้ Shift ที่เหมาะสม
      }
    }

    return {
      char: char,
      keysToHighlight: keysToHighlight,
      baseKey: baseKey || null,
      language: detectedLanguage,
    };
  }, [textToType, typedText, isCapsLockActive, currentSegmentIndex, segments]);

  useEffect(() => {
    setNextChar(typingGuidance.char);
    setHighlightedKeys(typingGuidance.keysToHighlight);
    setActiveFinger(typingGuidance.baseKey ? keyToFingerMap[typingGuidance.baseKey] : null);
    setKeyboardLanguage(typingGuidance.language);
  }, [typingGuidance]);

  const calculateWPM = useCallback((correctChars: number, timeInSeconds: number): number => {
    if (timeInSeconds === 0) return 0;
    const words = correctChars / 5;
    const minutes = timeInSeconds / 60;
    return Math.round(words / minutes);
  }, []);

  const calculateAccuracy = useCallback((correctChars: number, totalChars: number): number => {
    if (totalChars === 0) return 0;
    return Math.round((correctChars / totalChars) * 100);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (!isStarted && value.length > 0) {
      setIsStarted(true);
      setIsPaused(false);
      setStartTime(Date.now());
    }

    if (isPaused) return;

    // ตรวจสอบว่าผู้ใช้พิมพ์ครบแล้วและกด space bar เพื่อไปข้อความถัดไป
    if (value.length === textToType.length + 1 && value[textToType.length] === ' ') {
      // คำนวณคะแนนสำหรับส่วนที่พิมพ์เสร็จแล้ว
      const typedSegment = value.substring(0, textToType.length);
      const finalCorrectCharsForSegment = textToType.split('').reduce((acc, char, index) => {
        return acc + (typedSegment[index] === char ? 1 : 0);
      }, 0);
      const finalErrorsForSegment = textToType.length - finalCorrectCharsForSegment;

      // นับ space bar ที่ใช้เพื่อไปข้อความถัดไปด้วย (ถ้าไม่ใช่ segment สุดท้าย)
      const spaceCorrect = currentSegmentIndex + 1 < segments.length ? 1 : 0;

      const newTotalCorrectChars = totalCorrectChars + finalCorrectCharsForSegment + spaceCorrect;
      const newTotalTypedChars = totalTypedChars + textToType.length + spaceCorrect;
      const newTotalErrors = totalErrors + finalErrorsForSegment;

      setTotalCorrectChars(newTotalCorrectChars);
      setTotalTypedChars(newTotalTypedChars);
      setTotalErrors(newTotalErrors);

      if (currentSegmentIndex + 1 < segments.length) {
        setCurrentSegmentIndex(prev => prev + 1);
        setTextToType(segments[currentSegmentIndex + 1]);
        setTypedText('');
      } else {
        const finalEndTime = Date.now();
        setIsFinished(true);
        setIsStarted(false);
        setIsPaused(false);

        const timeTaken = (finalEndTime - (startTime || finalEndTime)) / 1000;
        setWpm(calculateWPM(newTotalCorrectChars, timeTaken));
        setAccuracy(calculateAccuracy(newTotalCorrectChars, newTotalTypedChars));
      }
      return;
    }

    // ถ้าพิมพ์เกินความยาวที่กำหนด ให้ตัดออก
    if (value.length > textToType.length) {
      return;
    }

    setTypedText(value);

    // ตรวจสอบว่าเป็น segment สุดท้ายและพิมพ์ครบแล้วหรือไม่
    if (value.length === textToType.length && currentSegmentIndex === segments.length - 1) {
      // คำนวณคะแนนสำหรับ segment สุดท้าย
      const finalCorrectCharsForSegment = textToType.split('').reduce((acc, char, index) => {
        return acc + (value[index] === char ? 1 : 0);
      }, 0);
      const finalErrorsForSegment = textToType.length - finalCorrectCharsForSegment;

      const newTotalCorrectChars = totalCorrectChars + finalCorrectCharsForSegment;
      const newTotalTypedChars = totalTypedChars + textToType.length;
      const newTotalErrors = totalErrors + finalErrorsForSegment;

      setTotalCorrectChars(newTotalCorrectChars);
      setTotalTypedChars(newTotalTypedChars);
      setTotalErrors(newTotalErrors);

      const finalEndTime = Date.now();
      setIsFinished(true);
      setIsStarted(false);
      setIsPaused(false);

      const timeTaken = (finalEndTime - (startTime || finalEndTime)) / 1000;
      setWpm(calculateWPM(newTotalCorrectChars, timeTaken));
      setAccuracy(calculateAccuracy(newTotalCorrectChars, newTotalTypedChars));
    }
  };

  const resetGameStates = () => {
    setTypedText('');
    setStartTime(null);
    setTimer(0);
    setTotalErrors(0);
    setTotalCorrectChars(0);
    setTotalTypedChars(0);
    setIsStarted(false);
    setIsPaused(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentSegmentIndex(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleResetGame = () => {
    for (const language of languages) {
      for (const unit of language.units) {
        for (const session of unit.sessions) {
          const selectedLevel = session.levels.find(l => l.id === currentLevelId);
          if (selectedLevel) {
            const newSegments = segmentText(selectedLevel.text);
            setSegments(newSegments);
            setTextToType(newSegments[0] || '');
            resetGameStates();
            return;
          }
        }
      }
    }
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const handleStartPause = () => {
    if (!isStarted) {
      setIsStarted(true);
      setIsPaused(false);
      setStartTime(Date.now());
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      setIsPaused(!isPaused);
    }
  };

  const getGrade = useCallback((): string => {
    if (!isFinished) return '-';
    const currentLevelCriteria = scoringCriteria[currentLevelId];
    if (!currentLevelCriteria) return 'ไม่มีเกณฑ์การให้คะแนน';

    for (const criteria of currentLevelCriteria) {
      if (wpm >= criteria.minWPM && accuracy >= criteria.minAccuracy && totalErrors <= criteria.maxErrors) {
        return criteria.grade;
      }
    }
    return 'ต้องฝึกเพิ่ม';
  }, [currentLevelId, wpm, accuracy, totalErrors, isFinished]);

  // แทนที่ฟังก์ชัน renderTextToType เดิมด้วยโค้ดนี้:

  const renderTextToType = () => {
    const isLastSegment = currentSegmentIndex === segments.length - 1;
    const isTypingComplete = typedText.length === textToType.length;

    // วรรณยุกต์ไทย
    const toneMarks = ['่', '้', '๊', '๋'];
    // สระที่อยู่ด้านบน
    const topVowels = ['ิ', 'ี', 'ึ', 'ื', '์', 'ั'];
    // สระอำ
    const saraAm = 'ำ';

    const textElements = textToType.split('').map((char, index) => {
      let colorClass = 'text-gray-700';
      if (index < typedText.length) {
        colorClass = typedText[index] === char ? 'text-green-600' : 'text-red-600 line-through';
      }

      // ตรวจสอบว่าเป็นวรรณยุกต์หรือไม่
      const isToneMark = toneMarks.includes(char);

      // ตรวจสอบว่ามีสระด้านบนก่อนหน้าหรือไม่ (ในตำแหน่งก่อนหน้า 1-2 ตัว)
      let hasTopVowelBefore = false;

      // ตรวจสอบว่ามีสระอำหลังวรรณยุกต์หรือไม่ (กรณี น + ้ + ำ)
      let hasSaraAmAfter = false;

      if (isToneMark && index > 0) {
        // ตรวจสอบตัวอักษรก่อนหน้า 1 ตัว
        if (topVowels.includes(textToType[index - 1])) {
          hasTopVowelBefore = true;
        }
        // ตรวจสอบตัวอักษรก่อนหน้า 2 ตัว (กรณีมีพยัญชนะคั่น)
        else if (index > 1 && topVowels.includes(textToType[index - 2])) {
          hasTopVowelBefore = true;
        }

        // ตรวจสอบว่ามีสระอำหลังวรรณยุกต์หรือไม่
        if (index < textToType.length - 1 && textToType[index + 1] === saraAm) {
          hasSaraAmAfter = true;
        }
      }

      // ถ้าเป็นวรรณยุกต์และมีสระอำตามหลัง ให้เลื่อนขึ้นเหมือนมีสระด้านบน
      const shouldRaiseToneMark = isToneMark && (hasTopVowelBefore || hasSaraAmAfter);

      return (
        <span
          key={index}
          className={`${colorClass} ${index === typedText.length ? 'border-b-2 border-blue-500 animate-pulse' : ''} ${shouldRaiseToneMark ? 'thai-tone-mark' : ''}`}
        >
          {char === ' ' && index >= typedText.length ? '\u00A0' : char}
        </span>
      );
    });

    // แสดงข้อความแนะนำให้กด space bar เมื่อพิมพ์ครบและไม่ใช่ segment สุดท้าย
    if (isTypingComplete && !isLastSegment) {
      textElements.push(
        <span key="spacebar-hint" className="ml-2 text-blue-600 font-bold animate-pulse">
          [กด Space Bar เพื่อดำเนินต่อ]
        </span>
      );
    }

    return textElements;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  const getCurrentLevel = () => {
    for (const language of languages) {
      for (const unit of language.units) {
        for (const session of unit.sessions) {
          const level = session.levels.find(l => l.id === currentLevelId);
          if (level) return level;
        }
      }
    }
    return null;
  };

  // 2. แก้ไขการคำนวณ Progress Bar (แทนที่บรรทัดเดิม)
  const currentLevel = getCurrentLevel();

  // คำนวณ progress ที่ถูกต้อง โดยใช้จำนวนตัวอักษรจริงที่ผ่านไปแล้ว
  let completedCharsReal = 0;

  // นับตัวอักษรจาก segments ที่เสร็จแล้ว
  for (let i = 0; i < currentSegmentIndex; i++) {
    completedCharsReal += segments[i].length;
    if (i < segments.length - 1) { // เพิ่ม space bar ถ้าไม่ใช่ segment สุดท้าย
      completedCharsReal += 1;
    }
  }

  // เพิ่มตัวอักษรจาก segment ปัจจุบัน
  const currentSegmentProgress = typedText.length;
  const totalProgress = completedCharsReal + currentSegmentProgress;

  // ใช้ความยาวของข้อความต้นฉบับโดยตรง (แก้ไขจากเดิม)
  const totalCharsActual = fullTextContent.length;
  const progress = totalCharsActual > 0 ? (totalProgress / totalCharsActual) * 100 : 0;

  useEffect(() => {
    // Find current level and auto-expand menu to show it
    for (const language of languages) {
      for (const unit of language.units) {
        for (const session of unit.sessions) {
          const foundLevel = session.levels.find(level => level.id === currentLevelId);
          if (foundLevel) {
            setExpandedLanguage(language.id);
            setExpandedUnits(prev => ({ ...prev, [unit.id]: true }));
            setExpandedSessions(prev => ({ ...prev, [session.id]: true }));
            return;
          }
        }
      }
    }
  }, [currentLevelId, languages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col xl:flex-row p-2 sm:p-4 font-inter gap-3 lg:gap-6">
      {/* Aside Menu for Level Selection */}
      <aside className="bg-white rounded-xl lg:rounded-2xl shadow-2xl w-full xl:w-80 2xl:w-96 border border-gray-200 h-150 sm:h-200 lg:h-500 lg:max-h-[90vh] flex flex-col">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 lg:p-5 rounded-t-xl lg:rounded-t-2xl shadow-lg">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-center flex items-center justify-center gap-2">
            <Target size={16} className="sm:w-5 sm:h-5" />
            เลือกบทเรียน
          </h2>
        </div>

        {/* Menu Content with improved scrolling - responsive */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
          <div className="space-y-2 sm:space-y-3">
            {languages.map((language, _langIndex) => { // Fixed: added underscore
              // Check if current level is in this language
              const isLanguageActive = language.units.some(unit =>
                unit.sessions.some(session =>
                  session.levels.some(level => level.id === currentLevelId)
                )
              );

              return (
                <div key={language.id} className="border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <button
                    onClick={() => setExpandedLanguage(expandedLanguage === language.id ? '' : language.id)}
                    className={`w-full flex items-center justify-between p-2.5 sm:p-3 lg:p-4 transition-all duration-300 ${isLanguageActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                  >
                    <span className={`font-bold text-sm sm:text-base ${isLanguageActive ? 'text-blue-700' : 'text-gray-800'}`}>
                      {language.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {isLanguageActive && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>}
                      {expandedLanguage === language.id ?
                        <ChevronDown size={16} className={`sm:w-5 sm:h-5 transition-transform duration-200 ${isLanguageActive ? 'text-blue-600' : 'text-gray-600'}`} /> :
                        <ChevronRight size={16} className={`sm:w-5 sm:h-5 transition-transform duration-200 ${isLanguageActive ? 'text-blue-600' : 'text-gray-600'}`} />
                      }
                    </div>
                  </button>

                  {expandedLanguage === language.id && (
                    <div className="bg-white border-t border-gray-100">
                      <div className="space-y-1.5 sm:space-y-2 p-1.5 sm:p-2">
                        {language.units.map((unit, _unitIndex) => { // Fixed: added underscore
                          // Check if current level is in this unit
                          const isUnitActive = unit.sessions.some(session =>
                            session.levels.some(level => level.id === currentLevelId)
                          );

                          return (
                            <div key={unit.id} className="border border-gray-150 rounded-md sm:rounded-lg overflow-hidden shadow-sm">
                              <button
                                onClick={() => toggleUnit(unit.id)}
                                className={`w-full flex items-center justify-between p-2 sm:p-2.5 lg:p-3 transition-all duration-300 ${isUnitActive
                                  ? 'bg-gradient-to-r from-blue-25 to-blue-50 border-l-3 border-l-blue-400'
                                  : 'bg-gray-25 hover:bg-gray-50'
                                  }`}
                              >
                                <span className={`font-semibold text-xs sm:text-sm ${isUnitActive ? 'text-blue-700' : 'text-gray-700'
                                  }`}>
                                  {unit.name}
                                </span>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  {isUnitActive && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse"></div>}
                                  {expandedUnits[unit.id] ?
                                    <ChevronDown size={14} className={`sm:w-4 sm:h-4 transition-transform duration-200 ${isUnitActive ? 'text-blue-600' : 'text-gray-500'}`} /> :
                                    <ChevronRight size={14} className={`sm:w-4 sm:h-4 transition-transform duration-200 ${isUnitActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                  }
                                </div>
                              </button>

                              {expandedUnits[unit.id] && (
                                <div className="bg-white border-t border-gray-100">
                                  <div className="space-y-1 sm:space-y-1.5 p-1.5 sm:p-2">
                                    {unit.sessions.map((session, _sessionIndex) => { // Fixed: added underscore
                                      // Check if current level is in this session
                                      const isSessionActive = session.levels.some(level => level.id === currentLevelId);

                                      return (
                                        <div key={session.id} className="border border-gray-100 rounded-sm sm:rounded-md overflow-hidden">
                                          <button
                                            onClick={() => toggleSession(session.id)}
                                            className={`w-full flex items-center justify-between p-2 sm:p-2.5 transition-all duration-300 ${isSessionActive
                                              ? 'bg-gradient-to-r from-blue-25 to-indigo-25 border-l-2 border-l-blue-300'
                                              : 'bg-gray-25 hover:bg-gray-50'
                                              }`}
                                          >
                                            <span className={`font-medium text-xs ${isSessionActive ? 'text-blue-600' : 'text-gray-600'
                                              }`}>
                                              {session.name}
                                            </span>
                                            <div className="flex items-center gap-1 sm:gap-1.5">
                                              {isSessionActive && <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-300 rounded-full animate-pulse"></div>}
                                              {expandedSessions[session.id] ?
                                                <ChevronDown size={12} className={`sm:w-4 sm:h-4 transition-transform duration-200 ${isSessionActive ? 'text-blue-500' : 'text-gray-400'}`} /> :
                                                <ChevronRight size={12} className={`sm:w-4 sm:h-4 transition-transform duration-200 ${isSessionActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                              }
                                            </div>
                                          </button>

                                          {expandedSessions[session.id] && (
                                            <div className="bg-white border-t border-gray-50 p-1.5 sm:p-2">
                                              <div className="space-y-1 sm:space-y-1.5">
                                                {session.levels.map((level, _levelIndex) => ( // Fixed: added underscore
                                                  <button
                                                    key={level.id}
                                                    onClick={() => setCurrentLevelId(level.id)}
                                                    disabled={isStarted && !isPaused}
                                                    className={`
                                                      w-full text-left p-2 sm:p-2.5 lg:p-3 rounded-md sm:rounded-lg border transition-all duration-300 ease-in-out text-xs font-medium
                                                      ${currentLevelId === level.id
                                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg transform scale-[1.02] ring-2 ring-blue-200 ring-opacity-50'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md hover:transform hover:scale-[1.01]'
                                                      }
                                                      ${(isStarted && !isPaused) ? 'opacity-50 cursor-not-allowed' : ''}
                                                    `}
                                                  >
                                                    <div className="flex items-center justify-between">
                                                      <span className="leading-relaxed">{level.name}</span>
                                                      {currentLevelId === level.id && (
                                                        <div className="flex items-center gap-1">
                                                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                                                          <span className="text-xs opacity-90 hidden sm:inline">กำลังเรียน</span>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with current selection info - responsive */}
        <div className="border-t border-gray-200 p-2 sm:p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl lg:rounded-b-2xl">
          <div className="text-xs text-gray-600 text-center">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-gray-700 text-xs sm:text-sm">กำลังเรียน:</span>
            </div>
            <div className="font-bold text-blue-700 truncate px-2 py-1 bg-white rounded-md shadow-sm border text-xs sm:text-sm">
              {currentLevel?.name || 'กำลังโหลด...'}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="bg-white p-4 lg:p-8 rounded-xl lg:rounded-2xl shadow-2xl flex-1 border border-gray-200 min-h-0">
        {/* <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 lg:p-6 rounded-lg mb-4 lg:mb-6">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-center mb-2">
            React Typing Trainer
          </h1>
          <p className="text-center opacity-90 text-sm lg:text-base">
            {currentLevel?.id || 'กำลังโหลด...'}
          </p>
        </div> */}

        {/* Stats Display with Icons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-4 lg:mb-6">
          <div className="bg-blue-50 p-3 lg:p-4 rounded-lg shadow-md border border-blue-200">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="text-blue-600" size={18} />
              <p className="text-lg lg:text-xl font-bold text-blue-800">{formatTime(timer)}</p>
              <p className="text-xs lg:text-sm font-medium text-blue-700">เวลา</p>
            </div>
          </div>
          <div className="bg-green-50 p-3 lg:p-4 rounded-lg shadow-md border border-green-200">
            <div className="flex items-center justify-center space-x-2">
              <Target className="text-green-600" size={18} />
              <p className="text-lg lg:text-xl font-bold text-green-800">{wpm}</p>
              <p className="text-xs lg:text-sm font-medium text-green-700">WPM</p>
            </div>
          </div>
          <div className="bg-purple-50 p-3 lg:p-4 rounded-lg shadow-md border border-purple-200">
            <div className="flex items-center justify-center space-x-2">
              <Award className="text-purple-600" size={18} />
              <p className="text-lg lg:text-xl font-bold text-purple-800">{accuracy}%</p>
              <p className="text-xs lg:text-sm font-medium text-purple-700">ความแม่นยำ</p>
            </div>
          </div>
          <div className="bg-red-50 p-3 lg:p-4 rounded-lg shadow-md border border-red-200">
            <div className="flex items-center justify-center space-x-2">
              <CircleAlert className="text-red-600" size={18} />
              <p className="text-lg lg:text-xl font-bold text-red-800">{totalErrors}</p>
              <p className="text-xs lg:text-sm font-medium text-red-700">ข้อผิดพลาด</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 lg:mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>ความคืบหน้า</span>
            <span>{totalProgress} / {totalCharsActual} ตัวอักษร</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Typing Area */}
        <div className="bg-blue-50 p-2 lg:p-4 rounded-lg border border-blue-200 mb-3 lg:mb-4 min-h-[60px] lg:min-h-[70px] flex items-center justify-center text-base lg:text-lg leading-relaxed text-center font-mono relative overflow-hidden whitespace-pre-wrap">
          {renderTextToType()}
        </div>

        {/* Input Text Area */}
        <textarea
          ref={inputRef}
          className="w-full p-2 lg:p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 text-base lg:text-lg font-mono resize-none transition duration-200 ease-in-out min-h-[35px] lg:min-h-[45px] mb-3 lg:mb-4"
          placeholder={isFinished ? 'กด "เริ่มใหม่" เพื่อเล่นอีกครั้ง' : isPaused ? 'กด "ดำเนินต่อ" เพื่อเล่นต่อ' : 'เริ่มพิมพ์ที่นี่...'}
          value={typedText}
          onChange={handleInputChange}
          disabled={isFinished || isPaused}
          autoFocus
        />

        {/* Game Controls */}
        <div className="mb-3 lg:mb-4 text-center flex gap-2 justify-center">
          <button
            onClick={handleStartPause}
            disabled={isFinished}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 lg:py-3 lg:px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 text-sm lg:text-base"
          >
            {!isStarted ? (
              <>
                <Play size={16} />
                เริ่ม
              </>
            ) : isPaused ? (
              <>
                <Play size={16} />
                ดำเนินต่อ
              </>
            ) : (
              <>
                <Pause size={16} />
                หยุด
              </>
            )}
          </button>

          <button
            onClick={handleResetGame}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 lg:py-3 lg:px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300 text-sm lg:text-base"
          >
            <RotateCcw size={16} />
            เริ่มใหม่
          </button>
        </div>

        {/* Virtual Keyboard และ Finger Guidance */}
        <div className="flex flex-col-reverse lg:flex-row gap-3 lg:gap-4">
          {/* Virtual Keyboard */}
          <div className="flex-1 p-3 lg:p-4 bg-gray-100 rounded-lg shadow-inner border border-gray-200 overflow-x-auto">
            <h2 className="text-base lg:text-lg font-bold text-gray-800 mb-2 lg:mb-3 text-center">คีย์บอร์ด</h2>
            <div className="flex flex-col items-center justify-center">
              {keyboardRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex my-0.5 lg:my-1">
                  {row.map((keyLabel) => {
                    const isHighlighted = highlightedKeys.includes(keyLabel);
                    const isCapsActive = keyLabel === 'CapsLock' && isCapsLockActive;

                    const displayChar = keyLabel.length > 1 ? keyLabel :
                      (isShiftActive || isCapsLockActive ?
                        keyDisplays[keyboardLanguage].shifted[keyLabel as keyof typeof keyDisplays.en.shifted]
                        : keyDisplays[keyboardLanguage].unshifted[keyLabel as keyof typeof keyDisplays.en.unshifted]
                      ) || keyLabel;

                    return (
                      <div
                        key={keyLabel}
                        className={`
                          relative flex items-center justify-center
                          m-0.5 rounded-md text-xs lg:text-sm font-semibold transition-all duration-100 ease-in-out
                          border-b-4
                          ${isHighlighted ? 'bg-blue-400 text-white border-blue-600 -translate-y-1 shadow-xl' : isCapsActive ? 'bg-blue-300 text-white border-blue-500' : 'bg-gray-200 text-gray-800 border-gray-400 shadow-sm'}
                          ${keyLabel === 'Backspace' ? 'w-16 xl:w-24' : ''}
                          ${keyLabel === 'Tab' ? 'w-12 xl:w-20' : ''}
                          ${keyLabel === '\\' ? 'w-12 xl:w-18' : ''}
                          ${keyLabel === 'CapsLock' ? 'w-16 xl:w-26' : ''}
                          ${keyLabel === 'Enter' ? 'w-16 xl:w-26' : ''}
                          ${keyLabel === 'Shift' || keyLabel === 'ShiftRight' ? 'w-20 xl:w-32' : ''}
                          ${keyLabel === 'Control' || keyLabel === 'ControlRight' ? 'w-20 xl:w-30' : ''}
                          ${keyLabel === 'Alt' || keyLabel === 'AltGr' ? 'w-16 xl:w-18' : ''}
                          ${keyLabel === 'Space' ? 'w-56 xl:w-96' : 'w-8 h-8 xl:w-12 xl:h-12'}
                        `}
                      >
                        {displayChar}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Finger Guidance - ย้ายมาด้านข้างและลดขนาด */}
          {(nextChar || (typedText.length === textToType.length && currentSegmentIndex + 1 < segments.length)) && !isFinished && !isPaused && (
            <div className=" lg:w-64 p-2 lg:p-3 bg-green-50 rounded-lg border border-green-200 text-center lg:text-left flex flex-col ">
              <p className="text-sm lg:text-base font-semibold text-green-800 mb-1 text-center">
                ตัวอักษรถัดไป:
              </p>
              <p className="text-xl lg:text-2xl font-bold text-green-900 mb-2 text-center">
                {typedText.length === textToType.length && currentSegmentIndex + 1 < segments.length
                  ? '[Space] เพื่อดำเนินต่อ'
                  : (nextChar === ' ' ? '[Space]' : nextChar)
                }
              </p>
              {activeFinger && (
                <p className="text-xs lg:text-sm text-green-700 text-center">
                  ใช้นิ้ว: <span className="font-bold">{fingerNamesDisplay[activeFinger]}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Result & Grade Display */}
        {isFinished && (
          <div className="mt-4 lg:mt-6 bg-green-50 border border-green-200 p-4 lg:p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
              🎉 ยินดีด้วย! คุณพิมพ์เสร็จแล้ว
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
              <div>
                <div className="text-2xl font-bold text-green-600">{formatTime(timer)}</div>
                <div className="text-sm text-gray-600">เวลาทั้งหมด</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{wpm}</div>
                <div className="text-sm text-gray-600">คำต่อนาที</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-sm text-gray-600">ความถูกต้อง</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{totalErrors}</div>
                <div className="text-sm text-gray-600">ข้อผิดพลาด</div>
              </div>
            </div>
            <p className="text-lg font-semibold text-green-700 text-center">
              เกรด: <span className="text-green-900 font-bold text-xl">{getGrade()}</span>
            </p>
          </div>
        )}

        {/* Scoring Criteria Display for Current Level */}
        <div className="mt-4 lg:mt-6 bg-gray-50 p-4 lg:p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-3 lg:mb-4 text-center">
            เกณฑ์การให้คะแนนสำหรับ "{currentLevel?.name || 'กำลังโหลด...'}":
          </h2>
          {scoringCriteria[currentLevelId] ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 uppercase text-xs lg:text-sm leading-normal">
                    <th className="py-2 px-3 lg:py-3 lg:px-6 text-left rounded-tl-lg">เกรด</th>
                    <th className="py-2 px-3 lg:py-3 lg:px-6 text-left">WPM ขั้นต่ำ</th>
                    <th className="py-2 px-3 lg:py-3 lg:px-6 text-left">ความแม่นยำขั้นต่ำ (%)</th>
                    <th className="py-2 px-3 lg:py-3 lg:px-6 text-left rounded-tr-lg">ข้อผิดพลาดสูงสุด</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-xs lg:text-sm font-light">
                  {scoringCriteria[currentLevelId].map((criteria, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-2 px-3 lg:py-3 lg:px-6 text-left whitespace-nowrap font-medium">{criteria.grade}</td>
                      <td className="py-2 px-3 lg:py-3 lg:px-6 text-left">{criteria.minWPM}</td>
                      <td className="py-2 px-3 lg:py-3 lg:px-6 text-left">{criteria.minAccuracy}</td>
                      <td className="py-2 px-3 lg:py-3 lg:px-6 text-left">{criteria.maxErrors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600 text-sm lg:text-base">ไม่มีเกณฑ์การให้คะแนนสำหรับด่านนี้</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;