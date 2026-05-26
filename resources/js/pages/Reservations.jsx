import React, { useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { useData, RES_STATUS } from '../contexts/DataContext';
import {
    PageHeader,
    Button,
    Badge,
    Field,
    Input,
    Textarea,
    Select,
    Modal,
    AngleUpload,
    DamageCanvas,
} from '../components/ui';
import { PlusIcon, CheckIcon, XIcon, WrenchIcon } from '../components/Icons';

const STATUS_LABEL_KEY = {
    [RES_STATUS.PENDING]: 'statusPending',
    [RES_STATUS.APPROVED]: 'statusApproved',
    [RES_STATUS.REJECTED]: 'statusRejected',
    [RES_STATUS.CHECKED_IN]: 'statusCheckedIn',
    [RES_STATUS.CHECKED_OUT]: 'statusCheckedOut',
};

const DAMAGE_TYPE_OPTIONS = ['scratch', 'dent', 'crack', 'clip'];
const DAMAGE_SEVERITY_OPTIONS = ['low', 'high'];

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    if (!aStart || !bStart) return false;
    const aS = aStart;
    const aE = aEnd || aStart;
    const bS = bStart;
    const bE = bEnd || bStart;
    return aS <= bE && bS <= aE;
}

function formatPeriod(startDate, endDate) {
    if (!startDate) return '';
    if (!endDate || endDate === startDate) return startDate;
    return `${startDate} → ${endDate}`;
}

export default function Reservations({ initialDraft, onClearInitial }) {
    const initialVehicleId = initialDraft?.vehicleId || null;
    const initialStartDate = initialDraft?.startDate || '';
    const initialEndDate = initialDraft?.endDate || '';
    const initialTrip = initialDraft?.trip || '';
    const { t } = useI18n();
    const { user } = useAuth();
    const {
        reservations,
        vehicles,
        addReservation,
        approveReservation,
        rejectReservation,
        checkInReservation,
        checkOutReservation,
        confirmReservationOperational,
        addMaintenance,
    } = useData();

    const [filter, setFilter] = useState('all');
    const [newOpen, setNewOpen] = useState(!!initialVehicleId);
    const [checkInId, setCheckInId] = useState(null);
    const [checkOutId, setCheckOutId] = useState(null);
    const [confirmOpId, setConfirmOpId] = useState(null);
    const [preselectVehicle, setPreselectVehicle] = useState(initialVehicleId);
    const [preselectStartDate, setPreselectStartDate] = useState(initialStartDate);
    const [preselectEndDate, setPreselectEndDate] = useState(initialEndDate);
    const [preselectTrip, setPreselectTrip] = useState(initialTrip);
    const [maintenancePrefill, setMaintenancePrefill] = useState(null);

    React.useEffect(() => {
        if (initialVehicleId) {
            setPreselectVehicle(initialVehicleId);
            setPreselectStartDate(initialStartDate);
            setPreselectEndDate(initialEndDate);
            setPreselectTrip(initialTrip);
            setNewOpen(true);
        }
    }, [initialVehicleId, initialStartDate, initialEndDate, initialTrip]);

    const isManager = user.role === ROLES.MANAGER || user.role === ROLES.ADMIN;
    const subtitle = isManager ? t.reservations.subtitleManager : t.reservations.subtitleDriver;

    const visibleReservations = useMemo(() => {
        let list = isManager
            ? reservations
            : reservations.filter((r) => r.requestedBy === user.id);
        if (filter !== 'all') list = list.filter((r) => r.status === filter);
        return [...list].sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
    }, [reservations, isManager, user.id, filter]);

    const competingCountFor = useMemo(() => {
        const pending = reservations.filter((r) => r.status === RES_STATUS.PENDING);
        return (reservation) =>
            pending.filter(
                (other) =>
                    other.vehicleId === reservation.vehicleId &&
                    rangesOverlap(other.startDate, other.endDate, reservation.startDate, reservation.endDate)
            ).length;
    }, [reservations]);

    const handleNewClose = () => {
        setNewOpen(false);
        setPreselectVehicle(null);
        setPreselectStartDate('');
        setPreselectEndDate('');
        setPreselectTrip('');
        if (onClearInitial) onClearInitial();
    };

    return (
        <div>
            <PageHeader
                kicker={t.nav.reservations}
                title={t.reservations.title}
                subtitle={subtitle}
                action={
                    <Button variant="accent" onClick={() => setNewOpen(true)}>
                        <PlusIcon className="h-4 w-4" />
                        {t.reservations.newReservation}
                    </Button>
                }
            />

            <div className="mb-6 flex flex-wrap gap-1 border-b border-border-soft">
                {[
                    ['all', t.reservations.allReservations],
                    [RES_STATUS.PENDING, t.reservations.pending],
                    [RES_STATUS.APPROVED, t.reservations.approved],
                    [RES_STATUS.CHECKED_IN, t.reservations.checkedIn],
                    [RES_STATUS.CHECKED_OUT, t.reservations.checkedOut],
                    [RES_STATUS.REJECTED, t.reservations.rejected],
                ].map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`relative -mb-px px-3 py-3 text-sm transition ${
                            filter === key
                                ? 'text-ink'
                                : 'text-muted hover:text-ink'
                        }`}
                    >
                        {label}
                        {filter === key && (
                            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-ink" />
                        )}
                    </button>
                ))}
            </div>

            {visibleReservations.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">{t.reservations.empty}</p>
            ) : (
                <div className="overflow-hidden rounded-md border border-border-soft">
                    <table className="min-w-full bg-surface text-sm">
                        <thead className="border-b border-border-soft bg-paper-2/60 text-left">
                            <tr>
                                <Th>{t.reservations.vehicle}</Th>
                                <Th>{t.reservations.trip}</Th>
                                <Th>{t.reservations.period}</Th>
                                <Th>{t.reservations.requestedBy}</Th>
                                <Th>{t.reservations.status}</Th>
                                <Th right>{t.common.actions}</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleReservations.map((r, i) => {
                                const vehicle = vehicles.find((v) => v.id === r.vehicleId);
                                const competingCount = competingCountFor(r);
                                return (
                                    <tr
                                        key={r.id}
                                        className={`${
                                            i !== visibleReservations.length - 1
                                                ? 'border-b border-border-soft'
                                                : ''
                                        } hover:bg-paper-2/40`}
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-ink">{vehicle?.name}</p>
                                            <p className="mt-0.5 font-mono text-xs text-muted">
                                                {vehicle?.plate}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 text-ink">{r.trip}</td>
                                        <td className="px-5 py-4 font-mono text-xs text-muted">
                                            {formatPeriod(r.startDate, r.endDate)}
                                            {isManager &&
                                                r.status === RES_STATUS.PENDING &&
                                                competingCount > 1 && (
                                                    <p className="mt-1 text-[11px] font-medium text-warn">
                                                        {t.reservations.competingRequests.replace(
                                                            '{n}',
                                                            competingCount
                                                        )}
                                                    </p>
                                                )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-ink">{r.requestedByName}</p>
                                            <p className="mt-0.5 text-xs text-muted">{r.team}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <Badge tone={r.status}>
                                                {t.reservations[STATUS_LABEL_KEY[r.status]]}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <Actions
                                                reservation={r}
                                                isManager={isManager}
                                                isOwner={r.requestedBy === user.id}
                                                onApprove={() => approveReservation(r.id)}
                                                onReject={() => rejectReservation(r.id)}
                                                onCheckIn={() => setCheckInId(r.id)}
                                                onCheckOut={() => setCheckOutId(r.id)}
                                                onConfirmOp={() => setConfirmOpId(r.id)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <NewReservationModal
                open={newOpen}
                onClose={handleNewClose}
                preselectVehicle={preselectVehicle}
                preselectStartDate={preselectStartDate}
                preselectEndDate={preselectEndDate}
                preselectTrip={preselectTrip}
                onCreate={async (payload) => {
                    await addReservation(payload);
                    handleNewClose();
                }}
            />

            <CheckInModal
                open={checkInId !== null}
                onClose={() => setCheckInId(null)}
                reservation={reservations.find((r) => r.id === checkInId)}
                vehicle={vehicles.find(
                    (v) => v.id === reservations.find((r) => r.id === checkInId)?.vehicleId
                )}
                onConfirm={async ({ driver, startKm, startNotes, angleMedia }) => {
                    await checkInReservation(checkInId, {
                        driver,
                        startKm,
                        startNotes,
                        angleMedia,
                    });
                    setCheckInId(null);
                }}
                defaultDriver={user.name}
            />

            <CheckOutModal
                open={checkOutId !== null}
                onClose={() => setCheckOutId(null)}
                reservation={reservations.find((r) => r.id === checkOutId)}
                vehicle={vehicles.find(
                    (v) => v.id === reservations.find((r) => r.id === checkOutId)?.vehicleId
                )}
                onConfirm={async ({ endKm, endNotes, endMedia, damages }) => {
                    await checkOutReservation(checkOutId, {
                        endKm,
                        endNotes,
                        files: (endMedia || []).map((m) => m.file).filter(Boolean),
                        damages,
                    });
                    setCheckOutId(null);
                }}
            />

            <OperationalConfirmModal
                reservation={confirmOpId ? reservations.find((r) => r.id === confirmOpId) : null}
                vehicle={
                    confirmOpId
                        ? vehicles.find(
                              (v) =>
                                  v.id ===
                                  reservations.find((r) => r.id === confirmOpId)?.vehicleId
                          )
                        : null
                }
                onClose={() => setConfirmOpId(null)}
                onConfirm={async (operational) => {
                    const r = reservations.find((x) => x.id === confirmOpId);
                    await confirmReservationOperational(confirmOpId, operational);
                    if (!operational && r) {
                        setMaintenancePrefill({
                            vehicleId: r.vehicleId,
                            notes: r.endNotes || '',
                        });
                    }
                    setConfirmOpId(null);
                }}
            />

            <CheckoutMaintenanceModal
                prefill={maintenancePrefill}
                onClose={() => setMaintenancePrefill(null)}
                onCreate={(payload) => {
                    addMaintenance(payload);
                    setMaintenancePrefill(null);
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

function Actions({
    reservation,
    isManager,
    isOwner,
    onApprove,
    onReject,
    onCheckIn,
    onCheckOut,
    onConfirmOp,
}) {
    const { t } = useI18n();
    const r = reservation;

    if (isManager && r.status === RES_STATUS.PENDING) {
        return (
            <div className="inline-flex gap-2">
                <Button size="sm" variant="success" onClick={onApprove}>
                    <CheckIcon className="h-4 w-4" />
                    {t.common.approve}
                </Button>
                <Button size="sm" variant="secondary" onClick={onReject}>
                    <XIcon className="h-4 w-4" />
                    {t.common.reject}
                </Button>
            </div>
        );
    }
    if (isOwner && r.status === RES_STATUS.APPROVED) {
        return (
            <Button size="sm" variant="accent" onClick={onCheckIn}>
                {t.reservations.doCheckIn_short}
            </Button>
        );
    }
    if (isOwner && r.status === RES_STATUS.CHECKED_IN) {
        return (
            <Button size="sm" variant="secondary" onClick={onCheckOut}>
                {t.reservations.doCheckOut_short}
            </Button>
        );
    }
    if (
        isManager &&
        r.status === RES_STATUS.CHECKED_OUT &&
        r.operationalConfirmed === null
    ) {
        return (
            <Button size="sm" variant="accent" onClick={onConfirmOp}>
                {t.reservations.confirmOperational}
            </Button>
        );
    }
    return <span className="text-xs text-muted">—</span>;
}

function NewReservationModal({
    open,
    onClose,
    onCreate,
    preselectVehicle,
    preselectStartDate,
    preselectEndDate,
    preselectTrip,
}) {
    const { t } = useI18n();
    const { vehicles } = useData();
    const [vehicleId, setVehicleId] = useState(preselectVehicle || '');
    const [trip, setTrip] = useState(preselectTrip || '');
    const [startDate, setStartDate] = useState(preselectStartDate || '');
    const [endDate, setEndDate] = useState(preselectEndDate || '');
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (open) {
            setVehicleId(preselectVehicle || '');
            setTrip(preselectTrip || '');
            setStartDate(preselectStartDate || '');
            setEndDate(preselectEndDate || '');
            setError('');
        }
    }, [open, preselectVehicle, preselectStartDate, preselectEndDate, preselectTrip]);

    const submit = async (e) => {
        e.preventDefault();
        if (!vehicleId || !trip || !startDate) return;
        const resolvedEnd = endDate && endDate >= startDate ? endDate : startDate;
        setError('');
        try {
            await onCreate({
                vehicleId: Number(vehicleId),
                trip,
                startDate,
                endDate: resolvedEnd,
            });
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    'NÃ£o foi possÃ­vel criar a reserva.'
            );
        }
    };

    const operational = vehicles.filter((v) => v.operational);

    return (
        <Modal open={open} onClose={onClose} kicker="01 · Pré-Reserva" title={t.reservations.preReserveTitle}>
            <form onSubmit={submit} className="space-y-5">
                <Field label={t.reservations.vehicle}>
                    <Select
                        value={vehicleId}
                        onChange={(e) => setVehicleId(e.target.value)}
                        required
                    >
                        <option value="">{t.reservations.chooseVehicle}</option>
                        {operational.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.name} — {v.plate}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field label={t.reservations.trip}>
                    <Input
                        value={trip}
                        onChange={(e) => setTrip(e.target.value)}
                        placeholder={t.reservations.tripPlaceholder}
                        required
                    />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label={t.reservations.startDate}>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </Field>
                    <Field label={t.reservations.endDate}>
                        <Input
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </Field>
                </div>
                {error && (
                    <p className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
                        {error}
                    </p>
                )}
                <div className="flex justify-end gap-2 border-t border-border-soft pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t.common.cancel}
                    </Button>
                    <Button type="submit" variant="accent">
                        {t.reservations.submitRequest}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

function CheckInModal({ open, onClose, onConfirm, reservation, vehicle, defaultDriver }) {
    const { t } = useI18n();
    const [driver, setDriver] = useState('');
    const [startKm, setStartKm] = useState('');
    const [startNotes, setStartNotes] = useState('');
    const [angleMedia, setAngleMedia] = useState({});

    React.useEffect(() => {
        if (open) {
            setDriver(defaultDriver || '');
            setStartKm(vehicle?.currentKm || '');
            setStartNotes('');
            setAngleMedia({});
        }
    }, [open, defaultDriver, vehicle]);

    if (!reservation || !vehicle) return null;

    const requiredAngles = ['front', 'back', 'left', 'right'];
    const hasAllAngles = requiredAngles.every((a) => angleMedia[a]?.file);

    const submit = (e) => {
        e.preventDefault();
        if (!hasAllAngles) return;
        onConfirm({
            driver,
            startKm: Number(startKm),
            startNotes,
            angleMedia,
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            kicker={`03 · ${vehicle.name} · ${vehicle.plate}`}
            title={t.reservations.checkInTitle}
        >
            <form onSubmit={submit} className="space-y-5">
                <Field label={t.reservations.checkInDriver}>
                    <Input value={driver} onChange={(e) => setDriver(e.target.value)} required />
                </Field>
                <Field label={t.reservations.startKm}>
                    <Input
                        type="number"
                        value={startKm}
                        onChange={(e) => setStartKm(e.target.value)}
                        required
                    />
                </Field>
                <Field label={t.reservations.startNotes}>
                    <Textarea
                        rows={3}
                        value={startNotes}
                        onChange={(e) => setStartNotes(e.target.value)}
                        placeholder={t.reservations.startNotesPlaceholder}
                    />
                </Field>
                <AngleUpload value={angleMedia} onChange={setAngleMedia} />
                <div className="flex justify-end gap-2 border-t border-border-soft pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t.common.cancel}
                    </Button>
                    <Button type="submit" variant="accent" disabled={!hasAllAngles}>
                        {t.reservations.doCheckIn}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

function OperationalConfirmModal({ reservation, vehicle, onClose, onConfirm }) {
    const { t } = useI18n();
    if (!reservation || !vehicle) return null;

    return (
        <Modal
            open={true}
            onClose={onClose}
            kicker={`${vehicle.name} · ${vehicle.plate}`}
            title={t.reservations.confirmOperationalTitle}
        >
            <p className="mb-5 text-sm text-muted">{t.reservations.confirmOperationalSubtitle}</p>

            {reservation.endNotes && (
                <div className="mb-5 rounded-md border border-border-soft bg-paper-2/60 px-3 py-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                        {t.reservations.endNotes}
                    </p>
                    <p className="mt-1 text-xs text-ink">{reservation.endNotes}</p>
                </div>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => onConfirm(true)}
                    className="rounded-md border border-positive bg-positive-soft px-4 py-3 text-sm font-medium text-positive transition hover:bg-positive-soft/80"
                >
                    {t.reservations.operationalYes}
                </button>
                <button
                    type="button"
                    onClick={() => onConfirm(false)}
                    className="rounded-md border border-danger bg-danger-soft px-4 py-3 text-sm font-medium text-danger transition hover:bg-danger-soft/80"
                >
                    {t.reservations.operationalNo}
                </button>
            </div>
        </Modal>
    );
}

function CheckoutMaintenanceModal({ prefill, onClose, onCreate }) {
    const { t } = useI18n();
    const { vehicles } = useData();
    const [type, setType] = useState('');
    const [downtimeDays, setDowntimeDays] = useState(0);
    const [notes, setNotes] = useState('');
    const [cost, setCost] = useState('');

    React.useEffect(() => {
        if (prefill) {
            setType('');
            setDowntimeDays(0);
            setNotes(prefill.notes || '');
            setCost('');
        }
    }, [prefill]);

    if (!prefill) return null;

    const vehicle = vehicles.find((v) => v.id === prefill.vehicleId);

    const submit = (e) => {
        e.preventDefault();
        onCreate({
            vehicleId: prefill.vehicleId,
            date: new Date().toISOString().slice(0, 10),
            type,
            downtimeDays: Number(downtimeDays),
            notes,
            cost: Number(cost || 0),
        });
    };

    return (
        <Modal
            open={true}
            onClose={onClose}
            kicker={
                <span className="inline-flex items-center gap-2">
                    <WrenchIcon className="h-3.5 w-3.5" />
                    {vehicle ? `${vehicle.name} · ${vehicle.plate}` : ''}
                </span>
            }
            title={t.maintenance.createTitle}
        >
            <p className="mb-4 rounded-md border border-warn/30 bg-warn-soft px-3 py-2 text-xs text-warn">
                {t.maintenance.autoFromCheckout}
            </p>
            <form onSubmit={submit} className="space-y-5">
                <Field label={t.maintenance.type}>
                    <Input
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        placeholder={t.maintenance.typePlaceholder}
                        required
                    />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label={t.maintenance.downtimeDays}>
                        <Input
                            type="number"
                            min="0"
                            value={downtimeDays}
                            onChange={(e) => setDowntimeDays(e.target.value)}
                        />
                    </Field>
                    <Field label={t.maintenance.cost}>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                        />
                    </Field>
                </div>
                <Field label={t.maintenance.notes}>
                    <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
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

function CheckOutModal({ open, onClose, onConfirm, reservation, vehicle }) {
    const { t } = useI18n();
    const [endKm, setEndKm] = useState('');
    const [endNotes, setEndNotes] = useState('');
    const [endAngleMedia, setEndAngleMedia] = useState({});
    const [hasDamages, setHasDamages] = useState(false);
    const [damageView, setDamageView] = useState('exterior');
    const [damages, setDamages] = useState([]);
    const [editingDamageId, setEditingDamageId] = useState(null);

    React.useEffect(() => {
        if (open) {
            setEndKm(reservation?.startKm || '');
            setEndNotes('');
            setEndAngleMedia({});
            setHasDamages(false);
            setDamageView('exterior');
            setDamages([]);
            setEditingDamageId(null);
        }
    }, [open, reservation]);

    if (!reservation || !vehicle) return null;

    const editingDamage = damages.find((d) => d.id === editingDamageId);
    const requiredAngles = ['front', 'back', 'left', 'right'];
    const hasAllAngles = requiredAngles.every((angle) => endAngleMedia[angle]?.file);

    function addDamageAt({ x, y }) {
        const id = `tmp-${Date.now()}`;
        setDamages((prev) => [
            ...prev,
            {
                id,
                x,
                y,
                view: damageView,
                damage_type: 'scratch',
                severity: 'low',
                description: '',
                photoFile: null,
                photoPreviewUrl: null,
            },
        ]);
        setEditingDamageId(id);
    }

    function updateDamage(id, patch) {
        setDamages((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    }

    function removeDamage(id) {
        const target = damages.find((d) => d.id === id);
        if (target?.photoPreviewUrl) URL.revokeObjectURL(target.photoPreviewUrl);
        setDamages((prev) => prev.filter((d) => d.id !== id));
        if (editingDamageId === id) setEditingDamageId(null);
    }

    function updateDamagePhoto(id, file) {
        const target = damages.find((d) => d.id === id);
        if (target?.photoPreviewUrl) URL.revokeObjectURL(target.photoPreviewUrl);

        if (!file) {
            updateDamage(id, { photoFile: null, photoPreviewUrl: null });
            return;
        }

        updateDamage(id, {
            photoFile: file,
            photoPreviewUrl: URL.createObjectURL(file),
        });
    }

    const submit = (e) => {
        e.preventDefault();
        if (!hasAllAngles) return;
        onConfirm({
            endKm: Number(endKm),
            endNotes,
            angleMedia: endAngleMedia,
            damages: hasDamages ? damages : [],
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            kicker={`04 · ${vehicle.name} · ${vehicle.plate}`}
            title={t.reservations.checkOutTitle}
            maxWidth="max-w-4xl"
        >
            <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[190px_1fr]">
                    <Field label={t.reservations.endKm}>
                        <Input
                            type="number"
                            value={endKm}
                            onChange={(e) => setEndKm(e.target.value)}
                            required
                        />
                    </Field>
                    <Field label={t.reservations.endNotes}>
                        <Textarea
                            rows={3}
                            value={endNotes}
                            onChange={(e) => setEndNotes(e.target.value)}
                            placeholder={t.reservations.endNotesPlaceholder}
                        />
                    </Field>
                </div>
                <AngleUpload
                    value={endAngleMedia}
                    onChange={setEndAngleMedia}
                    accept="image/*,video/*"
                    title={t.reservations.endMediaLabel}
                    hint={t.reservations.endAngleMediaHint}
                />
                <div className="rounded-md border border-border-soft bg-paper-2/40 px-4 py-3">
                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={hasDamages}
                            onChange={(e) => {
                                const nextValue = e.target.checked;
                                setHasDamages(nextValue);
                                if (!nextValue) {
                                    setDamages([]);
                                    setEditingDamageId(null);
                                }
                            }}
                            className="mt-1 h-4 w-4 rounded border-border text-ink focus:ring-ink/20"
                        />
                        <div>
                            <p className="text-sm font-semibold text-ink">{t.damages.toggleLabel}</p>
                            <p className="mt-1 text-xs text-muted">{t.damages.hint}</p>
                        </div>
                    </label>
                </div>
                {hasDamages && (
                <div className="rounded-md border border-border-soft bg-paper-2/30 p-4">
                        <div className="mb-4">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-ink">{t.damages.title}</p>
                            <div className="inline-flex rounded-md border border-border-soft bg-paper p-1">
                                {['exterior', 'interior'].map((view) => (
                                    <button
                                        key={view}
                                        type="button"
                                        onClick={() => setDamageView(view)}
                                        className={`rounded-sm px-3 py-1 text-xs font-medium transition ${
                                            damageView === view
                                                ? 'bg-ink text-paper'
                                                : 'text-muted hover:text-ink'
                                        }`}
                                    >
                                        {view === 'exterior' ? 'Exterior' : 'Interior'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="mt-2 text-xs font-medium text-muted">
                            {t.damages.count.replace(
                                '{n}',
                                damages.filter((damage) => (damage.view || 'exterior') === damageView)
                                    .length
                            )}
                        </p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                        <DamageCanvas
                            category={vehicle.category}
                            view={damageView}
                            vehicleName={vehicle.name}
                            damages={damages.filter(
                                (damage) => (damage.view || 'exterior') === damageView
                            )}
                            selectedId={editingDamageId}
                            onAddPoint={addDamageAt}
                            onSelect={(damage) => setEditingDamageId(damage.id)}
                        />

                        <div className="overflow-hidden rounded-md border border-border-soft bg-paper">
                            {damages.filter(
                                (damage) => (damage.view || 'exterior') === damageView
                            ).length === 0 ? (
                                <div className="flex min-h-[140px] items-center justify-center px-6 text-center text-sm text-muted">
                                    {t.damages.emptyPanel}
                                </div>
                            ) : (
                                <table className="min-w-full text-sm">
                                    <thead className="border-b border-border-soft bg-paper-2/70 text-left">
                                        <tr>
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                                                No
                                            </th>
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                                                {t.damages.type}
                                            </th>
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                                                {t.damages.description}
                                            </th>
                                            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted">
                                                {t.common.actions}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {damages
                                            .filter(
                                                (damage) =>
                                                    (damage.view || 'exterior') === damageView
                                            )
                                            .map((damage, index) => (
                                            <tr
                                                key={damage.id}
                                                className={`${
                                                    index !==
                                                    damages.filter(
                                                        (entry) =>
                                                            (entry.view || 'exterior') === damageView
                                                    ).length -
                                                        1
                                                        ? 'border-b border-border-soft'
                                                        : ''
                                                }`}
                                            >
                                                <td className="px-4 py-3 font-medium text-ink">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3 text-ink">
                                                    {t.damages.types[damage.damage_type]}
                                                </td>
                                                <td className="px-4 py-3 text-muted">
                                                    {damage.description || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingDamageId(damage.id)}
                                                        className="text-sm font-medium text-sky-600 hover:underline"
                                                    >
                                                        {t.common.edit}
                                                    </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
                )}
                <p className="rounded-md border border-border-soft bg-paper-2/60 px-3 py-2 text-[11px] text-muted">
                    {t.reservations.operationalManagerHint}
                </p>
                <div className="flex justify-end gap-2 border-t border-border-soft pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t.common.cancel}
                    </Button>
                    <Button type="submit" variant="accent" disabled={!hasAllAngles}>
                        {t.reservations.doCheckOut}
                    </Button>
                </div>
            </form>

            <DamageDetailModal
                open={Boolean(editingDamage)}
                damage={editingDamage}
                damageIndex={damages.findIndex((d) => d.id === editingDamageId) + 1}
                onClose={() => setEditingDamageId(null)}
                onUpdate={updateDamage}
                onUpdatePhoto={updateDamagePhoto}
                onRemove={removeDamage}
            />
        </Modal>
    );
}

function DamageDetailModal({
    open,
    damage,
    damageIndex,
    onClose,
    onUpdate,
    onUpdatePhoto,
    onRemove,
}) {
    const { t } = useI18n();

    if (!open || !damage) return null;

    return (
        <Modal open={open} onClose={onClose} title={`Add damage #${damageIndex}`} maxWidth="max-w-2xl">
            <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-[1.5fr_0.8fr]">
                    <Field label={t.damages.type}>
                        <Select
                            value={damage.damage_type}
                            onChange={(e) =>
                                onUpdate(damage.id, {
                                    damage_type: e.target.value,
                                })
                            }
                        >
                            {DAMAGE_TYPE_OPTIONS.map((type) => (
                                <option key={type} value={type}>
                                    {t.damages.types[type]}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <Field label={t.damages.severity}>
                        <Select
                            value={damage.severity}
                            onChange={(e) =>
                                onUpdate(damage.id, {
                                    severity: e.target.value,
                                })
                            }
                        >
                            {DAMAGE_SEVERITY_OPTIONS.map((severity) => (
                                <option key={severity} value={severity}>
                                    {t.damages.severities[severity]}
                                </option>
                            ))}
                        </Select>
                    </Field>
                </div>

                <Field label={t.damages.description}>
                    <Textarea
                        rows={5}
                        value={damage.description}
                        onChange={(e) =>
                            onUpdate(damage.id, {
                                description: e.target.value,
                            })
                        }
                        placeholder={t.damages.descriptionPlaceholder}
                    />
                </Field>

                <Field label={t.damages.photo}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onUpdatePhoto(damage.id, e.target.files?.[0] || null)}
                        className="block w-full text-sm text-ink file:mr-3 file:rounded-md file:border file:border-border file:bg-paper file:px-3 file:py-2 file:text-sm file:font-medium"
                    />
                </Field>

                {damage.photoPreviewUrl && (
                    <div className="overflow-hidden rounded-md border border-border-soft bg-paper-2">
                        <img
                            src={damage.photoPreviewUrl}
                            alt={t.damages.photo}
                            className="h-44 w-full object-cover"
                        />
                    </div>
                )}

                <div className="flex justify-between gap-3 border-t border-border-soft pt-4">
                    <Button type="button" variant="danger" onClick={() => onRemove(damage.id)}>
                        {t.damages.remove}
                    </Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            {t.common.cancel}
                        </Button>
                        <Button type="button" variant="accent" onClick={onClose}>
                            {t.common.save}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
