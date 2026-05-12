import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';

const copyByLang = {
    pt: {
        signIn: 'Iniciar sessão',
        register: 'Criar conta',
        newUsers: 'Registo de novo utilizadores',
        email: 'E-mail',
        password: 'Palavra-passe',
        forgot: 'Esqueci-me da minha palavra-passe',
        fullName: 'Nome completo',
        team: 'Equipa',
        confirmPassword: 'Confirmar palavra-passe',
        signInButton: 'Iniciar sessão',
        registerButton: 'Criar conta',
        fastBooking: 'Reserva rápida e fácil',
        saveUpTo: 'Até 30% de desconto',
        offers: 'Ofertas exclusivas',
        cashback: 'Ganhe cashback',
        socialDivider: 'ou',
        google: 'Google',
        apple: 'Apple',
        demoHint: 'Contas demo',
        registerHint:
            'Novos registos entram como Condutor. Gestor e administrador devem ser promovidos depois.',
        backToLogin: 'Já tenho conta',
        createAccountTitle: 'Crie a sua conta',
    },
    en: {
        signIn: 'Sign in',
        register: 'Create account',
        newUsers: 'New user registration',
        email: 'Email',
        password: 'Password',
        forgot: 'I forgot my password',
        fullName: 'Full name',
        team: 'Team',
        confirmPassword: 'Confirm password',
        signInButton: 'Sign in',
        registerButton: 'Create account',
        fastBooking: 'Fast and easy booking',
        saveUpTo: 'Up to 30% discount',
        offers: 'Exclusive offers',
        cashback: 'Earn cashback',
        socialDivider: 'or',
        google: 'Google',
        apple: 'Apple',
        demoHint: 'Demo accounts',
        registerHint:
            'New accounts are created as Driver. Manager and admin should be promoted later.',
        backToLogin: 'I already have an account',
        createAccountTitle: 'Create your account',
    },
};

export default function Login({ onBack }) {
    const { lang } = useI18n();
    const { login, register } = useAuth();
    const copy = useMemo(() => copyByLang[lang] || copyByLang.pt, [lang]);

    const [mode, setMode] = useState('login');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({
        name: '',
        team: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        function handleKey(event) {
            if (event.key === 'Escape') onBack?.();
        }

        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onBack]);

    async function handleLogin(event) {
        event.preventDefault();
        setPending(true);
        setError('');

        try {
            await login(loginForm);
        } catch (requestError) {
            setError(extractError(requestError) || 'Não foi possível iniciar sessão.');
        } finally {
            setPending(false);
        }
    }

    async function handleRegister(event) {
        event.preventDefault();
        setPending(true);
        setError('');

        try {
            await register(registerForm);
        } catch (requestError) {
            setError(extractError(requestError) || 'Não foi possível criar a conta.');
        } finally {
            setPending(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-[140] bg-black/18 backdrop-blur-[1px]"
            onClick={onBack}
        >
            <div
                className={`mx-auto flex min-h-screen w-full px-4 ${
                    mode === 'login'
                        ? 'max-w-7xl items-start justify-end pt-22 md:px-6'
                        : 'max-w-6xl items-start justify-center pt-16 md:px-6'
                }`}
            >
                <div onClick={(event) => event.stopPropagation()} className="w-full">
                    {mode === 'login' ? (
                        <div className="ml-auto w-full max-w-[620px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
                            <div className="grid md:grid-cols-[0.9fr_1.1fr]">
                                <section className="border-b border-slate-200 p-7 md:border-b-0 md:border-r">
                                    <p className="text-[2rem] font-semibold tracking-tight text-ink">
                                        {copy.newUsers}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode('register');
                                            setError('');
                                        }}
                                        className="mt-5 w-full rounded-xl border border-slate-300 px-5 py-3 text-lg font-medium transition hover:border-ink hover:bg-slate-50"
                                    >
                                        {copy.register}
                                    </button>

                                    <ul className="mt-7 space-y-3.5 text-lg text-ink">
                                        <FeatureItem>{copy.fastBooking}</FeatureItem>
                                        <FeatureItem>{copy.saveUpTo}</FeatureItem>
                                        <FeatureItem>{copy.offers}</FeatureItem>
                                        <FeatureItem>{copy.cashback}</FeatureItem>
                                    </ul>
                                </section>

                                <section className="p-7">
                                    <p className="text-[2rem] font-semibold tracking-tight text-ink">
                                        {copy.signIn}
                                    </p>

                                    <form onSubmit={handleLogin} className="mt-7 space-y-5">
                                        <Field label={copy.email}>
                                            <Input
                                                type="email"
                                                value={loginForm.email}
                                                onChange={(event) =>
                                                    setLoginForm((current) => ({
                                                        ...current,
                                                        email: event.target.value,
                                                    }))
                                                }
                                                autoComplete="email"
                                                required
                                            />
                                        </Field>

                                        <Field label={copy.password}>
                                            <Input
                                                type="password"
                                                value={loginForm.password}
                                                onChange={(event) =>
                                                    setLoginForm((current) => ({
                                                        ...current,
                                                        password: event.target.value,
                                                    }))
                                                }
                                                autoComplete="current-password"
                                                required
                                            />
                                        </Field>

                                        <button
                                            type="button"
                                            className="block w-full text-center text-sm font-medium text-blue-600 transition hover:text-blue-700"
                                        >
                                            {copy.forgot}
                                        </button>

                                        {error && (
                                            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                                                {error}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={pending}
                                            className="w-full rounded-xl bg-[#17894e] px-5 py-3.5 text-[1.15rem] font-semibold text-white transition hover:bg-[#117241] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {pending ? '...' : copy.signInButton}
                                        </button>
                                    </form>

                                    <Divider>{copy.socialDivider}</Divider>

                                    <div className="grid grid-cols-2 gap-4">
                                        <SocialButton>{copy.google}</SocialButton>
                                        <SocialButton dark>{copy.apple}</SocialButton>
                                    </div>

                                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                                        <p className="font-semibold text-slate-800">{copy.demoHint}</p>
                                        <p className="mt-2">ana@empresa.pt · password123</p>
                                        <p>rui@empresa.pt · password123</p>
                                        <p>carla@empresa.pt · password123</p>
                                    </div>
                                </section>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
                            <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
                                <aside className="border-b border-slate-200 bg-slate-50 p-8 lg:border-b-0 lg:border-r">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                        <p className="text-lg font-medium text-ink">
                                            {copy.newUsers}
                                        </p>
                                        <div className="mt-5 space-y-3">
                                            <SocialButton>{copy.google}</SocialButton>
                                            <SocialButton dark>{copy.apple}</SocialButton>
                                        </div>
                                        <p className="mt-5 text-sm leading-6 text-slate-600">
                                            {copy.registerHint}
                                        </p>
                                    </div>
                                </aside>

                                <section className="p-8">
                                    <div className="flex flex-wrap items-end justify-between gap-4">
                                        <p className="text-4xl font-semibold tracking-tight text-ink">
                                            {copy.createAccountTitle}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMode('login');
                                                setError('');
                                            }}
                                            className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                                        >
                                            {copy.backToLogin}
                                        </button>
                                    </div>

                                    <form onSubmit={handleRegister} className="mt-8">
                                        <div className="grid gap-5 md:grid-cols-2">
                                            <Field label={copy.fullName}>
                                                <Input
                                                    value={registerForm.name}
                                                    onChange={(event) =>
                                                        setRegisterForm((current) => ({
                                                            ...current,
                                                            name: event.target.value,
                                                        }))
                                                    }
                                                    autoComplete="name"
                                                    required
                                                />
                                            </Field>

                                            <Field label={copy.team}>
                                                <Input
                                                    value={registerForm.team}
                                                    onChange={(event) =>
                                                        setRegisterForm((current) => ({
                                                            ...current,
                                                            team: event.target.value,
                                                        }))
                                                    }
                                                    autoComplete="organization"
                                                    required
                                                />
                                            </Field>

                                            <Field label={copy.email}>
                                                <Input
                                                    type="email"
                                                    value={registerForm.email}
                                                    onChange={(event) =>
                                                        setRegisterForm((current) => ({
                                                            ...current,
                                                            email: event.target.value,
                                                        }))
                                                    }
                                                    autoComplete="email"
                                                    required
                                                />
                                            </Field>

                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                    Perfil atribuído
                                                </p>
                                                <p className="mt-2 text-base font-medium text-ink">
                                                    Condutor
                                                </p>
                                            </div>

                                            <Field label={copy.password}>
                                                <Input
                                                    type="password"
                                                    value={registerForm.password}
                                                    onChange={(event) =>
                                                        setRegisterForm((current) => ({
                                                            ...current,
                                                            password: event.target.value,
                                                        }))
                                                    }
                                                    autoComplete="new-password"
                                                    required
                                                />
                                            </Field>

                                            <Field label={copy.confirmPassword}>
                                                <Input
                                                    type="password"
                                                    value={registerForm.password_confirmation}
                                                    onChange={(event) =>
                                                        setRegisterForm((current) => ({
                                                            ...current,
                                                            password_confirmation:
                                                                event.target.value,
                                                        }))
                                                    }
                                                    autoComplete="new-password"
                                                    required
                                                />
                                            </Field>
                                        </div>

                                        {error && (
                                            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                                                {error}
                                            </p>
                                        )}

                                        <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 lg:flex-row lg:items-center lg:justify-between">
                                            <ul className="space-y-2 text-sm text-emerald-700">
                                                <FeatureLine>{copy.fastBooking}</FeatureLine>
                                                <FeatureLine>{copy.saveUpTo}</FeatureLine>
                                                <FeatureLine>{copy.offers}</FeatureLine>
                                            </ul>

                                            <button
                                                type="submit"
                                                disabled={pending}
                                                className="rounded-xl bg-[#17894e] px-8 py-4 text-lg font-semibold text-white transition hover:bg-[#117241] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {pending ? '...' : copy.registerButton}
                                            </button>
                                        </div>
                                    </form>
                                </section>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
            {children}
        </label>
    );
}

function Input(props) {
    return (
        <input
            {...props}
            className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 ${
                props.className || ''
            }`}
        />
    );
}

function FeatureItem({ children }) {
    return (
        <li className="flex items-center gap-3">
            <span className="text-xl text-ink">✓</span>
            <span>{children}</span>
        </li>
    );
}

function FeatureLine({ children }) {
    return (
        <li className="flex items-center gap-2">
            <span>✓</span>
            <span>{children}</span>
        </li>
    );
}

function Divider({ children }) {
    return (
        <div className="my-6 flex items-center gap-4 text-sm text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>{children}</span>
            <span className="h-px flex-1 bg-slate-200" />
        </div>
    );
}

function SocialButton({ children, dark = false }) {
    return (
        <button
            type="button"
            className={`flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition ${
                dark
                    ? 'border-black bg-black text-white hover:bg-neutral-900'
                    : 'border-slate-300 bg-white text-ink hover:bg-slate-50'
            }`}
        >
            {children}
        </button>
    );
}

function extractError(error) {
    const messageBag = error?.response?.data?.errors;
    if (messageBag) {
        const firstKey = Object.keys(messageBag)[0];
        if (firstKey && messageBag[firstKey]?.[0]) return messageBag[firstKey][0];
    }

    return error?.response?.data?.message || '';
}
