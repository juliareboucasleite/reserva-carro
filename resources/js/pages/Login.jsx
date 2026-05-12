import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';

const COUNTRY_OPTIONS = [
    { code: 'PT', label: 'Portugal' },
    { code: 'ES', label: 'Espanha' },
    { code: 'FR', label: 'França' },
    { code: 'DE', label: 'Alemanha' },
    { code: 'GB', label: 'Reino Unido' },
    { code: 'IT', label: 'Itália' },
    { code: 'NL', label: 'Países Baixos' },
    { code: 'BE', label: 'Bélgica' },
    { code: 'BR', label: 'Brasil' },
];

const COUNTRY_LABELS_EN = {
    PT: 'Portugal',
    ES: 'Spain',
    FR: 'France',
    DE: 'Germany',
    GB: 'United Kingdom',
    IT: 'Italy',
    NL: 'Netherlands',
    BE: 'Belgium',
    BR: 'Brazil',
};

const copyByLang = {
    pt: {
        signIn: 'Iniciar sessão',
        signInButton: 'Iniciar sessão',
        email: 'E-mail',
        password: 'Palavra-passe',
        forgot: 'Esqueci-me da palavra-passe',
        socialDivider: 'ou continuar com',
        google: 'Google',
        apple: 'Apple',
        noAccount: 'Ainda não tem conta?',
        createAccountCta: 'Criar conta',

        registerTitle: 'Crie a sua conta',
        haveAccount: 'Já tenho conta',
        personalSection: 'Dados pessoais',
        accessSection: 'Dados de acesso',
        firstName: 'Nome',
        lastName: 'Apelido',
        country: 'País de residência',
        nif: 'NIF',
        birthdate: 'Data de nascimento',
        phone: 'Telemóvel',
        phonePlaceholder: '+351 9XX XXX XXX',
        confirmEmail: 'Confirme o e-mail',
        confirmPassword: 'Confirme a palavra-passe',
        newsletter: 'Aceito receber ofertas e novidades por e-mail',
        legal: 'Ao criar conta, aceito os Termos de utilização e a Política de privacidade.',
        registerButton: 'Criar conta',
        emailMismatch: 'Os e-mails introduzidos não coincidem.',
        passwordMismatch: 'As palavras-passe não coincidem.',
        passwordHint: 'Mínimo 8 caracteres.',
        roleNote: 'Os novos registos entram como Condutor.',
    },
    en: {
        signIn: 'Sign in',
        signInButton: 'Sign in',
        email: 'Email',
        password: 'Password',
        forgot: 'Forgot password',
        socialDivider: 'or continue with',
        google: 'Google',
        apple: 'Apple',
        noAccount: "Don't have an account?",
        createAccountCta: 'Create account',

        registerTitle: 'Create your account',
        haveAccount: 'I already have an account',
        personalSection: 'Personal details',
        accessSection: 'Login details',
        firstName: 'First name',
        lastName: 'Last name',
        country: 'Country of residence',
        nif: 'Tax ID',
        birthdate: 'Date of birth',
        phone: 'Mobile',
        phonePlaceholder: '+351 9XX XXX XXX',
        confirmEmail: 'Confirm email',
        confirmPassword: 'Confirm password',
        newsletter: 'I agree to receive offers and news by email',
        legal: 'By creating an account, I accept the Terms of use and Privacy policy.',
        registerButton: 'Create account',
        emailMismatch: 'The emails do not match.',
        passwordMismatch: 'The passwords do not match.',
        passwordHint: 'Minimum 8 characters.',
        roleNote: 'New registrations are created as Driver.',
    },
};

const EMPTY_REGISTER = {
    name: '',
    surname: '',
    country: 'PT',
    nif: '',
    birthdate: '',
    phone: '',
    email: '',
    email_confirmation: '',
    password: '',
    password_confirmation: '',
    newsletter_opt_in: false,
};

export default function Login({ onBack }) {
    const { lang } = useI18n();
    const { login, register } = useAuth();
    const copy = useMemo(() => copyByLang[lang] || copyByLang.pt, [lang]);

    const [mode, setMode] = useState('login');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER);

    useEffect(() => {
        function handleKey(event) {
            if (event.key === 'Escape') onBack?.();
        }

        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onBack]);

    function updateRegister(field, value) {
        setRegisterForm((current) => ({ ...current, [field]: value }));
    }

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

        if (registerForm.email !== registerForm.email_confirmation) {
            setError(copy.emailMismatch);
            return;
        }

        if (registerForm.password !== registerForm.password_confirmation) {
            setError(copy.passwordMismatch);
            return;
        }

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

    const countryOptions = useMemo(
        () =>
            COUNTRY_OPTIONS.map((option) => ({
                code: option.code,
                label: lang === 'en' ? COUNTRY_LABELS_EN[option.code] || option.label : option.label,
            })),
        [lang]
    );

    return (
        <div
            className="fixed inset-0 z-[140] overflow-y-auto bg-black/40 backdrop-blur-[2px]"
            onClick={onBack}
        >
            <div className="flex min-h-screen items-start justify-center px-4 py-12 md:py-16">
                {mode === 'login' ? (
                    <LoginCard
                        copy={copy}
                        form={loginForm}
                        setForm={setLoginForm}
                        onSubmit={handleLogin}
                        onSwitch={() => {
                            setMode('register');
                            setError('');
                        }}
                        error={error}
                        pending={pending}
                    />
                ) : (
                    <RegisterCard
                        copy={copy}
                        form={registerForm}
                        update={updateRegister}
                        onSubmit={handleRegister}
                        onSwitch={() => {
                            setMode('login');
                            setError('');
                        }}
                        error={error}
                        pending={pending}
                        countryOptions={countryOptions}
                    />
                )}
            </div>
        </div>
    );
}

function LoginCard({ copy, form, setForm, onSubmit, onSwitch, error, pending }) {
    return (
        <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
        >
            <div className="px-7 py-7">
                <h2 className="text-xl font-semibold tracking-tight text-ink">{copy.signIn}</h2>

                <form onSubmit={onSubmit} className="mt-5 space-y-3.5">
                    <Field label={copy.email}>
                        <Input
                            type="email"
                            value={form.email}
                            onChange={(event) =>
                                setForm((current) => ({ ...current, email: event.target.value }))
                            }
                            autoComplete="email"
                            required
                        />
                    </Field>

                    <Field label={copy.password}>
                        <Input
                            type="password"
                            value={form.password}
                            onChange={(event) =>
                                setForm((current) => ({ ...current, password: event.target.value }))
                            }
                            autoComplete="current-password"
                            required
                        />
                    </Field>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                            {copy.forgot}
                        </button>
                    </div>

                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full rounded-lg bg-[#17894e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#117241] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {pending ? '...' : copy.signInButton}
                    </button>
                </form>

                <Divider>{copy.socialDivider}</Divider>

                <div className="grid grid-cols-2 gap-2.5">
                    <SocialButton>{copy.google}</SocialButton>
                    <SocialButton dark>{copy.apple}</SocialButton>
                </div>

                <p className="mt-6 text-center text-xs text-slate-600">
                    {copy.noAccount}{' '}
                    <button
                        type="button"
                        onClick={onSwitch}
                        className="font-semibold text-[#17894e] hover:text-[#117241]"
                    >
                        {copy.createAccountCta}
                    </button>
                </p>
            </div>
        </div>
    );
}

function RegisterCard({ copy, form, update, onSubmit, onSwitch, error, pending, countryOptions }) {
    return (
        <div className="mx-auto w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-7 py-5">
                <h2 className="text-xl font-semibold tracking-tight text-ink">
                    {copy.registerTitle}
                </h2>
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                    {copy.haveAccount}
                </button>
            </div>

            <form onSubmit={onSubmit} className="px-7 py-6">
                <SectionTitle>{copy.personalSection}</SectionTitle>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label={copy.firstName}>
                        <Input
                            value={form.name}
                            onChange={(event) => update('name', event.target.value)}
                            autoComplete="given-name"
                            required
                        />
                    </Field>

                    <Field label={copy.lastName}>
                        <Input
                            value={form.surname}
                            onChange={(event) => update('surname', event.target.value)}
                            autoComplete="family-name"
                            required
                        />
                    </Field>

                    <Field label={copy.country}>
                        <Select
                            value={form.country}
                            onChange={(event) => update('country', event.target.value)}
                            required
                        >
                            {countryOptions.map((option) => (
                                <option key={option.code} value={option.code}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <Field label={copy.nif}>
                        <Input
                            value={form.nif}
                            onChange={(event) => update('nif', event.target.value)}
                            inputMode="numeric"
                            required
                        />
                    </Field>

                    <Field label={copy.birthdate}>
                        <Input
                            type="date"
                            value={form.birthdate}
                            onChange={(event) => update('birthdate', event.target.value)}
                            required
                        />
                    </Field>

                    <Field label={copy.phone}>
                        <Input
                            type="tel"
                            value={form.phone}
                            onChange={(event) => update('phone', event.target.value)}
                            placeholder={copy.phonePlaceholder}
                            autoComplete="tel"
                            required
                        />
                    </Field>
                </div>

                <SectionTitle className="mt-6">{copy.accessSection}</SectionTitle>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label={copy.email}>
                        <Input
                            type="email"
                            value={form.email}
                            onChange={(event) => update('email', event.target.value)}
                            autoComplete="email"
                            required
                        />
                    </Field>

                    <Field label={copy.confirmEmail}>
                        <Input
                            type="email"
                            value={form.email_confirmation}
                            onChange={(event) => update('email_confirmation', event.target.value)}
                            autoComplete="email"
                            required
                        />
                    </Field>

                    <Field label={copy.password} hint={copy.passwordHint}>
                        <Input
                            type="password"
                            value={form.password}
                            onChange={(event) => update('password', event.target.value)}
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />
                    </Field>

                    <Field label={copy.confirmPassword}>
                        <Input
                            type="password"
                            value={form.password_confirmation}
                            onChange={(event) => update('password_confirmation', event.target.value)}
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />
                    </Field>
                </div>

                <label className="mt-5 flex items-start gap-2.5 text-xs text-slate-600">
                    <input
                        type="checkbox"
                        checked={form.newsletter_opt_in}
                        onChange={(event) => update('newsletter_opt_in', event.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#17894e] focus:ring-[#17894e]"
                    />
                    <span>{copy.newsletter}</span>
                </label>

                <p className="mt-3 text-[11px] leading-5 text-slate-500">{copy.legal}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{copy.roleNote}</p>

                {error && (
                    <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={pending}
                    className="mt-5 w-full rounded-lg bg-[#17894e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#117241] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {pending ? '...' : copy.registerButton}
                </button>
            </form>
        </div>
    );
}

function Field({ label, hint, children }) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
            {children}
            {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
        </label>
    );
}

function Input(props) {
    return (
        <input
            {...props}
            className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-[#17894e] focus:ring-2 focus:ring-[#17894e]/15 ${
                props.className || ''
            }`}
        />
    );
}

function Select({ children, ...props }) {
    return (
        <select
            {...props}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-[#17894e] focus:ring-2 focus:ring-[#17894e]/15"
        >
            {children}
        </select>
    );
}

function SectionTitle({ children, className = '' }) {
    return (
        <p
            className={`text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 ${className}`}
        >
            {children}
        </p>
    );
}

function Divider({ children }) {
    return (
        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-400">
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
            className={`flex w-full items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition ${
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
