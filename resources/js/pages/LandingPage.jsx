import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useData } from '../contexts/DataContext';
import { CarIcon, GaugeIcon, PhoneIcon, PinIcon, SeatIcon } from '../components/Icons';
import VehicleMedia from '../components/VehicleMedia';
import { estimateRoute, searchLocations } from '../services/locationService';
import heroBackground from '../../img/carros/suv-japones-hero.webp';

const LOCATION_OPTIONS = [
    'Lisboa',
    'Porto',
    'Faro',
    'Coimbra',
    'Braga',
    'Aveiro',
    'Setúbal',
    'Viseu',
];

const RESIDENCE_OPTIONS = ['Portugal', 'Espanha', 'França', 'Alemanha', 'Reino Unido'];

const WEEKDAY_LABELS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
const MONTH_LABELS = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
];
const MONTH_SHORT_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const TIME_GROUPS = [
    {
        label: 'Manhã',
        options: ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
    },
    {
        label: 'Tarde',
        options: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'],
    },
    {
        label: 'Noite',
        options: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'],
    },
];

function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDateInput(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function formatFieldDate(value) {
    const date = parseDateInput(value);
    return `${MONTH_SHORT_LABELS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatMonthTitle(date) {
    return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

function monthStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthGrid(baseDate) {
    const first = monthStart(baseDate);
    const offset = (first.getDay() + 6) % 7;
    const cursor = addDays(first, -offset);

    return Array.from({ length: 35 }, (_, index) => {
        const date = addDays(cursor, index);
        return {
            date,
            inMonth: date.getMonth() === baseDate.getMonth(),
        };
    });
}

const OFFER_PRESETS = {
    'ford transit': {
        categoryLabel: 'Furgão',
        supplier: 'Europcar',
        pickupMode: 'Aeroporto (Shuttle)',
        features: ['Ar Condicionado', 'Diesel', 'Manual', '4 Portas'],
        protections: ['Seguro de Responsabilidade Civil', 'Proteção do Veículo e Contra Roubo'],
        included: ['Condutor Adicional'],
        payment: 'Pague no levantamento',
        price: 48.5,
        cashback: 6.4,
        rating: '8.7',
        luggage: 7,
    },
    'vw transporter': {
        categoryLabel: 'Minivan',
        supplier: 'Sixt',
        pickupMode: 'Aeroporto (Balcão)',
        features: ['Ar Condicionado', 'Diesel', 'Manual', '4 Portas'],
        protections: ['Seguro de Responsabilidade Civil', 'Proteção Contra Roubo'],
        included: ['Condutor Adicional'],
        payment: 'Pague agora',
        price: 44.2,
        cashback: 5.8,
        rating: '8.3',
        luggage: 6,
    },
    'mitsubishi l400': {
        categoryLabel: 'Furgão',
        supplier: 'Record Go',
        pickupMode: 'Aeroporto (Meet & Greet)',
        features: ['Diesel', 'Manual', '4 Portas'],
        protections: ['Seguro de Responsabilidade Civil', 'Proteção Contra Roubo'],
        included: ['Condutor Adicional'],
        payment: 'Pague no levantamento',
        price: 32.9,
        cashback: 4.1,
        rating: '7.9',
        luggage: 5,
    },
    'opel vivaro': {
        categoryLabel: 'Minivan',
        supplier: 'Drive4Move',
        pickupMode: 'Aeroporto (Autoatendimento)',
        features: ['Ar Condicionado', 'Diesel', 'Manual', '4 Portas'],
        protections: ['Seguro de Responsabilidade Civil', 'Proteção do Veículo e Contra Roubo'],
        included: ['Condutor Adicional'],
        payment: 'Pague agora',
        price: 39.6,
        cashback: 5.2,
        rating: '8.0',
        luggage: 6,
    },
    'opel benfica': {
        categoryLabel: 'Especial',
        supplier: 'Goldcar',
        pickupMode: 'Cidade',
        features: ['Ar Condicionado', 'Manual', '4 Portas', 'Gasolina'],
        protections: ['Seguro de Responsabilidade Civil'],
        included: ['Condutor Adicional'],
        payment: 'Pague agora',
        price: 22.7,
        cashback: 3.7,
        rating: '7.5',
        luggage: 4,
    },
    'autocarro marcopolo iveco': {
        categoryLabel: 'Especial',
        supplier: 'Autounion',
        pickupMode: 'Cidade',
        features: ['Ar Condicionado', 'Diesel', 'Manual'],
        protections: ['Seguro de Responsabilidade Civil', 'Serviço de Assistência Premium'],
        included: ['Condutor Adicional'],
        payment: 'Pague no levantamento',
        price: 96.4,
        cashback: 12.4,
        rating: '8.8',
        luggage: 14,
    },
    'autocarro man': {
        categoryLabel: 'Especial',
        supplier: 'Klass Wagen',
        pickupMode: 'Cidade',
        features: ['Ar Condicionado', 'Diesel', 'Manual'],
        protections: ['Seguro de Responsabilidade Civil', 'Serviço de Assistência Premium'],
        included: ['Condutor Adicional'],
        payment: 'Pague no levantamento',
        price: 104.9,
        cashback: 13.8,
        rating: '9.0',
        luggage: 16,
    },
};

function formatEuro(value) {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(value);
}

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function getOfferPreset(vehicle) {
    return OFFER_PRESETS[normalizeText(vehicle.name)] || {
        categoryLabel: vehicle.category === 'bus' ? 'Especial' : vehicle.category === 'van' ? 'Furgão' : 'Compacto',
        supplier: 'Rent a Star',
        pickupMode: 'Cidade',
        features: ['Ar Condicionado', 'Manual'],
        protections: ['Seguro de Responsabilidade Civil'],
        included: ['Condutor Adicional'],
        payment: 'Pague agora',
        price: 29.9,
        cashback: 3.9,
        rating: '8.0',
        luggage: Math.max(2, Math.ceil((vehicle.seats || 4) / 2)),
    };
}

function buildSearchOffer(vehicle, routeData, pickupLocation, returnLocation) {
    const preset = getOfferPreset(vehicle);
    const distanceExtra = routeData?.distance_km ? Math.min(routeData.distance_km * 0.12, 22) : 0;
    const computedPrice = Number((preset.price + distanceExtra).toFixed(2));

    return {
        id: vehicle.id,
        vehicle,
        title: vehicle.name,
        subtitle: `ou ${preset.categoryLabel} semelhante`,
        categoryLabel: preset.categoryLabel,
        supplier: preset.supplier,
        pickupMode: preset.pickupMode,
        features: preset.features,
        protections: preset.protections,
        included: preset.included,
        payment: preset.payment,
        price: computedPrice,
        cashback: preset.cashback,
        rating: preset.rating,
        luggage: preset.luggage,
        transmission: preset.features.includes('Automático') ? 'Automático' : 'Manual',
        mileageLabel: 'Quilometragem ilimitada',
        fuelLabel: preset.features.includes('Elétrico')
            ? 'Elétrico'
            : preset.features.includes('Híbrido')
            ? 'Híbrido'
            : preset.features.includes('Diesel')
            ? 'Diesel'
            : 'Gasolina',
        pickupLabel: pickupLocation || vehicle.base || 'Portugal',
        dropoffLabel: returnLocation || pickupLocation || vehicle.base || 'Portugal',
    };
}

export default function LandingPage({ onGoToLogin }) {
    const { t, lang, setLang } = useI18n();
    const { vehicles } = useData();
    const widgetRef = useRef(null);
    const resultsRef = useRef(null);

    const today = useMemo(() => new Date(), []);
    const tomorrow = useMemo(() => addDays(today, 1), [today]);

    const [pickupLocation, setPickupLocation] = useState('');
    const [returnLocation, setReturnLocation] = useState('');
    const [pickupLocationData, setPickupLocationData] = useState(null);
    const [returnLocationData, setReturnLocationData] = useState(null);
    const [locationOptions, setLocationOptions] = useState([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const [routeData, setRouteData] = useState(null);
    const [routeLoading, setRouteLoading] = useState(false);
    const [pickupDate, setPickupDate] = useState(formatDateInput(today));
    const [returnDate, setReturnDate] = useState(formatDateInput(tomorrow));
    const [pickupTime, setPickupTime] = useState('10:00');
    const [returnTime, setReturnTime] = useState('10:00');
    const [residence, setResidence] = useState('Portugal');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [selectedPickupModes, setSelectedPickupModes] = useState([]);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [sortOrder, setSortOrder] = useState('recommended');
    const [activePanel, setActivePanel] = useState(null);
    const [calendarMonth, setCalendarMonth] = useState(monthStart(today));

    useEffect(() => {
        function handlePointerDown(event) {
            if (widgetRef.current && !widgetRef.current.contains(event.target)) {
                setActivePanel(null);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, []);

    useEffect(() => {
        if (activePanel !== 'pickupLocation' && activePanel !== 'returnLocation') return;

        const source = activePanel === 'returnLocation' ? returnLocation : pickupLocation;
        let cancelled = false;

        const timeoutId = window.setTimeout(async () => {
            setLocationLoading(true);
            try {
                const response = await searchLocations(source, 'all');
                if (!cancelled) {
                    setLocationOptions(response.options || []);
                }
            } catch (error) {
                if (!cancelled) {
                    setLocationOptions([]);
                }
            } finally {
                if (!cancelled) {
                    setLocationLoading(false);
                }
            }
        }, 180);

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [activePanel, pickupLocation, returnLocation]);

    const matchingLocations = useMemo(() => locationOptions, [locationOptions]);

    const offers = useMemo(() => {
        return vehicles.map((vehicle) =>
            buildSearchOffer(
                vehicle,
                routeData,
                pickupLocationData?.label || pickupLocation,
                returnLocationData?.label || returnLocation
            )
        );
    }, [vehicles, routeData, pickupLocationData, pickupLocation, returnLocationData, returnLocation]);

    const categoryOptions = useMemo(() => {
        const groups = new Map();
        offers.forEach((offer) => {
            const current = groups.get(offer.categoryLabel) || {
                label: offer.categoryLabel,
                count: 0,
                minPrice: offer.price,
            };
            current.count += 1;
            current.minPrice = Math.min(current.minPrice, offer.price);
            groups.set(offer.categoryLabel, current);
        });
        return [...groups.values()].sort((a, b) => a.minPrice - b.minPrice);
    }, [offers]);

    const supplierOptions = useMemo(() => {
        const groups = new Map();
        offers.forEach((offer) => {
            const current = groups.get(offer.supplier) || {
                label: offer.supplier,
                count: 0,
                minPrice: offer.price,
            };
            current.count += 1;
            current.minPrice = Math.min(current.minPrice, offer.price);
            groups.set(offer.supplier, current);
        });
        return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
    }, [offers]);

    const pickupModeOptions = useMemo(() => {
        const groups = new Map();
        offers.forEach((offer) => {
            const current = groups.get(offer.pickupMode) || { label: offer.pickupMode, count: 0 };
            current.count += 1;
            groups.set(offer.pickupMode, current);
        });
        return [...groups.values()];
    }, [offers]);

    const featureOptions = useMemo(() => {
        const groups = new Map();
        offers.forEach((offer) => {
            offer.features.forEach((feature) => {
                groups.set(feature, (groups.get(feature) || 0) + 1);
            });
        });
        return [...groups.entries()].map(([label, count]) => ({ label, count }));
    }, [offers]);

    const minAvailablePrice = useMemo(
        () => (offers.length ? Math.floor(Math.min(...offers.map((offer) => offer.price))) : 0),
        [offers]
    );
    const maxAvailablePrice = useMemo(
        () => (offers.length ? Math.ceil(Math.max(...offers.map((offer) => offer.price))) : 0),
        [offers]
    );

    useEffect(() => {
        if (offers.length === 0) return;
        if (priceMin === '') setPriceMin(String(minAvailablePrice));
        if (priceMax === '') setPriceMax(String(maxAvailablePrice));
    }, [offers, priceMin, priceMax, minAvailablePrice, maxAvailablePrice]);

    const filteredOffers = useMemo(() => {
        let result = offers.filter((offer) => {
            if (statusFilter === 'available' && offer.vehicle.availability === 'inoperational') return false;
            if (selectedCategories.length && !selectedCategories.includes(offer.categoryLabel)) return false;
            if (selectedSuppliers.length && !selectedSuppliers.includes(offer.supplier)) return false;
            if (selectedPickupModes.length && !selectedPickupModes.includes(offer.pickupMode)) return false;
            if (selectedFeatures.length && !selectedFeatures.every((feature) => offer.features.includes(feature))) return false;
            if (priceMin !== '' && offer.price < Number(priceMin)) return false;
            if (priceMax !== '' && offer.price > Number(priceMax)) return false;
            return true;
        });

        if (sortOrder === 'price_asc') {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'price_desc') {
            result = [...result].sort((a, b) => b.price - a.price);
        } else if (sortOrder === 'rating') {
            result = [...result].sort((a, b) => Number(b.rating) - Number(a.rating));
        } else {
            result = [...result].sort((a, b) => a.price - b.price || Number(b.rating) - Number(a.rating));
        }

        return result;
    }, [
        offers,
        statusFilter,
        selectedCategories,
        selectedSuppliers,
        selectedPickupModes,
        selectedFeatures,
        priceMin,
        priceMax,
        sortOrder,
    ]);

    const activeFilterTags = [
        ...selectedCategories.map((value) => ({ type: 'category', value })),
        ...selectedSuppliers.map((value) => ({ type: 'supplier', value })),
        ...selectedPickupModes.map((value) => ({ type: 'pickup', value })),
        ...selectedFeatures.map((value) => ({ type: 'feature', value })),
    ];

    const searchSummary = [
        pickupLocation ? `Levantamento: ${pickupLocation}` : null,
        returnLocation ? `Devolução: ${returnLocation}` : null,
        `${formatFieldDate(pickupDate)} ${pickupTime} → ${formatFieldDate(returnDate)} ${returnTime}`,
        `Residência: ${residence}`,
    ]
        .filter(Boolean)
        .join(' · ');

    function openDatePanel(panel) {
        setActivePanel(panel);
        setCalendarMonth(monthStart(parseDateInput(panel === 'pickupDate' ? pickupDate : returnDate)));
    }

    function updateDate(panel, value) {
        const selected = parseDateInput(value);

        if (panel === 'pickupDate') {
            setPickupDate(value);

            if (selected >= parseDateInput(returnDate)) {
                setReturnDate(formatDateInput(addDays(selected, 1)));
            }
        } else {
            if (selected <= parseDateInput(pickupDate)) {
                setReturnDate(formatDateInput(addDays(parseDateInput(pickupDate), 1)));
            } else {
                setReturnDate(value);
            }
        }

        setActivePanel(null);
    }

    function updateTime(panel, value) {
        if (panel === 'pickupTime') setPickupTime(value);
        if (panel === 'returnTime') setReturnTime(value);
        setActivePanel(null);
    }

    function handleLocationInput(panel, value) {
        if (panel === 'pickupLocation') {
            setPickupLocation(value);
            setPickupLocationData(null);
        }

        if (panel === 'returnLocation') {
            setReturnLocation(value);
            setReturnLocationData(null);
        }

        setRouteData(null);
    }

    function chooseLocation(panel, option) {
        if (panel === 'pickupLocation') {
            setPickupLocation(option.label);
            setPickupLocationData(option);
        }

        if (panel === 'returnLocation') {
            setReturnLocation(option.label);
            setReturnLocationData(option);
        }

        setActivePanel(null);
    }

    async function triggerSearch() {
        setActivePanel(null);

        if (pickupLocationData && returnLocationData) {
            setRouteLoading(true);
            try {
                const response = await estimateRoute(pickupLocationData, returnLocationData);
                setRouteData(response.route || null);
            } catch (error) {
                setRouteData(null);
            } finally {
                setRouteLoading(false);
            }
        } else {
            setRouteData(null);
        }

        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function toggleFilterValue(setter, value) {
        setter((current) =>
            current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
        );
    }

    function clearSearchFilters() {
        setSelectedCategories([]);
        setSelectedSuppliers([]);
        setSelectedPickupModes([]);
        setSelectedFeatures([]);
        setPriceMin(String(minAvailablePrice));
        setPriceMax(String(maxAvailablePrice));
        setSortOrder('recommended');
        setStatusFilter('all');
    }

    return (
        <div className="min-h-screen bg-paper text-ink">
            <section className="relative overflow-visible">
                <div className="absolute inset-0">
                    <img
                        src={heroBackground}
                        alt="SUV em estrada de montanha"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.55),rgba(15,23,42,0.78))]" />
                </div>

                <header className="relative z-30">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-white">
                        <a href="#top" className="flex items-center gap-3" aria-label="Início">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 backdrop-blur">
                                <CarIcon className="h-5 w-5" />
                            </span>
                            <span className="text-lg font-semibold tracking-tight">ReservaCarro</span>
                        </a>

                        <div className="flex items-center gap-4">
                            <LangSwitch lang={lang} setLang={setLang} light />
                            <button
                                onClick={onGoToLogin}
                                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/16"
                            >
                                {t.landing.navLogin}
                            </button>
                        </div>
                    </div>
                </header>

                <div id="top" className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-8 md:pb-28 md:pt-10">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                            {t.landing.heroBadge}
                        </p>
                        <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
                            Reserve a viatura certa sem sair da sua equipa.
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-white/78 md:text-lg">
                            Pesquisa rápida por local, datas e horário, com uma experiência mais
                            próxima de um motor de reservas moderno.
                        </p>
                    </div>

                    <div
                        ref={widgetRef}
                        className="relative z-20 mt-10 overflow-visible rounded-[28px] bg-white p-5 shadow-[0_22px_80px_rgba(15,23,42,0.22)] md:p-6"
                    >
                        <div className="grid gap-3 lg:grid-cols-[1.35fr_1.35fr_1.3fr_1.3fr_0.85fr]">
                            <div className="relative">
                                <SearchSlot
                                    label="Levantamento"
                                    icon={<PinMiniIcon />}
                                    active={activePanel === 'pickupLocation'}
                                >
                                    <input
                                        value={pickupLocation}
                                        onChange={(event) =>
                                            handleLocationInput('pickupLocation', event.target.value)
                                        }
                                        onFocus={() => setActivePanel('pickupLocation')}
                                        placeholder="Pesquisar destinos"
                                        className="w-full bg-transparent text-[0.95rem] font-medium text-ink outline-none placeholder:text-slate-300"
                                    />
                                </SearchSlot>
                                {activePanel === 'pickupLocation' && (
                                    <LocationPanel
                                        options={matchingLocations}
                                        loading={locationLoading}
                                        onSelect={(value) => chooseLocation('pickupLocation', value)}
                                    />
                                )}
                            </div>

                            <div className="relative">
                                <SearchSlot
                                    label="Devolução"
                                    icon={<PinMiniIcon />}
                                    active={activePanel === 'returnLocation'}
                                    trailing={
                                        returnLocation ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setReturnLocation('');
                                                    setReturnLocationData(null);
                                                    setRouteData(null);
                                                }}
                                                className="rounded-full bg-slate-500 text-white"
                                            >
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M6.28 5.22a.75.75 0 1 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                                                </svg>
                                            </button>
                                        ) : null
                                    }
                                >
                                    <input
                                        value={returnLocation}
                                        onChange={(event) =>
                                            handleLocationInput('returnLocation', event.target.value)
                                        }
                                        onFocus={() => setActivePanel('returnLocation')}
                                        placeholder="Pesquisar destinos"
                                        className="w-full bg-transparent text-[0.95rem] font-medium text-ink outline-none placeholder:text-slate-300"
                                    />
                                </SearchSlot>
                                {activePanel === 'returnLocation' && (
                                    <LocationPanel
                                        options={matchingLocations}
                                        loading={locationLoading}
                                        onSelect={(value) => chooseLocation('returnLocation', value)}
                                    />
                                )}
                            </div>

                            <div className="relative">
                                <DateTimeSlot
                                    icon={<CalendarMiniIcon />}
                                    dateLabel="Data de levantamento"
                                    dateValue={formatFieldDate(pickupDate)}
                                    timeLabel="Hora"
                                    timeValue={pickupTime}
                                    activeDate={activePanel === 'pickupDate'}
                                    activeTime={activePanel === 'pickupTime'}
                                    onClickDate={() => openDatePanel('pickupDate')}
                                    onClickTime={() => setActivePanel('pickupTime')}
                                />
                                {activePanel === 'pickupDate' && (
                                    <CalendarPanel
                                        month={calendarMonth}
                                        selected={pickupDate}
                                        rangeStart={pickupDate}
                                        rangeEnd={returnDate}
                                        onMonthChange={setCalendarMonth}
                                        onSelect={(value) => updateDate('pickupDate', value)}
                                    />
                                )}
                                {activePanel === 'pickupTime' && (
                                    <TimePanel
                                        selected={pickupTime}
                                        onSelect={(value) => updateTime('pickupTime', value)}
                                    />
                                )}
                            </div>

                            <div className="relative">
                                <DateTimeSlot
                                    icon={<CalendarMiniIcon />}
                                    dateLabel="Devolução"
                                    dateValue={formatFieldDate(returnDate)}
                                    timeLabel="Hora"
                                    timeValue={returnTime}
                                    activeDate={activePanel === 'returnDate'}
                                    activeTime={activePanel === 'returnTime'}
                                    onClickDate={() => openDatePanel('returnDate')}
                                    onClickTime={() => setActivePanel('returnTime')}
                                />
                                {activePanel === 'returnDate' && (
                                    <CalendarPanel
                                        month={calendarMonth}
                                        selected={returnDate}
                                        rangeStart={pickupDate}
                                        rangeEnd={returnDate}
                                        onMonthChange={setCalendarMonth}
                                        onSelect={(value) => updateDate('returnDate', value)}
                                    />
                                )}
                                {activePanel === 'returnTime' && (
                                    <TimePanel
                                        selected={returnTime}
                                        onSelect={(value) => updateTime('returnTime', value)}
                                    />
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={triggerSearch}
                                className="min-h-[72px] rounded-2xl bg-[#17894e] px-5 text-base font-semibold text-white transition hover:bg-[#117241]"
                            >
                                Pesquisar
                            </button>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p>Introduza as primeiras 3 letras e aguarde pelos resultados.</p>
                                {routeLoading && (
                                    <p className="mt-1 text-xs text-slate-400">A calcular rota...</p>
                                )}
                                {routeData && (
                                    <p className="mt-1 text-xs font-medium text-slate-600">
                                        {routeData.distance_km} km · {routeData.duration_min} min · {routeData.scope_label}
                                    </p>
                                )}
                            </div>

                            <div className="relative self-start md:self-auto">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActivePanel((current) =>
                                            current === 'residence' ? null : 'residence'
                                        )
                                    }
                                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-medium transition ${
                                        activePanel === 'residence'
                                            ? 'border-sky-500 bg-sky-50 text-sky-900'
                                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-lg">🇵🇹</span>
                                    <span>Residência: {residence}</span>
                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 0 1 1.1 1.02l-4.25 4.5a.75.75 0 0 1-1.1 0l-4.25-4.5a.75.75 0 0 1 .02-1.04Z" />
                                    </svg>
                                </button>

                                {activePanel === 'residence' && (
                                    <div className="absolute right-0 top-full z-30 mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                                        {RESIDENCE_OPTIONS.map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => {
                                                    setResidence(option);
                                                    setActivePanel(null);
                                                }}
                                                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                                                    option === residence
                                                        ? 'bg-amber-50 text-amber-900'
                                                        : 'hover:bg-slate-50'
                                                }`}
                                            >
                                                <span>{option}</span>
                                                {option === residence && <span>✓</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section ref={resultsRef} id="search" className="-mt-8 bg-paper-2 pt-18">
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-ink">
                                {filtered.length} viatura{filtered.length === 1 ? '' : 's'}{' '}
                                {filtered.length === 1 ? 'disponível' : 'disponíveis'}
                            </h2>
                            <p className="mt-1 max-w-3xl text-sm text-muted">{searchSummary}</p>
                        </div>

                        <div className="flex gap-1 rounded-full border border-border bg-paper p-1 text-xs shadow-sm">
                            <FilterChip
                                active={statusFilter === 'all'}
                                onClick={() => setStatusFilter('all')}
                            >
                                Todas
                            </FilterChip>
                            <FilterChip
                                active={statusFilter === 'available'}
                                onClick={() => setStatusFilter('available')}
                            >
                                Disponíveis
                            </FilterChip>
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="rounded-3xl border border-border bg-paper px-5 py-14 text-center text-sm text-muted shadow-sm">
                            Sem viaturas com estes critérios.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filtered.map((vehicle) => (
                                <VehicleCard
                                    key={vehicle.id}
                                    vehicle={vehicle}
                                    onReserve={onGoToLogin}
                                />
                            ))}
                        </div>
                    )}

                    <p className="mt-4 text-xs text-muted">
                        Para reservar é necessário{' '}
                        <button onClick={onGoToLogin} className="font-medium text-ink underline">
                            iniciar sessão
                        </button>
                        .
                    </p>
                </div>
            </section>

            <section id="how" className="border-t border-border-soft bg-paper">
                <div className="mx-auto max-w-7xl px-6 py-14">
                    <div className="mb-8">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                            {t.landing.howKicker}
                        </p>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">
                            {t.landing.howTitle}
                        </h2>
                    </div>

                    <ol className="grid gap-px overflow-hidden rounded-[28px] border border-border bg-border md:grid-cols-4">
                        {t.landing.steps.map((step, index) => (
                            <li key={index} className="bg-paper p-6">
                                <p className="text-xs font-semibold text-ink">
                                    {String(index + 1).padStart(2, '0')}
                                </p>
                                <h3 className="mt-3 text-base font-bold text-ink">{step.title}</h3>
                                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                                    {step.text}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <SiteFooter
                t={t}
                lang={lang}
                setLang={setLang}
                onGoToLogin={onGoToLogin}
            />
        </div>
    );
}

function VehicleCard({ vehicle, onReserve }) {
    return (
        <article className="group flex flex-col overflow-hidden rounded-[24px] border border-border bg-paper transition hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-xl">
            <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
                <StatusDot vehicle={vehicle} />
                <span className="font-mono text-sm font-semibold tracking-wider text-ink">
                    {vehicle.plate}
                </span>
            </div>

            <div className="aspect-[5/3] overflow-hidden bg-paper-2 text-ink">
                <VehicleMedia
                    vehicle={vehicle}
                    imageClassName="h-full w-full object-cover transition duration-150 ease-in-out group-hover:scale-[1.02]"
                    className="h-full w-full"
                />
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                        {vehicle.brand}
                    </p>
                    <h3 className="mt-0.5 text-base font-bold leading-tight tracking-tight text-ink">
                        {vehicle.model}
                    </h3>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                        <GaugeIcon className="h-3.5 w-3.5 text-muted-soft" />
                        <span className="font-mono text-ink">
                            {vehicle.currentKm.toLocaleString('pt-PT')}
                        </span>{' '}
                        km
                    </span>
                    <span className="text-border">·</span>
                    <span className="inline-flex items-center gap-1.5">
                        <SeatIcon className="h-3.5 w-3.5 text-muted-soft" />
                        {vehicle.seats} lugares
                    </span>
                    <span className="text-border">·</span>
                    <span className="inline-flex items-center gap-1.5">
                        <PinIcon className="h-3.5 w-3.5 text-muted-soft" />
                        {vehicle.base}
                    </span>
                </div>

                <div className="rounded-2xl bg-paper-2 px-3 py-2 text-xs">
                    <p className="truncate text-ink">{vehicle.responsible}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 font-mono text-muted">
                        <PhoneIcon className="h-3 w-3 text-muted-soft" />
                        {vehicle.phone}
                    </p>
                </div>

                {vehicle.activeReservation && vehicle.availability !== 'available' && vehicle.availability !== 'inoperational' && (
                    <p className="rounded-md bg-warn-soft px-2.5 py-1.5 text-[11px] text-warn">
                        {[vehicle.activeReservation.requesterName, vehicle.activeReservation.date]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-border-soft pt-3 text-xs">
                    <span className="text-muted">{vehicle.insuranceCompany}</span>
                    <button
                        onClick={onReserve}
                        disabled={vehicle.availability === 'inoperational'}
                        className="font-medium text-ink underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-muted-soft disabled:no-underline"
                    >
                        Reservar →
                    </button>
                </div>
            </div>
        </article>
    );
}

function SearchSlot({ label, icon, children, active, trailing }) {
    return (
        <label
            className={`flex min-h-[72px] items-center gap-3 rounded-2xl border bg-white px-3.5 py-2.5 shadow-sm transition ${
                active
                    ? 'border-sky-500 ring-2 ring-sky-100'
                    : 'border-slate-200 hover:border-slate-300'
            }`}
        >
            <span className="text-slate-400">{icon}</span>
            <span className="min-w-0 flex-1">
                <span className="block text-xs text-slate-500">{label}</span>
                {children}
            </span>
            {trailing && <span className="shrink-0 text-slate-400">{trailing}</span>}
        </label>
    );
}

function DateTimeSlot({
    icon,
    dateLabel,
    dateValue,
    timeLabel,
    timeValue,
    activeDate,
    activeTime,
    onClickDate,
    onClickTime,
}) {
    const anyActive = activeDate || activeTime;

    return (
        <div
            className={`flex min-h-[72px] overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                anyActive
                    ? 'border-sky-500 ring-2 ring-sky-100'
                    : 'border-slate-200 hover:border-slate-300'
            }`}
        >
            <button
                type="button"
                onClick={onClickDate}
                className={`flex min-w-0 flex-1 items-center gap-3 px-3.5 py-2.5 text-left transition ${
                    activeDate ? 'bg-sky-50/60' : 'hover:bg-slate-50'
                }`}
            >
                {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
                <span className="min-w-0">
                    <span className="block truncate text-xs text-slate-500">{dateLabel}</span>
                    <span className="mt-0.5 block truncate text-[0.95rem] font-medium text-ink">
                        {dateValue}
                    </span>
                </span>
            </button>

            <span className="w-px self-stretch bg-slate-200" />

            <button
                type="button"
                onClick={onClickTime}
                className={`flex w-[88px] shrink-0 flex-col justify-center px-3 py-2.5 text-left transition ${
                    activeTime ? 'bg-sky-50/60' : 'hover:bg-slate-50'
                }`}
            >
                <span className="block text-xs text-slate-500">{timeLabel}</span>
                <span className="mt-0.5 block text-[0.95rem] font-medium text-ink">
                    {timeValue}
                </span>
            </button>
        </div>
    );
}

function LocationPanel({ options, loading, onSelect }) {
    return (
        <div className="absolute left-0 top-full z-30 mt-3 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            {loading ? (
                <p className="px-4 py-3 text-sm text-slate-500">A procurar localizaÃ§Ãµes...</p>
            ) : options.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-500">Sem resultados.</p>
            ) : (
                options.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onSelect(option)}
                        className="flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-ink">
                                {option.label}
                            </span>
                            <span className="mt-0.5 block text-xs text-slate-400">
                                {option.type_label} · {option.city}
                            </span>
                        </span>
                        <span className="shrink-0 text-xs text-slate-400">{option.type_label}</span>
                    </button>
                ))
            )}
        </div>
    );
}

function CalendarPanel({ month, selected, rangeStart, rangeEnd, onMonthChange, onSelect }) {
    const months = [month, monthStart(addDays(month, 32))];

    return (
        <div className="absolute left-0 top-full z-30 mt-3 w-[min(100vw-3rem,540px)] overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="mb-4 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => onMonthChange(monthStart(addDays(month, -32)))}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                >
                    <ChevronLeftIcon />
                </button>
                <button
                    type="button"
                    onClick={() => onMonthChange(monthStart(addDays(month, 32)))}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 lg:hidden"
                >
                    <ChevronRightIcon />
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {months.map((current, index) => (
                    <div key={`${current.getFullYear()}-${current.getMonth()}`}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-center text-2xl font-bold text-ink">
                                {formatMonthTitle(current)}
                            </h3>
                            {index === 1 && (
                                <button
                                    type="button"
                                    onClick={() => onMonthChange(monthStart(addDays(month, 32)))}
                                    className="hidden rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 lg:block"
                                >
                                    <ChevronRightIcon />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-7 gap-2 text-center text-sm text-slate-500">
                            {WEEKDAY_LABELS.map((weekday) => (
                                <span key={weekday} className="py-1">
                                    {weekday}
                                </span>
                            ))}
                        </div>

                        <div className="mt-2 grid grid-cols-7 gap-2">
                            {getMonthGrid(current).map(({ date, inMonth }) => {
                                const value = formatDateInput(date);
                                const selectedDay = selected === value;
                                const inRange =
                                    value >= rangeStart && value <= rangeEnd;

                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => onSelect(value)}
                                        className={`h-11 rounded-2xl text-sm font-medium transition ${
                                            selectedDay
                                                ? 'bg-amber-300 text-ink'
                                                : inRange
                                                ? 'bg-amber-100 text-ink'
                                                : inMonth
                                                ? 'text-ink hover:bg-slate-100'
                                                : 'text-slate-300'
                                        }`}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TimePanel({ selected, onSelect }) {
    return (
        <div className="absolute left-0 top-full z-30 mt-3 w-[min(100vw-3rem,540px)] overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="max-h-[420px] overflow-y-auto pr-1">
                {TIME_GROUPS.map((group) => (
                    <div key={group.label} className="mb-6 last:mb-0">
                        <h3 className="mb-4 text-xl font-semibold text-ink">{group.label}</h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {group.options.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => onSelect(option)}
                                    className={`rounded-2xl px-4 py-3 text-base font-medium transition ${
                                        selected === option
                                            ? 'bg-amber-300 text-ink'
                                            : 'bg-slate-50 text-ink hover:bg-slate-100'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const AVAILABILITY_LABEL = {
    available: { text: 'Disponível', cls: 'text-positive', dot: 'bg-positive' },
    pre_reserved: { text: 'Pré-reservada', cls: 'text-warn', dot: 'bg-warn' },
    reserved: { text: 'Reservada', cls: 'text-warn', dot: 'bg-warn' },
    in_use: { text: 'Em uso', cls: 'text-ink', dot: 'bg-ink' },
    inoperational: { text: 'Inoperacional', cls: 'text-danger', dot: 'bg-danger' },
};

function StatusDot({ vehicle }) {
    const info = AVAILABILITY_LABEL[vehicle?.availability] || AVAILABILITY_LABEL.available;
    return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
            <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} />
            <span className={info.cls}>{info.text}</span>
        </span>
    );
}

function FilterChip({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`rounded-full px-3 py-1.5 transition ${
                active ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
            }`}
        >
            {children}
        </button>
    );
}

function LangSwitch({ lang, setLang, light = false }) {
    const active = light ? 'text-white' : 'text-ink';
    const muted = light ? 'text-white/65 hover:text-white' : 'text-muted hover:text-ink';
    const divider = light ? 'text-white/40' : 'text-border';

    return (
        <div className="hidden text-xs font-medium sm:flex">
            <button
                onClick={() => setLang('pt')}
                className={`px-1.5 py-1 transition ${lang === 'pt' ? active : muted}`}
            >
                PT
            </button>
            <span className={`px-0.5 ${divider}`}>/</span>
            <button
                onClick={() => setLang('en')}
                className={`px-1.5 py-1 transition ${lang === 'en' ? active : muted}`}
            >
                EN
            </button>
        </div>
    );
}

function PinMiniIcon() {
    return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12Z" />
            <circle cx="12" cy="9" r="2.5" />
        </svg>
    );
}

function CalendarMiniIcon() {
    return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 9h18M8 3v4M16 3v4" />
        </svg>
    );
}

function ChevronLeftIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11.78 4.97a.75.75 0 0 1 0 1.06L7.81 10l3.97 3.97a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.22 4.97a.75.75 0 0 0 0 1.06L12.19 10l-3.97 3.97a.75.75 0 1 0 1.06 1.06l4.5-4.5a.75.75 0 0 0 0-1.06l-4.5-4.5a.75.75 0 0 0-1.06 0Z" />
        </svg>
    );
}

const FOOTER_COLUMNS_PT = [
    {
        title: 'Reservas',
        links: [
            'Tarifas e condições',
            'Frota disponível',
            'Bases de levantamento',
            'Aeroportos de levantamento',
            'Programa de fidelidade',
            'Promoções internas',
            'Aplicação móvel',
            'Notícias da frota',
        ],
    },
    {
        title: 'Gestão de frota',
        links: ['Adicionar viatura', 'Pedidos de manutenção'],
    },
    {
        title: 'Parceiros',
        links: ['Programa de parceria'],
    },
    {
        title: 'Sobre',
        links: [
            'Quem somos',
            'Política de privacidade',
            'Política de cookies',
            'Termos e condições',
            'Código de conduta',
            'Carreiras',
        ],
    },
    {
        title: 'Apoio',
        links: [
            { label: 'Iniciar sessão ou criar conta', isLogin: true },
            'Gerir reserva',
            'Centro de ajuda',
            'Perguntas frequentes',
            'Requisitos de utilização',
        ],
    },
];

const FOOTER_COLUMNS_EN = [
    {
        title: 'Bookings',
        links: [
            'Pricing & conditions',
            'Available fleet',
            'Pickup bases',
            'Pickup airports',
            'Loyalty program',
            'Internal promotions',
            'Mobile app',
            'Fleet news',
        ],
    },
    {
        title: 'Fleet management',
        links: ['Add vehicle', 'Maintenance requests'],
    },
    {
        title: 'Partners',
        links: ['Partnership program'],
    },
    {
        title: 'About',
        links: [
            'About us',
            'Privacy policy',
            'Cookie policy',
            'Terms & conditions',
            'Code of conduct',
            'Careers',
        ],
    },
    {
        title: 'Support',
        links: [
            { label: 'Sign in or create account', isLogin: true },
            'Manage booking',
            'Help centre',
            'FAQ',
            'Usage requirements',
        ],
    },
];

function SiteFooter({ t, lang, setLang, onGoToLogin }) {
    const columns = lang === 'en' ? FOOTER_COLUMNS_EN : FOOTER_COLUMNS_PT;

    return (
        <footer id="contact" className="border-t border-border bg-paper">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                    {columns.map((column) => (
                        <div key={column.title}>
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
                                {column.title}
                            </h3>
                            <ul className="mt-4 space-y-2.5">
                                {column.links.map((link) => {
                                    const item = typeof link === 'string' ? { label: link } : link;
                                    const className =
                                        'text-sm text-muted transition hover:text-ink';

                                    if (item.isLogin) {
                                        return (
                                            <li key={item.label}>
                                                <button
                                                    type="button"
                                                    onClick={onGoToLogin}
                                                    className={className}
                                                >
                                                    {item.label}
                                                </button>
                                            </li>
                                        );
                                    }

                                    return (
                                        <li key={item.label}>
                                            <a href="#" className={className}>
                                                {item.label}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-start gap-4 border-t border-border-soft pt-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-paper">
                            <CarIcon className="h-4 w-4" />
                        </span>
                        <p className="text-xs text-muted">{t.landing.footerTagline}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted">
                        <LangSwitch lang={lang} setLang={setLang} />
                        <span className="hidden text-border md:inline">·</span>
                        <p>
                            © {new Date().getFullYear()}. {t.landing.footerRights}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
