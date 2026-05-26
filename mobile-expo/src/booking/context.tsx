import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../state';
import {
  DEFAULT_FILTERS,
  fetchCatalogVehicles,
  rentalDays,
  type CatalogVehicle,
  type SortOption,
  type VehicleFilters,
} from './catalog';
import type { BookingScreen, LocationOption } from './types';

type BookingCtx = {
  screen: BookingScreen;
  navigate: (screen: BookingScreen) => void;
  goBack: () => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  showBenefits: boolean;
  dismissBenefits: () => void;
  pickup: LocationOption | null;
  setPickup: (loc: LocationOption | null) => void;
  returnLoc: LocationOption | null;
  setReturnLoc: (loc: LocationOption | null) => void;
  differentReturn: boolean;
  setDifferentReturn: (value: boolean) => void;
  pickupDate: Date;
  returnDate: Date;
  setPickupDate: (d: Date) => void;
  setReturnDate: (d: Date) => void;
  pickupTime: string;
  returnTime: string;
  setPickupTime: (t: string) => void;
  setReturnTime: (t: string) => void;
  rentalDays: number;
  openLocationPicker: (mode: 'pickup' | 'return') => void;
  confirmSearch: () => void;
  vehicles: CatalogVehicle[];
  vehiclesLoading: boolean;
  reloadVehicles: () => Promise<void>;
  selectedVehicle: CatalogVehicle | null;
  selectVehicle: (vehicle: CatalogVehicle) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  filters: VehicleFilters;
  setFilters: (filters: VehicleFilters) => void;
  childSeats: number;
  setChildSeats: (n: number) => void;
  coveragePlan: 'flex' | 'promo';
  setCoveragePlan: (plan: 'flex' | 'promo') => void;
};

const BookingContext = createContext<BookingCtx | null>(null);

function defaultPickupDate() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(0, 0, 0, 0);
  return d;
}

function defaultReturnDate() {
  const d = defaultPickupDate();
  d.setDate(d.getDate() + 1);
  return d;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const { apiBaseUrl } = useAuth();
  const [history, setHistory] = useState<BookingScreen[]>(['home']);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showBenefits, setShowBenefits] = useState(true);
  const [pickup, setPickup] = useState<LocationOption | null>({
    id: 'coimbra',
    label: 'Coimbra, Portugal',
    kind: 'city',
  });
  const [returnLoc, setReturnLoc] = useState<LocationOption | null>(null);
  const [differentReturn, setDifferentReturn] = useState(false);
  const [pickupDate, setPickupDate] = useState(defaultPickupDate);
  const [returnDate, setReturnDate] = useState(defaultReturnDate);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('10:00');
  const [vehicles, setVehicles] = useState<CatalogVehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<CatalogVehicle | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [filters, setFilters] = useState<VehicleFilters>(DEFAULT_FILTERS);
  const [childSeats, setChildSeats] = useState(0);
  const [coveragePlan, setCoveragePlan] = useState<'flex' | 'promo'>('flex');

  const screen = history[history.length - 1];
  const days = rentalDays(pickupDate, returnDate);

  const navigate = useCallback((next: BookingScreen) => {
    setHistory((prev) => [...prev, next]);
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const dismissBenefits = useCallback(() => setShowBenefits(false), []);

  const openLocationPicker = useCallback(
    (mode: 'pickup' | 'return') => {
      navigate(mode === 'pickup' ? 'location-pickup' : 'location-return');
    },
    [navigate],
  );

  const reloadVehicles = useCallback(async () => {
    setVehiclesLoading(true);
    try {
      const list = await fetchCatalogVehicles(apiBaseUrl, days);
      setVehicles(list);
    } finally {
      setVehiclesLoading(false);
    }
  }, [apiBaseUrl, days]);

  const confirmSearch = useCallback(() => {
    setSearchOpen(false);
    navigate('results');
    reloadVehicles();
  }, [navigate, reloadVehicles]);

  const selectVehicle = useCallback(
    (vehicle: CatalogVehicle) => {
      setSelectedVehicle(vehicle);
      navigate('configure');
    },
    [navigate],
  );

  const value = useMemo<BookingCtx>(
    () => ({
      screen,
      navigate,
      goBack,
      menuOpen,
      setMenuOpen,
      authOpen,
      setAuthOpen,
      searchOpen,
      setSearchOpen,
      showBenefits,
      dismissBenefits,
      pickup,
      setPickup,
      returnLoc,
      setReturnLoc,
      differentReturn,
      setDifferentReturn,
      pickupDate,
      returnDate,
      setPickupDate,
      setReturnDate,
      pickupTime,
      returnTime,
      setPickupTime,
      setReturnTime,
      rentalDays: days,
      openLocationPicker,
      confirmSearch,
      vehicles,
      vehiclesLoading,
      reloadVehicles,
      selectedVehicle,
      selectVehicle,
      sortBy,
      setSortBy,
      filters,
      setFilters,
      childSeats,
      setChildSeats,
      coveragePlan,
      setCoveragePlan,
    }),
    [
      screen,
      navigate,
      goBack,
      menuOpen,
      authOpen,
      searchOpen,
      showBenefits,
      dismissBenefits,
      pickup,
      returnLoc,
      differentReturn,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      days,
      openLocationPicker,
      confirmSearch,
      vehicles,
      vehiclesLoading,
      reloadVehicles,
      selectedVehicle,
      selectVehicle,
      sortBy,
      filters,
      childSeats,
      coveragePlan,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be inside BookingProvider');
  return ctx;
}
