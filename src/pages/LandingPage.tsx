import React from 'react';
import { LogIn, Keyboard, Users, BarChart2, Shield, BookOpen } from 'lucide-react';

interface LandingPageProps {
    onGuestStart: () => void;
    onSignIn: () => void;
    isAuthReady: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGuestStart, onSignIn, isAuthReady }) => {
    const accent = 'var(--color-accent)';
    const accentBorder = '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)';

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--gradient-landing)' }}>

            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10"
                        style={{ border: `2px solid ${accent}` }}>
                        <Keyboard size={22} style={{ color: accent }} />
                    </div>
                    <div>
                        <div className="text-white font-bold text-base leading-tight">TypingPro</div>
                        <div className="text-xs font-medium" style={{ color: accent }}>ระบบฝึกพิมพ์ดีด</div>
                    </div>
                </div>
                <button
                    onClick={onSignIn}
                    disabled={!isAuthReady}
                    className="flex items-center gap-2 font-semibold py-2 px-5 rounded-xl shadow hover:scale-105 transition-all duration-200 text-sm disabled:opacity-50 btn-primary"
                >
                    <LogIn size={16} /> เข้าสู่ระบบ
                </button>
            </nav>

            {/* Hero */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-12">

                {/* Badge */}
                <div className="mb-6 flex items-center gap-2 bg-white/10 text-sm font-medium px-4 py-1.5 rounded-full"
                    style={{ border: accentBorder, color: accent }}>
                    <BookOpen size={14} />
                    ระบบฝึกพิมพ์ดีดอาชีวศึกษา ปวช. / ปวส.
                </div>

                {/* Icon */}
                <div className="mb-6 w-24 h-24 rounded-full flex items-center justify-center bg-white/10 shadow-xl"
                    style={{ border: `4px solid ${accent}` }}>
                    <Keyboard size={48} style={{ color: accent }} />
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-3 leading-tight">
                    ระบบฝึกพิมพ์ดีด
                </h1>
                <h2 className="text-2xl sm:text-3xl font-bold mb-5" style={{ color: accent }}>
                    อาชีวศึกษา
                </h2>
                <p className="text-white/75 text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
                    ฝึกพิมพ์ภาษาไทยและอังกฤษ พร้อมระบบห้องเรียน การสอบออนไลน์
                    และติดตามความก้าวหน้าตามมาตรฐานอาชีวศึกษา
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                    <button
                        onClick={onGuestStart}
                        className="flex items-center justify-center gap-2 font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-lg"
                        style={{
                            background: accent,
                            color: 'var(--color-sidebar)',
                            border: `2px solid ${accent}`,
                        }}
                    >
                        <Keyboard size={22} /> ลองฝึกเลย (ไม่ต้อง Login)
                    </button>
                    <button
                        onClick={onSignIn}
                        disabled={!isAuthReady}
                        className="flex items-center justify-center gap-2 font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-lg border-2 border-white/50 text-white bg-white/10 hover:bg-white/20 disabled:opacity-50"
                    >
                        <LogIn size={22} /> เข้าสู่ระบบด้วย Google
                    </button>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl w-full">
                    {[
                        { icon: <Keyboard size={28} />, title: 'ฝึกพิมพ์', desc: 'ภาษาไทย & อังกฤษ พร้อมคีย์บอร์ดเสมือน' },
                        { icon: <Users size={28} />, title: 'ระบบห้องเรียน', desc: 'ครูสร้างห้อง นักเรียน join ด้วย Class Code' },
                        { icon: <Shield size={28} />, title: 'ระบบสอบ', desc: 'สอบออนไลน์มีเวลาจำกัด Anti-cheat' },
                        { icon: <BarChart2 size={28} />, title: 'ติดตามผล', desc: 'Dashboard คะแนน WPM Leaderboard' },
                    ].map((f, i) => (
                        <div key={i} className="rounded-2xl p-5 text-left"
                            style={{
                                background: 'rgba(255,255,255,0.07)',
                                border: accentBorder,
                                backdropFilter: 'blur(8px)',
                            }}>
                            <div className="mb-3" style={{ color: accent }}>{f.icon}</div>
                            <h3 className="font-bold text-white text-base mb-1">{f.title}</h3>
                            <p className="text-white/60 text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-5 border-t border-white/10">
                <div className="flex items-center justify-center gap-3 text-white/40 text-sm">
                    <BookOpen size={14} />
                    <span>สำหรับอาชีวศึกษา ปวช. / ปวส.</span>
                    <span>•</span>
                    <span>© 2025 Ratchanon Semsayan</span>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
