import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { useData, RES_STATUS } from '../contexts/DataContext';
import { PageHeader, Card, Stat, Badge } from '../components/ui';
import { AlertIcon } from '../components/Icons';

function daysUntil(dateStr) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    return Math.round((target - now) / 86400000);
}

export default function Dashboard() {
    const { t } = useI18n();
    const { user } = useAuth();
    const { vehicles, reservations } = useData();

    const operational = vehicles.filter((v) => v.operational).length;
    const pending = reservations.filter((r) => r.status === RES_STATUS.PENDING).length;
    const active = reservations.filter(
        (r) => r.status === RES_STATUS.APPROVED || r.status === RES_STATUS.CHECKED_IN
    ).length;

    const alerts = [];
    vehicles.forEach((v) => {
        const dInsp = daysUntil(v.nextInspection);
        const dIns = daysUntil(v.insuranceRenewal);
        if (dInsp <= 30 && dInsp >= 0) {
            alerts.push({
                type: 'inspection',
                vehicle: v,
                days: dInsp,
                label: t.alerts.inspectionSoon.replace('{n}', dInsp),
            });
        }
        if (dIns <= 30 && dIns >= 0) {
            alerts.push({
                type: 'insurance',
                vehicle: v,
                days: dIns,
                label: t.alerts.insuranceSoon.replace('{n}', dIns),
            });
        }
    });
    alerts.sort((a, b) => a.days - b.days);

    return (
        <div>
            <PageHeader
                kicker={t.dashboard.title}
                title={`${t.dashboard.welcome}, ${user.name.split(' ')[0]}.`}
            />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label={t.dashboard.statsVehicles} value={vehicles.length} />
                <Stat
                    label={t.dashboard.statsOperational}
                    value={`${operational}/${vehicles.length}`}
                    tone="good"
                />
                <Stat
                    label={t.dashboard.statsPending}
                    value={pending}
                    tone={pending > 0 ? 'warn' : 'default'}
                />
                <Stat label={t.dashboard.statsActive} value={active} />
            </div>

            <div className="mt-16">
                <div className="mb-5 flex items-end justify-between border-b border-border-soft pb-3">
                    <h2 className="text-base font-bold tracking-tight text-ink">
                        {t.dashboard.upcomingAlerts}
                    </h2>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                        30 / 15 / 5
                    </span>
                </div>

                {alerts.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted">{t.dashboard.noAlerts}</p>
                ) : (
                    <ul>
                        {alerts.slice(0, 8).map((a, i) => (
                            <li
                                key={i}
                                className="flex items-center justify-between border-b border-border-soft py-4"
                            >
                                <div className="flex items-center gap-4">
                                    <AlertIcon
                                        className={`h-5 w-5 ${
                                            a.days <= 5
                                                ? 'text-danger'
                                                : a.days <= 15
                                                ? 'text-warn'
                                                : 'text-accent'
                                        }`}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-ink">
                                            {a.vehicle.name}{' '}
                                            <span className="font-mono text-xs text-muted">
                                                · {a.vehicle.plate}
                                            </span>
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted">{a.label}</p>
                                    </div>
                                </div>
                                <span
                                    className={`font-mono text-xs ${
                                        a.days <= 5
                                            ? 'text-danger'
                                            : a.days <= 15
                                            ? 'text-warn'
                                            : 'text-muted'
                                    }`}
                                >
                                    {a.days} {t.dashboard.daysLeft}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
