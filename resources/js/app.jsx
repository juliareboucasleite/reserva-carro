import './bootstrap';
import '../css/app.css';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    BrowserRouter,
    Navigate,
    Outlet,
    Route,
    Routes,
    useLocation,
    useNavigate,
    useOutletContext,
    useParams,
} from 'react-router-dom';
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

const VIEW_TO_PATH = {
    dashboard: '/painel',
    vehicles: '/viaturas',
    reservations: '/reservas',
    damages: '/avarias',
    maintenance: '/manutencao',
    admin: '/admin',
};

function buildTripFromSearch(search) {
    if (!search) return '';
    const pickup = search.pickupLocationData?.label || search.pickupLocation || '';
    const dropoff = search.returnLocationData?.label || search.returnLocation || '';
    if (pickup && dropoff && pickup !== dropoff) return `${pickup} → ${dropoff}`;
    return pickup || dropoff || '';
}

function AppShell() {
    const { isAuthenticated, authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [publicSearch, setPublicSearch] = useState(null);
    const [publicModalOpen, setPublicModalOpen] = useState(false);
    const [reservationDraft, setReservationDraft] = useState(null);

    useEffect(() => {
        if (isAuthenticated && reservationDraft && location.pathname !== '/reservas') {
            navigate('/reservas');
        }
    }, [isAuthenticated, reservationDraft, location.pathname, navigate]);

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-paper text-ink">
                <div className="text-sm font-medium">A carregar sessão...</div>
            </div>
        );
    }

    const handleSearch = (search) => {
        setPublicSearch(search);
        navigate('/pesquisa');
    };

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
            navigate('/reservas');
        } else {
            setPublicModalOpen(true);
        }
    };

    const requestReservation = (id) => {
        setReservationDraft({ vehicleId: id, startDate: '', endDate: '', trip: '' });
        navigate('/reservas');
    };

    const handlePublicLoginCta = () => {
        if (isAuthenticated) navigate('/painel');
        else setPublicModalOpen(true);
    };

    const publicProps = {
        isAuthenticated,
        onGoToDashboard: () => navigate('/painel'),
        onGoToLogin: handlePublicLoginCta,
        onStartReservation: startPublicReservation,
    };

    return (
        <>
            <Routes>
                <Route
                    path="/"
                    element={<LandingPage {...publicProps} onSearch={handleSearch} />}
                />
                <Route
                    path="/pesquisa"
                    element={
                        <SearchResultsPage
                            {...publicProps}
                            search={publicSearch}
                            onBack={() => navigate('/')}
                        />
                    }
                />

                <Route
                    element={
                        isAuthenticated ? (
                            <ProtectedLayout
                                requestReservation={requestReservation}
                                reservationDraft={reservationDraft}
                                clearReservationDraft={() => setReservationDraft(null)}
                            />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                >
                    <Route path="/painel" element={<Dashboard />} />
                    <Route path="/viaturas" element={<VehiclesRoute />} />
                    <Route path="/viaturas/:id" element={<VehicleDetailRoute />} />
                    <Route path="/reservas" element={<ReservationsRoute />} />
                    <Route path="/avarias" element={<Damages />} />
                    <Route path="/manutencao" element={<Maintenance />} />
                    <Route path="/admin" element={<Admin />} />
                </Route>

                <Route
                    path="*"
                    element={<Navigate to={isAuthenticated ? '/painel' : '/'} replace />}
                />
            </Routes>

            {publicModalOpen && !isAuthenticated && (
                <Login onBack={() => setPublicModalOpen(false)} />
            )}
        </>
    );
}

function ProtectedLayout({ requestReservation, reservationDraft, clearReservationDraft }) {
    const navigate = useNavigate();
    const location = useLocation();

    const currentView = (() => {
        if (location.pathname.startsWith('/viaturas')) return 'vehicles';
        if (location.pathname === '/painel') return 'dashboard';
        if (location.pathname === '/reservas') return 'reservations';
        if (location.pathname === '/avarias') return 'damages';
        if (location.pathname === '/manutencao') return 'maintenance';
        if (location.pathname === '/admin') return 'admin';
        return 'dashboard';
    })();

    const onNavigate = (view) => navigate(VIEW_TO_PATH[view] || '/painel');

    return (
        <DashboardLayout
            currentView={currentView}
            onNavigate={onNavigate}
            onGoToPublic={() => navigate('/')}
        >
            <Outlet context={{ requestReservation, reservationDraft, clearReservationDraft }} />
        </DashboardLayout>
    );
}

function VehiclesRoute() {
    const navigate = useNavigate();
    const { requestReservation } = useOutletContext();
    return (
        <Vehicles
            onOpenVehicle={(id) => navigate(`/viaturas/${id}`)}
            onRequestReservation={requestReservation}
        />
    );
}

function VehicleDetailRoute() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { requestReservation } = useOutletContext();
    return (
        <VehicleDetail
            vehicleId={Number(id)}
            onBack={() => navigate('/viaturas')}
            onRequestReservation={requestReservation}
        />
    );
}

function ReservationsRoute() {
    const { reservationDraft, clearReservationDraft } = useOutletContext();
    return <Reservations initialDraft={reservationDraft} onClearInitial={clearReservationDraft} />;
}

const rootElement = document.getElementById('app');

if (rootElement) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <I18nProvider>
                <AuthProvider>
                    <DataProvider>
                        <BrowserRouter>
                            <AppShell />
                        </BrowserRouter>
                    </DataProvider>
                </AuthProvider>
            </I18nProvider>
        </React.StrictMode>
    );
}
