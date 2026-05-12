import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations } from './translations';

const STORAGE_KEY = 'rentacar_lang';
const DEFAULT_LANG = 'pt';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
    const [lang, setLang] = useState(() => {
        if (typeof window === 'undefined') return DEFAULT_LANG;
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return stored && translations[stored] ? stored : DEFAULT_LANG;
    });

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en';
    }, [lang]);

    const t = translations[lang];

    return (
        <I18nContext.Provider value={{ lang, setLang, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
    return ctx;
}
