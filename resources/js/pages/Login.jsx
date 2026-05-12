import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { CarIcon } from '../components/Icons';

export default function Login({ onBack }) {
    const { t, lang, setLang } = useI18n();
    const { login } = useAuth();

    const roles = [
        { id: ROLES.DRIVER, label: t.auth.roleDriver, desc: t.auth.roleDriverDesc },
        { id: ROLES.MANAGER, label: t.auth.roleManager, desc: t.auth.roleManagerDesc },
        { id: ROLES.ADMIN, label: t.auth.roleAdmin, desc: t.auth.roleAdminDesc },
    ];

    return (
        <div className="min-h-screen bg-paper-2 text-ink">
            <header className="border-b border-border bg-paper">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-3"
                        aria-label="Início"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-paper">
                            <CarIcon className="h-4 w-4" />
                        </span>
                    </button>

                    <div className="flex items-center gap-4">
                        <LangSwitch lang={lang} setLang={setLang} />
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="text-sm text-muted transition hover:text-ink"
                            >
                                ← {t.common.back}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto flex max-w-md flex-col px-6 py-14">
                <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        {t.auth.chooseRole}
                    </p>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">
                        {t.auth.loginTitle}
                    </h1>
                    <p className="mt-2 text-sm text-muted">{t.auth.loginSubtitle}</p>
                </div>

                <div className="space-y-4 rounded-lg border border-border bg-paper p-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                            {t.auth.email}
                        </label>
                        <input
                            type="email"
                            placeholder={t.auth.emailPlaceholder}
                            disabled
                            className="w-full rounded-md border border-border bg-paper-2 px-3 py-2 text-sm text-ink placeholder:text-muted-soft outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                            {t.auth.password}
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            disabled
                            className="w-full rounded-md border border-border bg-paper-2 px-3 py-2 text-sm text-ink placeholder:text-muted-soft outline-none"
                        />
                    </div>
                </div>

                <div className="mt-6 border-t border-border-soft pt-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                        {t.auth.demoNotice}
                    </p>
                    <ul className="space-y-2">
                        {roles.map((r) => (
                            <li key={r.id}>
                                <button
                                    onClick={() => login(r.id)}
                                    className="group flex w-full items-center justify-between gap-4 rounded-md border border-border bg-paper px-4 py-3 text-left transition hover:border-ink hover:bg-paper-2"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-ink">{r.label}</p>
                                        <p className="mt-0.5 text-xs text-muted">{r.desc}</p>
                                    </div>
                                    <span className="text-muted-soft transition group-hover:text-ink">
                                        →
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
}

function LangSwitch({ lang, setLang }) {
    return (
        <div className="flex text-xs font-medium">
            <button
                onClick={() => setLang('pt')}
                className={`px-1.5 py-1 transition ${
                    lang === 'pt' ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
            >
                PT
            </button>
            <span className="px-0.5 text-border">/</span>
            <button
                onClick={() => setLang('en')}
                className={`px-1.5 py-1 transition ${
                    lang === 'en' ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
            >
                EN
            </button>
        </div>
    );
}
