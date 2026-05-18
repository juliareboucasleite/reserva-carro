export type Role = 'driver' | 'manager' | 'admin';

export type User = {
  id: number;
  name: string;
  surname?: string | null;
  email: string;
  role: Role;
  team?: string | null;
  phone?: string | null;
};

export type Vehicle = {
  id: number;
  brand: string;
  model: string;
  name?: string | null;
  category?: string | null;
  plate: string;
  seats?: number | null;
  current_km: number;
  operational: boolean;
  image?: string | null;
  base?: string | null;
  next_inspection?: string | null;
  insurance_company?: string | null;
  insurance_type?: string | null;
  insurance_renewal?: string | null;
  responsible?: string | null;
  phone?: string | null;
  availability?: string;
  active_reservation?: {
    id?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    date?: string | null;
    status?: string | null;
    requester_name?: string | null;
    trip?: string | null;
  } | null;
};

export type AngleKey = 'front' | 'back' | 'left' | 'right';

export type ReservationMedia = {
  id: number;
  phase: 'start' | 'end';
  angle?: AngleKey | null;
  url?: string | null;
  mime?: string | null;
  original_name?: string | null;
};

export type ReservationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'checked_in'
  | 'checked_out';

export type Reservation = {
  id: number;
  vehicle_id: number;
  requested_by: number;
  team?: string | null;
  trip: string;
  start_date?: string | null;
  end_date?: string | null;
  date?: string | null;
  status: ReservationStatus;
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

export type MaintenanceRecord = {
  id: number;
  vehicle_id: number;
  date: string;
  type: string;
  downtime_days: number;
  notes?: string | null;
  cost: number;
};

export type Damage = {
  id: number;
  reservation_id: number;
  reservation?: {
    id: number;
    requested_by: number;
    requester?: { id: number; name: string } | null;
    vehicle?: Vehicle | null;
  } | null;
  x: number;
  y: number;
  damage_type: 'scratch' | 'dent' | 'crack' | 'clip';
  severity: 'low' | 'high';
  description?: string | null;
  photo_url?: string | null;
  cost: number | null;
  response_message?: string | null;
  created_at?: string | null;
};

export type NotificationItem = {
  id: number;
  type: string;
  message: string;
  vehicle_id?: number | null;
  reservation_id?: number | null;
  created_at: string;
  read: boolean;
  kind?: string | null;
};

export type MediaAsset = {
  uri: string;
  mimeType: string;
  fileName: string;
  type: 'image' | 'video';
};

export type AngleMediaMap = Partial<Record<AngleKey, MediaAsset>>;

export type DamageDraft = {
  x: number;
  y: number;
  damage_type: Damage['damage_type'];
  severity: Damage['severity'];
  description?: string;
  photo?: MediaAsset | null;
};

export function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

export function buildAssetUrl(baseUrl: string, maybeRelative?: string | null) {
  if (!maybeRelative) return null;
  if (maybeRelative.startsWith('http://') || maybeRelative.startsWith('https://')) {
    return maybeRelative;
  }
  return `${normalizeBaseUrl(baseUrl)}${maybeRelative.startsWith('/') ? '' : '/'}${maybeRelative}`;
}

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

export type RequestOptions = {
  token?: string | null;
  method?: string;
  body?: FormData | Record<string, unknown> | null;
};

export async function apiRequest<T>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' });
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`);

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const url = `${normalizeBaseUrl(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
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
      ? Object.values(apiError.errors).flat().join('\n')
      : '';
    throw new Error(apiError?.message || fieldErrors || `HTTP ${response.status}`);
  }

  return payload as T;
}

export function appendAngleMedia(formData: FormData, angles: AngleMediaMap) {
  (['front', 'back', 'left', 'right'] as const).forEach((angle) => {
    const asset = angles[angle];
    if (!asset) return;
    formData.append(`media[${angle}]`, {
      uri: asset.uri,
      type: asset.mimeType,
      name: asset.fileName,
    } as unknown as Blob);
  });
}

export function appendMediaAsset(formData: FormData, key: string, asset: MediaAsset) {
  formData.append(key, {
    uri: asset.uri,
    type: asset.mimeType,
    name: asset.fileName,
  } as unknown as Blob);
}

export const api = {
  login(baseUrl: string, email: string, password: string) {
    return apiRequest<{ token: string; user: User }>(baseUrl, '/api/auth/mobile/login', {
      body: { email: email.trim(), password },
    });
  },
  me(baseUrl: string, token: string) {
    return apiRequest<{ user: User }>(baseUrl, '/api/auth/me', { token });
  },
  logout(baseUrl: string, token: string) {
    return apiRequest<{ ok: boolean }>(baseUrl, '/api/auth/logout', {
      token,
      body: {},
    });
  },
  vehicles(baseUrl: string, token: string) {
    return apiRequest<Vehicle[]>(baseUrl, '/api/vehicles', { token });
  },
  reservations(baseUrl: string, token: string) {
    return apiRequest<Reservation[]>(baseUrl, '/api/reservations', { token });
  },
  createReservation(
    baseUrl: string,
    token: string,
    payload: { vehicle_id: number; trip: string; start_date: string; end_date: string },
  ) {
    return apiRequest<Reservation>(baseUrl, '/api/reservations', {
      token,
      body: payload,
    });
  },
  approveReservation(baseUrl: string, token: string, id: number) {
    return apiRequest<Reservation>(baseUrl, `/api/reservations/${id}/approve`, {
      token,
      body: {},
    });
  },
  rejectReservation(baseUrl: string, token: string, id: number) {
    return apiRequest<Reservation>(baseUrl, `/api/reservations/${id}/reject`, {
      token,
      body: {},
    });
  },
  checkIn(
    baseUrl: string,
    token: string,
    id: number,
    data: {
      driver: string;
      start_km: string;
      start_notes?: string;
      angleMedia: AngleMediaMap;
    },
  ) {
    const form = new FormData();
    form.append('driver', data.driver);
    form.append('start_km', data.start_km);
    if (data.start_notes) form.append('start_notes', data.start_notes);
    appendAngleMedia(form, data.angleMedia);
    return apiRequest<Reservation>(baseUrl, `/api/reservations/${id}/checkin`, {
      token,
      body: form,
    });
  },
  checkOut(
    baseUrl: string,
    token: string,
    id: number,
    data: {
      end_km: string;
      end_notes?: string;
      angleMedia: AngleMediaMap;
    },
  ) {
    const form = new FormData();
    form.append('end_km', data.end_km);
    if (data.end_notes) form.append('end_notes', data.end_notes);
    appendAngleMedia(form, data.angleMedia);
    return apiRequest<Reservation>(baseUrl, `/api/reservations/${id}/checkout`, {
      token,
      body: form,
    });
  },
  reportDamage(
    baseUrl: string,
    token: string,
    reservationId: number,
    damage: DamageDraft,
  ) {
    const form = new FormData();
    form.append('x', String(damage.x));
    form.append('y', String(damage.y));
    form.append('damage_type', damage.damage_type);
    form.append('severity', damage.severity);
    if (damage.description) form.append('description', damage.description);
    if (damage.photo) appendMediaAsset(form, 'photo', damage.photo);
    return apiRequest<Damage>(baseUrl, `/api/reservations/${reservationId}/damages`, {
      token,
      body: form,
    });
  },
  confirmOperational(
    baseUrl: string,
    token: string,
    id: number,
    operational: boolean,
  ) {
    return apiRequest<Reservation>(
      baseUrl,
      `/api/reservations/${id}/confirm-operational`,
      { token, body: { operational } },
    );
  },
  damages(baseUrl: string, token: string) {
    return apiRequest<Damage[]>(baseUrl, '/api/damages', { token });
  },
  setDamageCost(
    baseUrl: string,
    token: string,
    id: number,
    payload: { cost: number; response_message?: string },
  ) {
    return apiRequest<Damage>(baseUrl, `/api/damages/${id}/cost`, {
      token,
      method: 'PATCH',
      body: payload,
    });
  },
  maintenance(baseUrl: string, token: string) {
    return apiRequest<MaintenanceRecord[]>(baseUrl, '/api/maintenance', { token });
  },
  createMaintenance(
    baseUrl: string,
    token: string,
    payload: {
      vehicle_id: number;
      date: string;
      type: string;
      downtime_days: number;
      notes?: string;
      cost: number;
    },
  ) {
    return apiRequest<MaintenanceRecord>(baseUrl, '/api/maintenance', {
      token,
      body: payload,
    });
  },
  notifications(baseUrl: string, token: string) {
    return apiRequest<NotificationItem[]>(baseUrl, '/api/notifications', { token });
  },
  markNotificationRead(baseUrl: string, token: string, id: number) {
    return apiRequest<{ ok: boolean }>(baseUrl, `/api/notifications/${id}/read`, {
      token,
      body: {},
    });
  },
  markAllNotificationsRead(baseUrl: string, token: string) {
    return apiRequest<{ ok: boolean }>(baseUrl, '/api/notifications/read-all', {
      token,
      body: {},
    });
  },
};
