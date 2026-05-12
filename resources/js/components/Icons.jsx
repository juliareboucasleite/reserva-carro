import React from 'react';

const base = 'h-5 w-5';
const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

export function DashboardIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
    );
}

export function CarIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5" />
            <path d="M3 13h18v5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
            <circle cx="7" cy="16" r="1" />
            <circle cx="17" cy="16" r="1" />
        </svg>
    );
}

export function CalendarIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 9h18M8 3v4M16 3v4" />
        </svg>
    );
}

export function WrenchIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z" />
        </svg>
    );
}

export function UsersIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M2 20v-1.5A4.5 4.5 0 0 1 6.5 14h5A4.5 4.5 0 0 1 16 18.5V20" />
            <path d="M22 20v-1a3.5 3.5 0 0 0-3.5-3.5H17" />
        </svg>
    );
}

export function LogoutIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5M21 12H9" />
        </svg>
    );
}

export function AlertIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.3 3.86a2 2 0 0 1 3.4 0l8.5 14.71A2 2 0 0 1 20.5 21H3.5a2 2 0 0 1-1.7-2.43z" />
        </svg>
    );
}

export function CheckIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <path d="M20 6L9 17l-5-5" />
        </svg>
    );
}

export function XIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    );
}

export function PlusIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}

export function SeatIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <path d="M6 19v-7a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v7" />
            <path d="M4 19h16" />
        </svg>
    );
}

export function GaugeIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <path d="M12 14l3-3" />
            <path d="M21 12a9 9 0 1 0-17.7 2" />
            <circle cx="12" cy="14" r="1" />
        </svg>
    );
}

export function ShieldIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <path d="M12 3l8 3v6c0 4.5-3.5 8.5-8 9-4.5-.5-8-4.5-8-9V6z" />
        </svg>
    );
}

export function PhoneIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
    );
}

export function PinIcon({ className = base }) {
    return (
        <svg className={className} viewBox="0 0 24 24" {...stroke}>
            <path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z" />
            <circle cx="12" cy="9" r="2.5" />
        </svg>
    );
}

const artStroke = {
    fill: 'none',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

function VanArt({ className = '' }) {
    return (
        <svg viewBox="0 0 200 110" className={className}>
            <g stroke="currentColor" {...artStroke}>
                <path d="M18 80 L18 50 Q18 42 26 42 L96 42 L122 30 L160 30 Q180 30 188 50 L188 80" />
                <path d="M18 80 L188 80" />
                <path d="M96 42 L96 80" />
                <path d="M122 30 L122 80" />
                <path d="M30 50 L88 50 L88 70 L30 70 Z" strokeWidth="1" />
                <path d="M104 50 L114 50 L114 65 L104 65 Z" strokeWidth="1" />
                <path d="M130 50 L172 50 L172 65 L130 65 Z" strokeWidth="1" />
                <circle cx="50" cy="86" r="9" />
                <circle cx="50" cy="86" r="3" strokeWidth="1" />
                <circle cx="158" cy="86" r="9" />
                <circle cx="158" cy="86" r="3" strokeWidth="1" />
            </g>
        </svg>
    );
}

function BusArt({ className = '' }) {
    return (
        <svg viewBox="0 0 200 110" className={className}>
            <g stroke="currentColor" {...artStroke}>
                <path d="M10 80 L10 38 Q10 28 22 28 L180 28 Q190 28 190 38 L190 80" />
                <path d="M10 80 L190 80" />
                <path d="M10 50 L190 50" strokeWidth="1" />
                {[30, 56, 82, 108, 134, 160].map((x) => (
                    <rect key={x} x={x} y="36" width="20" height="12" strokeWidth="1" />
                ))}
                <rect x="14" y="56" width="172" height="18" strokeWidth="1" />
                <circle cx="40" cy="86" r="9" />
                <circle cx="40" cy="86" r="3" strokeWidth="1" />
                <circle cx="160" cy="86" r="9" />
                <circle cx="160" cy="86" r="3" strokeWidth="1" />
            </g>
        </svg>
    );
}

function CarArt({ className = '' }) {
    return (
        <svg viewBox="0 0 200 110" className={className}>
            <g stroke="currentColor" {...artStroke}>
                <path d="M14 80 L14 70 Q14 60 26 56 L60 44 Q80 36 104 36 L132 36 Q156 36 174 54 L186 64 Q190 66 190 72 L190 80" />
                <path d="M14 80 L190 80" />
                <path d="M64 52 L100 44 L100 60 L64 60 Z" strokeWidth="1" />
                <path d="M108 44 L150 52 L150 60 L108 60 Z" strokeWidth="1" />
                <path d="M100 44 L108 44 L108 60 L100 60 Z" strokeWidth="1" />
                <circle cx="56" cy="86" r="9" />
                <circle cx="56" cy="86" r="3" strokeWidth="1" />
                <circle cx="154" cy="86" r="9" />
                <circle cx="154" cy="86" r="3" strokeWidth="1" />
            </g>
        </svg>
    );
}

export function VehicleArt({ category = 'car', className = '' }) {
    if (category === 'bus') return <BusArt className={className} />;
    if (category === 'van') return <VanArt className={className} />;
    return <CarArt className={className} />;
}
