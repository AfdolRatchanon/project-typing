import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'slate-blue' | 'teal' | 'navy' | 'purple';

export interface ThemeOption {
    id: ThemeId;
    name: string;
    primary: string;   // preview color
    sidebar: string;
    accent: string;
}

export const THEMES: ThemeOption[] = [
    { id: 'slate-blue', name: 'Slate Blue',   primary: '#1D4ED8', sidebar: '#1E293B', accent: '#3B82F6' },
    { id: 'teal',       name: 'Charcoal Teal', primary: '#0F766E', sidebar: '#111827', accent: '#14B8A6' },
    { id: 'navy',       name: 'Navy Amber',    primary: '#1E3A5F', sidebar: '#162D4A', accent: '#F59E0B' },
    { id: 'purple',     name: 'Purple Haze',   primary: '#7C3AED', sidebar: '#1E1B4B', accent: '#A78BFA' },
];

interface ThemeContextValue {
    themeId: ThemeId;
    setTheme: (id: ThemeId) => void;
    themes: ThemeOption[];
    current: ThemeOption;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'app-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeId, setThemeId] = useState<ThemeId>(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
        return saved && THEMES.find(t => t.id === saved) ? saved : 'navy';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem(STORAGE_KEY, themeId);
    }, [themeId]);

    const setTheme = (id: ThemeId) => setThemeId(id);
    const current = THEMES.find(t => t.id === themeId)!;

    return (
        <ThemeContext.Provider value={{ themeId, setTheme, themes: THEMES, current }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextValue => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
};
