import React, { useRef } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { CameraIcon, TrashIcon } from './Icons';

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

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const MAX_FILE_BYTES = 20 * 1024 * 1024;

export function MediaUpload({ value = [], onChange, disabled = false }) {
    const { t } = useI18n();
    const inputRef = useRef(null);

    async function handleFiles(event) {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        const accepted = files.filter((file) => file.size <= MAX_FILE_BYTES);
        const items = await Promise.all(
            accepted.map(async (file) => ({
                id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                name: file.name,
                type: file.type,
                dataUrl: await readFileAsDataUrl(file),
                createdAt: Date.now(),
            }))
        );

        onChange([...(value || []), ...items]);
        if (inputRef.current) inputRef.current.value = '';
    }

    function removeItem(id) {
        onChange((value || []).filter((item) => item.id !== id));
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-ink">{t.media.title}</p>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-paper px-2.5 py-1.5 text-xs font-medium text-ink transition hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <CameraIcon className="h-3.5 w-3.5" />
                    {t.media.add}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={handleFiles}
                    disabled={disabled}
                />
            </div>

            <p className="mt-1 text-[11px] text-muted">{t.media.hint}</p>

            {value && value.length > 0 ? (
                <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {value.map((item) => (
                        <li
                            key={item.id}
                            className="group relative overflow-hidden rounded-md border border-border-soft bg-paper-2"
                        >
                            <div className="aspect-square">
                                {item.type?.startsWith('video') ? (
                                    <video
                                        src={item.dataUrl}
                                        className="h-full w-full object-cover"
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={item.dataUrl}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </div>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => removeItem(item.id)}
                                    title={t.media.remove}
                                    className="absolute right-1 top-1 rounded-md bg-ink/80 p-1 text-paper opacity-0 transition group-hover:opacity-100"
                                >
                                    <TrashIcon className="h-3 w-3" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-3 rounded-md border border-dashed border-border bg-paper-2/50 px-3 py-4 text-center text-[11px] text-muted">
                    {t.media.empty}
                </p>
            )}
        </div>
    );
}

export function MediaGallery({ items = [] }) {
    const { t } = useI18n();

    if (!items || items.length === 0) {
        return <p className="text-[11px] text-muted">{t.media.empty}</p>;
    }

    return (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {items.map((item) => (
                <li
                    key={item.id}
                    className="overflow-hidden rounded-md border border-border-soft bg-paper-2"
                >
                    <a
                        href={item.dataUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block aspect-square"
                    >
                        {item.type?.startsWith('video') ? (
                            <video
                                src={item.dataUrl}
                                className="h-full w-full object-cover"
                                muted
                                playsInline
                            />
                        ) : (
                            <img
                                src={item.dataUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                            />
                        )}
                    </a>
                </li>
            ))}
        </ul>
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
