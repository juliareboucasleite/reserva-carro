import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useData } from '../contexts/DataContext';
import {
    PageHeader,
    Button,
    Field,
    Input,
    Textarea,
    Select,
    Modal,
    Stat,
} from '../components/ui';
import { PlusIcon } from '../components/Icons';

export default function Maintenance() {
    const { t } = useI18n();
    const { maintenance, vehicles, addMaintenance } = useData();
    const [open, setOpen] = useState(false);

    const total = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
    const sorted = [...maintenance].sort((a, b) => (a.date < b.date ? 1 : -1));

    return (
        <div>
            <PageHeader
                kicker={t.nav.maintenance}
                title={t.maintenance.title}
                subtitle={t.maintenance.subtitle}
                action={
                    <Button variant="accent" onClick={() => setOpen(true)}>
                        <PlusIcon className="h-4 w-4" />
                        {t.maintenance.newRecord}
                    </Button>
                }
            />

            <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label={t.maintenance.totalCost} value={`${total.toLocaleString('pt-PT')} €`} />
                <Stat label={t.maintenance.empty} value={maintenance.length} />
            </div>

            {sorted.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">{t.maintenance.empty}</p>
            ) : (
                <div className="overflow-hidden rounded-md border border-border-soft">
                    <table className="min-w-full bg-surface text-sm">
                        <thead className="border-b border-border-soft bg-paper-2/60 text-left">
                            <tr>
                                <Th>{t.maintenance.date}</Th>
                                <Th>{t.maintenance.vehicle}</Th>
                                <Th>{t.maintenance.type}</Th>
                                <Th>{t.maintenance.downtimeDays}</Th>
                                <Th>{t.maintenance.notes}</Th>
                                <Th right>{t.maintenance.cost}</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((m, i) => {
                                const v = vehicles.find((x) => x.id === m.vehicleId);
                                return (
                                    <tr
                                        key={m.id}
                                        className={`${
                                            i !== sorted.length - 1
                                                ? 'border-b border-border-soft'
                                                : ''
                                        } hover:bg-paper-2/40`}
                                    >
                                        <td className="px-5 py-4 font-mono text-xs text-muted">
                                            {m.date}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-ink">{v?.name}</p>
                                            <p className="mt-0.5 font-mono text-xs text-muted">
                                                {v?.plate}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 text-ink">{m.type}</td>
                                        <td className="px-5 py-4 font-mono text-xs text-muted">
                                            {m.downtimeDays}
                                        </td>
                                        <td className="px-5 py-4 text-muted">{m.notes}</td>
                                        <td className="px-5 py-4 text-right font-mono text-xs font-medium text-ink">
                                            {m.cost.toLocaleString('pt-PT')} €
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <NewMaintenanceModal
                open={open}
                onClose={() => setOpen(false)}
                onCreate={(payload) => {
                    addMaintenance(payload);
                    setOpen(false);
                }}
            />
        </div>
    );
}

function Th({ children, right }) {
    return (
        <th
            className={`px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted ${
                right ? 'text-right' : ''
            }`}
        >
            {children}
        </th>
    );
}

function NewMaintenanceModal({ open, onClose, onCreate }) {
    const { t } = useI18n();
    const { vehicles } = useData();
    const [vehicleId, setVehicleId] = useState('');
    const [date, setDate] = useState('');
    const [type, setType] = useState('');
    const [downtimeDays, setDowntimeDays] = useState(0);
    const [notes, setNotes] = useState('');
    const [cost, setCost] = useState('');

    React.useEffect(() => {
        if (open) {
            setVehicleId('');
            setDate('');
            setType('');
            setDowntimeDays(0);
            setNotes('');
            setCost('');
        }
    }, [open]);

    const submit = (e) => {
        e.preventDefault();
        onCreate({
            vehicleId: Number(vehicleId),
            date,
            type,
            downtimeDays: Number(downtimeDays),
            notes,
            cost: Number(cost),
        });
    };

    return (
        <Modal open={open} onClose={onClose} title={t.maintenance.createTitle}>
            <form onSubmit={submit} className="space-y-5">
                <Field label={t.maintenance.vehicle}>
                    <Select
                        value={vehicleId}
                        onChange={(e) => setVehicleId(e.target.value)}
                        required
                    >
                        <option value="">—</option>
                        {vehicles.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.name} — {v.plate}
                            </option>
                        ))}
                    </Select>
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label={t.maintenance.date}>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </Field>
                    <Field label={t.maintenance.downtimeDays}>
                        <Input
                            type="number"
                            min="0"
                            value={downtimeDays}
                            onChange={(e) => setDowntimeDays(e.target.value)}
                        />
                    </Field>
                </div>
                <Field label={t.maintenance.type}>
                    <Input
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        placeholder={t.maintenance.typePlaceholder}
                        required
                    />
                </Field>
                <Field label={t.maintenance.notes}>
                    <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </Field>
                <Field label={t.maintenance.cost}>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        required
                    />
                </Field>
                <div className="flex justify-end gap-2 border-t border-border-soft pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t.common.cancel}
                    </Button>
                    <Button type="submit" variant="accent">
                        {t.common.create}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
