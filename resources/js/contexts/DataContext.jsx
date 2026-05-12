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
                const [r, m, n] = await Promise.all([
                    axios.get('/api/reservations'),
                    axios.get('/api/maintenance'),
                    axios.get('/api/notifications'),
                ]);
                setReservations(r.data.map(mapReservation));
                setMaintenance(m.data.map(mapMaintenance));
                setNotifications(n.data.map(mapNotification));
            } else {
                setReservations([]);
                setMaintenance([]);
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
        fetchNotifications();
    };

    const approveReservation = async (id) => {
        const { data } = await axios.post(`/api/reservations/${id}/approve`);
        setReservations((prev) => prev.map((r) => (r.id === id ? mapReservation(data) : r)));
        fetchNotifications();
    };

    const rejectReservation = async (id) => {
        const { data } = await axios.post(`/api/reservations/${id}/reject`);
        setReservations((prev) => prev.map((r) => (r.id === id ? mapReservation(data) : r)));
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
    };

    const checkOutReservation = async (id, { endKm, endNotes, files }) => {
        const fd = new FormData();
        fd.append('end_km', String(endKm));
        if (endNotes) fd.append('end_notes', endNotes);
        (files || []).forEach((file) => fd.append('media[]', file));

        const { data } = await axios.post(`/api/reservations/${id}/checkout`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        setReservations((prev) => prev.map((r) => (r.id === id ? mapReservation(data) : r)));
        if (data.end_km) {
            setVehicles((prev) =>
                prev.map((v) => (v.id === data.vehicle_id ? { ...v, currentKm: data.end_km } : v))
            );
        }
        fetchNotifications();
    };

    const confirmReservationOperational = async (id, operational) => {
        const { data } = await axios.post(`/api/reservations/${id}/confirm-operational`, {
            operational,
        });
        setReservations((prev) => prev.map((r) => (r.id === id ? mapReservation(data) : r)));
        if (!operational) {
            setVehicles((prev) =>
                prev.map((v) => (v.id === data.vehicle_id ? { ...v, operational: false } : v))
            );
        }
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

    const unreadCount = notifications.filter((n) => !n.read).length;

    const value = useMemo(
        () => ({
            vehicles,
            reservations,
            maintenance,
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
            markNotificationRead,
            markAllNotificationsRead,
            getVehicle,
            getMaintenanceFor,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [vehicles, reservations, maintenance, notifications, unreadCount, loading]
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
