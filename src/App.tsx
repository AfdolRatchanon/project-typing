import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Clock, Target, Award, RotateCcw, Play, Pause, ChevronDown, ChevronRight } from 'lucide-react';
import './App.css'
// Define types for better type safety and code readability
interface Level {
  id: string;
  name: string;
  text: string;
}

interface Unit {
  id: string;
  name: string;
  levels: Level[];
}

interface Language {
  id: string;
  name: string;
  units: Unit[];
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

// --- Data for Languages, Units, Levels and Scoring Criteria ---
const languages: Language[] = [
  {
    id: 'thai',
    name: 'ภาษาไทย',
    units: [
      {
        id: 'thai-basic',
        name: 'หน่วยที่ 1: พื้นฐาน',
        levels: [
          {
            id: 'thai-basic-1',
            name: 'ด่าน 1: แป้นเหย้าไทย',
            text: 'ฟ ห ก ด เ ้ ่ า ส ว ง',
          },
          {
            id: 'thai-basic-2',
            name: 'ด่าน 2: แถวบน',
            text: 'ๆ ไ ำ พ ะ ั ี ร น ย บ ล',
          },
          {
            id: 'thai-basic-3',
            name: 'ด่าน 3: แถวล่าง',
            text: 'ผ ป แ อ ิ ื ท ม ใ ฝ',
          },
        ]
      },
      {
        id: 'thai-words',
        name: 'หน่วยที่ 2: คำศัพท์',
        levels: [
          {
            id: 'thai-words-1',
            name: 'ด่าน 1: คำง่าย',
            text: 'การ คาร คิด คำ ใจ ใส ใน ใหม่ ได้ ดี',
          },
          {
            id: 'thai-words-2',
            name: 'ด่าน 2: คำยาว',
            text: 'มาก มี แม้ ยัง ระ รัก ลง วัน สี หา',
          },
        ]
      },
      {
        id: 'thai-sentences',
        name: 'หน่วยที่ 3: ประโยค',
        levels: [
          {
            id: 'thai-sentences-1',
            name: 'ด่าน 1: ประโยคง่าย',
            text: 'การฝึกพิมพ์ดีดเป็นสิ่งสำคัญในการทำงานยุคใหม่',
          },
          {
            id: 'thai-sentences-2',
            name: 'ด่าน 2: ประโยคยาว',
            text: 'ความเร็วและความแม่นยำในการพิมพ์จะช่วยเพิ่มประสิทธิภาพในการทำงานของคุณได้อย่างมาก การฝึกฝนอย่างสม่ำเสมอจะนำไปสู่ความสำเร็จ',
          },
        ]
      },
      {
        id: 'thai-advanced',
        name: 'หน่วยที่ 4: ขั้นสูง',
        levels: [
          {
            id: 'thai-advanced-1',
            name: 'ด่าน 1: ตัวเลขและสัญลักษณ์',
            text: 'ราคาของสินค้าคือ $123.45 และมีส่วนลด 10% เหลือเพียง 111.10 บาท! รหัสสินค้า #ABC-789.',
          },
        ]
      }
    ]
  },
  {
    id: 'english',
    name: 'English',
    units: [
      {
        id: 'english-basic',
        name: 'Unit 1: Basic',
        levels: [
          {
            id: 'english-basic-1',
            name: 'Level 1: Home Row',
            text: 'a s d f g h j k l',
          },
          {
            id: 'english-basic-2',
            name: 'Level 2: Top Row',
            text: 'q w e r t y u i o p',
          },
          {
            id: 'english-basic-3',
            name: 'Level 3: Bottom Row',
            text: 'z x c v b n m',
          },
        ]
      },
      {
        id: 'english-words',
        name: 'Unit 2: Words',
        levels: [
          {
            id: 'english-words-1',
            name: 'Level 1: Simple Words',
            text: 'the and for are but not you all can had her was one our',
          },
          {
            id: 'english-words-2',
            name: 'Level 2: Common Words',
            text: 'about after again against because before being between during',
          },
        ]
      },
      {
        id: 'english-sentences',
        name: 'Unit 3: Sentences',
        levels: [
          {
            id: 'english-sentences-1',
            name: 'Level 1: Simple Sentences',
            text: 'The quick brown fox jumps over the lazy dog.',
          },
          {
            id: 'english-sentences-2',
            name: 'Level 2: Complex Sentences',
            text: 'Practice makes perfect and consistency is key to improvement. The quick brown fox jumps over the lazy dog.',
          },
        ]
      }
    ]
  }
];

const scoringCriteria: LevelScoring = {
  // Thai Basic
  'thai-basic-1': [
    { minWPM: 20, minAccuracy: 95, maxErrors: 2, grade: 'ยอดเยี่ยม!' },
    { minWPM: 15, minAccuracy: 90, maxErrors: 4, grade: 'ดีมาก' },
    { minWPM: 10, minAccuracy: 85, maxErrors: 6, grade: 'พอใช้' },
  ],
  'thai-basic-2': [
    { minWPM: 25, minAccuracy: 95, maxErrors: 2, grade: 'ยอดเยี่ยม!' },
    { minWPM: 20, minAccuracy: 90, maxErrors: 4, grade: 'ดีมาก' },
    { minWPM: 15, minAccuracy: 85, maxErrors: 6, grade: 'พอใช้' },
  ],
  'thai-basic-3': [
    { minWPM: 25, minAccuracy: 95, maxErrors: 2, grade: 'ยอดเยี่ยม!' },
    { minWPM: 20, minAccuracy: 90, maxErrors: 4, grade: 'ดีมาก' },
    { minWPM: 15, minAccuracy: 85, maxErrors: 6, grade: 'พอใช้' },
  ],
  // Thai Words
  'thai-words-1': [
    { minWPM: 30, minAccuracy: 95, maxErrors: 3, grade: 'ยอดเยี่ยม!' },
    { minWPM: 25, minAccuracy: 90, maxErrors: 5, grade: 'ดีมาก' },
    { minWPM: 20, minAccuracy: 85, maxErrors: 7, grade: 'พอใช้' },
  ],
  'thai-words-2': [
    { minWPM: 30, minAccuracy: 95, maxErrors: 3, grade: 'ยอดเยี่ยม!' },
    { minWPM: 25, minAccuracy: 90, maxErrors: 5, grade: 'ดีมาก' },
    { minWPM: 20, minAccuracy: 85, maxErrors: 7, grade: 'พอใช้' },
  ],
  // Thai Sentences
  'thai-sentences-1': [
    { minWPM: 40, minAccuracy: 98, maxErrors: 2, grade: 'ยอดเยี่ยม!' },
    { minWPM: 30, minAccuracy: 95, maxErrors: 5, grade: 'ดีมาก' },
    { minWPM: 20, minAccuracy: 90, maxErrors: 8, grade: 'พอใช้' },
  ],
  'thai-sentences-2': [
    { minWPM: 50, minAccuracy: 98, maxErrors: 3, grade: 'ยอดเยี่ยม!' },
    { minWPM: 40, minAccuracy: 95, maxErrors: 7, grade: 'ดีมาก' },
    { minWPM: 30, minAccuracy: 90, maxErrors: 10, grade: 'พอใช้' },
  ],
  // Thai Advanced
  'thai-advanced-1': [
    { minWPM: 35, minAccuracy: 97, maxErrors: 3, grade: 'ยอดเยี่ยม!' },
    { minWPM: 25, minAccuracy: 93, maxErrors: 6, grade: 'ดีมาก' },
    { minWPM: 15, minAccuracy: 88, maxErrors: 9, grade: 'พอใช้' },
  ],
  // English Basic
  'english-basic-1': [
    { minWPM: 20, minAccuracy: 95, maxErrors: 2, grade: 'Excellent!' },
    { minWPM: 15, minAccuracy: 90, maxErrors: 4, grade: 'Good' },
    { minWPM: 10, minAccuracy: 85, maxErrors: 6, grade: 'Fair' },
  ],
  'english-basic-2': [
    { minWPM: 25, minAccuracy: 95, maxErrors: 2, grade: 'Excellent!' },
    { minWPM: 20, minAccuracy: 90, maxErrors: 4, grade: 'Good' },
    { minWPM: 15, minAccuracy: 85, maxErrors: 6, grade: 'Fair' },
  ],
  'english-basic-3': [
    { minWPM: 25, minAccuracy: 95, maxErrors: 2, grade: 'Excellent!' },
    { minWPM: 20, minAccuracy: 90, maxErrors: 4, grade: 'Good' },
    { minWPM: 15, minAccuracy: 85, maxErrors: 6, grade: 'Fair' },
  ],
  // English Words
  'english-words-1': [
    { minWPM: 35, minAccuracy: 95, maxErrors: 3, grade: 'Excellent!' },
    { minWPM: 30, minAccuracy: 90, maxErrors: 5, grade: 'Good' },
    { minWPM: 25, minAccuracy: 85, maxErrors: 7, grade: 'Fair' },
  ],
  'english-words-2': [
    { minWPM: 40, minAccuracy: 95, maxErrors: 3, grade: 'Excellent!' },
    { minWPM: 35, minAccuracy: 90, maxErrors: 5, grade: 'Good' },
    { minWPM: 30, minAccuracy: 85, maxErrors: 7, grade: 'Fair' },
  ],
  // English Sentences
  'english-sentences-1': [
    { minWPM: 50, minAccuracy: 98, maxErrors: 2, grade: 'Excellent!' },
    { minWPM: 40, minAccuracy: 95, maxErrors: 4, grade: 'Good' },
    { minWPM: 30, minAccuracy: 90, maxErrors: 6, grade: 'Fair' },
  ],
  'english-sentences-2': [
    { minWPM: 60, minAccuracy: 99, maxErrors: 1, grade: 'Excellent!' },
    { minWPM: 50, minAccuracy: 97, maxErrors: 4, grade: 'Good' },
    { minWPM: 40, minAccuracy: 92, maxErrors: 7, grade: 'Fair' },
  ],
};

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
  const [currentLevelId, setCurrentLevelId] = useState<string>(languages[0].units[0].levels[0].id);
  const [fullTextContent, setFullTextContent] = useState<string>(languages[0].units[0].levels[0].text);
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
        const selectedLevel = unit.levels.find(level => level.id === currentLevelId);
        if (selectedLevel) {
          setFullTextContent(selectedLevel.text);
          return;
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
    const char = textToType[typedText.length];
    if (!char) {
      return {
        char: '',
        keysToHighlight: [],
        baseKey: null,
        language: keyboardLanguage,
      };
    }

    const charCode = char.charCodeAt(0);
    const detectedLanguage: 'en' | 'th' = (charCode >= 0x0E00 && charCode <= 0x0E7F) ? 'th' : 'en';

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
        keysToHighlight.push('Shift');
      }
    }

    return {
      char: char,
      keysToHighlight: keysToHighlight,
      baseKey: baseKey || null,
      language: detectedLanguage,
    };
  }, [textToType, typedText, isCapsLockActive, keyboardLanguage]);

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

    if (value.length >= textToType.length) {
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
        const selectedLevel = unit.levels.find(l => l.id === currentLevelId);
        if (selectedLevel) {
          const newSegments = segmentText(selectedLevel.text);
          setSegments(newSegments);
          setTextToType(newSegments[0] || '');
          resetGameStates();
          return;
        }
      }
    }
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

  const renderTextToType = () => {
    return textToType.split('').map((char, index) => {
      let colorClass = 'text-gray-700';
      if (index < typedText.length) {
        colorClass = typedText[index] === char ? 'text-green-600' : 'text-red-600 line-through';
      }
      return (
        <span key={index} className={`${colorClass} ${index === typedText.length ? 'border-b-2 border-blue-500 animate-pulse' : ''}`}>
          {char === ' ' && index >= typedText.length ? '\u00A0' : char}
        </span>
      );
    });
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
        const level = unit.levels.find(l => l.id === currentLevelId);
        if (level) return level;
      }
    }
    return null;
  };

  const currentLevel = getCurrentLevel();
  const completedChars = typedText.length + (currentSegmentIndex * (segments[0]?.length || 0));
  const totalChars = fullTextContent.length;
  const progress = totalChars > 0 ? (completedChars / totalChars) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col lg:flex-row p-2 sm:p-4 font-inter gap-3 lg:gap-6">
      {/* Aside Menu for Level Selection */}
      <aside className="bg-white rounded-xl lg:rounded-2xl shadow-2xl w-full lg:w-80 xl:w-96 p-3 lg:p-6 border border-gray-200 lg:h-fit max-h-80 lg:max-h-screen">
        <h2 className="text-lg lg:text-2xl font-bold text-gray-800 mb-3 lg:mb-6 text-center">
          เลือกบทเรียน
        </h2>

        <div className="overflow-y-auto max-h-60 lg:max-h-[calc(100vh-200px)] pr-2">
          {languages.map((language) => (
            <div key={language.id} className="mb-4">
              <button
                onClick={() => setExpandedLanguage(expandedLanguage === language.id ? '' : language.id)}
                className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="font-bold text-gray-800">{language.name}</span>
                {expandedLanguage === language.id ?
                  <ChevronDown size={20} /> :
                  <ChevronRight size={20} />
                }
              </button>

              {expandedLanguage === language.id && (
                <div className="mt-2 space-y-2">
                  {language.units.map((unit) => (
                    <div key={unit.id}>
                      <button
                        onClick={() => toggleUnit(unit.id)}
                        className="w-full flex items-center justify-between p-2 ml-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-gray-700 text-sm">{unit.name}</span>
                        {expandedUnits[unit.id] ?
                          <ChevronDown size={16} /> :
                          <ChevronRight size={16} />
                        }
                      </button>

                      {expandedUnits[unit.id] && (
                        <div className="mt-1 space-y-1">
                          {unit.levels.map((level) => (
                            <button
                              key={level.id}
                              onClick={() => setCurrentLevelId(level.id)}
                              disabled={isStarted && !isPaused}
                              className={`
                                w-full text-left p-2 ml-8 rounded-md border transition-all duration-200 ease-in-out text-sm
                                ${currentLevelId === level.id
                                  ? 'bg-blue-500 text-white border-blue-600 shadow-md'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                                }
                                ${(isStarted && !isPaused) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                              `}
                            >
                              {level.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="bg-white p-4 lg:p-8 rounded-xl lg:rounded-2xl shadow-2xl flex-1 border border-gray-200 min-h-0">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 lg:p-6 rounded-lg mb-4 lg:mb-6">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-center mb-2">
            React Typing Trainer
          </h1>
          <p className="text-center opacity-90 text-sm lg:text-base">
            {currentLevel?.name || 'กำลังโหลด...'}
          </p>
        </div>

        {/* Stats Display with Icons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-4 lg:mb-6">
          <div className="bg-blue-50 p-3 lg:p-4 rounded-lg shadow-md text-center border border-blue-200">
            <Clock className="mx-auto mb-2 text-blue-600" size={20} />
            <p className="text-xl lg:text-2xl font-bold text-blue-800">{formatTime(timer)}</p>
            <p className="text-xs lg:text-sm font-medium text-blue-700">เวลา</p>
          </div>
          <div className="bg-green-50 p-3 lg:p-4 rounded-lg shadow-md text-center border border-green-200">
            <Target className="mx-auto mb-2 text-green-600" size={20} />
            <p className="text-xl lg:text-2xl font-bold text-green-800">{wpm}</p>
            <p className="text-xs lg:text-sm font-medium text-green-700">WPM</p>
          </div>
          <div className="bg-purple-50 p-3 lg:p-4 rounded-lg shadow-md text-center border border-purple-200">
            <Award className="mx-auto mb-2 text-purple-600" size={20} />
            <p className="text-xl lg:text-2xl font-bold text-purple-800">{accuracy}%</p>
            <p className="text-xs lg:text-sm font-medium text-purple-700">ความแม่นยำ</p>
          </div>
          <div className="bg-red-50 p-3 lg:p-4 rounded-lg shadow-md text-center border border-red-200">
            <p className="text-xl lg:text-2xl font-bold text-red-800">{totalErrors}</p>
            <p className="text-xs lg:text-sm font-medium text-red-700">ข้อผิดพลาด</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 lg:mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>ความคืบหน้า</span>
            <span>{completedChars} / {totalChars} ตัวอักษร</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Typing Area */}
        <div className="bg-blue-50 p-3 lg:p-6 rounded-lg border border-blue-200 mb-4 lg:mb-6 min-h-[80px] lg:min-h-[100px] flex items-center justify-center text-base lg:text-xl leading-relaxed text-center font-mono relative overflow-hidden whitespace-pre-wrap">
          {renderTextToType()}
        </div>

        {/* Input Text Area */}
        <textarea
          ref={inputRef}
          className="w-full p-3 lg:p-4 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 text-base lg:text-lg font-mono resize-none transition duration-200 ease-in-out min-h-[80px] lg:min-h-[100px]"
          placeholder={isFinished ? 'กด "เริ่มใหม่" เพื่อเล่นอีกครั้ง' : isPaused ? 'กด "ดำเนินต่อ" เพื่อเล่นต่อ' : 'เริ่มพิมพ์ที่นี่...'}
          value={typedText}
          onChange={handleInputChange}
          disabled={isFinished || isPaused}
          autoFocus
        />

        {/* Game Controls */}
        <div className="mt-4 lg:mt-6 text-center flex gap-2 justify-center">
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

        {/* Finger Guidance */}
        {nextChar && !isFinished && !isPaused && (
          <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-green-50 rounded-lg border border-green-200 text-center">
            <p className="text-base lg:text-lg font-semibold text-green-800">
              ตัวอักษรถัดไป: <span className="text-2xl lg:text-3xl font-bold text-green-900">{nextChar === ' ' ? '[Space]' : nextChar}</span>
            </p>
            {activeFinger && (
              <p className="text-sm lg:text-md text-green-700 mt-2">
                ใช้นิ้ว: <span className="font-bold">{fingerNamesDisplay[activeFinger]}</span>
              </p>
            )}
          </div>
        )}

        {/* Virtual Keyboard */}
        <div className="mt-4 lg:mt-6 p-3 lg:p-6 bg-gray-100 rounded-lg shadow-inner border border-gray-200 overflow-x-auto">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-2 lg:mb-4 text-center">คีย์บอร์ด</h2>
          <div className="flex flex-col items-center justify-center">
            {keyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex my-0.5 lg:my-1">
                {row.map((keyLabel) => {
                  const isHighlighted = highlightedKeys.includes(keyLabel) || (highlightedKeys.includes('Shift') && (keyLabel === 'Shift' || keyLabel === 'ShiftRight'));
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
                        ${isHighlighted ? 'bg-blue-400 text-white border-blue-600 -translate-y-1 shadow-lg' : isCapsActive ? 'bg-blue-300 text-white border-blue-500' : 'bg-gray-200 text-gray-800 border-gray-400 shadow-sm'}
                        ${keyLabel === 'Backspace' ? 'w-16 lg:w-24' : ''}
                        ${keyLabel === 'Tab' ? 'w-12 lg:w-20' : ''}
                        ${keyLabel === '\\' ? 'w-12 lg:w-18' : ''}
                        ${keyLabel === 'CapsLock' ? 'w-16 lg:w-26' : ''}
                        ${keyLabel === 'Enter' ? 'w-16 lg:w-26' : ''}
                        ${keyLabel === 'Shift' || keyLabel === 'ShiftRight' ? 'w-20 lg:w-32' : ''}
                        ${keyLabel === 'Control' || keyLabel === 'ControlRight' ? 'w-20 lg:w-30' : ''}
                        ${keyLabel === 'Alt' || keyLabel === 'AltGr' ? 'w-16 lg:w-18' : ''}
                        ${keyLabel === 'Space' ? 'w-56 lg:w-96' : 'w-8 h-8 lg:w-12 lg:h-12'}
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