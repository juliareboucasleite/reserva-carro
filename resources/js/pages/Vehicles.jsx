import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
    PageHeader,
    Button,
    Badge,
    DueDate,
    MediaGallery,
    Field,
    Input,
    Modal,
    Select,
    AvailabilityBadge,
    isVehicleReservable,
} from '../components/ui';
import VehicleMedia from '../components/VehicleMedia';
import { PlusIcon } from '../components/Icons';

export default function Vehicles({ onOpenVehicle, onRequestReservation }) {
    const { t } = useI18n();
    const { user } = useAuth();
    const { vehicles, addVehicle, updateVehicle } = useData();
    const [editing, setEditing] = useState(null);

    const canManage = user.role === ROLES.MANAGER || user.role === ROLES.ADMIN;

    return (
        <div>
            <PageHeader
                kicker={t.nav.vehicles}
                title={t.vehicles.title}
                subtitle={t.vehicles.subtitle}
                action={
                    canManage && (
                        <Button variant="accent" onClick={() => setEditing({})}>
                            <PlusIcon className="h-4 w-4" />
                            {t.vehicles.newVehicle}
                        </Button>
                    )
                }
            />

            <div className="overflow-hidden rounded-md border border-border-soft">
                <table className="min-w-full bg-surface text-sm">
                    <thead className="border-b border-border-soft bg-paper-2/60 text-left">
                        <tr>
                            <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                                {t.reservations.vehicle}
                            </th>
                            <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                                {t.vehicles.plate}
                            </th>
                            <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                                {t.vehicles.seats}
                            </th>
                            <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                                {t.vehicles.km}
                            </th>
                            <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                                {t.vehicles.nextInspection}
                            </th>
                            <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                                {t.vehicles.operational}
                            </th>
                            <th className="px-5 py-3 text-right font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                                {t.common.actions}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map((v, i) => (
                            <tr
                                key={v.id}
                                className={`${
                                    i !== vehicles.length - 1 ? 'border-b border-border-soft' : ''
                                } hover:bg-paper-2/40`}
                            >
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-16 overflow-hidden rounded-md bg-paper-2">
                                            <VehicleMedia
                                                vehicle={v}
                                                imageClassName="h-full w-full object-cover"
                                                className="h-full w-full"
                                            />
                                        </div>
                                        <span className="font-medium text-ink">{v.name}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 font-mono text-xs text-ink">{v.plate}</td>
                                <td className="px-5 py-4 text-muted">{v.seats}</td>
                                <td className="px-5 py-4 font-mono text-xs text-muted">
                                    {v.currentKm.toLocaleString('pt-PT')}
                                </td>
                                <td className="px-5 py-4">
                                    <DueDate value={v.nextInspection} />
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex flex-col gap-1">
                                        <AvailabilityBadge vehicle={v} />
                                        {v.activeReservation && (
                                            <span className="text-[10px] text-muted">
                                                {[v.activeReservation.requesterName, v.activeReservation.date]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <div className="inline-flex gap-2">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() => onOpenVehicle(v.id)}
                                        >
                                            {t.common.details}
                                        </Button>
                                        {canManage && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setEditing(v)}
                                            >
                                                {t.common.edit}
                                            </Button>
                                        )}
                                        {isVehicleReservable(v) && (
                                            <Button
                                                variant="accent"
                                                size="sm"
                                                onClick={() => onRequestReservation(v.id)}
                                            >
                                                {t.reservations.newReservation}
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <VehicleFormModal
                vehicle={editing}
                onClose={() => setEditing(null)}
                onSave={(payload) => {
                    if (editing && editing.id) {
                        updateVehicle(editing.id, payload);
                    } else {
                        addVehicle(payload);
                    }
                    setEditing(null);
                }}
            />
        </div>
    );
}

export function VehicleDetail({ vehicleId, onBack, onRequestReservation }) {
    const { t } = useI18n();
    const { user } = useAuth();
    const {
        getVehicle,
        getMaintenanceFor,
        reservations,
        setVehicleOperational,
        updateVehicle,
    } = useData();
    const v = getVehicle(vehicleId);
    const [editing, setEditing] = useState(false);

    if (!v) {
        return (
            <div>
                <button onClick={onBack} className="text-sm text-muted hover:text-ink">
                    ← {t.common.back}
                </button>
            </div>
        );
    }

    const records = getMaintenanceFor(vehicleId);
    const vehicleReservations = reservations.filter((r) => r.vehicleId === vehicleId);
    const canManage = user.role === ROLES.MANAGER || user.role === ROLES.ADMIN;

    return (
        <div>
            <button
                onClick={onBack}
                className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink"
            >
                ← {t.common.back}
            </button>

            <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-border-soft pb-8 md:flex-row md:items-end">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                        {v.plate}
                    </p>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">
                        {v.name}
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <AvailabilityBadge vehicle={v} />
                        {v.activeReservation && (
                            <span className="text-xs text-muted">
                                {[v.activeReservation.requesterName, v.activeReservation.date]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {canManage && (
                        <>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setEditing(true)}
                            >
                                {t.common.edit}
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setVehicleOperational(v.id, !v.operational)}
                            >
                                {v.operational
                                    ? t.vehicles.markInoperational
                                    : t.vehicles.markOperational}
                            </Button>
                        </>
                    )}
                    {isVehicleReservable(v) && (
                        <Button variant="accent" size="sm" onClick={() => onRequestReservation(v.id)}>
                            {t.vehicles.requestThis}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-7">
                    <div className="mb-6 overflow-hidden rounded-lg border border-border-soft bg-paper-2">
                        <div className="aspect-[16/9]">
                            <VehicleMedia
                                vehicle={v}
                                imageClassName="h-full w-full object-cover"
                                className="h-full w-full"
                            />
                        </div>
                    </div>
                    <h2 className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                        {t.vehicles.characteristics}
                    </h2>
                    <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border-soft pt-6">
                        <Row label={t.vehicles.plate} value={v.plate} mono />
                        <Row label={t.vehicles.seats} value={v.seats} />
                        <Row label={t.vehicles.km} value={`${v.currentKm.toLocaleString('pt-PT')}`} mono />
                        <Row
                            label={t.vehicles.operational}
                            value={v.operational ? t.common.yes : t.common.no}
                        />
                        <Row
                            label={t.vehicles.nextInspection}
                            value={<DueDate value={v.nextInspection} />}
                        />
                    </dl>
                </div>

                <div className="lg:col-span-5">
                    <h2 className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                        {t.vehicles.insurance}
                    </h2>
                    <dl className="space-y-6 border-t border-border-soft pt-6">
                        <Row label={t.vehicles.insuranceCompany} value={v.insuranceCompany} />
                        <Row label={t.vehicles.insuranceType} value={v.insuranceType} />
                        <Row
                            label={t.vehicles.insuranceRenewal}
                            value={<DueDate value={v.insuranceRenewal} />}
                        />
                    </dl>
                </div>
            </div>

            <div className="mt-16">
                <h2 className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    {t.vehicles.maintenanceHistory}
                </h2>
                {records.length === 0 ? (
                    <p className="border-t border-border-soft pt-6 text-sm text-muted">
                        {t.vehicles.noMaintenance}
                    </p>
                ) : (
                    <table className="min-w-full border-t border-border-soft text-sm">
                        <thead className="text-left">
                            <tr className="border-b border-border-soft">
                                <th className="py-3 pr-4 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                                    {t.maintenance.date}
                                </th>
                                <th className="py-3 pr-4 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                                    {t.maintenance.type}
                                </th>
                                <th className="py-3 pr-4 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                                    {t.maintenance.downtimeDays}
                                </th>
                                <th className="py-3 pr-4 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                                    {t.maintenance.notes}
                                </th>
                                <th className="py-3 text-right font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                                    {t.maintenance.cost}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((m, idx) => (
                                <tr
                                    key={m.id}
                                    className={
                                        idx !== records.length - 1
                                            ? 'border-b border-border-soft'
                                            : ''
                                    }
                                >
                                    <td className="py-3 pr-4 font-mono text-xs text-muted">{m.date}</td>
                                    <td className="py-3 pr-4 text-ink">{m.type}</td>
                                    <td className="py-3 pr-4 font-mono text-xs text-muted">
                                        {m.downtimeDays}
                                    </td>
                                    <td className="py-3 pr-4 text-muted">{m.notes}</td>
                                    <td className="py-3 text-right font-mono text-xs font-medium text-ink">
                                        {m.cost.toLocaleString('pt-PT')} €
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <VehicleFormModal
                vehicle={editing ? v : null}
                onClose={() => setEditing(false)}
                onSave={(payload) => {
                    updateVehicle(v.id, payload);
                    setEditing(false);
                }}
            />

            <div className="mt-16">
                <h2 className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    {t.vehicles.reservationsHistory}
                </h2>
                {vehicleReservations.length === 0 ? (
                    <p className="border-t border-border-soft pt-6 text-sm text-muted">
                        {t.vehicles.noReservations}
                    </p>
                ) : (
                    <ul className="border-t border-border-soft">
                        {vehicleReservations.map((r) => {
                            const hasMedia =
                                (r.startMedia?.length || 0) + (r.endMedia?.length || 0) > 0;
                            return (
                                <li
                                    key={r.id}
                                    className="border-b border-border-soft py-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-ink">{r.trip}</p>
                                            <p className="mt-0.5 font-mono text-xs text-muted">
                                                {r.date} · {r.requestedByName}
                                            </p>
                                        </div>
                                        <Badge tone={r.status}>
                                            {t.reservations[
                                                'status' +
                                                    r.status
                                                        .replace(/_./g, (m) =>
                                                            m[1].toUpperCase()
                                                        )
                                                        .replace(/^./, (m) => m.toUpperCase())
                                            ] || r.status}
                                        </Badge>
                                    </div>
                                    {hasMedia && (
                                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                                            {r.startMedia?.length > 0 && (
                                                <div>
                                                    <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                                                        {t.reservations.startMediaLabel}
                                                    </p>
                                                    <MediaGallery items={r.startMedia} />
                                                </div>
                                            )}
                                            {r.endMedia?.length > 0 && (
                                                <div>
                                                    <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                                                        {t.reservations.endMediaLabel}
                                                    </p>
                                                    <MediaGallery items={r.endMedia} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

const CATEGORY_OPTIONS = ['van', 'car', 'bus'];

const EMPTY_VEHICLE = {
    brand: '',
    model: '',
    category: 'van',
    plate: '',
    seats: 5,
    currentKm: 0,
    operational: true,
    nextInspection: '',
    insuranceCompany: '',
    insuranceType: '',
    insuranceRenewal: '',
    responsible: '',
    phone: '',
    base: '',
};

function VehicleFormModal({ vehicle, onClose, onSave }) {
    const { t } = useI18n();
    const isEditing = !!(vehicle && vehicle.id);
    const [form, setForm] = useState(EMPTY_VEHICLE);

    React.useEffect(() => {
        if (vehicle) {
            setForm({ ...EMPTY_VEHICLE, ...vehicle });
        }
    }, [vehicle]);

    if (!vehicle) return null;

    const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const submit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            seats: Number(form.seats) || 0,
            currentKm: Number(form.currentKm) || 0,
        });
    };

    return (
        <Modal
            open={true}
            onClose={onClose}
            title={isEditing ? t.common.edit : t.vehicles.newVehicle}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t.vehicles.brand || 'Marca'}>
                        <Input
                            value={form.brand}
                            onChange={(e) => update('brand', e.target.value)}
                            required
                        />
                    </Field>
                    <Field label={t.vehicles.model || 'Modelo'}>
                        <Input
                            value={form.model}
                            onChange={(e) => update('model', e.target.value)}
                            required
                        />
                    </Field>
                    <Field label={t.vehicles.plate}>
                        <Input
                            value={form.plate}
                            onChange={(e) => update('plate', e.target.value)}
                            required
                        />
                    </Field>
                    <Field label={t.vehicles.category || 'Categoria'}>
                        <Select
                            value={form.category}
                            onChange={(e) => update('category', e.target.value)}
                        >
                            {CATEGORY_OPTIONS.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field label={t.vehicles.seats}>
                        <Input
                            type="number"
                            min="0"
                            value={form.seats}
                            onChange={(e) => update('seats', e.target.value)}
                            required
                        />
                    </Field>
                    <Field label={t.vehicles.km}>
                        <Input
                            type="number"
                            min="0"
                            value={form.currentKm}
                            onChange={(e) => update('currentKm', e.target.value)}
                            required
                        />
                    </Field>
                    <Field label={t.vehicles.base || 'Base'}>
                        <Input
                            value={form.base}
                            onChange={(e) => update('base', e.target.value)}
                        />
                    </Field>
                    <Field label={t.vehicles.responsible || 'Responsável'}>
                        <Input
                            value={form.responsible}
                            onChange={(e) => update('responsible', e.target.value)}
                        />
                    </Field>
                    <Field label={t.vehicles.phone || 'Telefone'}>
                        <Input
                            value={form.phone}
                            onChange={(e) => update('phone', e.target.value)}
                        />
                    </Field>
                    <Field label={t.vehicles.nextInspection}>
                        <Input
                            type="date"
                            value={form.nextInspection || ''}
                            onChange={(e) => update('nextInspection', e.target.value)}
                        />
                    </Field>
                    <Field label={t.vehicles.insuranceCompany}>
                        <Input
                            value={form.insuranceCompany}
                            onChange={(e) => update('insuranceCompany', e.target.value)}
                        />
                    </Field>
                    <Field label={t.vehicles.insuranceType}>
                        <Input
                            value={form.insuranceType}
                            onChange={(e) => update('insuranceType', e.target.value)}
                        />
                    </Field>
                    <Field label={t.vehicles.insuranceRenewal}>
                        <Input
                            type="date"
                            value={form.insuranceRenewal || ''}
                            onChange={(e) => update('insuranceRenewal', e.target.value)}
                        />
                    </Field>
                </div>

                <div className="flex justify-end gap-2 border-t border-border-soft pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t.common.cancel}
                    </Button>
                    <Button type="submit" variant="accent">
                        {t.common.save}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

function Row({ label, value, mono = false }) {
    return (
        <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{label}</dt>
            <dd
                className={`mt-1.5 text-sm text-ink ${
                    mono ? 'font-mono' : 'font-medium'
                }`}
            >
                {value}
            </dd>
        </div>
    );
}
