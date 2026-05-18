import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const STORAGE_KEYS = {
  apiBaseUrl: 'reserva_carro_mobile_api_base_url',
  authToken: 'reserva_carro_mobile_auth_token',
} as const;

const ANGLES = [
  { key: 'front', label: 'Frente' },
  { key: 'right', label: 'Lado direito' },
  { key: 'left', label: 'Lado esquerdo' },
  { key: 'back', label: 'Traseira' },
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  checked_in: 'Em curso',
  checked_out: 'Devolvida',
};

const ROLE_LABELS: Record<string, string> = {
  driver: 'Condutor',
  manager: 'Gestor',
  admin: 'Admin',
};

type AngleKey = (typeof ANGLES)[number]['key'];

type User = {
  id: number;
  name: string;
  surname?: string | null;
  email: string;
  role: 'driver' | 'manager' | 'admin';
  team?: string | null;
  phone?: string | null;
};

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  category?: string | null;
  plate: string;
  current_km: number;
  operational: boolean;
  image?: string | null;
  base?: string | null;
  availability?: string;
  active_reservation?: {
    id?: number | null;
    date?: string | null;
    status?: string | null;
    requester_name?: string | null;
    trip?: string | null;
  } | null;
};

type ReservationMedia = {
  id: number;
  phase: 'start' | 'end';
  angle?: AngleKey | null;
  url?: string | null;
  mime?: string | null;
  original_name?: string | null;
};

type Reservation = {
  id: number;
  vehicle_id: number;
  requested_by: number;
  team?: string | null;
  trip: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'checked_in' | 'checked_out';
  driver?: string | null;
  start_km?: number | null;
  end_km?: number | null;
  start_notes?: string | null;
  end_notes?: string | null;
  operational_confirmed?: boolean | null;
  requester?: {
    id: number;
    name: string;
    team?: string | null;
  } | null;
  vehicle?: Vehicle | null;
  media?: ReservationMedia[];
};

type PhotoAsset = {
  uri: string;
  mimeType: string;
  fileName: string;
};

type PhotoMap = Partial<Record<AngleKey, PhotoAsset>>;

type ActiveTab = 'reservas' | 'viaturas' | 'conta';

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

async function apiRequest<T>(
  baseUrl: string,
  path: string,
  options: {
    token?: string | null;
    method?: string;
    body?: FormData | Record<string, unknown> | null;
  } = {},
): Promise<T> {
  const headers = new Headers({
    Accept: 'application/json',
  });

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const response = await fetch(buildApiUrl(baseUrl, path), {
    method: options.method ?? (options.body ? 'POST' : 'GET'),
    headers,
    body,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? ((await response.json()) as ApiErrorPayload | T)
    : null;

  if (!response.ok) {
    const apiError = payload as ApiErrorPayload | null;
    const fieldErrors = apiError?.errors
      ? Object.values(apiError.errors)
          .flat()
          .join('\n')
      : '';
    throw new Error(apiError?.message || fieldErrors || 'Pedido falhou.');
  }

  return payload as T;
}

function buildApiUrl(baseUrl: string, path: string) {
  const normalized = normalizeBaseUrl(baseUrl);
  return `${normalized}${path.startsWith('/') ? path : `/${path}`}`;
}

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

function resolveAssetUrl(baseUrl: string, maybeRelative?: string | null) {
  if (!maybeRelative) return null;
  if (maybeRelative.startsWith('http://') || maybeRelative.startsWith('https://')) {
    return maybeRelative;
  }
  return `${normalizeBaseUrl(baseUrl)}${maybeRelative.startsWith('/') ? '' : '/'}${maybeRelative}`;
}

function formatKm(value?: number | null) {
  if (value === null || value === undefined) return '—';
  return `${value.toLocaleString('pt-PT')} km`;
}

function vehicleName(vehicle?: Vehicle | null) {
  if (!vehicle) return 'Viatura';
  return `${vehicle.brand} ${vehicle.model}`;
}

function byNewestDate<T extends { date: string; id: number }>(items: T[]) {
  return [...items].sort((a, b) => {
    if (a.date === b.date) return b.id - a.id;
    return a.date < b.date ? 1 : -1;
  });
}

function isManager(role?: string) {
  return role === 'manager' || role === 'admin';
}

function statusTone(status: string) {
  switch (status) {
    case 'approved':
      return styles.badgeApproved;
    case 'checked_in':
      return styles.badgeInProgress;
    case 'checked_out':
      return styles.badgeDone;
    case 'rejected':
      return styles.badgeRejected;
    default:
      return styles.badgePending;
  }
}

async function pickAnglePhoto(angleLabel: string): Promise<PhotoAsset | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permissão necessária', 'É preciso autorizar o uso da câmara.');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    cameraType: ImagePicker.CameraType.back,
    allowsEditing: false,
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    mimeType: asset.mimeType || 'image/jpeg',
    fileName: asset.fileName || `${angleLabel.toLowerCase().replace(/\s+/g, '-')}.jpg`,
  };
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [apiBaseUrlInput, setApiBaseUrlInput] = useState('');

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('reservas');
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);

  const [createReservationOpen, setCreateReservationOpen] = useState(false);
  const [reservationVehicleId, setReservationVehicleId] = useState<number | null>(null);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTrip, setReservationTrip] = useState('');

  const [checkInReservationId, setCheckInReservationId] = useState<number | null>(null);
  const [checkInDriver, setCheckInDriver] = useState('');
  const [checkInKm, setCheckInKm] = useState('');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkInPhotos, setCheckInPhotos] = useState<PhotoMap>({});

  const [checkOutReservationId, setCheckOutReservationId] = useState<number | null>(null);
  const [checkOutKm, setCheckOutKm] = useState('');
  const [checkOutNotes, setCheckOutNotes] = useState('');
  const [checkOutPhotos, setCheckOutPhotos] = useState<PhotoMap>({});

  const selectedReservation = useMemo(
    () => reservations.find((reservation) => reservation.id === selectedReservationId) ?? null,
    [reservations, selectedReservationId],
  );

  const checkInReservation = useMemo(
    () => reservations.find((reservation) => reservation.id === checkInReservationId) ?? null,
    [reservations, checkInReservationId],
  );

  const checkOutReservation = useMemo(
    () => reservations.find((reservation) => reservation.id === checkOutReservationId) ?? null,
    [reservations, checkOutReservationId],
  );

  const createReservationVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === reservationVehicleId) ?? null,
    [vehicles, reservationVehicleId],
  );

  useEffect(() => {
    async function bootstrap() {
      try {
        const [storedBaseUrl, storedToken] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEYS.apiBaseUrl),
          SecureStore.getItemAsync(STORAGE_KEYS.authToken),
        ]);

        if (storedBaseUrl) {
          const normalized = normalizeBaseUrl(storedBaseUrl);
          setApiBaseUrl(normalized);
          setApiBaseUrlInput(normalized);
        }

        if (!storedBaseUrl || !storedToken) return;

        const me = await apiRequest<{ user: User }>(storedBaseUrl, '/mobile/auth/me', {
          token: storedToken,
        });

        setToken(storedToken);
        setUser(me.user);
        await refreshAll(storedBaseUrl, storedToken);
      } catch (error) {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.authToken);
      } finally {
        setBooting(false);
      }
    }

    bootstrap();
  }, []);

  async function refreshAll(baseUrlOverride?: string, tokenOverride?: string) {
    const currentBaseUrl = baseUrlOverride ?? apiBaseUrl;
    const currentToken = tokenOverride ?? token;
    if (!currentBaseUrl || !currentToken) return;

    setSyncing(true);
    try {
      const [vehiclesPayload, reservationsPayload] = await Promise.all([
        apiRequest<Vehicle[]>(currentBaseUrl, '/mobile/vehicles', {
          token: currentToken,
        }),
        apiRequest<Reservation[]>(currentBaseUrl, '/mobile/reservations', {
          token: currentToken,
        }),
      ]);

      setVehicles(vehiclesPayload);
      setReservations(byNewestDate(reservationsPayload));
    } catch (error) {
      Alert.alert('Erro de sincronização', getErrorMessage(error));
    } finally {
      setSyncing(false);
    }
  }

  async function saveApiBaseUrl() {
    const normalized = normalizeBaseUrl(apiBaseUrlInput);
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      Alert.alert('URL inválida', 'Usa um endereço completo, por exemplo http://192.168.1.10:8000.');
      return;
    }

    await SecureStore.setItemAsync(STORAGE_KEYS.apiBaseUrl, normalized);
    setApiBaseUrl(normalized);

    if (token) {
      await refreshAll(normalized, token);
    }
  }

  async function handleLogin() {
    if (!apiBaseUrlInput.trim()) {
      Alert.alert('Falta a API', 'Define primeiro o endereço do backend Laravel.');
      return;
    }

    const normalized = normalizeBaseUrl(apiBaseUrlInput);
    setSubmitting(true);

    try {
      const payload = await apiRequest<{ token: string; user: User }>(normalized, '/mobile/auth/login', {
        body: {
          email: loginEmail.trim(),
          password: loginPassword,
        },
      });

      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.apiBaseUrl, normalized),
        SecureStore.setItemAsync(STORAGE_KEYS.authToken, payload.token),
      ]);

      setApiBaseUrl(normalized);
      setApiBaseUrlInput(normalized);
      setToken(payload.token);
      setUser(payload.user);
      setActiveTab('reservas');

      await refreshAll(normalized, payload.token);
    } catch (error) {
      Alert.alert('Falha no login', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      if (token && apiBaseUrl) {
        await apiRequest<{ ok: boolean }>(apiBaseUrl, '/mobile/auth/logout', {
          token,
          body: {},
        });
      }
    } catch (error) {
      // O token será removido localmente mesmo que o backend falhe.
    } finally {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.authToken);
      setToken(null);
      setUser(null);
      setVehicles([]);
      setReservations([]);
      setSelectedReservationId(null);
    }
  }

  function openReservationComposer(vehicleId?: number) {
    setReservationVehicleId(vehicleId ?? vehicles[0]?.id ?? null);
    setReservationDate(new Date().toISOString().slice(0, 10));
    setReservationTrip('');
    setCreateReservationOpen(true);
  }

  async function createReservation() {
    if (!token || !apiBaseUrl || !reservationVehicleId || !reservationDate || !reservationTrip.trim()) {
      Alert.alert('Dados em falta', 'Escolhe a viatura, a data e o motivo da deslocação.');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest<Reservation>(apiBaseUrl, '/mobile/reservations', {
        token,
        body: {
          vehicle_id: reservationVehicleId,
          date: reservationDate,
          trip: reservationTrip.trim(),
        },
      });
      setCreateReservationOpen(false);
      await refreshAll();
      setActiveTab('reservas');
    } catch (error) {
      Alert.alert('Não foi possível criar a reserva', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function takeCheckInPhoto(angle: AngleKey, label: string) {
    const picked = await pickAnglePhoto(label);
    if (!picked) return;
    setCheckInPhotos((current) => ({ ...current, [angle]: picked }));
  }

  async function takeCheckOutPhoto(angle: AngleKey, label: string) {
    const picked = await pickAnglePhoto(label);
    if (!picked) return;
    setCheckOutPhotos((current) => ({ ...current, [angle]: picked }));
  }

  function buildAngleFormData(photos: PhotoMap) {
    const formData = new FormData();

    for (const angle of ANGLES) {
      const asset = photos[angle.key];
      if (!asset) continue;

      formData.append(`media[${angle.key}]`, {
        uri: asset.uri,
        type: asset.mimeType,
        name: asset.fileName,
      } as any);
    }

    return formData;
  }

  async function submitCheckIn() {
    if (!token || !apiBaseUrl || !checkInReservation) return;
    if (!checkInDriver.trim() || !checkInKm.trim()) {
      Alert.alert('Dados em falta', 'Indica o condutor e os quilómetros iniciais.');
      return;
    }

    const missingAngles = ANGLES.filter((angle) => !checkInPhotos[angle.key]);
    if (missingAngles.length > 0) {
      Alert.alert('Faltam fotos', 'A app exige as 4 fotos: frente, laterais e traseira.');
      return;
    }

    const formData = buildAngleFormData(checkInPhotos);
    formData.append('driver', checkInDriver.trim());
    formData.append('start_km', checkInKm.trim());
    if (checkInNotes.trim()) formData.append('start_notes', checkInNotes.trim());

    setSubmitting(true);
    try {
      await apiRequest<Reservation>(
        apiBaseUrl,
        `/mobile/reservations/${checkInReservation.id}/checkin`,
        {
          token,
          body: formData,
        },
      );
      resetCheckInState();
      await refreshAll();
    } catch (error) {
      Alert.alert('Não foi possível iniciar o levantamento', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCheckOut() {
    if (!token || !apiBaseUrl || !checkOutReservation) return;
    if (!checkOutKm.trim()) {
      Alert.alert('Dados em falta', 'Indica os quilómetros finais.');
      return;
    }

    const missingAngles = ANGLES.filter((angle) => !checkOutPhotos[angle.key]);
    if (missingAngles.length > 0) {
      Alert.alert('Faltam fotos', 'A devolução também exige as 4 fotos do estado final.');
      return;
    }

    const formData = buildAngleFormData(checkOutPhotos);
    formData.append('end_km', checkOutKm.trim());
    if (checkOutNotes.trim()) formData.append('end_notes', checkOutNotes.trim());

    setSubmitting(true);
    try {
      await apiRequest<Reservation>(
        apiBaseUrl,
        `/mobile/reservations/${checkOutReservation.id}/checkout`,
        {
          token,
          body: formData,
        },
      );
      resetCheckOutState();
      await refreshAll();
    } catch (error) {
      Alert.alert('Não foi possível concluir a devolução', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function moderateReservation(reservationId: number, action: 'approve' | 'reject') {
    if (!token || !apiBaseUrl) return;

    setSubmitting(true);
    try {
      await apiRequest<Reservation>(apiBaseUrl, `/mobile/reservations/${reservationId}/${action}`, {
        token,
        body: {},
      });
      await refreshAll();
    } catch (error) {
      Alert.alert('Não foi possível atualizar a reserva', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmOperational(reservationId: number, operational: boolean) {
    if (!token || !apiBaseUrl) return;

    setSubmitting(true);
    try {
      await apiRequest<Reservation>(
        apiBaseUrl,
        `/mobile/reservations/${reservationId}/confirm-operational`,
        {
          token,
          body: { operational },
        },
      );
      await refreshAll();
    } catch (error) {
      Alert.alert('Não foi possível confirmar o estado da viatura', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function startCheckIn(reservation: Reservation) {
    setCheckInReservationId(reservation.id);
    setCheckInDriver(reservation.driver || `${user?.name ?? ''} ${user?.surname ?? ''}`.trim());
    setCheckInKm(String(reservation.vehicle?.current_km ?? ''));
    setCheckInNotes('');
    setCheckInPhotos({});
  }

  function startCheckOut(reservation: Reservation) {
    setCheckOutReservationId(reservation.id);
    setCheckOutKm(String(reservation.vehicle?.current_km ?? reservation.start_km ?? ''));
    setCheckOutNotes('');
    setCheckOutPhotos({});
  }

  function resetCheckInState() {
    setCheckInReservationId(null);
    setCheckInDriver('');
    setCheckInKm('');
    setCheckInNotes('');
    setCheckInPhotos({});
  }

  function resetCheckOutState() {
    setCheckOutReservationId(null);
    setCheckOutKm('');
    setCheckOutNotes('');
    setCheckOutPhotos({});
  }

  if (booting) {
    return (
      <SafeAreaView style={styles.bootContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#16352f" />
        <Text style={styles.bootText}>A preparar a sessão móvel...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      {!user ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.authScroll}>
            <View style={styles.heroCard}>
              <Text style={styles.kicker}>Expo Go</Text>
              <Text style={styles.heroTitle}>Reserva Carro Mobile</Text>
              <Text style={styles.heroCopy}>
                Liga esta app ao teu Laravel local, inicia sessão e usa reservas, viaturas e captação
                de fotos no telemóvel.
              </Text>
            </View>

            <Card title="Backend">
              <FieldLabel>URL base da API</FieldLabel>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                value={apiBaseUrlInput}
                onChangeText={setApiBaseUrlInput}
                placeholder="http://192.168.1.10:8000"
                placeholderTextColor="#6c7c78"
              />
              <Text style={styles.hint}>
                Num telemóvel físico, usa o IP da tua máquina na rede local. `localhost` não funciona no
                dispositivo.
              </Text>
              <Pressable style={styles.secondaryButton} onPress={saveApiBaseUrl}>
                <Text style={styles.secondaryButtonText}>Guardar endereço</Text>
              </Pressable>
            </Card>

            <Card title="Entrar">
              <FieldLabel>Email</FieldLabel>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={loginEmail}
                onChangeText={setLoginEmail}
                placeholder="condutor@empresa.pt"
                placeholderTextColor="#6c7c78"
              />

              <FieldLabel>Palavra-passe</FieldLabel>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={loginPassword}
                onChangeText={setLoginPassword}
                placeholder="••••••••"
                placeholderTextColor="#6c7c78"
              />

              <Pressable
                style={[styles.primaryButton, submitting && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={submitting}
              >
                <Text style={styles.primaryButtonText}>
                  {submitting ? 'A entrar...' : 'Iniciar sessão'}
                </Text>
              </Pressable>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.kicker}>Sessão ativa</Text>
              <Text style={styles.topTitle}>
                {user.name} {user.surname ?? ''}
              </Text>
              <Text style={styles.topMeta}>
                {ROLE_LABELS[user.role] ?? user.role} · {user.team || 'Sem equipa'}
              </Text>
            </View>
            <Pressable style={styles.refreshButton} onPress={() => refreshAll()}>
              <Text style={styles.refreshButtonText}>{syncing ? '...' : 'Atualizar'}</Text>
            </Pressable>
          </View>

          <View style={styles.tabBar}>
            <TabButton
              label="Reservas"
              active={activeTab === 'reservas'}
              onPress={() => setActiveTab('reservas')}
            />
            <TabButton
              label="Viaturas"
              active={activeTab === 'viaturas'}
              onPress={() => setActiveTab('viaturas')}
            />
            <TabButton
              label="Conta"
              active={activeTab === 'conta'}
              onPress={() => setActiveTab('conta')}
            />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {activeTab === 'reservas' && (
              <>
                <Card
                  title="Reservas"
                  action={
                    <Pressable style={styles.inlineAction} onPress={() => openReservationComposer()}>
                      <Text style={styles.inlineActionText}>Nova reserva</Text>
                    </Pressable>
                  }
                >
                  {reservations.length === 0 ? (
                    <Text style={styles.emptyText}>Ainda não há reservas visíveis nesta conta.</Text>
                  ) : (
                    reservations.map((reservation) => (
                      <Pressable
                        key={reservation.id}
                        style={styles.listCard}
                        onPress={() => setSelectedReservationId(reservation.id)}
                      >
                        <View style={styles.listHeader}>
                          <Text style={styles.listTitle}>{vehicleName(reservation.vehicle)}</Text>
                          <View style={[styles.badge, statusTone(reservation.status)]}>
                            <Text style={styles.badgeText}>
                              {STATUS_LABELS[reservation.status] ?? reservation.status}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.listSubtle}>{reservation.trip}</Text>
                        <Text style={styles.listMeta}>
                          {reservation.date} · {reservation.requester?.name || '—'}
                        </Text>

                        <View style={styles.inlineActionsRow}>
                          {reservation.status === 'approved' && reservation.requested_by === user.id && (
                            <ActionChip label="Levantamento" onPress={() => startCheckIn(reservation)} />
                          )}
                          {reservation.status === 'checked_in' && reservation.requested_by === user.id && (
                            <ActionChip label="Devolução" onPress={() => startCheckOut(reservation)} />
                          )}
                          {reservation.status === 'pending' && isManager(user.role) && (
                            <>
                              <ActionChip
                                label="Aprovar"
                                tone="strong"
                                onPress={() => moderateReservation(reservation.id, 'approve')}
                              />
                              <ActionChip
                                label="Rejeitar"
                                tone="danger"
                                onPress={() => moderateReservation(reservation.id, 'reject')}
                              />
                            </>
                          )}
                        </View>
                      </Pressable>
                    ))
                  )}
                </Card>

                {selectedReservation && (
                  <Card
                    title={`Reserva #${selectedReservation.id}`}
                    action={
                      <Pressable
                        style={styles.inlineAction}
                        onPress={() => setSelectedReservationId(null)}
                      >
                        <Text style={styles.inlineActionText}>Fechar</Text>
                      </Pressable>
                    }
                  >
                    <DetailRow label="Viatura" value={vehicleName(selectedReservation.vehicle)} />
                    <DetailRow label="Data" value={selectedReservation.date} />
                    <DetailRow label="Motivo" value={selectedReservation.trip} />
                    <DetailRow
                      label="Condutor"
                      value={selectedReservation.driver || selectedReservation.requester?.name || '—'}
                    />
                    <DetailRow
                      label="Quilómetros"
                      value={`${formatKm(selectedReservation.start_km)} → ${formatKm(selectedReservation.end_km)}`}
                    />

                    <MediaStrip
                      title="Fotos de levantamento"
                      baseUrl={apiBaseUrl}
                      media={(selectedReservation.media || []).filter((item) => item.phase === 'start')}
                    />
                    <MediaStrip
                      title="Fotos de devolução"
                      baseUrl={apiBaseUrl}
                      media={(selectedReservation.media || []).filter((item) => item.phase === 'end')}
                    />

                    {selectedReservation.status === 'checked_out' && isManager(user.role) && (
                      <View style={styles.confirmWrap}>
                        <Text style={styles.sectionCaption}>Estado operacional</Text>
                        <View style={styles.inlineActionsRow}>
                          <ActionChip
                            label="Operacional"
                            tone="strong"
                            onPress={() => confirmOperational(selectedReservation.id, true)}
                          />
                          <ActionChip
                            label="Fora de serviço"
                            tone="danger"
                            onPress={() => confirmOperational(selectedReservation.id, false)}
                          />
                        </View>
                      </View>
                    )}
                  </Card>
                )}
              </>
            )}

            {activeTab === 'viaturas' && (
              <Card title="Viaturas">
                {vehicles.map((vehicle) => (
                  <View key={vehicle.id} style={styles.listCard}>
                    <View style={styles.listHeader}>
                      <Text style={styles.listTitle}>{vehicleName(vehicle)}</Text>
                      <AvailabilityPill availability={vehicle.availability} />
                    </View>
                    <Text style={styles.listSubtle}>{vehicle.plate}</Text>
                    <Text style={styles.listMeta}>
                      {formatKm(vehicle.current_km)} · {vehicle.base || 'Base não definida'}
                    </Text>
                    {vehicle.active_reservation?.date && (
                      <Text style={styles.listMeta}>
                        Reserva ativa: {vehicle.active_reservation.date} ·{' '}
                        {vehicle.active_reservation.requester_name || 'Atribuída'}
                      </Text>
                    )}
                    <View style={styles.inlineActionsRow}>
                      <ActionChip label="Reservar" onPress={() => openReservationComposer(vehicle.id)} />
                    </View>
                  </View>
                ))}
              </Card>
            )}

            {activeTab === 'conta' && (
              <>
                <Card title="Conta">
                  <DetailRow label="Email" value={user.email} />
                  <DetailRow label="Perfil" value={ROLE_LABELS[user.role] ?? user.role} />
                  <DetailRow label="Equipa" value={user.team || '—'} />
                  <DetailRow label="Telefone" value={user.phone || '—'} />
                </Card>

                <Card title="Ligação ao backend">
                  <FieldLabel>URL base</FieldLabel>
                  <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={apiBaseUrlInput}
                    onChangeText={setApiBaseUrlInput}
                    placeholder="http://192.168.1.10:8000"
                    placeholderTextColor="#6c7c78"
                  />
                  <View style={styles.inlineActionsRow}>
                    <ActionChip label="Guardar URL" tone="strong" onPress={saveApiBaseUrl} />
                    <ActionChip label="Terminar sessão" tone="danger" onPress={handleLogout} />
                  </View>
                </Card>
              </>
            )}
          </ScrollView>
        </>
      )}

      <ReservationComposerModal
        open={createReservationOpen}
        vehicle={createReservationVehicle}
        vehicles={vehicles}
        date={reservationDate}
        trip={reservationTrip}
        submitting={submitting}
        selectedVehicleId={reservationVehicleId}
        onClose={() => setCreateReservationOpen(false)}
        onChangeVehicle={setReservationVehicleId}
        onChangeDate={setReservationDate}
        onChangeTrip={setReservationTrip}
        onSubmit={createReservation}
      />

      <AngleCaptureModal
        open={Boolean(checkInReservation)}
        title={checkInReservation ? `Levantamento #${checkInReservation.id}` : 'Levantamento'}
        subtitle={checkInReservation ? vehicleName(checkInReservation.vehicle) : ''}
        kmLabel="Quilómetros iniciais"
        notesLabel="Observações no levantamento"
        driverField
        driverValue={checkInDriver}
        kmValue={checkInKm}
        notesValue={checkInNotes}
        photos={checkInPhotos}
        submitting={submitting}
        onClose={resetCheckInState}
        onChangeDriver={setCheckInDriver}
        onChangeKm={setCheckInKm}
        onChangeNotes={setCheckInNotes}
        onTakePhoto={takeCheckInPhoto}
        onSubmit={submitCheckIn}
      />

      <AngleCaptureModal
        open={Boolean(checkOutReservation)}
        title={checkOutReservation ? `Devolução #${checkOutReservation.id}` : 'Devolução'}
        subtitle={checkOutReservation ? vehicleName(checkOutReservation.vehicle) : ''}
        kmLabel="Quilómetros finais"
        notesLabel="Observações na devolução"
        driverField={false}
        driverValue=""
        kmValue={checkOutKm}
        notesValue={checkOutNotes}
        photos={checkOutPhotos}
        submitting={submitting}
        onClose={resetCheckOutState}
        onChangeDriver={() => undefined}
        onChangeKm={setCheckOutKm}
        onChangeNotes={setCheckOutNotes}
        onTakePhoto={takeCheckOutPhoto}
        onSubmit={submitCheckOut}
      />
    </SafeAreaView>
  );
}

function ReservationComposerModal({
  open,
  vehicle,
  vehicles,
  date,
  trip,
  submitting,
  selectedVehicleId,
  onClose,
  onChangeVehicle,
  onChangeDate,
  onChangeTrip,
  onSubmit,
}: {
  open: boolean;
  vehicle: Vehicle | null;
  vehicles: Vehicle[];
  date: string;
  trip: string;
  submitting: boolean;
  selectedVehicleId: number | null;
  onClose: () => void;
  onChangeVehicle: (value: number | null) => void;
  onChangeDate: (value: string) => void;
  onChangeTrip: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Nova reserva</Text>
          <Text style={styles.modalSubtitle}>
            {vehicle ? `${vehicleName(vehicle)} · ${vehicle.plate}` : 'Escolhe a viatura'}
          </Text>

          <FieldLabel>Viatura</FieldLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroller}>
            {vehicles.map((item) => (
              <Pressable
                key={item.id}
                style={[
                  styles.choiceChip,
                  selectedVehicleId === item.id && styles.choiceChipActive,
                ]}
                onPress={() => onChangeVehicle(item.id)}
              >
                <Text
                  style={[
                    styles.choiceChipText,
                    selectedVehicleId === item.id && styles.choiceChipTextActive,
                  ]}
                >
                  {vehicleName(item)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <FieldLabel>Data</FieldLabel>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={onChangeDate}
            placeholder="2026-05-18"
            placeholderTextColor="#6c7c78"
          />

          <FieldLabel>Motivo da deslocação</FieldLabel>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={trip}
            onChangeText={onChangeTrip}
            placeholder="Ex.: Obra em Sintra / distribuição / recolha"
            placeholderTextColor="#6c7c78"
            multiline
          />

          <View style={styles.modalActions}>
            <Pressable style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, submitting && styles.buttonDisabled]}
              onPress={onSubmit}
              disabled={submitting}
            >
              <Text style={styles.primaryButtonText}>
                {submitting ? 'A guardar...' : 'Criar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AngleCaptureModal({
  open,
  title,
  subtitle,
  kmLabel,
  notesLabel,
  driverField,
  driverValue,
  kmValue,
  notesValue,
  photos,
  submitting,
  onClose,
  onChangeDriver,
  onChangeKm,
  onChangeNotes,
  onTakePhoto,
  onSubmit,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  kmLabel: string;
  notesLabel: string;
  driverField: boolean;
  driverValue: string;
  kmValue: string;
  notesValue: string;
  photos: PhotoMap;
  submitting: boolean;
  onClose: () => void;
  onChangeDriver: (value: string) => void;
  onChangeKm: (value: string) => void;
  onChangeNotes: (value: string) => void;
  onTakePhoto: (angle: AngleKey, label: string) => Promise<void>;
  onSubmit: () => void;
}) {
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <ScrollView contentContainerStyle={styles.modalScrollWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalSubtitle}>{subtitle}</Text>

            {driverField && (
              <>
                <FieldLabel>Condutor</FieldLabel>
                <TextInput
                  style={styles.input}
                  value={driverValue}
                  onChangeText={onChangeDriver}
                  placeholder="Nome do condutor"
                  placeholderTextColor="#6c7c78"
                />
              </>
            )}

            <FieldLabel>{kmLabel}</FieldLabel>
            <TextInput
              style={styles.input}
              value={kmValue}
              onChangeText={onChangeKm}
              keyboardType="numeric"
              placeholder="123450"
              placeholderTextColor="#6c7c78"
            />

            <FieldLabel>{notesLabel}</FieldLabel>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={notesValue}
              onChangeText={onChangeNotes}
              multiline
              placeholder="Anota danos, sujidade, equipamento em falta ou outros detalhes."
              placeholderTextColor="#6c7c78"
            />

            <Text style={styles.sectionCaption}>Captação por ângulo</Text>
            {ANGLES.map((angle) => (
              <View key={angle.key} style={styles.angleRow}>
                <View style={styles.angleCopy}>
                  <Text style={styles.angleLabel}>{angle.label}</Text>
                  <Text style={styles.angleHint}>
                    {photos[angle.key] ? 'Foto capturada' : 'Obrigatória'}
                  </Text>
                </View>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => onTakePhoto(angle.key, angle.label)}
                >
                  <Text style={styles.secondaryButtonText}>
                    {photos[angle.key] ? 'Refazer' : 'Fotografar'}
                  </Text>
                </Pressable>
              </View>
            ))}

            <View style={styles.previewGrid}>
              {ANGLES.map((angle) => {
                const photo = photos[angle.key];
                return (
                  <View key={angle.key} style={styles.previewCard}>
                    <Text style={styles.previewLabel}>{angle.label}</Text>
                    {photo ? (
                      <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                    ) : (
                      <View style={styles.previewPlaceholder}>
                        <Text style={styles.previewPlaceholderText}>Sem foto</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryButton} onPress={onClose}>
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, submitting && styles.buttonDisabled]}
                onPress={onSubmit}
                disabled={submitting}
              >
                <Text style={styles.primaryButtonText}>
                  {submitting ? 'A enviar...' : 'Enviar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function MediaStrip({
  title,
  baseUrl,
  media,
}: {
  title: string;
  baseUrl: string;
  media: ReservationMedia[];
}) {
  return (
    <View style={styles.mediaSection}>
      <Text style={styles.sectionCaption}>{title}</Text>
      {media.length === 0 ? (
        <Text style={styles.emptyText}>Sem ficheiros enviados nesta fase.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {media.map((item) => {
            const uri = resolveAssetUrl(baseUrl, item.url);
            return (
              <View key={item.id} style={styles.mediaCard}>
                <Text style={styles.previewLabel}>{item.angle || 'ficheiro'}</Text>
                {uri ? (
                  <Image source={{ uri }} style={styles.mediaImage} />
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <Text style={styles.previewPlaceholderText}>Sem URL</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ActionChip({
  label,
  tone = 'default',
  onPress,
}: {
  label: string;
  tone?: 'default' | 'strong' | 'danger';
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.actionChip,
        tone === 'strong' && styles.actionChipStrong,
        tone === 'danger' && styles.actionChipDanger,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.actionChipText,
          tone === 'strong' && styles.actionChipTextStrong,
          tone === 'danger' && styles.actionChipTextDanger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function AvailabilityPill({ availability }: { availability?: string }) {
  const label =
    availability === 'available'
      ? 'Disponível'
      : availability === 'reserved'
        ? 'Reservada'
        : availability === 'in_use'
          ? 'Em uso'
          : 'Inoperacional';

  return (
    <View
      style={[
        styles.badge,
        availability === 'available'
          ? styles.badgeApproved
          : availability === 'reserved'
            ? styles.badgePending
            : availability === 'in_use'
              ? styles.badgeInProgress
              : styles.badgeRejected,
      ]}
    >
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f3efe6',
  },
  flex: {
    flex: 1,
  },
  bootContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3efe6',
    gap: 16,
  },
  bootText: {
    color: '#16352f',
    fontSize: 15,
  },
  authScroll: {
    padding: 20,
    gap: 18,
  },
  heroCard: {
    backgroundColor: '#16352f',
    borderRadius: 24,
    padding: 24,
    gap: 10,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#8fa69e',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f7f3eb',
  },
  heroCopy: {
    fontSize: 15,
    lineHeight: 22,
    color: '#dae2de',
  },
  topBar: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd2c4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f5ef',
  },
  topTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16352f',
  },
  topMeta: {
    marginTop: 2,
    color: '#5a6b66',
    fontSize: 14,
  },
  refreshButton: {
    backgroundColor: '#e8dfd1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  refreshButtonText: {
    color: '#16352f',
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#ede5d8',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#16352f',
  },
  tabButtonText: {
    color: '#28443d',
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#f8f5ef',
  },
  content: {
    padding: 18,
    gap: 16,
  },
  card: {
    backgroundColor: '#fcfaf6',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e6ddcf',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#17362f',
  },
  inlineAction: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#e8dfd1',
  },
  inlineActionText: {
    color: '#16352f',
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38504a',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cfbfab',
    borderRadius: 16,
    backgroundColor: '#fffdf8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#15322b',
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  hint: {
    marginTop: 8,
    color: '#6c7c78',
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: '#16352f',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#f7f3eb',
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#ebe2d5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#16352f',
    fontWeight: '800',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  listCard: {
    borderWidth: 1,
    borderColor: '#e6ddcf',
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
    backgroundColor: '#fffaf1',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  listTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#17362f',
  },
  listSubtle: {
    marginTop: 4,
    color: '#425853',
    fontSize: 14,
  },
  listMeta: {
    marginTop: 4,
    color: '#6c7c78',
    fontSize: 13,
  },
  inlineActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  actionChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#ebe2d5',
  },
  actionChipStrong: {
    backgroundColor: '#17362f',
  },
  actionChipDanger: {
    backgroundColor: '#f1d5d0',
  },
  actionChipText: {
    color: '#17362f',
    fontWeight: '800',
  },
  actionChipTextStrong: {
    color: '#f8f5ef',
  },
  actionChipTextDanger: {
    color: '#8d2c1f',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgePending: {
    backgroundColor: '#ece0bd',
  },
  badgeApproved: {
    backgroundColor: '#cfe4d9',
  },
  badgeInProgress: {
    backgroundColor: '#c9dceb',
  },
  badgeDone: {
    backgroundColor: '#d8e7cf',
  },
  badgeRejected: {
    backgroundColor: '#efd1cb',
  },
  badgeText: {
    color: '#17362f',
    fontWeight: '800',
    fontSize: 12,
  },
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#efe8dc',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    color: '#75857f',
  },
  detailValue: {
    marginTop: 4,
    color: '#17362f',
    fontSize: 15,
  },
  mediaSection: {
    marginTop: 16,
  },
  sectionCaption: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#5f746e',
    marginBottom: 10,
  },
  mediaCard: {
    width: 126,
    marginRight: 12,
  },
  mediaImage: {
    width: 126,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#ddd',
  },
  emptyText: {
    color: '#6c7c78',
    fontSize: 14,
  },
  confirmWrap: {
    marginTop: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 28, 24, 0.42)',
    justifyContent: 'flex-end',
  },
  modalScrollWrap: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fcfaf6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '92%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#17362f',
  },
  modalSubtitle: {
    marginTop: 4,
    marginBottom: 12,
    color: '#6c7c78',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  chipScroller: {
    gap: 8,
    paddingBottom: 8,
  },
  choiceChip: {
    backgroundColor: '#ece4d7',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  choiceChipActive: {
    backgroundColor: '#16352f',
  },
  choiceChipText: {
    color: '#17362f',
    fontWeight: '700',
  },
  choiceChipTextActive: {
    color: '#f8f5ef',
  },
  angleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#efe8dc',
  },
  angleCopy: {
    flex: 1,
  },
  angleLabel: {
    color: '#17362f',
    fontWeight: '800',
    fontSize: 15,
  },
  angleHint: {
    marginTop: 2,
    color: '#6c7c78',
    fontSize: 12,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  previewCard: {
    width: '47%',
  },
  previewLabel: {
    marginBottom: 6,
    color: '#4f655f',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  previewImage: {
    width: '100%',
    height: 116,
    borderRadius: 16,
  },
  previewPlaceholder: {
    width: '100%',
    height: 116,
    borderRadius: 16,
    backgroundColor: '#ece4d7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPlaceholderText: {
    color: '#7b8a85',
    fontWeight: '700',
  },
});
