import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { PageHeader, Badge, Button, DamageCanvas, Field, Input, Textarea } from '../components/ui';

export default function Damages() {
    const { t } = useI18n();
    const { user } = useAuth();
    const { damages, setDamageCost } = useData();
    const [savingId, setSavingId] = useState(null);

    const isManager = user.role === ROLES.MANAGER || user.role === ROLES.ADMIN;

    const visibleDamages = [...damages]
        .filter((damage) => isManager || damage.reservation?.requestedByName === user.name)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return (
        <div>
            <PageHeader
                kicker={t.nav.damages}
                title={t.damages.pageTitle}
                subtitle={isManager ? t.damages.pageSubtitleManager : t.damages.pageSubtitleDriver}
            />

            {visibleDamages.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">{t.damages.noItems}</p>
            ) : (
                <div className="space-y-5">
                    {visibleDamages.map((damage) => (
                        <DamageCard
                            key={damage.id}
                            damage={damage}
                            isManager={isManager}
                            saving={savingId === damage.id}
                            onSave={async (payload) => {
                                setSavingId(damage.id);
                                try {
                                    await setDamageCost(damage.id, payload);
                                } finally {
                                    setSavingId(null);
                                }
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function DamageCard({ damage, isManager, saving, onSave }) {
    const { t } = useI18n();
    const [cost, setCost] = useState(damage.cost ?? '');
    const [responseMessage, setResponseMessage] = useState(damage.responseMessage || '');

    const vehicle = damage.reservation?.vehicle;
    const requesterName = damage.reservation?.requestedByName || '—';

    return (
        <article className="rounded-md border border-border bg-surface p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={damage.cost !== null ? 'approved' : 'pending'}>
                            {damage.cost !== null ? t.damages.costReviewed : t.damages.costPending}
                        </Badge>
                        <span className="text-xs text-muted">
                            {damage.createdAt ? new Date(damage.createdAt).toLocaleString('pt-PT') : ''}
                        </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-ink">
                        {vehicle ? `${vehicle.name} · ${vehicle.plate}` : t.damages.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                        <span>{t.damages.reportedBy}: {requesterName}</span>
                        <span>{t.damages.type}: {t.damages.types[damage.damageType]}</span>
                        <span>{t.damages.severity}: {t.damages.severities[damage.severity]}</span>
                    </div>
                    {damage.description && (
                        <p className="mt-3 max-w-2xl text-sm text-ink">{damage.description}</p>
                    )}
                </div>

                {damage.cost !== null && (
                    <div className="rounded-md border border-border-soft bg-paper-2 px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-wider text-muted">{t.damages.costTitle}</p>
                        <p className="mt-1 text-2xl font-bold text-ink">
                            {Number(damage.cost).toLocaleString('pt-PT', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })} €
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
                <div className="space-y-4">
                    <DamageCanvas
                        category={vehicle?.category || 'car'}
                        damages={[
                            {
                                id: damage.id,
                                x: damage.x,
                                y: damage.y,
                                description: damage.description,
                                damage_type: damage.damageType,
                                cost: damage.cost,
                            },
                        ]}
                        selectedId={damage.id}
                        readOnly
                    />

                    {damage.photoUrl && (
                        <div className="overflow-hidden rounded-md border border-border-soft bg-paper-2">
                            <img
                                src={damage.photoUrl}
                                alt={t.damages.photo}
                                className="h-48 w-full object-cover"
                            />
                        </div>
                    )}
                </div>

                <div className="rounded-md border border-border-soft bg-paper p-4">
                    {isManager ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                onSave({
                                    cost: Number(cost || 0),
                                    responseMessage,
                                });
                            }}
                            className="space-y-4"
                        >
                            <Field label={t.damages.costAmount}>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    required
                                />
                            </Field>

                            <Field label={t.damages.costResponse}>
                                <Textarea
                                    rows={4}
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                />
                            </Field>

                            <div className="flex justify-end">
                                <Button type="submit" variant="accent" disabled={saving}>
                                    {saving ? t.common.loading : t.damages.setCost}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-muted">
                                {damage.cost !== null
                                    ? t.damages.costSet.replace(
                                          '{value}',
                                          Number(damage.cost).toLocaleString('pt-PT', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                          })
                                      )
                                    : t.damages.costPending}
                            </p>
                            {damage.responseMessage && (
                                <div className="rounded-md border border-border-soft bg-paper-2 px-3 py-3 text-sm text-ink">
                                    {damage.responseMessage}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
