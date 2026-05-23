import React, { useRef, useEffect, useState } from 'react';
import { Clock, Target, Award, CircleAlert } from 'lucide-react';
import { formatTime, formatTimeWithColor } from '../../utils/timeUtils';

function CountdownRing({ remaining, limit }: { remaining: number; limit: number }) {
    const r = 23;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - Math.max(0, remaining / limit));
    const isUrgent = remaining < 30;
    return (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 54, height: 54 }}>
            <svg width="54" height="54" viewBox="0 0 54 54" style={{ transform: 'rotate(-90deg)' }}>
                <circle r={r} cx="27" cy="27" fill="none"
                    stroke="var(--color-border)" strokeWidth="4" />
                <circle r={r} cx="27" cy="27" fill="none"
                    stroke={isUrgent ? 'var(--color-error)' : 'var(--color-primary)'}
                    strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
            </svg>
            <span style={{
                position: 'absolute', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '-0.02em',
                color: isUrgent ? 'var(--color-error)' : 'var(--color-text)',
            }}>
                {formatTime(remaining)}
            </span>
        </div>
    );
}

function useAnimatedNumber(target: number, duration = 250): number {
    const [display, setDisplay] = useState(target);
    const rafRef = useRef<number>(0);
    const startRef = useRef<number>(0);
    const fromRef = useRef<number>(target);

    useEffect(() => {
        cancelAnimationFrame(rafRef.current);
        const from = fromRef.current;
        if (from === target) return;
        startRef.current = performance.now();
        const step = (now: number) => {
            const t = Math.min(1, (now - startRef.current) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.round(from + (target - from) * eased));
            if (t < 1) rafRef.current = requestAnimationFrame(step);
            else fromRef.current = target;
        };
        rafRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]);

    return display;
}

interface StatsDisplayProps {
    timer: number;
    timeLimit: number | null;
    remainingTime: number | null;
    wpm: number;
    accuracy: number;
    totalErrors: number;
    totalProgress: number;
    totalCharsActual: number;
    wpmHistory?: number[];
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
    timer, timeLimit, remainingTime,
    wpm, accuracy, totalErrors,
    totalProgress, totalCharsActual,
    wpmHistory = [],
}) => {
    const animWpm = useAnimatedNumber(wpm);
    const animAccuracy = useAnimatedNumber(accuracy);
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
                <div style={{ ...cardBase, borderColor: timeLimit && (remainingTime ?? 999) < 30 ? 'color-mix(in srgb, var(--color-error) 40%, transparent)' : undefined, flexDirection: 'column', gap: '0.25rem' }}>
                    {timeLimit && remainingTime !== null ? (
                        <>
                            <CountdownRing remaining={remainingTime} limit={timeLimit} />
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>เหลือ</p>
                        </>
                    ) : (
                        <>
                            <p className={`text-lg lg:text-xl font-bold leading-none ${timeColor}`}>{timeText}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>ไม่จำกัด</p>
                        </>
                    )}
                </div>

                {/* WPM */}
                <div style={cardBase}>
                    <Target size={17} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    <div className="text-center">
                        <p className="text-lg lg:text-xl font-bold leading-none" style={{ color: 'var(--color-success)' }}>{animWpm}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>WPM</p>
                    </div>
                    {wpmHistory.length >= 2 && (() => {
                        const max = Math.max(...wpmHistory, 1);
                        const pts = wpmHistory.map((v, i) =>
                            `${(i / (wpmHistory.length - 1)) * 60},${22 - (v / max) * 20}`
                        ).join(' ');
                        return (
                            <svg width="60" height="22" className="opacity-50 shrink-0" style={{ color: 'var(--color-success)' }}>
                                <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                            </svg>
                        );
                    })()}
                </div>

                {/* ความแม่นยำ */}
                <div style={cardBase}>
                    <Award size={17} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                    <div className="text-center min-w-0 flex-1">
                        <p className="text-lg lg:text-xl font-bold leading-none" style={{ color: 'var(--color-accent)' }}>{animAccuracy}%</p>
                        <p className="text-xs mt-0.5 mb-1" style={{ color: 'var(--color-text-muted)' }}>ความแม่นยำ</p>
                        {/* B2 — accuracy mini bar */}
                        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)' }}>
                            <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${animAccuracy}%`, background: 'var(--color-accent)' }} />
                        </div>
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
