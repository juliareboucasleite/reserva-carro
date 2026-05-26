import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  api,
  normalizeBaseUrl,
  type Damage,
  type MaintenanceRecord,
  type NotificationItem,
  type Reservation,
  type User,
  type Vehicle,
} from './api';

const STORAGE_KEYS = {
  apiBaseUrl: 'reserva_carro_mobile_api_base_url',
  authToken: 'reserva_carro_mobile_auth_token',
} as const;

const DEFAULT_API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL ?? '');

type AuthCtx = {
  booting: boolean;
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => Promise<void>;
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
};

type DataCtx = {
  loading: boolean;
  vehicles: Vehicle[];
  reservations: Reservation[];
  damages: Damage[];
  maintenance: MaintenanceRecord[];
  notifications: NotificationItem[];
  unreadCount: number;
  refresh: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  createReservation: (payload: {
    vehicle_id: number;
    trip: string;
    start_date: string;
    end_date: string;
  }) => Promise<void>;
  approveReservation: (id: number) => Promise<void>;
  rejectReservation: (id: number) => Promise<void>;
  checkIn: (
    id: number,
    payload: {
      driver: string;
      start_km: string;
      start_notes?: string;
      angleMedia: import('./api').AngleMediaMap;
    },
  ) => Promise<void>;
  checkOut: (
    id: number,
    payload: {
      end_km: string;
      end_notes?: string;
      angleMedia: import('./api').AngleMediaMap;
      damages?: import('./api').DamageDraft[];
    },
  ) => Promise<void>;
  confirmOperational: (id: number, operational: boolean) => Promise<void>;
  setDamageCost: (
    id: number,
    payload: { cost: number; response_message?: string },
  ) => Promise<void>;
  createMaintenance: (payload: {
    vehicle_id: number;
    date: string;
    type: string;
    downtime_days: number;
    notes?: string;
    cost: number;
  }) => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);
const DataContext = createContext<DataCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [booting, setBooting] = useState(true);
  const [apiBaseUrl, setApiBaseUrlState] = useState(DEFAULT_API_BASE_URL);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [storedBaseUrl, storedToken] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEYS.apiBaseUrl),
          SecureStore.getItemAsync(STORAGE_KEYS.authToken),
        ]);
        const resolvedBaseUrl = normalizeBaseUrl(storedBaseUrl || DEFAULT_API_BASE_URL);
        if (resolvedBaseUrl) setApiBaseUrlState(resolvedBaseUrl);
        if (resolvedBaseUrl && storedToken) {
          try {
            const me = await api.me(resolvedBaseUrl, storedToken);
            setToken(storedToken);
            setUser(me.user);
          } catch {
            await SecureStore.deleteItemAsync(STORAGE_KEYS.authToken);
          }
        }
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const setApiBaseUrl = useCallback(async (url: string) => {
    const normalized = normalizeBaseUrl(url);
    await SecureStore.setItemAsync(STORAGE_KEYS.apiBaseUrl, normalized);
    setApiBaseUrlState(normalized);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const payload = await api.login(apiBaseUrl, email, password);
      await SecureStore.setItemAsync(STORAGE_KEYS.authToken, payload.token);
      setToken(payload.token);
      setUser(payload.user);
      return payload.user;
    },
    [apiBaseUrl],
  );

  const logout = useCallback(async () => {
    try {
      if (token && apiBaseUrl) await api.logout(apiBaseUrl, token);
    } catch {
      // ignore
    }
    await SecureStore.deleteItemAsync(STORAGE_KEYS.authToken);
    setToken(null);
    setUser(null);
  }, [apiBaseUrl, token]);

  const value = useMemo<AuthCtx>(
    () => ({ booting, apiBaseUrl, setApiBaseUrl, token, user, login, logout }),
    [booting, apiBaseUrl, setApiBaseUrl, token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { apiBaseUrl, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [damages, setDamages] = useState<Damage[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    if (!apiBaseUrl || !token) return;
    setLoading(true);
    try {
      const [v, r, d, m, n] = await Promise.all([
        api.vehicles(apiBaseUrl, token),
        api.reservations(apiBaseUrl, token),
        api.damages(apiBaseUrl, token).catch(() => []),
        api.maintenance(apiBaseUrl, token).catch(() => []),
        api.notifications(apiBaseUrl, token).catch(() => []),
      ]);
      setVehicles(v);
      setReservations(
        [...r].sort((a, b) => {
          const ad = a.start_date || a.date || '';
          const bd = b.start_date || b.date || '';
          if (ad === bd) return b.id - a.id;
          return ad < bd ? 1 : -1;
        }),
      );
      setDamages(d);
      setMaintenance(m);
      setNotifications(n);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, token]);

  const refreshNotifications = useCallback(async () => {
    if (!apiBaseUrl || !token) return;
    try {
      const next = await api.notifications(apiBaseUrl, token);
      setNotifications(next);
    } catch {
      // ignore
    }
  }, [apiBaseUrl, token]);

  useEffect(() => {
    if (!apiBaseUrl || !token) {
      setVehicles([]);
      setReservations([]);
      setDamages([]);
      setMaintenance([]);
      setNotifications([]);
      return;
    }
    refresh();
  }, [apiBaseUrl, token, refresh]);

  useEffect(() => {
    if (!apiBaseUrl || !token) return;
    pollRef.current = setInterval(refreshNotifications, 30000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [apiBaseUrl, token, refreshNotifications]);

  const createReservation = useCallback<DataCtx['createReservation']>(
    async (payload) => {
      if (!apiBaseUrl || !token) return;
      await api.createReservation(apiBaseUrl, token, payload);
      await refresh();
    },
    [apiBaseUrl, token, refresh],
  );

  const approveReservation = useCallback(
    async (id: number) => {
      if (!apiBaseUrl || !token) return;
      await api.approveReservation(apiBaseUrl, token, id);
      await refresh();
    },
    [apiBaseUrl, token, refresh],
  );

  const rejectReservation = useCallback(
    async (id: number) => {
      if (!apiBaseUrl || !token) return;
      await api.rejectReservation(apiBaseUrl, token, id);
      await refresh();
    },
    [apiBaseUrl, token, refresh],
  );

  const checkIn = useCallback<DataCtx['checkIn']>(
    async (id, payload) => {
      if (!apiBaseUrl || !token) return;
      await api.checkIn(apiBaseUrl, token, id, payload);
      await refresh();
    },
    [apiBaseUrl, token, refresh],
  );

  const checkOut = useCallback<DataCtx['checkOut']>(
    async (id, payload) => {
      if (!apiBaseUrl || !token) return;
      await api.checkOut(apiBaseUrl, token, id, payload);
      for (const damage of payload.damages || []) {
        await api.reportDamage(apiBaseUrl, token, id, damage);
      }
      await refresh();
    },
    [apiBaseUrl, token, refresh],
  );

  const confirmOperational = useCallback(
    async (id: number, operational: boolean) => {
      if (!apiBaseUrl || !token) return;
      await api.confirmOperational(apiBaseUrl, token, id, operational);
      await refresh();
    },
    [apiBaseUrl, token, refresh],
  );

  const setDamageCost = useCallback<DataCtx['setDamageCost']>(
    async (id, payload) => {
      if (!apiBaseUrl || !token) return;
      await api.setDamageCost(apiBaseUrl, token, id, payload);
      await refresh();
    },
    [apiBaseUrl, token, refresh],
  );

  const createMaintenance = useCallback<DataCtx['createMaintenance']>(
    async (payload) => {
      if (!apiBaseUrl || !token) return;
      await api.createMaintenance(apiBaseUrl, token, payload);
      await refresh();
    },
    [apiBaseUrl, token, refresh],
  );

  const markNotificationRead = useCallback(
    async (id: number) => {
      if (!apiBaseUrl || !token) return;
      await api.markNotificationRead(apiBaseUrl, token, id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
    },
    [apiBaseUrl, token],
  );

  const markAllNotificationsRead = useCallback(async () => {
    if (!apiBaseUrl || !token) return;
    await api.markAllNotificationsRead(apiBaseUrl, token);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, [apiBaseUrl, token]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value = useMemo<DataCtx>(
    () => ({
      loading,
      vehicles,
      reservations,
      damages,
      maintenance,
      notifications,
      unreadCount,
      refresh,
      refreshNotifications,
      createReservation,
      approveReservation,
      rejectReservation,
      checkIn,
      checkOut,
      confirmOperational,
      setDamageCost,
      createMaintenance,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      loading,
      vehicles,
      reservations,
      damages,
      maintenance,
      notifications,
      unreadCount,
      refresh,
      refreshNotifications,
      createReservation,
      approveReservation,
      rejectReservation,
      checkIn,
      checkOut,
      confirmOperational,
      setDamageCost,
      createMaintenance,
      markNotificationRead,
      markAllNotificationsRead,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}

export function isManager(role?: Role | string | null) {
  return role === 'manager' || role === 'admin';
}

type Role = 'driver' | 'manager' | 'admin';
