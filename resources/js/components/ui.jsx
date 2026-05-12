import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { CameraIcon, TrashIcon } from './Icons';
import { resolveExteriorSvg } from '../utils/vehicleExterior';

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

const SELECT_VALUE_TONES = {
    pending: 'text-amber-600',
    requested: 'text-amber-600',
    approved: 'text-emerald-600',
    confirmed: 'text-emerald-600',
    checked_out: 'text-blue-600',
    completed: 'text-blue-600',
    rejected: 'text-rose-600',
    cancelled: 'text-rose-600',
    canceled: 'text-rose-600',
    maintenance: 'text-slate-500',
};

export function Select({
    children,
    value,
    onChange,
    className = '',
    disabled = false,
    placeholder = 'Selecionar',
    toneMap = {},
    ...props
}) {
    const rootRef = useRef(null);
    const [open, setOpen] = useState(false);

    const options = React.Children.toArray(children)
        .filter(React.isValidElement)
        .map((child) => ({
            value: String(child.props.value ?? ''),
            label: child.props.children,
            disabled: Boolean(child.props.disabled),
        }));

    const normalizedValue = String(value ?? '');
    const selectedOption =
        options.find((option) => option.value === normalizedValue) ?? options[0] ?? null;
    const currentTone = toneMap[normalizedValue] || SELECT_VALUE_TONES[normalizedValue] || '';

    useEffect(() => {
        function handlePointerDown(event) {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    function emitChange(nextValue) {
        onChange?.({ target: { value: nextValue } });
        setOpen(false);
    }

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((current) => !current)}
                className={`flex min-h-[48px] w-full items-center justify-between rounded-md border border-border bg-paper px-3 py-2 text-left text-sm outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20 disabled:cursor-not-allowed disabled:opacity-50 ${
                    open ? 'border-sky-500 ring-2 ring-sky-100' : 'hover:border-ink/30'
                } ${className}`}
            >
                <span className={`truncate font-medium ${normalizedValue ? currentTone || 'text-ink' : 'text-muted-soft'}`}>
                    {selectedOption?.label || placeholder}
                </span>
                <svg
                    className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 0 1 1.1 1.02l-4.25 4.5a.75.75 0 0 1-1.1 0l-4.25-4.5a.75.75 0 0 1 .02-1.04Z" />
                </svg>
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-border bg-white shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
                    {options.map((option, index) => {
                        const tone =
                            toneMap[option.value] ||
                            SELECT_VALUE_TONES[option.value] ||
                            'text-ink';
                        const selected = option.value === normalizedValue;

                        return (
                            <button
                                key={`${option.value}-${index}`}
                                type="button"
                                disabled={option.disabled}
                                onClick={() => emitChange(option.value)}
                                className={`flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold transition ${
                                    selected
                                        ? 'bg-sky-50'
                                        : 'bg-white hover:bg-slate-50'
                                } ${tone} disabled:cursor-not-allowed disabled:opacity-40 ${
                                    index !== options.length - 1 ? 'border-b border-slate-100' : ''
                                }`}
                            >
                                <span className="truncate">{option.label}</span>
                                {selected && (
                                    <svg
                                        className="h-4 w-4 shrink-0 text-slate-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 0 1 1.1 1.02l-4.25 4.5a.75.75 0 0 1-1.1 0l-4.25-4.5a.75.75 0 0 1 .02-1.04Z" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            <select
                {...props}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
            >
                {children}
            </select>
        </div>
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
    available: 'bg-positive-soft text-positive',
    pre_reserved: 'bg-warn-soft text-warn',
    reserved: 'bg-warn-soft text-warn',
    in_use: 'bg-paper-3 text-ink',
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

const MAX_FILE_BYTES = 20 * 1024 * 1024;

export function MediaUpload({ value = [], onChange, disabled = false }) {
    const { t } = useI18n();
    const inputRef = useRef(null);

    function handleFiles(event) {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        const accepted = files.filter((file) => file.size <= MAX_FILE_BYTES);
        const items = accepted.map((file) => ({
            id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: file.name,
            type: file.type,
            previewUrl: URL.createObjectURL(file),
            file,
        }));

        onChange([...(value || []), ...items]);
        if (inputRef.current) inputRef.current.value = '';
    }

    function removeItem(id) {
        const target = (value || []).find((item) => item.id === id);
        if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
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
                                        src={item.previewUrl || item.dataUrl}
                                        className="h-full w-full object-cover"
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={item.previewUrl || item.dataUrl}
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

const ANGLE_KEYS = ['front', 'back', 'right', 'left'];

export function AngleUpload({
    value = {},
    onChange,
    disabled = false,
    accept = 'image/*',
    title,
    hint,
}) {
    const { t } = useI18n();

    function pickFile(angle, file) {
        if (!file) return;
        if (file.size > MAX_FILE_BYTES) return;

        const current = value[angle];
        if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);

        onChange({
            ...value,
            [angle]: {
                file,
                previewUrl: URL.createObjectURL(file),
                name: file.name,
                type: file.type,
            },
        });
    }

    function removeAngle(angle) {
        const current = value[angle];
        if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);
        const next = { ...value };
        delete next[angle];
        onChange(next);
    }

    return (
        <div>
            <p className="text-xs font-medium text-ink">{title || t.media.angles.title}</p>
            <p className="mt-1 text-[11px] text-muted">{hint || t.media.angles.hint}</p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ANGLE_KEYS.map((angle) => {
                    const entry = value[angle];
                    return (
                        <AngleSlot
                            key={angle}
                            label={t.media.angles[angle]}
                            replaceLabel={t.media.angles.replace}
                            removeLabel={t.media.remove}
                            entry={entry}
                            disabled={disabled}
                            accept={accept}
                            onPick={(file) => pickFile(angle, file)}
                            onRemove={() => removeAngle(angle)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function AngleSlot({
    label,
    replaceLabel,
    removeLabel,
    entry,
    disabled,
    accept,
    onPick,
    onRemove,
}) {
    const inputRef = useRef(null);

    return (
        <div>
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted">
                {label}
            </p>

            <div className="relative aspect-square overflow-hidden rounded-md border border-border-soft bg-paper-2">
                {entry ? (
                    <>
                        {entry.type?.startsWith('video') ? (
                            <video
                                src={entry.previewUrl}
                                className="h-full w-full object-cover"
                                muted
                                playsInline
                            />
                        ) : (
                            <img
                                src={entry.previewUrl}
                                alt={label}
                                className="h-full w-full object-cover"
                            />
                        )}
                        {!disabled && (
                            <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                                <button
                                    type="button"
                                    onClick={() => inputRef.current?.click()}
                                    className="rounded-md bg-paper/90 px-2 py-0.5 text-[10px] font-medium text-ink"
                                >
                                    {replaceLabel}
                                </button>
                                <button
                                    type="button"
                                    onClick={onRemove}
                                    className="rounded-md bg-danger/90 px-2 py-0.5 text-[10px] font-medium text-white"
                                >
                                    <TrashIcon className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={disabled}
                        className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted transition hover:bg-paper-3 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <CameraIcon className="h-5 w-5" />
                        <span className="text-[10px]">+</span>
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => onPick(e.target.files?.[0])}
                disabled={disabled}
            />
        </div>
    );
}

export function DamageCanvas({
    category = 'car',
    damages = [],
    selectedId = null,
    onAddPoint,
    onSelect,
    onRemove,
    readOnly = false,
}) {
    const containerRef = useRef(null);

    function handleClick(event) {
        if (readOnly || !onAddPoint) return;
        if (event.target.closest('[data-damage-dot]')) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        onAddPoint({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
    }

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            className={`relative mx-auto w-full max-w-[520px] overflow-hidden rounded-md border border-border-soft bg-paper-2 ${
                readOnly ? '' : 'cursor-crosshair'
            }`}
        >
            <img
                src={resolveExteriorSvg(category)}
                alt="Exterior"
                className="block h-auto w-full select-none"
                draggable={false}
            />
            {damages.map((d, index) => (
                <button
                    key={d.id || `tmp-${index}`}
                    data-damage-dot
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onSelect) onSelect(d);
                    }}
                    title={d.description || d.damage_type}
                    style={{ left: `${d.x * 100}%`, top: `${d.y * 100}%` }}
                    className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white transition ${
                        selectedId === d.id
                            ? 'h-7 w-7 border-white bg-sky-600 shadow-[0_0_0_3px_rgba(37,99,235,0.28)]'
                            : 'h-5 w-5 border-white bg-sky-500 hover:scale-110'
                    } ${d.cost !== null && d.cost !== undefined ? 'opacity-70' : ''}`}
                >
                    <span>{index + 1}</span>
                    <span className="sr-only">Dano {index + 1}</span>
                </button>
            ))}
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
                        className="relative block aspect-square"
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
                        {item.angle && t.media.angles?.[item.angle] && (
                            <span className="absolute left-1 top-1 rounded-sm bg-ink/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-paper">
                                {t.media.angles[item.angle]}
                            </span>
                        )}
                    </a>
                </li>
            ))}
        </ul>
    );
}

export function AvailabilityBadge({ vehicle }) {
    const { t } = useI18n();
    const availability = vehicle?.availability || 'available';

    const label = {
        available: t.vehicles.availabilityAvailable,
        pre_reserved: t.vehicles.availabilityPreReserved,
        reserved: t.vehicles.availabilityReserved,
        in_use: t.vehicles.availabilityInUse,
        inoperational: t.vehicles.availabilityInoperational,
    }[availability];

    return <Badge tone={availability}>{label}</Badge>;
}

export function isVehicleReservable(vehicle) {
    return vehicle?.availability === 'available';
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
