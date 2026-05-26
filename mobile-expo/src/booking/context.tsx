import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
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
  country: string;
  setCountry: (c: string) => void;
  openLocationPicker: (mode: 'pickup' | 'return') => void;
  confirmSearch: () => void;
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
  d.setDate(d.getDate() + 2);
  return d;
}

export function BookingProvider({ children }: { children: ReactNode }) {
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

  const screen = history[history.length - 1];

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

  const confirmSearch = useCallback(() => {
    setSearchOpen(false);
    setAuthOpen(true);
  }, []);

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
      country: 'Portugal',
      setCountry: () => undefined,
      openLocationPicker,
      confirmSearch,
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
      openLocationPicker,
      confirmSearch,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be inside BookingProvider');
  return ctx;
}
