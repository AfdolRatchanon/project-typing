import React from 'react';
import { Clock, Target, Award, CircleAlert, Timer } from 'lucide-react';
import { formatTime, formatTimeWithColor } from '../../utils/timeUtils';

interface StatsDisplayProps {
    timer: number;
    timeLimit: number | null;
    remainingTime: number | null;
    wpm: number;
    accuracy: number;
    totalErrors: number;
    totalProgress: number;
    totalCharsActual: number;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
    timer, timeLimit, remainingTime,
    wpm, accuracy, totalErrors,
    totalProgress, totalCharsActual,
}) => {
    const progress = totalCharsActual > 0 ? (totalProgress / totalCharsActual) * 100 : 0;
    const timeColor = formatTimeWithColor(remainingTime, true, timeLimit).color;
    const timeText  = formatTimeWithColor(remainingTime, true, timeLimit).time;

    const cardBase: React.CSSProperties = {
        background: 'var(--color-primary-light)',
        border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    };

    return (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3 mb-4 lg:mb-5">
                {/* เวลาที่ใช้ */}
                <div style={cardBase}>
                    <Clock size={17} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <div className="text-center">
                        <p className="text-lg lg:text-xl font-bold leading-none" style={{ color: 'var(--color-primary)' }}>{formatTime(timer)}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>เวลาที่ใช้</p>
                    </div>
                </div>

                {/* เวลาที่เหลือ */}
                <div style={{ ...cardBase, borderColor: timeLimit && (remainingTime ?? 999) < 30 ? 'color-mix(in srgb, var(--color-error) 40%, transparent)' : undefined }}>
                    <Timer size={17} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <div className="text-center">
                        <p className={`text-lg lg:text-xl font-bold leading-none ${timeColor}`}>{timeText}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{timeLimit ? 'เหลือ' : 'ไม่จำกัด'}</p>
                    </div>
                </div>

                {/* WPM */}
                <div style={cardBase}>
                    <Target size={17} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    <div className="text-center">
                        <p className="text-lg lg:text-xl font-bold leading-none" style={{ color: 'var(--color-success)' }}>{wpm}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>WPM</p>
                    </div>
                </div>

                {/* ความแม่นยำ */}
                <div style={cardBase}>
                    <Award size={17} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                    <div className="text-center">
                        <p className="text-lg lg:text-xl font-bold leading-none" style={{ color: 'var(--color-accent)' }}>{accuracy}%</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>ความแม่นยำ</p>
                    </div>
                </div>

                {/* ข้อผิดพลาด */}
                <div style={{ ...cardBase, background: 'color-mix(in srgb, var(--color-error) 8%, transparent)', borderColor: 'color-mix(in srgb, var(--color-error) 25%, transparent)' }}>
                    <CircleAlert size={17} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
                    <div className="text-center">
                        <p className="text-lg lg:text-xl font-bold leading-none" style={{ color: 'var(--color-error)' }}>{totalErrors}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>ข้อผิดพลาด</p>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4 lg:mb-5">
                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    <span>ความคืบหน้า</span>
                    <span>{totalProgress} / {totalCharsActual} ตัวอักษร ({Math.round(progress)}%)</span>
                </div>
                <div className="w-full rounded-full h-2.5" style={{ background: 'var(--color-border)' }}>
                    <div className="h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%`, background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))' }} />
                </div>
            </div>
        </>
    );
};

export default StatsDisplay;
