import './bootstrap';
import '../css/app.css';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from './i18n/I18nContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage';
import SearchResultsPage from './pages/SearchResultsPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles, { VehicleDetail } from './pages/Vehicles';
import Reservations from './pages/Reservations';
import Damages from './pages/Damages';
import Maintenance from './pages/Maintenance';
import Admin from './pages/Admin';

function buildTripFromSearch(search) {
    if (!search) return '';
    const pickup = search.pickupLocationData?.label || search.pickupLocation || '';
    const dropoff = search.returnLocationData?.label || search.returnLocation || '';
    if (pickup && dropoff && pickup !== dropoff) return `${pickup} → ${dropoff}`;
    return pickup || dropoff || '';
}

function AppShell() {
    const { isAuthenticated, authLoading } = useAuth();
    const [publicPage, setPublicPage] = useState('landing');
    const [publicModal, setPublicModal] = useState(null);
    const [publicSearch, setPublicSearch] = useState(null);
    const [showPublic, setShowPublic] = useState(false);
    const [view, setView] = useState('dashboard');
    const [vehicleId, setVehicleId] = useState(null);
    const [reservationDraft, setReservationDraft] = useState(null);

    useEffect(() => {
        if (isAuthenticated && reservationDraft) {
            setShowPublic(false);
            setView('reservations');
        }
    }, [isAuthenticated, reservationDraft]);

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-paper text-ink">
                <div className="text-sm font-medium">A carregar sessão...</div>
            </div>
        );
    }

    const startPublicReservation = (vehicle) => {
        if (vehicle) {
            setReservationDraft({
                vehicleId: vehicle.id,
                startDate: publicSearch?.pickupDate || '',
                endDate: publicSearch?.returnDate || '',
                trip: buildTripFromSearch(publicSearch),
            });
        }
        if (isAuthenticated) {
            setShowPublic(false);
            setView('reservations');
        } else {
            setPublicModal('login');
        }
    };

    const goToDashboard = () => {
        setShowPublic(false);
        setPublicModal(null);
    };

    const handlePublicLoginCta = () => {
        if (isAuthenticated) {
            goToDashboard();
        } else {
            setPublicModal('login');
        }
    };

    if (!isAuthenticated || showPublic) {
        return (
            <>
                {publicPage === 'search-results' ? (
                    <SearchResultsPage
                        search={publicSearch}
                        onBack={() => setPublicPage('landing')}
                        onGoToLogin={handlePublicLoginCta}
                        onStartReservation={startPublicReservation}
                        isAuthenticated={isAuthenticated}
                        onGoToDashboard={goToDashboard}
                    />
                ) : (
                    <LandingPage
                        onGoToLogin={handlePublicLoginCta}
                        onStartReservation={startPublicReservation}
                        onSearch={(search) => {
                            setPublicSearch(search);
                            setPublicPage('search-results');
                        }}
                        isAuthenticated={isAuthenticated}
                        onGoToDashboard={goToDashboard}
                    />
                )}
                {publicModal === 'login' && !isAuthenticated && (
                    <Login onBack={() => setPublicModal(null)} />
                )}
            </>
        );
    }

    const navigate = (next) => {
        setView(next);
        setVehicleId(null);
        if (next !== 'reservations') setReservationDraft(null);
    };

    const openVehicle = (id) => {
        setVehicleId(id);
        setView('vehicle-detail');
    };

    const requestReservation = (id) => {
        setReservationDraft({ vehicleId: id, startDate: '', endDate: '', trip: '' });
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
                initialDraft={reservationDraft}
                onClearInitial={() => setReservationDraft(null)}
            />
        );
    else if (view === 'damages') content = <Damages />;
    else if (view === 'maintenance') content = <Maintenance />;
    else if (view === 'admin') content = <Admin />;
    else content = <Dashboard />;

    const sidebarView = view === 'vehicle-detail' ? 'vehicles' : view;

    return (
        <DashboardLayout
            currentView={sidebarView}
            onNavigate={navigate}
            onGoToPublic={() => setShowPublic(true)}
        >
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
