import React, { useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { CarIcon } from '../components/Icons';

const copyByLang = {
    pt: {
        signIn: 'Iniciar sessão',
        signUp: 'Criar conta',
        signInTitle: 'Entre na sua conta',
        signInSubtitle: 'Use o seu email profissional e a sua palavra-passe.',
        registerTitle: 'Crie a sua conta',
        registerSubtitle:
            'Registe um utilizador novo. Perfis de gestor e administrador devem ser atribuídos pela administração.',
        newUsers: 'Registo de novos utilizadores',
        createAccount: 'Criar conta',
        fastBooking: 'Reserva rápida e fácil',
        saveUpTo: 'Até 30% de desconto',
        offers: 'Ofertas exclusivas',
        cashback: 'Ganhe cashback',
        email: 'E-mail',
        password: 'Palavra-passe',
        forgot: 'Esqueci-me da minha palavra-passe',
        fullName: 'Nome completo',
        team: 'Equipa',
        confirmPassword: 'Confirmar palavra-passe',
        teamPlaceholder: 'Ex.: Operações Lisboa',
        signInButton: 'Iniciar sessão',
        registerButton: 'Criar conta',
        socialDivider: 'ou',
        google: 'Continuar com Google',
        apple: 'Continuar com Apple',
        back: 'Voltar',
        demoHint: 'Contas demo criadas localmente',
        driverHint: 'Novos registos entram como Condutor por defeito.',
        accountReady: 'Tem conta? Entre aqui',
    },
    en: {
        signIn: 'Sign in',
        signUp: 'Create account',
        signInTitle: 'Sign in to your account',
        signInSubtitle: 'Use your professional email and password.',
        registerTitle: 'Create your account',
        registerSubtitle:
            'Register a new user. Manager and administrator profiles should be assigned by administration.',
        newUsers: 'New user registration',
        createAccount: 'Create account',
        fastBooking: 'Fast and easy booking',
        saveUpTo: 'Up to 30% discount',
        offers: 'Exclusive offers',
        cashback: 'Earn cashback',
        email: 'Email',
        password: 'Password',
        forgot: 'I forgot my password',
        fullName: 'Full name',
        team: 'Team',
        confirmPassword: 'Confirm password',
        teamPlaceholder: 'e.g. Lisbon Operations',
        signInButton: 'Sign in',
        registerButton: 'Create account',
        socialDivider: 'or',
        google: 'Continue with Google',
        apple: 'Continue with Apple',
        back: 'Back',
        demoHint: 'Demo accounts seeded locally',
        driverHint: 'New registrations are created as Driver by default.',
        accountReady: 'Already have an account? Sign in',
    },
};

export default function Login({ onBack }) {
    const { lang, setLang } = useI18n();
    const { login, register } = useAuth();
    const { vehicles } = useData();
    const heroVehicle = vehicles[1] || vehicles[0];
    const copy = useMemo(() => copyByLang[lang] || copyByLang.pt, [lang]);

    const [mode, setMode] = useState('login');
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({
        name: '',
        team: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');

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
        <div className="min-h-screen bg-[#f3f4f6] text-ink">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={heroVehicle?.image}
                        alt={heroVehicle?.name || 'ReservaCarro'}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.68),rgba(15,23,42,0.82))]" />
                </div>

                <header className="relative z-20">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-white">
                        <button onClick={onBack} className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
                                <CarIcon className="h-5 w-5" />
                            </span>
                            <span className="text-lg font-semibold tracking-tight">ReservaCarro</span>
                        </button>

                        <div className="flex items-center gap-4">
                            <LangSwitch lang={lang} setLang={setLang} />
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/16"
                                >
                                    {copy.back}
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-8 md:pb-24">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                            {copy.signIn}
                        </p>
                        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
                            Acesso profissional com perfis reais em base de dados.
                        </h1>
                        <p className="mt-4 max-w-xl text-base leading-7 text-white/78">
                            Entre com email e palavra-passe. O sistema identifica o papel do
                            utilizador e abre a área correta para condutor, gestor ou administrador.
                        </p>
                    </div>

                    <div className="mt-10 rounded-[30px] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.22)]">
                        {mode === 'login' ? (
                            <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
                                <section className="border-b border-slate-200 p-8 lg:border-b-0 lg:border-r">
                                    <p className="text-3xl font-semibold tracking-tight text-ink">
                                        {copy.newUsers}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode('register');
                                            setError('');
                                        }}
                                        className="mt-6 w-full rounded-xl border border-slate-300 px-5 py-4 text-lg font-medium transition hover:border-ink hover:bg-slate-50"
                                    >
                                        {copy.createAccount}
                                    </button>

                                    <ul className="mt-10 space-y-4 text-lg text-ink">
                                        <FeatureItem>{copy.fastBooking}</FeatureItem>
                                        <FeatureItem>{copy.saveUpTo}</FeatureItem>
                                        <FeatureItem>{copy.offers}</FeatureItem>
                                        <FeatureItem>{copy.cashback}</FeatureItem>
                                    </ul>
                                </section>

                                <section className="p-8">
                                    <p className="text-3xl font-semibold tracking-tight text-ink">
                                        {copy.signIn}
                                    </p>
                                    <p className="mt-3 text-sm text-slate-500">
                                        {copy.signInSubtitle}
                                    </p>

                                    <form onSubmit={handleLogin} className="mt-8 space-y-5">
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
                                                placeholder="utilizador@empresa.pt"
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
                                                placeholder="********"
                                                autoComplete="current-password"
                                                required
                                            />
                                        </Field>

                                        <button
                                            type="button"
                                            className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
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
                                            className="w-full rounded-xl bg-[#17894e] px-5 py-4 text-lg font-semibold text-white transition hover:bg-[#117241] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {pending ? '...' : copy.signInButton}
                                        </button>
                                    </form>

                                    <Divider>{copy.socialDivider}</Divider>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <SocialButton>{copy.google}</SocialButton>
                                        <SocialButton dark>{copy.apple}</SocialButton>
                                    </div>

                                    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                                        <p className="font-semibold text-slate-800">{copy.demoHint}</p>
                                        <p className="mt-2">ana@empresa.pt · password123</p>
                                        <p>rui@empresa.pt · password123</p>
                                        <p>carla@empresa.pt · password123</p>
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
                                <aside className="border-b border-slate-200 bg-slate-50 p-8 lg:border-b-0 lg:border-r">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                        <p className="text-lg font-medium text-ink">
                                            Acelere o registo usando uma conta social
                                        </p>
                                        <div className="mt-5 space-y-3">
                                            <SocialButton>{copy.google}</SocialButton>
                                            <SocialButton dark>{copy.apple}</SocialButton>
                                        </div>
                                        <p className="mt-5 text-sm leading-6 text-slate-600">
                                            Os seus dados serão mantidos em sigilo. Esta ação não será
                                            publicada nas redes sociais.
                                        </p>
                                    </div>

                                    <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                                        <p className="font-semibold">{copy.driverHint}</p>
                                        <p className="mt-2">
                                            Gestores e administradores devem ser promovidos depois pela
                                            administração.
                                        </p>
                                    </div>
                                </aside>

                                <section className="p-8">
                                    <div className="flex flex-wrap items-end justify-between gap-4">
                                        <div>
                                            <p className="text-4xl font-semibold tracking-tight text-ink">
                                                {copy.registerTitle}
                                            </p>
                                            <p className="mt-3 max-w-2xl text-sm text-slate-500">
                                                {copy.registerSubtitle}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMode('login');
                                                setError('');
                                            }}
                                            className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                                        >
                                            {copy.accountReady}
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
                                                    placeholder="Nome do utilizador"
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
                                                    placeholder={copy.teamPlaceholder}
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
                                                    placeholder="utilizador@empresa.pt"
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
                                                    placeholder="Mínimo 8 caracteres"
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
                                                    placeholder="Repita a palavra-passe"
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
                        )}
                    </div>
                </main>
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

function Divider({ children }) {
    return (
        <div className="my-6 flex items-center gap-4 text-sm text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>{children}</span>
            <span className="h-px flex-1 bg-slate-200" />
        </div>
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

function LangSwitch({ lang, setLang }) {
    return (
        <div className="hidden text-xs font-medium sm:flex">
            <button
                onClick={() => setLang('pt')}
                className={`px-1.5 py-1 transition ${
                    lang === 'pt' ? 'text-white' : 'text-white/65 hover:text-white'
                }`}
            >
                PT
            </button>
            <span className="px-0.5 text-white/40">/</span>
            <button
                onClick={() => setLang('en')}
                className={`px-1.5 py-1 transition ${
                    lang === 'en' ? 'text-white' : 'text-white/65 hover:text-white'
                }`}
            >
                EN
            </button>
        </div>
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
