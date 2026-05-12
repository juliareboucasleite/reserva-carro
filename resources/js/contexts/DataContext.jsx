import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import fordTransitImg from '../../img/carros/ford-transit.webp';
import vwTransporterImg from '../../img/carros/vw-transporter.webp';
import mitsubishiL400Img from '../../img/carros/mitsubishi-l400.webp';
import opelVivaroImg from '../../img/carros/opel-vivaro.webp';
import opelBenficaImg from '../../img/carros/opel-benfica.webp';
import marcopoloIvecoImg from '../../img/carros/marcopolo-iveco.webp';
import manBusImg from '../../img/carros/man-bus.webp';

const DataContext = createContext(null);

const mkVehicle = (v) => ({ ...v, name: `${v.brand} ${v.model}` });

const INITIAL_VEHICLES = [
    mkVehicle({
        id: 1,
        brand: 'Ford',
        model: 'Trânsit',
        category: 'van',
        image: fordTransitImg,
        plate: '12-AB-34',
        seats: 9,
        currentKm: 84210,
        operational: true,
        nextInspection: '2026-08-12',
        insuranceCompany: 'Fidelidade',
        insuranceType: 'Todos os riscos',
        insuranceRenewal: '2026-11-30',
        responsible: 'João Tavares',
        phone: '+351 912 345 678',
        base: 'Lisboa',
    }),
    mkVehicle({
        id: 2,
        brand: 'VW',
        model: 'Transporter',
        category: 'van',
        image: vwTransporterImg,
        plate: '45-CD-67',
        seats: 8,
        currentKm: 122540,
        operational: true,
        nextInspection: '2026-06-02',
        insuranceCompany: 'Tranquilidade',
        insuranceType: 'Danos próprios',
        insuranceRenewal: '2026-07-15',
        responsible: 'Sofia Antunes',
        phone: '+351 913 998 712',
        base: 'Lisboa',
    }),
    mkVehicle({
        id: 3,
        brand: 'Mitsubishi',
        model: 'L400',
        category: 'van',
        image: mitsubishiL400Img,
        plate: '78-EF-90',
        seats: 6,
        currentKm: 198320,
        operational: false,
        nextInspection: '2026-05-20',
        insuranceCompany: 'Ageas',
        insuranceType: 'Responsabilidade civil',
        insuranceRenewal: '2026-12-01',
        responsible: 'Manuel Costa',
        phone: '+351 916 221 045',
        base: 'Porto',
    }),
    mkVehicle({
        id: 4,
        brand: 'Opel',
        model: 'Vivaro',
        category: 'van',
        image: opelVivaroImg,
        plate: '11-GH-22',
        seats: 9,
        currentKm: 56770,
        operational: true,
        nextInspection: '2026-09-04',
        insuranceCompany: 'Allianz',
        insuranceType: 'Todos os riscos',
        insuranceRenewal: '2027-01-10',
        responsible: 'Rita Lopes',
        phone: '+351 917 553 380',
        base: 'Lisboa',
    }),
    mkVehicle({
        id: 5,
        brand: 'Opel',
        model: 'Benfica',
        category: 'car',
        image: opelBenficaImg,
        plate: '33-IJ-44',
        seats: 5,
        currentKm: 32100,
        operational: true,
        nextInspection: '2026-10-18',
        insuranceCompany: 'Fidelidade',
        insuranceType: 'Danos próprios',
        insuranceRenewal: '2026-08-22',
        responsible: 'Pedro Marques',
        phone: '+351 919 042 116',
        base: 'Faro',
    }),
    mkVehicle({
        id: 6,
        brand: 'Autocarro',
        model: 'Marcopolo Iveco',
        category: 'bus',
        image: marcopoloIvecoImg,
        plate: '55-KL-66',
        seats: 55,
        currentKm: 412000,
        operational: true,
        nextInspection: '2026-05-25',
        insuranceCompany: 'Tranquilidade',
        insuranceType: 'Todos os riscos',
        insuranceRenewal: '2026-09-30',
        responsible: 'Carlos Ferreira',
        phone: '+351 918 776 200',
        base: 'Porto',
    }),
    mkVehicle({
        id: 7,
        brand: 'Autocarro',
        model: 'MAN',
        category: 'bus',
        image: manBusImg,
        plate: '77-MN-88',
        seats: 49,
        currentKm: 305880,
        operational: true,
        nextInspection: '2026-07-10',
        insuranceCompany: 'Ageas',
        insuranceType: 'Todos os riscos',
        insuranceRenewal: '2026-10-05',
        responsible: 'Inês Moreira',
        phone: '+351 914 318 905',
        base: 'Lisboa',
    }),
];

const INITIAL_MAINTENANCE = [];

const RES_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CHECKED_IN: 'checked_in',
    CHECKED_OUT: 'checked_out',
};

const INITIAL_RESERVATIONS = [];

export const NOTIFICATION_TYPES = {
    RESERVATION_REQUESTED: 'reservation_requested',
    RESERVATION_APPROVED: 'reservation_approved',
    RESERVATION_REJECTED: 'reservation_rejected',
    RESERVATION_CHECKED_OUT: 'reservation_checked_out',
    OPERATIONAL_CONFIRMATION_NEEDED: 'operational_confirmation_needed',
    VEHICLE_NON_OPERATIONAL: 'vehicle_non_operational',
    INSPECTION_DUE: 'inspection_due',
    INSURANCE_DUE: 'insurance_due',
};

export function filterNotificationsFor(notifications, user) {
    if (!user) return [];
    return notifications.filter((n) => {
        if (n.forUserId !== undefined) return n.forUserId === user.id;
        if (n.forRoles) return n.forRoles.includes(user.role);
        return true;
    });
}

function daysBetween(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    if (Number.isNaN(target.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
}

const MEDIA_TTL_DAYS = 30;

function purgeOldMedia(reservations) {
    const cutoff = Date.now() - MEDIA_TTL_DAYS * 86400000;
    let changed = false;
    const next = reservations.map((r) => {
        if (r.status !== RES_STATUS.CHECKED_OUT) return r;
        const filterRecent = (list) =>
            (list || []).filter((media) => (media.createdAt || 0) >= cutoff);
        const startMedia = filterRecent(r.startMedia);
        const endMedia = filterRecent(r.endMedia);
        if (startMedia.length !== (r.startMedia || []).length || endMedia.length !== (r.endMedia || []).length) {
            changed = true;
            return { ...r, startMedia, endMedia };
        }
        return r;
    });
    return changed ? next : reservations;
}

export { RES_STATUS };

export function DataProvider({ children }) {
    const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
    const [maintenance, setMaintenance] = useState(INITIAL_MAINTENANCE);
    const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
    const [events, setEvents] = useState([]);
    const [readNotificationIds, setReadNotificationIds] = useState(new Set());

    useEffect(() => {
        setReservations((prev) => purgeOldMedia(prev));
        const interval = window.setInterval(() => {
            setReservations((prev) => purgeOldMedia(prev));
        }, 60 * 60 * 1000);
        return () => window.clearInterval(interval);
    }, []);

    const pushEvent = (event) => {
        setEvents((prev) => [
            ...prev,
            {
                id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                createdAt: Date.now(),
                ...event,
            },
        ]);
    };

    const addReservation = (res) => {
        const id = reservations.length ? Math.max(...reservations.map((r) => r.id)) + 1 : 1;
        const created = {
            ...res,
            id,
            startMedia: res.startMedia || [],
            endMedia: res.endMedia || [],
            operationalConfirmed: null,
        };
        setReservations((prev) => [...prev, created]);
        const vehicle = vehicles.find((v) => v.id === created.vehicleId);
        pushEvent({
            type: NOTIFICATION_TYPES.RESERVATION_REQUESTED,
            reservationId: id,
            vehicleId: created.vehicleId,
            forRoles: ['manager', 'admin'],
            message: `${created.requestedByName} pediu reserva da viatura ${vehicle?.name || ''} (${created.trip})`,
        });
    };

    const updateReservation = (id, patch) => {
        const current = reservations.find((r) => r.id === id);
        const beforeStatus = current?.status;

        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

        if (!current) return;
        const after = { ...current, ...patch };
        const vehicle = vehicles.find((v) => v.id === after.vehicleId);

        if (
            beforeStatus !== RES_STATUS.APPROVED &&
            patch.status === RES_STATUS.APPROVED
        ) {
            pushEvent({
                type: NOTIFICATION_TYPES.RESERVATION_APPROVED,
                reservationId: id,
                vehicleId: after.vehicleId,
                forUserId: after.requestedBy,
                message: `Reserva aprovada: ${vehicle?.name || ''} (${after.trip}) — pronta para check-in`,
            });
        }

        if (
            beforeStatus !== RES_STATUS.REJECTED &&
            patch.status === RES_STATUS.REJECTED
        ) {
            pushEvent({
                type: NOTIFICATION_TYPES.RESERVATION_REJECTED,
                reservationId: id,
                vehicleId: after.vehicleId,
                forUserId: after.requestedBy,
                message: `Reserva rejeitada: ${vehicle?.name || ''} (${after.trip})`,
            });
        }

        if (
            beforeStatus !== RES_STATUS.CHECKED_OUT &&
            patch.status === RES_STATUS.CHECKED_OUT
        ) {
            pushEvent({
                type: NOTIFICATION_TYPES.RESERVATION_CHECKED_OUT,
                reservationId: id,
                vehicleId: after.vehicleId,
                forRoles: ['manager', 'admin'],
                message: `Reserva fechada: ${vehicle?.name || ''} — ${after.endKm?.toLocaleString('pt-PT') || '?'} km`,
            });
            pushEvent({
                type: NOTIFICATION_TYPES.OPERATIONAL_CONFIRMATION_NEEDED,
                reservationId: id,
                vehicleId: after.vehicleId,
                forRoles: ['manager', 'admin'],
                message: `Confirmar estado operacional: ${vehicle?.name || ''} (${vehicle?.plate || ''})`,
            });
        }
    };

    const addMaintenance = (m) => {
        setMaintenance((prev) => [
            ...prev,
            { ...m, id: prev.length ? Math.max(...prev.map((x) => x.id)) + 1 : 1 },
        ]);
    };

    const setVehicleOperational = (vehicleId, operational) => {
        setVehicles((prev) =>
            prev.map((v) => (v.id === vehicleId ? { ...v, operational } : v))
        );

        if (!operational) {
            const vehicle = vehicles.find((v) => v.id === vehicleId);
            pushEvent({
                type: NOTIFICATION_TYPES.VEHICLE_NON_OPERATIONAL,
                vehicleId,
                forRoles: ['manager', 'admin'],
                message: `Viatura ${vehicle?.name || ''} (${vehicle?.plate || ''}) marcada como não operacional`,
            });
        }
    };

    const updateVehicleKm = (vehicleId, km) => {
        setVehicles((prev) =>
            prev.map((v) => (v.id === vehicleId ? { ...v, currentKm: km } : v))
        );
    };

    const addVehicle = (payload) => {
        setVehicles((prev) => {
            const id = prev.length ? Math.max(...prev.map((v) => v.id)) + 1 : 1;
            const created = {
                ...payload,
                id,
                name: `${payload.brand} ${payload.model}`,
                operational: payload.operational ?? true,
                currentKm: Number(payload.currentKm) || 0,
                seats: Number(payload.seats) || 0,
            };
            return [...prev, created];
        });
    };

    const updateVehicle = (vehicleId, patch) => {
        setVehicles((prev) =>
            prev.map((v) => {
                if (v.id !== vehicleId) return v;
                const merged = { ...v, ...patch };
                if (patch.brand || patch.model) {
                    merged.name = `${merged.brand} ${merged.model}`;
                }
                if (patch.currentKm !== undefined) merged.currentKm = Number(patch.currentKm) || 0;
                if (patch.seats !== undefined) merged.seats = Number(patch.seats) || 0;
                return merged;
            })
        );
    };

    const getVehicle = (id) => vehicles.find((v) => v.id === id);
    const getMaintenanceFor = (vehicleId) =>
        maintenance.filter((m) => m.vehicleId === vehicleId);

    const notifications = useMemo(() => {
        const derived = [];

        vehicles.forEach((v) => {
            const inspDays = daysBetween(v.nextInspection);
            if (inspDays !== null && inspDays <= 30) {
                derived.push({
                    id: `insp-${v.id}-${v.nextInspection}`,
                    type: NOTIFICATION_TYPES.INSPECTION_DUE,
                    vehicleId: v.id,
                    createdAt: Date.now(),
                    days: inspDays,
                    forRoles: ['manager', 'admin'],
                    message:
                        inspDays < 0
                            ? `Inspeção vencida: ${v.name} (${v.plate})`
                            : inspDays === 0
                            ? `Inspeção hoje: ${v.name} (${v.plate})`
                            : `Inspeção em ${inspDays} dia${inspDays === 1 ? '' : 's'}: ${v.name} (${v.plate})`,
                });
            }

            const insDays = daysBetween(v.insuranceRenewal);
            if (insDays !== null && insDays <= 30) {
                derived.push({
                    id: `ins-${v.id}-${v.insuranceRenewal}`,
                    type: NOTIFICATION_TYPES.INSURANCE_DUE,
                    vehicleId: v.id,
                    createdAt: Date.now(),
                    days: insDays,
                    forRoles: ['manager', 'admin'],
                    message:
                        insDays < 0
                            ? `Renovação de seguro vencida: ${v.name} (${v.plate})`
                            : insDays === 0
                            ? `Seguro renova hoje: ${v.name} (${v.plate})`
                            : `Renovação de seguro em ${insDays} dia${insDays === 1 ? '' : 's'}: ${v.name} (${v.plate})`,
                });
            }
        });

        const all = [...events, ...derived].map((n) => ({
            ...n,
            read: readNotificationIds.has(n.id),
        }));

        return all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }, [vehicles, events, readNotificationIds]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markNotificationRead = (id) => {
        setReadNotificationIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const markAllNotificationsRead = () => {
        setReadNotificationIds(new Set(notifications.map((n) => n.id)));
    };

    return (
        <DataContext.Provider
            value={{
                vehicles,
                maintenance,
                reservations,
                addReservation,
                updateReservation,
                addMaintenance,
                setVehicleOperational,
                updateVehicleKm,
                addVehicle,
                updateVehicle,
                getVehicle,
                getMaintenanceFor,
                notifications,
                unreadCount,
                markNotificationRead,
                markAllNotificationsRead,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used inside DataProvider');
    return ctx;
}
