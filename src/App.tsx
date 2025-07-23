import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './App.css'
// Define types for better type safety and code readability
interface Level {
  id: string;
  name: string;
  text: string;
}

interface ScoringCriteria {
  minWPM: number;
  minAccuracy: number;
  maxErrors: number;
  grade: string;
}

interface LevelScoring {
  [levelId: string]: ScoringCriteria[];
}

// --- Data for Levels and Scoring Criteria ---
// สามารถเพิ่มหรือแก้ไขข้อมูลด่านและเกณฑ์การให้คะแนนได้ที่นี่
const levels: Level[] = [
  {
    id: 'level-1',
    name: 'ด่าน 1: ประโยคง่ายๆ',
    text: 'การฝึกพิมพ์ดีดเป็นสิ่งสำคัญในการทำงานยุคใหม่',
  },
  {
    id: 'level-2',
    name: 'ด่าน 2: ข้อความยาวขึ้น',
    text: 'ความเร็วและความแม่นยำในการพิมพ์จะช่วยเพิ่มประสิทธิภาพในการทำงานของคุณได้อย่างมาก การฝึกฝนอย่างสม่ำเสมอจะนำไปสู่ความสำเร็จ',
  },
  {
    id: 'level-3',
    name: 'ด่าน 3: ตัวเลขและสัญลักษณ์',
    text: 'ราคาของสินค้าคือ $123.45 และมีส่วนลด 10% เหลือเพียง 111.10 บาท! รหัสสินค้า #ABC-789.',
  },
  {
    id: 'level-4',
    name: 'ด่าน 4: ภาษาอังกฤษ',
    text: 'The quick brown fox jumps over the lazy dog. Practice makes perfect and consistency is key to improvement.',
  },
  { // New Level: Thai Home Row
    id: 'level-5',
    name: 'ด่าน 5: แป้นเหย้าภาษาไทย',
    text: 'ฟ ห ก ด ่ า ส ว',
  },
];

const scoringCriteria: LevelScoring = {
  'level-1': [
    { minWPM: 40, minAccuracy: 98, maxErrors: 2, grade: 'ยอดเยี่ยม!' },
    { minWPM: 30, minAccuracy: 95, maxErrors: 5, grade: 'ดีมาก' },
    { minWPM: 20, minAccuracy: 90, maxErrors: 8, grade: 'พอใช้' },
  ],
  'level-2': [
    { minWPM: 50, minAccuracy: 98, maxErrors: 3, grade: 'ยอดเยี่ยม!' },
    { minWPM: 40, minAccuracy: 95, maxErrors: 7, grade: 'ดีมาก' },
    { minWPM: 30, minAccuracy: 90, maxErrors: 10, grade: 'พอใช้' },
  ],
  'level-3': [
    { minWPM: 35, minAccuracy: 97, maxErrors: 3, grade: 'ยอดเยี่ยม!' },
    { minWPM: 25, minAccuracy: 93, maxErrors: 6, grade: 'ดีมาก' },
    { minWPM: 15, minAccuracy: 88, maxErrors: 9, grade: 'พอใช้' },
  ],
  'level-4': [
    { minWPM: 60, minAccuracy: 99, maxErrors: 1, grade: 'ยอดเยี่ยม!' },
    { minWPM: 50, minAccuracy: 97, maxErrors: 4, grade: 'ดีมาก' },
    { minWPM: 40, minAccuracy: 92, maxErrors: 7, grade: 'พอใช้' },
  ],
  'level-5': [ // Scoring for Thai Home Row
    { minWPM: 30, minAccuracy: 98, maxErrors: 1, grade: 'ยอดเยี่ยม!' },
    { minWPM: 20, minAccuracy: 95, maxErrors: 2, grade: 'ดีมาก' },
    { minWPM: 10, minAccuracy: 90, maxErrors: 3, grade: 'พอใช้' },
  ],
};

// --- Keyboard Layout Data ---
const keyboardRows = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Alt', 'Space', 'AltGr', 'Ctrl'],
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
  th: { // Thai Kedmanee Layout (ปรับปรุงใหม่ตามคำขอ)
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
// This function dynamically creates the charToKeyLabelMap based on the current language and shift state.
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
  'Alt': 'leftThumb', // Assuming left Alt
  'AltGr': 'rightThumb', // Assuming right Alt/AltGr
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
  // Normalize multiple spaces to single space and trim
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const words = normalizedText.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // If it's the first word of a new line, don't add a leading space
    const potentialNewLine = currentLine ? (currentLine + ' ' + word) : word;
    if (potentialNewLine.length <= maxCharsPerLine) {
      currentLine = potentialNewLine;
    } else {
      if (currentLine) { // Push the current line if it's not empty
        lines.push(currentLine);
      }
      currentLine = word; // Start a new line with the current word
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
  const [currentLevelId, setCurrentLevelId] = useState<string>(levels[0].id); // ID ของด่านปัจจุบัน
  const [fullTextContent, setFullTextContent] = useState<string>(levels[0].text); // Original full text
  const [segments, setSegments] = useState<string[]>([]); // Text broken into segments
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0); // Index of current segment
  const [textToType, setTextToType] = useState<string>(''); // Current segment to type
  const [typedText, setTypedText] = useState<string>(''); // Text typed for current segment

  const [startTime, setStartTime] = useState<number | null>(null); // Game start time
  const [endTime, setEndTime] = useState<number | null>(null); // Game end time
  const [timer, setTimer] = useState<number>(0); // Display timer

  const [totalErrors, setTotalErrors] = useState<number>(0); // Cumulative errors across all segments
  const [totalCorrectChars, setTotalCorrectChars] = useState<number>(0); // Cumulative correct characters
  const [totalTypedChars, setTotalTypedChars] = useState<number>(0); // Cumulative typed characters

  const [isStarted, setIsStarted] = useState<boolean>(false); // Game started status
  const [isFinished, setIsFinished] = useState<boolean>(false); // Game finished status

  const [wpm, setWpm] = useState<number>(0); // Words Per Minute
  const [cpm, setCpm] = useState<number>(0); // Characters Per Minute
  const [accuracy, setAccuracy] = useState<number>(0); // Accuracy

  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for timer interval
  const inputRef = useRef<HTMLTextAreaElement>(null); // Ref for input field

  // State for Keyboard and Finger Guidance
  const [nextChar, setNextChar] = useState<string>(''); // Next character to type
  const [activeFinger, setActiveFinger] = useState<string | null>(null); // Finger to use
  const [highlightedKeys, setHighlightedKeys] = useState<string[]>([]); // Keys to highlight on virtual keyboard
  const [keyboardLanguage, setKeyboardLanguage] = useState<'en' | 'th'>('en'); // Virtual keyboard language
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false); // Physical Shift key status
  const [isCapsLockActive, setIsCapsLockActive] = useState<boolean>(false); // Physical CapsLock key status

  // Effect hook to update fullTextContent when currentLevelId changes
  useEffect(() => {
    const selectedLevel = levels.find(level => level.id === currentLevelId);
    if (selectedLevel) {
      setFullTextContent(selectedLevel.text);
    }
  }, [currentLevelId]);

  // Effect hook to segment text and set initial segment when fullTextContent changes
  useEffect(() => {
    if (fullTextContent) {
      const newSegments = segmentText(fullTextContent);
      setSegments(newSegments);
      setCurrentSegmentIndex(0);
      setTextToType(newSegments[0] || ''); // Set the first segment as textToType
      resetGameStates(); // Reset all game-related states
    }
  }, [fullTextContent]);

  // Effect hook for the timer
  useEffect(() => {
    if (isStarted && !isFinished) {
      intervalRef.current = setInterval(() => {
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
  }, [isStarted, isFinished]);

  // Event listeners for physical keyboard Shift/CapsLock state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftActive(true);
      } else if (e.key === 'CapsLock') {
        // We get the state directly from the event to avoid sync issues
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

  // --- START: REFACTORED AND FIXED SECTION ---

  // useMemo to calculate all typing guidance values in one place for efficiency.
  const typingGuidance = useMemo(() => {
    const char = textToType[typedText.length];
    if (!char) {
      return {
        char: '',
        keysToHighlight: [],
        baseKey: null,
        language: keyboardLanguage, // Keep last language
      };
    }

    const charCode = char.charCodeAt(0);
    const detectedLanguage: 'en' | 'th' = (charCode >= 0x0E00 && charCode <= 0x0E7F) ? 'th' : 'en';

    let baseKey: string | undefined;
    let needsShift = false;

    // 1. Try to find the character in the unshifted layout
    const unshiftedCharToKeyMap = getCharToKeyLabelMap(detectedLanguage, false);
    baseKey = unshiftedCharToKeyMap[char];

    // 2. If not found, check the shifted layout
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

      // Handle Shift highlighting
      // This logic determines if the 'Shift' key needs to be visually pressed.
      const isCharUpperCase = detectedLanguage === 'en' && char.match(/[A-Z]/);
      const isSymbolRequiringShift = needsShift;

      // Highlight Shift if:
      // 1. It's a symbol that requires shift (e.g., '!' from '1').
      // 2. It's an uppercase letter AND CapsLock is OFF.
      // 3. It's a lowercase letter AND CapsLock is ON.
      if (isSymbolRequiringShift || (isCharUpperCase && !isCapsLockActive) || (!isCharUpperCase && isCapsLockActive && char.match(/[a-z]/i))) {
        keysToHighlight.push('Shift');
      }
    }

    return {
      char: char,
      keysToHighlight: keysToHighlight,
      baseKey: baseKey || null,
      language: detectedLanguage,
    };
  }, [textToType, typedText, isCapsLockActive]);

  // useEffect to update state based on the calculated guidance.
  // This separates calculation (useMemo) from side effects (useEffect).
  useEffect(() => {
    setNextChar(typingGuidance.char);
    setHighlightedKeys(typingGuidance.keysToHighlight);
    setActiveFinger(typingGuidance.baseKey ? keyToFingerMap[typingGuidance.baseKey] : null);
    setKeyboardLanguage(typingGuidance.language);
  }, [typingGuidance]);

  // --- END: REFACTORED AND FIXED SECTION ---

  // Function to calculate WPM (Words Per Minute)
  const calculateWPM = useCallback((correctChars: number, timeInSeconds: number): number => {
    if (timeInSeconds === 0) return 0;
    // Standard WPM calculation: (characters / 5) / minutes
    const words = correctChars / 5;
    const minutes = timeInSeconds / 60;
    return Math.round(words / minutes);
  }, []);

  // Function to calculate CPM (Characters Per Minute)
  const calculateCPM = useCallback((correctChars: number, timeInSeconds: number): number => {
    if (timeInSeconds === 0) return 0;
    const minutes = timeInSeconds / 60;
    return Math.round(correctChars / minutes);
  }, []);

  // Function to calculate Accuracy
  const calculateAccuracy = useCallback((correctChars: number, totalChars: number): number => {
    if (totalChars === 0) return 0;
    return Math.round((correctChars / totalChars) * 100);
  }, []);

  // Handle user input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;


    // Start the timer when the first character is typed
    if (!isStarted && value.length > 0) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    // Calculate errors for the current segment
    let currentSegmentErrors = 0;
    let currentSegmentCorrectChars = 0;

    for (let i = 0; i < value.length; i++) {
      if (value[i] === textToType[i]) {
        currentSegmentCorrectChars++;
      } else {
        currentSegmentErrors++;
      }
    }

    setTypedText(value);

    // Check if the current segment is finished
    if (value.length >= textToType.length) {
      // Finalize stats for this segment
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

      // Move to the next segment or finish the game
      if (currentSegmentIndex + 1 < segments.length) {
        setCurrentSegmentIndex(prev => prev + 1);
        setTextToType(segments[currentSegmentIndex + 1]);
        setTypedText(''); // Reset typed text for the new segment
      } else {
        // All segments finished
        const finalEndTime = Date.now();
        setIsFinished(true);
        setIsStarted(false);
        setEndTime(finalEndTime);

        const timeTaken = (finalEndTime - (startTime || finalEndTime)) / 1000;
        setWpm(calculateWPM(newTotalCorrectChars, timeTaken));
        setCpm(calculateCPM(newTotalCorrectChars, timeTaken));
        setAccuracy(calculateAccuracy(newTotalCorrectChars, newTotalTypedChars));
      }
    }
  };

  // Function to reset all game-related states
  const resetGameStates = () => {
    setTypedText('');
    setStartTime(null);
    setEndTime(null);
    setTimer(0);
    setTotalErrors(0);
    setTotalCorrectChars(0);
    setTotalTypedChars(0);
    setIsStarted(false);
    setIsFinished(false);
    setWpm(0);
    setCpm(0);
    setAccuracy(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input field on reset
    }
  };

  // Function to get the grade based on current stats and level criteria
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

  // Helper to render text with correct/incorrect highlighting
  const renderTextToType = () => {
    return textToType.split('').map((char, index) => {
      let colorClass = 'text-gray-700'; // Default color for upcoming text
      if (index < typedText.length) {
        colorClass = typedText[index] === char ? 'text-green-600' : 'text-red-600 line-through'; // Correct or Incorrect
      }
      return (
        <span key={index} className={`${colorClass} ${index === typedText.length ? 'border-b-2 border-blue-500 animate-pulse' : ''}`}>
          {char === ' ' && index >= typedText.length ? '\u00A0' : char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
          <span className="text-blue-600">React</span> Typing Trainer
        </h1>

        {/* Level Selection */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label htmlFor="level-select" className="text-lg font-semibold text-gray-700 mb-2 sm:mb-0 sm:mr-4">
            เลือกด่าน:
          </label>
          <select
            id="level-select"
            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out bg-white text-gray-800"
            value={currentLevelId}
            onChange={(e) => setCurrentLevelId(e.target.value)}
            disabled={isStarted}
          >
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        {/* Typing Area */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mb-6 min-h-[100px] flex items-center justify-center text-xl leading-relaxed text-center font-mono relative overflow-hidden whitespace-pre-wrap">
          {renderTextToType()}
        </div>

        {/* Input Text Area */}
        <textarea
          ref={inputRef}
          className="w-full p-4 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 text-lg font-mono resize-none transition duration-200 ease-in-out min-h-[100px]"
          placeholder={isFinished ? 'กด "เริ่มใหม่" เพื่อเล่นอีกครั้ง' : 'เริ่มพิมพ์ที่นี่...'}
          value={typedText}
          onChange={handleInputChange}
          disabled={isFinished}
          autoFocus
        />

        {/* Finger Guidance */}
        {nextChar && !isFinished && (
          <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200 text-center">
            <p className="text-lg font-semibold text-green-800">
              ตัวอักษรถัดไป: <span className="text-3xl font-bold text-green-900">{nextChar === ' ' ? '[Space]' : nextChar}</span>
            </p>
            {activeFinger && (
              <p className="text-md text-green-700 mt-2">
                ใช้นิ้ว: <span className="font-bold">{fingerNamesDisplay[activeFinger]}</span>
              </p>
            )}
          </div>
        )}

        {/* Virtual Keyboard */}
        <div className="mt-8 p-6 bg-gray-100 rounded-xl shadow-inner border border-gray-200 overflow-x-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">คีย์บอร์ด</h2>
          {/* Manual language toggle is removed in favor of automatic detection */}
          <div className="flex flex-col items-center justify-center">
            {keyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex my-1">
                {row.map((keyLabel) => {
                  const isHighlighted = highlightedKeys.includes(keyLabel) || (highlightedKeys.includes('Shift') && (keyLabel === 'Shift' || keyLabel === 'ShiftRight'));
                  const isCapsActive = keyLabel === 'CapsLock' && isCapsLockActive;

                  const displayChar = keyLabel.length > 1 ? keyLabel :
                    (isShiftActive ?
                      keyDisplays[keyboardLanguage].shifted[keyLabel as keyof typeof keyDisplays.en.shifted]
                      : keyDisplays[keyboardLanguage].unshifted[keyLabel as keyof typeof keyDisplays.en.unshifted]
                    ) || keyLabel;

                  // Handle CapsLock display for English letters
                  const finalDisplay = (isCapsLockActive && !isShiftActive && displayChar.match(/[a-z]/i)) ?
                    displayChar.toUpperCase() : displayChar;

                  return (
                    <div
                      key={keyLabel}
                      className={`
                            relative flex items-center justify-center
                            m-0.5 rounded-md text-sm font-semibold transition-all duration-100 ease-in-out
                            border-b-4
                            ${isHighlighted ? 'bg-blue-400 text-white border-blue-600 -translate-y-1 shadow-lg' : isCapsActive ? 'bg-blue-300 text-white border-blue-500' : 'bg-gray-200 text-gray-800 border-gray-400 shadow-sm'}
                            ${keyLabel === 'Backspace' ? 'w-24' : ''}
                            ${keyLabel === 'Tab' ? 'w-16' : ''}
                            ${keyLabel === 'Enter' ? 'w-24' : ''}
                            ${keyLabel === 'CapsLock' ? 'w-20' : ''}
                            ${keyLabel === 'Shift' || keyLabel === 'ShiftRight' ? 'flex-grow' : ''}
                            ${keyLabel === 'Space' ? 'w-64' : 'w-12 h-12'}
                            `}
                    >
                      {finalDisplay}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-purple-100 p-4 rounded-xl shadow-md text-center border border-purple-200">
            <p className="text-sm font-medium text-purple-700">เวลา (วินาที)</p>
            <p className="text-3xl font-bold text-purple-800">{timer}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-xl shadow-md text-center border border-green-200">
            <p className="text-sm font-medium text-green-700">ข้อผิดพลาด</p>
            <p className="text-3xl font-bold text-green-800">{totalErrors}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-xl shadow-md text-center border border-yellow-200">
            <p className="text-sm font-medium text-yellow-700">WPM</p>
            <p className="text-3xl font-bold text-yellow-800">{wpm}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-xl shadow-md text-center border border-red-200">
            <p className="text-sm font-medium text-red-700">ความแม่นยำ (%)</p>
            <p className="text-3xl font-bold text-red-800">{accuracy}</p>
          </div>
        </div>

        {/* Game Controls */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              const selectedLevel = levels.find(l => l.id === currentLevelId);
              if (selectedLevel) {
                setFullTextContent(selectedLevel.text); // This will trigger the useEffect to reset the game
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            {isFinished || !isStarted ? 'เริ่มใหม่' : 'รีเซ็ต'}
          </button>
        </div>

        {/* Result & Grade Display */}
        {isFinished && (
          <div className="mt-8 bg-indigo-50 p-6 rounded-xl shadow-inner border border-indigo-200 text-center">
            <h2 className="text-2xl font-bold text-indigo-800 mb-3">ผลลัพธ์ของคุณ:</h2>
            <p className="text-xl font-semibold text-indigo-700">
              เกรด: <span className="text-indigo-900 font-bold text-2xl">{getGrade()}</span>
            </p>
          </div>
        )}

        {/* Scoring Criteria Display for Current Level */}
        <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            เกณฑ์การให้คะแนนสำหรับด่าน "{currentLevelId && levels.find(l => l.id === currentLevelId)?.name || 'กำลังโหลด...'}":
          </h2>
          {scoringCriteria[currentLevelId] ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left rounded-tl-lg">เกรด</th>
                    <th className="py-3 px-6 text-left">WPM ขั้นต่ำ</th>
                    <th className="py-3 px-6 text-left">ความแม่นยำขั้นต่ำ (%)</th>
                    <th className="py-3 px-6 text-left rounded-tr-lg">ข้อผิดพลาดสูงสุด</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {scoringCriteria[currentLevelId].map((criteria, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-6 text-left whitespace-nowrap font-medium">{criteria.grade}</td>
                      <td className="py-3 px-6 text-left">{criteria.minWPM}</td>
                      <td className="py-3 px-6 text-left">{criteria.minAccuracy}</td>
                      <td className="py-3 px-6 text-left">{criteria.maxErrors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600">ไม่มีเกณฑ์การให้คะแนนสำหรับด่านนี้</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;