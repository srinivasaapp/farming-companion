"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { Language, translations } from '@/lib/i18n/translations';
import { useAuth } from '@/components/providers/AuthProvider';

interface LanguageContextType {
    lang: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'te',
    setLanguage: () => { },
    t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { lang, setLanguage, profile } = useAuth();

    // Secondary sync: If profile language differs from local state, it's already handled by AuthProvider.
    // This provider now acts as a pure translation consumer and local toggle bridge.

    const t = (key: string): string => {
        const dict = translations[lang] || translations['te'];
        return (dict as any)[key] || (translations['en'] as any)[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
