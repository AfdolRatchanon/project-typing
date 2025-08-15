// src/components/TypingArea.tsx

// สำคัญ: การ import React นี้จำเป็นเพื่อให้ TypeScript รู้จัก JSX namespace
import React from 'react';

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
const renderTextToType = (textToType: string, typedText: string, currentSegmentIndex: number, segments: string[]): React.JSX.Element[] => {
  const isLastSegment = currentSegmentIndex === segments.length - 1;
  const isTypingComplete = typedText.length === textToType.length;

  const toneMarks = ['่', '้', '๊', '๋'];
  const topVowels = ['ิ', 'ี', 'ึ', 'ื', '์', 'ั'];
  const saraAm = 'ำ';
  const tailConsonants = ['ป', 'ฝ', 'ฟ', 'ฬ'];

  const textElements = textToType.split('').map((char, index) => {
    let colorClass = 'text-gray-700';
    if (index < typedText.length) {
      colorClass = typedText[index] === char ? 'text-green-600' : 'text-red-600 line-through';
    }

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
        className={`
          ${colorClass}
          ${index === typedText.length ? 'border-b-2 border-blue-500 animate-pulse' : ''}
          ${shouldRaiseToneMark ? 'thai-tone-mark' : ''}
          ${shouldShiftToneMarkLeft ? 'thai-tone-mark-left' : ''}
        `}
      >
        {char === ' ' && index >= typedText.length ? '\u00A0' : char}
      </span>
    );
  });

  if (isTypingComplete && !isLastSegment) {
    textElements.push(
      <span key="spacebar-hint" className="ml-2 text-blue-600 font-bold animate-pulse">
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
      {/* พื้นที่แสดงข้อความสำหรับพิมพ์ */}
      <div className="bg-blue-50 p-2 lg:p-4 rounded-lg border border-blue-200 mb-3 lg:mb-4 min-h-[60px] lg:min-h-[70px] flex items-center justify-center text-base md:text-lg lg:text-xl leading-relaxed text-center font-mono relative overflow-hidden whitespace-pre-wrap niramit-regular">
        {renderTextToType(textToType, typedText, currentSegmentIndex, segments)}
      </div>

      {/* Textarea สำหรับรับอินพุต */}
      <textarea
        ref={inputRef}
        className="w-full p-2 lg:p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 text-base lg:text-lg font-mono resize-none transition duration-200 ease-in-out min-h-[35px] lg:min-h-[45px] mb-3 lg:mb-4"
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
