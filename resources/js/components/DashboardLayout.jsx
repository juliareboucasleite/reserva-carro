import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { useData, filterNotificationsFor } from '../contexts/DataContext';
import {
    DashboardIcon,
    CarIcon,
    CalendarIcon,
    WrenchIcon,
    UsersIcon,
    LogoutIcon,
    BellIcon,
    AlertIcon,
} from './Icons';

export default function DashboardLayout({ currentView, onNavigate, onGoToPublic, children }) {
    const { t, lang, setLang } = useI18n();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: t.nav.dashboard, icon: DashboardIcon, roles: 'all' },
        { id: 'vehicles', label: t.nav.vehicles, icon: CarIcon, roles: 'all' },
        { id: 'reservations', label: t.nav.reservations, icon: CalendarIcon, roles: 'all' },
        { id: 'damages', label: t.nav.damages, icon: AlertIcon, roles: 'all' },
        { id: 'maintenance', label: t.nav.maintenance, icon: WrenchIcon, roles: [ROLES.MANAGER, ROLES.ADMIN] },
        { id: 'admin', label: t.nav.admin, icon: UsersIcon, roles: [ROLES.ADMIN] },
    ];

    const visible = navItems.filter((n) => n.roles === 'all' || n.roles.includes(user.role));

    const roleLabel = {
        [ROLES.DRIVER]: t.auth.roleDriver,
        [ROLES.MANAGER]: t.auth.roleManager,
        [ROLES.ADMIN]: t.auth.roleAdmin,
    }[user.role];

    return (
        <div className="flex min-h-screen bg-paper-2 text-ink">
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-56 transform border-r border-border bg-paper transition-transform md:static md:translate-x-0 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-14 items-center border-b border-border px-5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-paper">
                        <CarIcon className="h-4 w-4" />
                    </span>
                </div>

                <nav className="px-2 py-4">
                    {visible.map((item) => {
                        const Icon = item.icon;
                        const active = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onNavigate(item.id);
                                    setMobileOpen(false);
                                }}
                                className={`mb-0.5 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
                                    active
                                        ? 'bg-paper-3 text-ink'
                                        : 'text-muted hover:bg-paper-2 hover:text-ink'
                                }`}
                            >
                                <Icon className={`h-[18px] w-[18px] ${active ? 'text-ink' : 'text-muted-soft'}`} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 border-t border-border px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                        {roleLabel}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium text-ink">{user.name}</p>
                </div>
            </aside>

            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-30 bg-ink/30 md:hidden"
                />
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-border bg-paper px-4 md:px-8">
                    <button
                        onClick={() => setMobileOpen((s) => !s)}
                        className="rounded-md p-2 text-ink hover:bg-paper-2 md:hidden"
                        aria-label="Menu"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M4 7h16M4 12h16M4 17h16" />
                        </svg>
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-4">
                        {onGoToPublic && (
                            <button
                                onClick={onGoToPublic}
                                className="hidden items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-paper-2 sm:flex"
                            >
                                Página inicial
                            </button>
                        )}

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

                        <NotificationsBell />

                        <button
                            onClick={logout}
                            title={t.auth.logout}
                            className="flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
                        >
                            <LogoutIcon className="h-[18px] w-[18px]" />
                            <span className="hidden sm:inline">{t.auth.logout}</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="mx-auto max-w-6xl">{children}</div>
                </main>
            </div>
        </div>
    );
}

function NotificationsBell() {
    const { t } = useI18n();
    const { user } = useAuth();
    const { notifications: allNotifications, markNotificationRead, markAllNotificationsRead } =
        useData();
    const notifications = filterNotificationsFor(allNotifications, user);
    const unreadCount = notifications.filter((n) => !n.read).length;
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function onClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) setOpen(false);
        }

        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((s) => !s)}
                title={t.notifications?.title || 'Notificações'}
                className="relative flex items-center text-muted transition hover:text-ink"
            >
                <BellIcon className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full z-30 mt-3 w-[340px] overflow-hidden rounded-md border border-border bg-paper shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
                    <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
                        <p className="text-sm font-semibold text-ink">
                            {t.notifications?.title || 'Notificações'}
                        </p>
                        {notifications.length > 0 && (
                            <button
                                onClick={markAllNotificationsRead}
                                className="text-xs text-muted hover:text-ink"
                            >
                                {t.notifications?.markAllRead || 'Marcar todas como lidas'}
                            </button>
                        )}
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="px-4 py-6 text-center text-xs text-muted">
                                {t.notifications?.empty || 'Sem notificações.'}
                            </p>
                        ) : (
                            <ul>
                                {notifications.map((n) => (
                                    <li key={n.id}>
                                        <button
                                            onClick={() => markNotificationRead(n.id)}
                                            className={`flex w-full items-start gap-3 border-b border-border-soft px-4 py-3 text-left text-xs transition hover:bg-paper-2/60 ${
                                                n.read ? 'text-muted' : 'text-ink'
                                            }`}
                                        >
                                            <span
                                                className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                                                    n.read ? 'bg-border' : 'bg-danger'
                                                }`}
                                            />
                                            <span className="flex-1 leading-relaxed">
                                                {n.message}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
