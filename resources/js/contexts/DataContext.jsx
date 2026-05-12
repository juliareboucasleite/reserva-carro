import React, { createContext, useContext, useState } from 'react';
import fordTransitImg from '../../img/carros/IMG_55143-large.jpg';
import vwTransporterImg from '../../img/carros/OIP.jpg';
import mitsubishiL400Img from '../../img/carros/images.jpg';
import opelVivaroImg from '../../img/carros/mGp_mDd22dAjx1vX50jrDmWutgmARkdpJwoI9xL_f3LeAc3uKhEqiz80ClopqOradAKI25S6ns7vcSbjRbBVpCgyjEK4lW4-n-cNlTt4uWp_h6xIDT-yXw06L_X4I3YBjwz-l91FYA4Rk52jr8GmSKaPNT-0-BZkbqK-HyfdrvAgplGduFXl_xVHXPhL-8b4.jpg';
import opelBenficaImg from '../../img/carros/opel-combo-5d-front-view.jpg';
import marcopoloIvecoImg from '../../img/carros/Rz5Vr-BJQawK9ZxvqglNZ1spDGetkm2N7CIv_4432g0EhIQtFDocjbo7Ma7myji2vhPzisYyNk1fKdyTcwmEKpuniNEPVBslDebNjrtNdt2Gmx9KZEfRPlkygEIi1DGWcjDGbhv2B56tt2894fYSxgrYfpPTsBj8aXB3pbC8Pq2zB0dlzuZqBzQLuMHUW3Vp.jpg';
import manBusImg from '../../img/carros/Wu5DWKkAfGc6LvdyHt_YHdT9NyX_flcLcCczrHBQKSsgxClnIbqix-F-4donbdP-ikwh0PX_uy8T3uHjtnVZ8NWc0conXxK53eQnZ9ZZzn6tF1vfHOHjWcP3o3-Vj6fHze-aZM78arUO5ZHnVa9txdfkxqqq4JWLxgWET3Iw4dA_qpGpu6OE8cGzSLdpM0Jn.jpg';

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

const INITIAL_MAINTENANCE = [
    {
        id: 1,
        vehicleId: 3,
        date: '2026-04-22',
        type: 'Revisão geral',
        downtimeDays: 4,
        notes: 'Substituição de correia de distribuição e óleos.',
        cost: 720,
    },
    {
        id: 2,
        vehicleId: 1,
        date: '2026-02-14',
        type: 'Pneus',
        downtimeDays: 1,
        notes: 'Quatro pneus novos.',
        cost: 480,
    },
    {
        id: 3,
        vehicleId: 6,
        date: '2026-03-08',
        type: 'Travões',
        downtimeDays: 2,
        notes: 'Pastilhas e discos dianteiros.',
        cost: 950,
    },
];

const RES_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CHECKED_IN: 'checked_in',
    CHECKED_OUT: 'checked_out',
};

const INITIAL_RESERVATIONS = [
    {
        id: 1,
        vehicleId: 2,
        requestedBy: 1,
        requestedByName: 'Ana Pereira',
        team: 'Operações Lisboa',
        trip: 'Lisboa → Porto (transporte de equipa)',
        date: '2026-05-18',
        status: RES_STATUS.APPROVED,
        driver: null,
        startKm: null,
        endKm: null,
        startNotes: '',
        endNotes: '',
    },
    {
        id: 2,
        vehicleId: 4,
        requestedBy: 1,
        requestedByName: 'Ana Pereira',
        team: 'Operações Lisboa',
        trip: 'Lisboa → Faro',
        date: '2026-05-22',
        status: RES_STATUS.PENDING,
        driver: null,
        startKm: null,
        endKm: null,
        startNotes: '',
        endNotes: '',
    },
    {
        id: 3,
        vehicleId: 1,
        requestedBy: 1,
        requestedByName: 'Ana Pereira',
        team: 'Operações Lisboa',
        trip: 'Lisboa → Coimbra',
        date: '2026-05-12',
        status: RES_STATUS.CHECKED_IN,
        driver: 'Ana Pereira',
        startKm: 84210,
        endKm: null,
        startNotes: 'Sem danos visíveis. Depósito cheio.',
        endNotes: '',
    },
];

export { RES_STATUS };

export function DataProvider({ children }) {
    const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
    const [maintenance, setMaintenance] = useState(INITIAL_MAINTENANCE);
    const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);

    const addReservation = (res) => {
        setReservations((prev) => [
            ...prev,
            { ...res, id: prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1 },
        ]);
    };

    const updateReservation = (id, patch) => {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
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
    };

    const updateVehicleKm = (vehicleId, km) => {
        setVehicles((prev) =>
            prev.map((v) => (v.id === vehicleId ? { ...v, currentKm: km } : v))
        );
    };

    const getVehicle = (id) => vehicles.find((v) => v.id === id);
    const getMaintenanceFor = (vehicleId) =>
        maintenance.filter((m) => m.vehicleId === vehicleId);

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
                getVehicle,
                getMaintenanceFor,
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
