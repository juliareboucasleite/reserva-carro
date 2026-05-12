import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const RES_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CHECKED_IN: 'checked_in',
    CHECKED_OUT: 'checked_out',
};

function mapVehicle(v) {
    return {
        id: v.id,
        brand: v.brand,
        model: v.model,
        name: v.name || `${v.brand} ${v.model}`,
        category: v.category,
        image: v.image,
        plate: v.plate,
        seats: v.seats,
        currentKm: v.current_km,
        operational: !!v.operational,
        nextInspection: v.next_inspection,
        insuranceCompany: v.insurance_company,
        insuranceType: v.insurance_type,
        insuranceRenewal: v.insurance_renewal,
        responsible: v.responsible,
        phone: v.phone,
        base: v.base,
        availability: v.availability || (v.operational ? 'available' : 'inoperational'),
        activeReservation: v.active_reservation
            ? {
                  id: v.active_reservation.id,
                  date: v.active_reservation.date,
                  status: v.active_reservation.status,
                  requesterName: v.active_reservation.requester_name,
                  trip: v.active_reservation.trip,
              }
            : null,
    };
}

function vehicleToApi(v) {
    return {
        brand: v.brand,
        model: v.model,
        category: v.category,
        image: v.image,
        plate: v.plate,
        seats: Number(v.seats) || 0,
        current_km: Number(v.currentKm) || 0,
        operational: v.operational ?? true,
        next_inspection: v.nextInspection || null,
        insurance_company: v.insuranceCompany || null,
        insurance_type: v.insuranceType || null,
        insurance_renewal: v.insuranceRenewal || null,
        responsible: v.responsible || null,
        phone: v.phone || null,
        base: v.base || null,
    };
}

function mapReservationMedia(m) {
    return {
        id: m.id,
        dataUrl: m.url,
        angle: m.angle || null,
        name: m.original_name,
        type: m.mime,
        size: m.size,
        createdAt: m.created_at ? new Date(m.created_at).getTime() : Date.now(),
    };
}

function mapReservation(r) {
    const startMedia = (r.media || []).filter((m) => m.phase === 'start').map(mapReservationMedia);
    const endMedia = (r.media || []).filter((m) => m.phase === 'end').map(mapReservationMedia);

    return {
        id: r.id,
        vehicleId: r.vehicle_id,
        vehicle: r.vehicle ? mapVehicle(r.vehicle) : null,
        requestedBy: r.requested_by,
        requestedByName: r.requester?.name || '',
        team: r.team,
        trip: r.trip,
        date: r.date,
        status: r.status,
        driver: r.driver,
        startKm: r.start_km,
        endKm: r.end_km,
        startNotes: r.start_notes || '',
        endNotes: r.end_notes || '',
        operationalConfirmed: r.operational_confirmed,
        startMedia,
        endMedia,
    };
}

function mapMaintenance(m) {
    return {
        id: m.id,
        vehicleId: m.vehicle_id,
        date: m.date,
        type: m.type,
        downtimeDays: m.downtime_days,
        notes: m.notes || '',
        cost: Number(m.cost) || 0,
    };
}

function mapDamage(d) {
    return {
        id: d.id,
        reservationId: d.reservation_id,
        reservation: d.reservation
            ? {
                  id: d.reservation.id,
                  requestedBy: d.reservation.requested_by,
                  requestedByName: d.reservation.requester?.name || '',
                  vehicle: d.reservation.vehicle ? mapVehicle(d.reservation.vehicle) : null,
              }
            : null,
        x: Number(d.x) || 0,
        y: Number(d.y) || 0,
        damageType: d.damage_type,
        severity: d.severity,
        description: d.description || '',
        photoUrl: d.photo_url || null,
        cost: d.cost !== null && d.cost !== undefined ? Number(d.cost) : null,
        responseMessage: d.response_message || '',
        costSetAt: d.cost_set_at || null,
        costSetterName: d.cost_setter?.name || '',
        createdAt: d.created_at || null,
    };
}

function mapNotification(n) {
    return {
        id: n.id,
        type: n.type,
        message: n.message,
        vehicleId: n.vehicle_id,
        reservationId: n.reservation_id,
        createdAt: n.created_at,
        read: n.read,
        kind: n.kind,
    };
}

export function DataProvider({ children }) {
    const { isAuthenticated, user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [maintenance, setMaintenance] = useState([]);
    const [damages, setDamages] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchVehicles = useCallback(async () => {
        const { data } = await axios.get('/api/vehicles');
        setVehicles(data.map(mapVehicle));
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            await fetchVehicles();
            if (isAuthenticated) {
                const [r, m, d, n] = await Promise.all([
                    axios.get('/api/reservations'),
                    axios.get('/api/maintenance'),
                    axios.get('/api/damages'),
                    axios.get('/api/notifications'),
                ]);
                setReservations(r.data.map(mapReservation));
                setMaintenance(m.data.map(mapMaintenance));
                setDamages(d.data.map(mapDamage));
                setNotifications(n.data.map(mapNotification));
            } else {
                setReservations([]);
                setMaintenance([]);
                setDamages([]);
                setNotifications([]);
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, fetchVehicles]);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        const { data } = await axios.get('/api/notifications');
        setNotifications(data.map(mapNotification));
    }, [isAuthenticated]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const interval = window.setInterval(fetchNotifications, 30000);
        return () => window.clearInterval(interval);
    }, [isAuthenticated, fetchNotifications]);

    const addVehicle = async (payload) => {
        const { data } = await axios.post('/api/vehicles', vehicleToApi(payload));
        setVehicles((prev) => [...prev, mapVehicle(data)]);
    };

    const updateVehicle = async (id, payload) => {
        const { data } = await axios.patch(`/api/vehicles/${id}`, vehicleToApi(payload));
        setVehicles((prev) => prev.map((v) => (v.id === id ? mapVehicle(data) : v)));
    };

    const setVehicleOperational = async (id, operational) => {
        const { data } = await axios.post(`/api/vehicles/${id}/operational`, { operational });
        setVehicles((prev) => prev.map((v) => (v.id === id ? mapVehicle(data) : v)));
        fetchNotifications();
    };

    const updateVehicleKm = (id, km) => {
        setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, currentKm: km } : v)));
    };

    const addReservation = async (payload) => {
        const { data } = await axios.post('/api/reservations', {
            vehicle_id: payload.vehicleId,
            trip: payload.trip,
            date: payload.date,
        });
        setReservations((prev) => [mapReservation(data), ...prev]);
        fetchVehicles();
        fetchNotifications();
    };

    const approveReservation = async (id) => {
        await axios.post(`/api/reservations/${id}/approve`);
        const { data } = await axios.get('/api/reservations');
        setReservations(data.map(mapReservation));
        fetchVehicles();
        fetchNotifications();
    };

    const rejectReservation = async (id) => {
        const { data } = await axios.post(`/api/reservations/${id}/reject`);
        setReservations((prev) => prev.map((r) => (r.id === id ? mapReservation(data) : r)));
        fetchVehicles();
        fetchNotifications();
    };

    const checkInReservation = async (id, { driver, startKm, startNotes, angleMedia }) => {
        const fd = new FormData();
        fd.append('driver', driver);
        fd.append('start_km', String(startKm));
        if (startNotes) fd.append('start_notes', startNotes);

        ['front', 'back', 'left', 'right'].forEach((angle) => {
            const entry = angleMedia?.[angle];
            if (entry?.file) fd.append(`media[${angle}]`, entry.file);
        });

        const { data } = await axios.post(`/api/reservations/${id}/checkin`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        setReservations((prev) => prev.map((r) => (r.id === id ? mapReservation(data) : r)));
        fetchVehicles();
    };

    const checkOutReservation = async (
        id,
        { endKm, endNotes, files, angleMedia, damages: reportedDamages = [] }
    ) => {
        const fd = new FormData();
        fd.append('end_km', String(endKm));
        if (endNotes) fd.append('end_notes', endNotes);
        ['front', 'back', 'left', 'right'].forEach((angle) => {
            const entry = angleMedia?.[angle];
            if (entry?.file) {
                fd.append(`media[${angle}]`, entry.file);
            }
        });
        (files || []).forEach((file) => fd.append('media[]', file));

        const { data } = await axios.post(`/api/reservations/${id}/checkout`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        setReservations((prev) => prev.map((r) => (r.id === id ? mapReservation(data) : r)));
        const uploadedDamages = [];
        for (const damage of reportedDamages) {
            uploadedDamages.push(
                await reportReservationDamage(id, {
                    x: damage.x,
                    y: damage.y,
                    damageType: damage.damage_type || damage.damageType,
                    severity: damage.severity,
                    description: damage.description,
                    photoFile: damage.photoFile || null,
                })
            );
        }
        fetchVehicles();
        fetchNotifications();
        return { reservation: mapReservation(data), damages: uploadedDamages };
    };

    const confirmReservationOperational = async (id, operational) => {
        const { data } = await axios.post(`/api/reservations/${id}/confirm-operational`, {
            operational,
        });
        setReservations((prev) => prev.map((r) => (r.id === id ? mapReservation(data) : r)));
        fetchVehicles();
        fetchNotifications();
    };

    const addMaintenance = async (payload) => {
        const { data } = await axios.post('/api/maintenance', {
            vehicle_id: payload.vehicleId,
            date: payload.date,
            type: payload.type,
            downtime_days: Number(payload.downtimeDays) || 0,
            notes: payload.notes || '',
            cost: Number(payload.cost) || 0,
        });
        setMaintenance((prev) => [mapMaintenance(data), ...prev]);
    };

    const reportReservationDamage = async (reservationId, payload) => {
        const fd = new FormData();
        fd.append('x', String(payload.x));
        fd.append('y', String(payload.y));
        fd.append('damage_type', payload.damageType);
        fd.append('severity', payload.severity);
        if (payload.description) fd.append('description', payload.description);
        if (payload.photoFile) fd.append('photo', payload.photoFile);

        const { data } = await axios.post(
            `/api/reservations/${reservationId}/damages`,
            fd,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        const mapped = mapDamage(data);
        setDamages((prev) => [mapped, ...prev]);
        return mapped;
    };

    const setDamageCost = async (damageId, { cost, responseMessage }) => {
        const { data } = await axios.patch(`/api/damages/${damageId}/cost`, {
            cost,
            response_message: responseMessage || '',
        });

        const mapped = mapDamage(data);
        setDamages((prev) => prev.map((d) => (d.id === damageId ? mapped : d)));
        return mapped;
    };

    const markNotificationRead = async (id) => {
        if (typeof id === 'string' && !id.startsWith('evt-')) return;
        const numeric = typeof id === 'string' ? Number(id.replace('evt-', '')) : id;
        await axios.post(`/api/notifications/${numeric}/read`);
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const markAllNotificationsRead = async () => {
        await axios.post('/api/notifications/read-all');
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const getVehicle = (id) => vehicles.find((v) => v.id === id);
    const getMaintenanceFor = (vehicleId) => maintenance.filter((m) => m.vehicleId === vehicleId);
    const getDamagesForReservation = (reservationId) =>
        damages.filter((d) => d.reservationId === reservationId);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const value = useMemo(
        () => ({
            vehicles,
            reservations,
            maintenance,
            damages,
            notifications,
            unreadCount,
            loading,
            refresh: fetchAll,
            addVehicle,
            updateVehicle,
            setVehicleOperational,
            updateVehicleKm,
            addReservation,
            approveReservation,
            rejectReservation,
            checkInReservation,
            checkOutReservation,
            confirmReservationOperational,
            addMaintenance,
            reportReservationDamage,
            setDamageCost,
            markNotificationRead,
            markAllNotificationsRead,
            getVehicle,
            getMaintenanceFor,
            getDamagesForReservation,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [vehicles, reservations, maintenance, damages, notifications, unreadCount, loading]
    );

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used inside DataProvider');
    return ctx;
}

export function filterNotificationsFor(notifications) {
    return notifications || [];
}
