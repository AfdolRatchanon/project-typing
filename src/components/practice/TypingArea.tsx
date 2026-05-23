// src/components/TypingArea.tsx

// สำคัญ: การ import React นี้จำเป็นเพื่อให้ TypeScript รู้จัก JSX namespace
import React, { useState, useEffect, useRef } from 'react';

// Interface for the component's props
interface TypingAreaProps {
  textToType: string;
  typedText: string;
  currentSegmentIndex: number;
  segments: string[];
  isFinished: boolean;
  isPaused: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

/**
 * @function renderTextToType
 * @description Creates JSX for displaying the text to be typed, with highlights and styles.
 * Handles Thai floating tone marks.
 * @param {string} textToType - The current segment of text to type.
 * @param {string} typedText - The text already typed by the user in the current segment.
 * @param {number} currentSegmentIndex - The index of the current segment.
 * @param {string[]} segments - All segments of the full text.
 * @returns {React.JSX.Element[]} - Array of JSX elements for rendering.
 */
const renderTextToType = (textToType: string, typedText: string, currentSegmentIndex: number, segments: string[], isFinished: boolean): React.JSX.Element[] => {
  const isLastSegment = currentSegmentIndex === segments.length - 1;
  const isTypingComplete = typedText.length === textToType.length;

  const toneMarks = ['่', '้', '๊', '๋'];
  const topVowels = ['ิ', 'ี', 'ึ', 'ื', '์', 'ั'];
  const saraAm = 'ำ';
  const tailConsonants = ['ป', 'ฝ', 'ฟ', 'ฬ'];

  const textElements = textToType.split('').map((char, index) => {
    // U1: \u0E43\u0E0A\u0E49 highlight \u0E41\u0E17\u0E19 line-through
    const isCorrect = index < typedText.length && typedText[index] === char;
    const isWrong   = index < typedText.length && typedText[index] !== char;
    const isCursor  = index === typedText.length && !isFinished;

    let colorClass = 'text-gray-700';
    if (isCorrect) colorClass = 'text-green-600';
    if (isWrong)   colorClass = 'text-red-700';

    const isToneMark = toneMarks.includes(char);
    let hasTopVowelBefore = false;
    let hasSaraAmAfter = false;
    let hasTailConsonantBefore = false;

    if (isToneMark && index > 0) {
      if (topVowels.includes(textToType[index - 1])) hasTopVowelBefore = true;
      else if (index > 1 && topVowels.includes(textToType[index - 2])) hasTopVowelBefore = true;
      if (index < textToType.length - 1 && textToType[index + 1] === saraAm) hasSaraAmAfter = true;

      if (tailConsonants.includes(textToType[index - 1])) hasTailConsonantBefore = true;
      else if (index > 1 && tailConsonants.includes(textToType[index - 2])) hasTailConsonantBefore = true;
    }

    const shouldRaiseToneMark = isToneMark && (hasTopVowelBefore || hasSaraAmAfter);
    const shouldShiftToneMarkLeft = isToneMark && hasTailConsonantBefore && !hasTopVowelBefore;

    return (
      <span
        key={index}
        className={`${colorClass} ${isCursor ? 'animate-pulse' : ''} ${shouldRaiseToneMark ? 'thai-tone-mark' : ''} ${shouldShiftToneMarkLeft ? 'thai-tone-mark-left' : ''}`}
        style={{
          // B1: cursor \u0E0A\u0E31\u0E14\u0E40\u0E08\u0E19 \u0E14\u0E49\u0E27\u0E22 border \u0E43\u0E15\u0E49\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23
          ...(isCursor ? { borderBottom: '3px solid var(--color-primary)' } : {}),
          // U1: bg highlight \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E15\u0E31\u0E27\u0E1C\u0E34\u0E14
          ...(isWrong ? { background: 'rgba(220,38,38,0.14)', borderRadius: '3px', padding: '0 1px' } : {}),
        }}
      >
        {char === ' ' && index >= typedText.length ? '\u00A0' : char}
      </span>
    );
  });

  if (isTypingComplete && !isLastSegment) {
    textElements.push(
      <span key="spacebar-hint" className="ml-2 font-bold animate-pulse" style={{ color: 'var(--color-accent)' }}>
        [กด Space Bar เพื่อดำเนินต่อ]
      </span>
    );
  }

  return textElements;
};

/**
 * @component TypingArea
 * @description Displays the text to be typed and the input textarea.
 * @param {TypingAreaProps} props - Props for TypingArea component.
 */
const TypingArea: React.FC<TypingAreaProps> = ({
  textToType,
  typedText,
  currentSegmentIndex,
  segments,
  isFinished,
  isPaused,
  inputRef,
  handleInputChange,
}) => {

  // U5 — shake on wrong keystroke
  const [shaking, setShaking] = useState(false);
  const prevErrorCountRef = useRef(0);
  const currentErrors = typedText.split('').filter((c, i) => c !== textToType[i]).length;
  useEffect(() => {
    if (currentErrors > prevErrorCountRef.current) {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 250);
      prevErrorCountRef.current = currentErrors;
      return () => clearTimeout(t);
    }
    prevErrorCountRef.current = currentErrors;
  }, [currentErrors]);

  // B3 — red border flash when 3 consecutive errors accumulate
  const [errorFlash, setErrorFlash] = useState(false);
  const consecutiveErrRef = useRef(0);
  const prevTypedLenRef = useRef(0);
  useEffect(() => {
    const len = typedText.length;
    if (len > prevTypedLenRef.current) {
      // new char typed
      const lastIdx = len - 1;
      if (typedText[lastIdx] !== textToType[lastIdx]) {
        consecutiveErrRef.current += 1;
        if (consecutiveErrRef.current >= 3) {
          setErrorFlash(true);
          const t = setTimeout(() => setErrorFlash(false), 400);
          consecutiveErrRef.current = 0;
          prevTypedLenRef.current = len;
          return () => clearTimeout(t);
        }
      } else {
        consecutiveErrRef.current = 0;
      }
    } else {
      consecutiveErrRef.current = 0;
    }
    prevTypedLenRef.current = len;
  }, [typedText, textToType]);

  // U14 — font size control
  const FONT_SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'] as const;
  const [fontSizeIdx, setFontSizeIdx] = useState(() => {
    const saved = localStorage.getItem('typingFontSize');
    return saved ? parseInt(saved, 10) : 2; // default = text-lg
  });
  const changeFontSize = (delta: number) => {
    setFontSizeIdx(prev => {
      const next = Math.max(0, Math.min(FONT_SIZES.length - 1, prev + delta));
      localStorage.setItem('typingFontSize', String(next));
      return next;
    });
  };
  const fontSizeClass = FONT_SIZES[fontSizeIdx];

  // Function to prevent copy, cut, and paste
  const preventClipboardActions = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  // Function to prevent Backspace and Delete keys
  // const preventDeleteKeys = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  //   if (e.key === 'Backspace' || e.key === 'Delete') {
  //     e.preventDefault();
  //   }
  // };

  return (
    <>
      {/* U14 — font size controls */}
      <div className="flex justify-end gap-1 mb-1">
        <button onClick={() => changeFontSize(-1)} disabled={fontSizeIdx === 0}
          className="text-xs px-1.5 py-0.5 rounded font-bold disabled:opacity-30"
          style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>A-</button>
        <button onClick={() => changeFontSize(1)} disabled={fontSizeIdx === FONT_SIZES.length - 1}
          className="text-xs px-1.5 py-0.5 rounded font-bold disabled:opacity-30"
          style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>A+</button>
      </div>

      {/* พื้นที่แสดงข้อความสำหรับพิมพ์ */}
      <div data-testid="typing-display" className={`p-2 lg:p-4 rounded-lg mb-3 lg:mb-4 min-h-[60px] lg:min-h-[70px] flex items-center justify-center ${fontSizeClass} leading-relaxed text-center font-mono relative overflow-hidden whitespace-pre-wrap niramit-regular${shaking ? ' animate-shake' : ''}`}
        style={{
          background: 'var(--color-primary-light)',
          border: errorFlash
            ? '2px solid var(--color-error)'
            : '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
          transition: 'border-color 0.15s ease',
        }}>
        {renderTextToType(textToType, typedText, currentSegmentIndex, segments, isFinished)}
      </div>

      {/* Textarea สำหรับรับอินพุต */}
      <textarea
        ref={inputRef}
        className="w-full p-2 lg:p-3 rounded-lg focus:outline-none text-base lg:text-lg font-mono resize-none transition duration-200 ease-in-out min-h-[35px] lg:min-h-[45px] mb-3 lg:mb-4"
        style={{ border: '2px solid color-mix(in srgb, var(--color-primary) 40%, transparent)', boxShadow: '0 0 0 0px var(--color-primary)' }}
        onFocus={e => (e.currentTarget.style.border = '2px solid var(--color-primary)')}
        onBlur={e => (e.currentTarget.style.border = '2px solid color-mix(in srgb, var(--color-primary) 40%, transparent)')}
        placeholder={isFinished ? 'กด "เริ่มใหม่" เพื่อเล่นอีกครั้ง' : isPaused ? 'กด "ดำเนินต่อ" เพื่อเล่นต่อ' : 'เริ่มพิมพ์ที่นี่...'}
        value={typedText}
        onChange={handleInputChange}
        disabled={isFinished || isPaused}
        autoFocus
        // เพิ่ม onCopy, onCut, onPaste เพื่อป้องกันการคัดลอกและวาง
        onCopy={preventClipboardActions}
        onCut={preventClipboardActions}
        onPaste={preventClipboardActions}
      // เพิ่ม onKeyDown เพื่อป้องกัน Backspace/Delete key
      // onKeyDown={preventDeleteKeys}
      />
    </>
  );
};

export default TypingArea;
