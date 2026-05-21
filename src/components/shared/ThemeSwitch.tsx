import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeSwitch: React.FC = () => {
    const { themeId, setTheme, themes } = useTheme();
    const [open, setOpen] = useState(false);

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
            {/* Theme panel */}
            {open && (
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-52 animate-modal-fade-in">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">เลือก Theme</p>
                    <div className="flex flex-col gap-2">
                        {themes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => { setTheme(theme.id); setOpen(false); }}
                                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left"
                            >
                                {/* Color preview */}
                                <div className="flex gap-1 flex-shrink-0">
                                    <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ background: theme.sidebar }} />
                                    <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ background: theme.primary }} />
                                    <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ background: theme.accent }} />
                                </div>
                                <span className="text-sm font-medium text-gray-700 flex-1">{theme.name}</span>
                                {themeId === theme.id && (
                                    <Check size={14} className="text-green-500 flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Toggle button */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
                style={{ background: 'var(--color-primary)' }}
                title="เปลี่ยน Theme"
            >
                <Palette size={20} />
            </button>
        </div>
    );
};

export default ThemeSwitch;
