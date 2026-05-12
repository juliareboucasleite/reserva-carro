import './bootstrap';
import '../css/app.css';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from './i18n/I18nContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles, { VehicleDetail } from './pages/Vehicles';
import Reservations from './pages/Reservations';
import Maintenance from './pages/Maintenance';
import Admin from './pages/Admin';

function AppShell() {
    const { isAuthenticated, authLoading } = useAuth();
    const [publicView, setPublicView] = useState('landing');
    const [view, setView] = useState('dashboard');
    const [vehicleId, setVehicleId] = useState(null);
    const [pendingReservationVehicle, setPendingReservationVehicle] = useState(null);

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-paper text-ink">
                <div className="text-sm font-medium">A carregar sessão...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (publicView === 'login') {
            return <Login onBack={() => setPublicView('landing')} />;
        }
        return <LandingPage onGoToLogin={() => setPublicView('login')} />;
    }

    const navigate = (next) => {
        setView(next);
        setVehicleId(null);
        if (next !== 'reservations') setPendingReservationVehicle(null);
    };

    const openVehicle = (id) => {
        setVehicleId(id);
        setView('vehicle-detail');
    };

    const requestReservation = (id) => {
        setPendingReservationVehicle(id);
        setView('reservations');
    };

    let content;
    if (view === 'dashboard') content = <Dashboard />;
    else if (view === 'vehicles')
        content = (
            <Vehicles onOpenVehicle={openVehicle} onRequestReservation={requestReservation} />
        );
    else if (view === 'vehicle-detail')
        content = (
            <VehicleDetail
                vehicleId={vehicleId}
                onBack={() => navigate('vehicles')}
                onRequestReservation={requestReservation}
            />
        );
    else if (view === 'reservations')
        content = (
            <Reservations
                initialNewVehicleId={pendingReservationVehicle}
                onClearInitial={() => setPendingReservationVehicle(null)}
            />
        );
    else if (view === 'maintenance') content = <Maintenance />;
    else if (view === 'admin') content = <Admin />;
    else content = <Dashboard />;

    const sidebarView = view === 'vehicle-detail' ? 'vehicles' : view;

    return (
        <DashboardLayout currentView={sidebarView} onNavigate={navigate}>
            {content}
        </DashboardLayout>
    );
}

const rootElement = document.getElementById('app');

if (rootElement) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <I18nProvider>
                <AuthProvider>
                    <DataProvider>
                        <AppShell />
                    </DataProvider>
                </AuthProvider>
            </I18nProvider>
        </React.StrictMode>
    );
}
