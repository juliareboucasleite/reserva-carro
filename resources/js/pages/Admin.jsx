import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { PageHeader } from '../components/ui';

export default function Admin() {
    const { t } = useI18n();

    return (
        <div>
            <PageHeader
                kicker={t.nav.admin}
                title={t.admin.title}
                subtitle={t.admin.subtitle}
            />

            <div className="grid divide-y divide-border-soft md:grid-cols-3 md:divide-x md:divide-y-0 md:border md:border-border-soft md:rounded-md md:overflow-hidden">
                <Item title={t.admin.users} />
                <Item title={t.admin.teams} />
                <Item title={t.admin.settings} />
            </div>
        </div>
    );
}

function Item({ title }) {
    const { t } = useI18n();
    return (
        <div className="bg-surface p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">—</p>
            <h3 className="mt-3 text-lg font-bold tracking-tight text-ink">
                {title}
            </h3>
            <p className="mt-2 text-sm text-muted">{t.admin.placeholder}</p>
        </div>
    );
}
