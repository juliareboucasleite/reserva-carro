import type { Vehicle } from '../api';

export type CatalogVehicle = {
  id: number;
  brand: string;
  model: string;
  category: string;
  plate: string;
  seats: number;
  image: string | null;
  base: string | null;
  operational: boolean;
  availability: string;
  transmission: 'manual' | 'auto';
  fuel: string;
  company: string;
  pricePerDay: number;
};

export type SortOption = 'recommended' | 'price_asc' | 'price_desc';

export type VehicleFilters = {
  categories: string[];
  minSeats: number | null;
  bases: string[];
};

export const DEFAULT_FILTERS: VehicleFilters = {
  categories: [],
  minSeats: null,
  bases: [],
};

const FALLBACK: Omit<CatalogVehicle, 'id' | 'pricePerDay'>[] = [
  {
    brand: 'Ford',
    model: 'Trânsit',
    category: 'van',
    plate: '12-AB-34',
    seats: 9,
    image: 'ford-transit.webp',
    base: 'Lisboa',
    operational: true,
    availability: 'available',
    transmission: 'manual',
    fuel: 'Diesel',
    company: 'Reserva Carro',
  },
  {
    brand: 'VW',
    model: 'Transporter',
    category: 'van',
    plate: '45-CD-67',
    seats: 8,
    image: 'vw-transporter.webp',
    base: 'Lisboa',
    operational: true,
    availability: 'available',
    transmission: 'manual',
    fuel: 'Diesel',
    company: 'Reserva Carro',
  },
  {
    brand: 'Opel',
    model: 'Vivaro',
    category: 'van',
    plate: '11-GH-22',
    seats: 9,
    image: 'opel-vivaro.webp',
    base: 'Lisboa',
    operational: true,
    availability: 'available',
    transmission: 'manual',
    fuel: 'Diesel',
    company: 'Reserva Carro',
  },
  {
    brand: 'Opel',
    model: 'Combo',
    category: 'car',
    plate: '33-IJ-44',
    seats: 5,
    image: 'opel-benfica.webp',
    base: 'Coimbra',
    operational: true,
    availability: 'available',
    transmission: 'manual',
    fuel: 'Gasolina',
    company: 'Reserva Carro',
  },
  {
    brand: 'Autocarro',
    model: 'Marcopolo Iveco',
    category: 'bus',
    plate: '55-KL-66',
    seats: 55,
    image: 'marcopolo-iveco.webp',
    base: 'Porto',
    operational: true,
    availability: 'available',
    transmission: 'manual',
    fuel: 'Diesel',
    company: 'Reserva Carro',
  },
  {
    brand: 'Autocarro',
    model: 'MAN',
    category: 'bus',
    plate: '77-MN-88',
    seats: 49,
    image: 'man-bus.webp',
    base: 'Lisboa',
    operational: true,
    availability: 'available',
    transmission: 'manual',
    fuel: 'Diesel',
    company: 'Reserva Carro',
  },
];

export function rentalDays(pickup: Date, returnDate: Date) {
  const ms = returnDate.getTime() - pickup.getTime();
  return Math.max(1, Math.ceil(ms / 86400000));
}

export function estimateDailyRate(vehicle: Pick<CatalogVehicle, 'category' | 'seats'>) {
  if (vehicle.category === 'bus') return 72;
  if (vehicle.category === 'van') return 38;
  return 28 + Math.min(vehicle.seats, 5);
}

export function totalEstimate(vehicle: Pick<CatalogVehicle, 'category' | 'seats'>, days: number) {
  return Math.round(estimateDailyRate(vehicle) * days * 100) / 100;
}

function enrichVehicle(raw: Vehicle, days: number): CatalogVehicle | null {
  if (!raw.operational) return null;
  if (raw.availability && raw.availability !== 'available') return null;

  const category = raw.category || 'van';
  const seats = raw.seats ?? 5;
  const base = {
    id: raw.id,
    brand: raw.brand,
    model: raw.model,
    category,
    plate: raw.plate,
    seats,
    image: raw.image ?? null,
    base: raw.base ?? null,
    operational: raw.operational,
    availability: raw.availability || 'available',
    transmission: 'manual' as const,
    fuel: category === 'bus' || category === 'van' ? 'Diesel' : 'Gasolina',
    company: 'Reserva Carro',
    pricePerDay: estimateDailyRate({ category, seats }),
  };
  return { ...base, pricePerDay: estimateDailyRate({ category, seats }) };
}

export async function fetchCatalogVehicles(apiBaseUrl: string, days: number): Promise<CatalogVehicle[]> {
  if (!apiBaseUrl) {
    return FALLBACK.map((item, index) => ({
      ...item,
      id: index + 1,
      pricePerDay: estimateDailyRate(item),
    }));
  }

  try {
    const response = await fetch(`${apiBaseUrl.replace(/\/+$/, '')}/api/vehicles`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('fetch failed');
    const payload = (await response.json()) as Vehicle[];
    const list = payload
      .map((vehicle) => enrichVehicle(vehicle, days))
      .filter((vehicle): vehicle is CatalogVehicle => vehicle !== null);
    if (list.length > 0) return list;
  } catch {
    // fallback below
  }

  return FALLBACK.map((item, index) => ({
    ...item,
    id: index + 1,
    pricePerDay: estimateDailyRate(item),
  }));
}

export function categoryLabel(category: string, lang: 'pt' | 'en') {
  const mapPt: Record<string, string> = {
    car: 'Económico',
    van: 'Utilitário',
    bus: 'Autocarro',
  };
  const mapEn: Record<string, string> = {
    car: 'Economy',
    van: 'Utility',
    bus: 'Coach',
  };
  return (lang === 'pt' ? mapPt : mapEn)[category] ?? category;
}

export function applyFilters(list: CatalogVehicle[], filters: VehicleFilters) {
  return list.filter((vehicle) => {
    if (filters.categories.length > 0 && !filters.categories.includes(vehicle.category)) {
      return false;
    }
    if (filters.minSeats && vehicle.seats < filters.minSeats) return false;
    if (filters.bases.length > 0 && vehicle.base && !filters.bases.includes(vehicle.base)) {
      return false;
    }
    return true;
  });
}

export function applySort(list: CatalogVehicle[], sort: SortOption) {
  const copy = [...list];
  if (sort === 'price_asc') copy.sort((a, b) => a.pricePerDay - b.pricePerDay);
  if (sort === 'price_desc') copy.sort((a, b) => b.pricePerDay - a.pricePerDay);
  return copy;
}
