import React from 'react';
import { useI18n } from '../i18n/I18nContext';

export function PageHeader({ title, subtitle, kicker, action }) {
    return (
        <div className="mb-8 flex flex-col items-start justify-between gap-3 border-b border-border-soft pb-5 md:flex-row md:items-end">
            <div>
                {kicker && (
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                        {kicker}
                    </p>
                )}
                <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">{title}</h1>
                {subtitle && <p className="mt-1.5 max-w-xl text-sm text-muted">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

export function Card({ children, className = '', flush = false }) {
    return (
        <div
            className={`rounded-md border border-border bg-surface ${flush ? '' : 'p-5'} ${className}`}
        >
            {children}
        </div>
    );
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
    const variants = {
        primary: 'bg-ink text-paper hover:bg-ink-soft',
        accent: 'bg-ink text-paper hover:bg-ink-soft',
        secondary: 'bg-paper text-ink border border-border hover:bg-paper-2',
        danger: 'bg-danger text-paper hover:opacity-90',
        success: 'bg-positive text-paper hover:opacity-90',
        ghost: 'text-muted hover:bg-paper-2 hover:text-ink',
        link: 'text-ink underline-offset-4 hover:underline',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-3.5 py-2 text-sm',
        lg: 'px-5 py-2.5 text-sm',
    };
    return (
        <button
            {...props}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
}

export function Field({ label, children, hint }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                {label}
            </span>
            {children}
            {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
        </label>
    );
}

const fieldBase =
    'w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted-soft outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20';

export function Input(props) {
    return <input {...props} className={`${fieldBase} ${props.className || ''}`} />;
}

export function Textarea(props) {
    return <textarea {...props} className={`${fieldBase} ${props.className || ''}`} />;
}

export function Select({ children, ...props }) {
    return (
        <select {...props} className={`${fieldBase} ${props.className || ''}`}>
            {children}
        </select>
    );
}

const BADGE_TONES = {
    pending: 'bg-warn-soft text-warn',
    approved: 'bg-positive-soft text-positive',
    rejected: 'bg-danger-soft text-danger',
    checked_in: 'bg-paper-3 text-ink',
    checked_out: 'bg-paper-3 text-muted',
    operational: 'bg-positive-soft text-positive',
    inoperational: 'bg-danger-soft text-danger',
    neutral: 'bg-paper-3 text-muted',
};

export function daysUntil(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    if (Number.isNaN(target.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
}

export function DueDate({ value }) {
    const { t } = useI18n();
    const days = daysUntil(value);

    if (!value || days === null) {
        return <span className="font-mono text-xs text-muted">—</span>;
    }

    let tone = null;
    let label = null;

    if (days < 0) {
        tone = 'inoperational';
        label = t.vehicles.dueOverdue;
    } else if (days === 0) {
        tone = 'inoperational';
        label = t.vehicles.dueToday;
    } else if (days <= 5) {
        tone = 'inoperational';
        label =
            days === 1
                ? t.vehicles.dueInDaysOne
                : t.vehicles.dueInDays.replace('{n}', days);
    } else if (days <= 15) {
        tone = 'pending';
        label = t.vehicles.dueInDays.replace('{n}', days);
    } else if (days <= 30) {
        tone = 'neutral';
        label = t.vehicles.dueInDays.replace('{n}', days);
    }

    return (
        <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-ink">{value}</span>
            {tone && <Badge tone={tone}>{label}</Badge>}
        </span>
    );
}

export function Badge({ tone = 'neutral', children }) {
    return (
        <span
            className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                BADGE_TONES[tone] || BADGE_TONES.neutral
            }`}
        >
            {children}
        </span>
    );
}

export function Stat({ label, value, hint, tone = 'default' }) {
    const tones = {
        default: 'text-ink',
        good: 'text-positive',
        warn: 'text-warn',
        bad: 'text-danger',
    };
    return (
        <div className="rounded-md border border-border bg-paper p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${tones[tone]}`}>{value}</p>
            {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
    );
}

export function Modal({ open, onClose, title, kicker, children, maxWidth = 'max-w-lg' }) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full ${maxWidth} overflow-hidden rounded-md border border-border bg-paper shadow-xl`}
            >
                <div className="flex items-start justify-between border-b border-border-soft px-6 py-4">
                    <div>
                        {kicker && (
                            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                                {kicker}
                            </p>
                        )}
                        <h3 className="text-base font-bold text-ink">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-sm p-1 text-muted hover:bg-paper-2 hover:text-ink"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}
