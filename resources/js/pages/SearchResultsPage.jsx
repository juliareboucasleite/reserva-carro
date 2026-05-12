import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import VehicleMedia from '../components/VehicleMedia';

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

const SORT_OPTIONS = [
    { value: 'recommended', label: 'Recomendado' },
    { value: 'price_asc', label: 'Preço mais baixo' },
    { value: 'price_desc', label: 'Preço mais alto' },
    { value: 'rating', label: 'Melhor avaliação' },
];

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
    return (
        OFFER_PRESETS[normalizeText(vehicle.name)] || {
            categoryLabel:
                vehicle.category === 'bus' ? 'Especial' : vehicle.category === 'van' ? 'Furgão' : 'Compacto',
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
        }
    );
}

function buildSearchOffer(vehicle, search) {
    const preset = getOfferPreset(vehicle);
    const distanceExtra = search?.routeData?.distance_km
        ? Math.min(search.routeData.distance_km * 0.12, 22)
        : 0;
    const computedPrice = Number((preset.price + distanceExtra).toFixed(2));

    const fuelLabel = preset.features.includes('Elétrico')
        ? 'Elétrico'
        : preset.features.includes('Híbrido')
        ? 'Híbrido'
        : preset.features.includes('Diesel')
        ? 'Diesel'
        : 'Gasolina';

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
        fuelLabel,
        pickupLabel: search?.pickupLocationData?.label || search?.pickupLocation || vehicle.base || 'Portugal',
        dropoffLabel:
            search?.returnLocationData?.label ||
            search?.returnLocation ||
            search?.pickupLocationData?.label ||
            search?.pickupLocation ||
            vehicle.base ||
            'Portugal',
    };
}

function getRatingBucketLabel(rating) {
    const value = Number(rating);
    if (value >= 8.5) return 'Excelente';
    if (value >= 8) return 'Muito Bom';
    if (value >= 7.5) return 'Bom';
    return 'Regular';
}

export default function SearchResultsPage({ search, onBack, onGoToLogin }) {
    const { vehicles } = useData();
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [sortOrder, setSortOrder] = useState('recommended');

    const offers = useMemo(
        () => vehicles.map((vehicle) => buildSearchOffer(vehicle, search)),
        [vehicles, search]
    );

    const categoryOptions = useMemo(() => groupByLabel(offers, (o) => o.categoryLabel, true), [offers]);
    const supplierOptions = useMemo(() => groupByLabel(offers, (o) => o.supplier, true), [offers]);
    const featureOptions = useMemo(() => groupByList(offers, (o) => o.features), [offers]);
    const paymentOptions = useMemo(() => groupByLabel(offers, (o) => o.payment, false), [offers]);
    const ratingOptions = useMemo(() => {
        const labels = ['Excelente', 'Muito Bom', 'Bom', 'Regular'];
        return labels
            .map((label) => ({
                label,
                count: offers.filter((offer) => getRatingBucketLabel(offer.rating) === label).length,
            }))
            .filter((item) => item.count > 0);
    }, [offers]);

    const minAvailablePrice = useMemo(
        () => (offers.length ? Math.floor(Math.min(...offers.map((o) => o.price))) : 0),
        [offers]
    );
    const maxAvailablePrice = useMemo(
        () => (offers.length ? Math.ceil(Math.max(...offers.map((o) => o.price))) : 0),
        [offers]
    );

    useEffect(() => {
        if (!offers.length) return;
        if (priceMin === '') setPriceMin(String(minAvailablePrice));
        if (priceMax === '') setPriceMax(String(maxAvailablePrice));
    }, [offers, priceMin, priceMax, minAvailablePrice, maxAvailablePrice]);

    const filteredOffers = useMemo(() => {
        let result = offers.filter((offer) => {
            if (statusFilter === 'available' && offer.vehicle.availability === 'inoperational') return false;
            if (selectedCategories.length && !selectedCategories.includes(offer.categoryLabel)) return false;
            if (selectedSuppliers.length && !selectedSuppliers.includes(offer.supplier)) return false;
            if (selectedFeatures.length && !selectedFeatures.every((f) => offer.features.includes(f))) return false;
            if (selectedRatings.length && !selectedRatings.includes(getRatingBucketLabel(offer.rating))) return false;
            if (selectedPayments.length && !selectedPayments.includes(offer.payment)) return false;
            if (priceMin !== '' && offer.price < Number(priceMin)) return false;
            if (priceMax !== '' && offer.price > Number(priceMax)) return false;
            return true;
        });

        if (sortOrder === 'price_asc') result = [...result].sort((a, b) => a.price - b.price);
        else if (sortOrder === 'price_desc') result = [...result].sort((a, b) => b.price - a.price);
        else if (sortOrder === 'rating') result = [...result].sort((a, b) => Number(b.rating) - Number(a.rating));
        else result = [...result].sort((a, b) => a.price - b.price || Number(b.rating) - Number(a.rating));

        return result;
    }, [
        offers,
        statusFilter,
        selectedCategories,
        selectedSuppliers,
        selectedFeatures,
        selectedRatings,
        selectedPayments,
        priceMin,
        priceMax,
        sortOrder,
    ]);

    const activeFilterTags = [
        ...selectedCategories.map((value) => ({ type: 'category', value })),
        ...selectedSuppliers.map((value) => ({ type: 'supplier', value })),
        ...selectedFeatures.map((value) => ({ type: 'feature', value })),
        ...selectedRatings.map((value) => ({ type: 'rating', value })),
        ...selectedPayments.map((value) => ({ type: 'payment', value })),
    ];

    const searchSummary = [
        search?.pickupLocation ? `Levantamento em ${search.pickupLocation}` : null,
        search?.returnLocation ? `devolução em ${search.returnLocation}` : null,
        search?.pickupDate && search?.pickupTime && search?.returnDate && search?.returnTime
            ? `${search.pickupDate} ${search.pickupTime} → ${search.returnDate} ${search.returnTime}`
            : null,
    ]
        .filter(Boolean)
        .join(' · ');

    function toggleValue(setter, value) {
        setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
    }

    function clearFilters() {
        setSelectedCategories([]);
        setSelectedSuppliers([]);
        setSelectedFeatures([]);
        setSelectedRatings([]);
        setSelectedPayments([]);
        setPriceMin(String(minAvailablePrice));
        setPriceMax(String(maxAvailablePrice));
        setSortOrder('recommended');
        setStatusFilter('all');
    }

    function removeActiveFilter(tag) {
        if (tag.type === 'category') toggleValue(setSelectedCategories, tag.value);
        if (tag.type === 'supplier') toggleValue(setSelectedSuppliers, tag.value);
        if (tag.type === 'feature') toggleValue(setSelectedFeatures, tag.value);
        if (tag.type === 'rating') toggleValue(setSelectedRatings, tag.value);
        if (tag.type === 'payment') toggleValue(setSelectedPayments, tag.value);
    }

    return (
        <div className="min-h-screen bg-paper text-ink">
            <header className="sticky top-0 z-10 border-b border-border bg-paper">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-paper-2"
                    >
                        ← Voltar
                    </button>
                    <button
                        type="button"
                        onClick={onGoToLogin}
                        className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink-soft"
                    >
                        Iniciar sessão
                    </button>
                </div>
            </header>

            <section className="bg-paper-2 py-6">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="rounded-md border border-border bg-paper px-5 py-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-lg font-semibold tracking-tight text-ink">
                                    {search?.pickupLocationData?.label || search?.pickupLocation || 'Portugal'}
                                    <span className="px-2 text-muted">→</span>
                                    {search?.returnLocationData?.label ||
                                        search?.returnLocation ||
                                        search?.pickupLocationData?.label ||
                                        search?.pickupLocation ||
                                        'Portugal'}
                                </p>
                                {searchSummary && <p className="mt-1 text-sm text-muted">{searchSummary}</p>}
                            </div>
                            {search?.routeData && (
                                <div className="rounded-md border border-border bg-paper-2 px-3 py-1.5 font-mono text-xs text-ink">
                                    {search.routeData.distance_km} km · {search.routeData.duration_min} min
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
                        <aside>
                            <div className="rounded-md border border-border bg-paper shadow-sm">
                                <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
                                    <h3 className="text-sm font-semibold tracking-wide text-ink">Filtros</h3>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-xs font-medium text-muted underline hover:text-ink"
                                    >
                                        Limpar
                                    </button>
                                </div>

                                <div className="space-y-5 px-4 py-4">
                                    <FilterSection title="Preço total">
                                        <div className="grid grid-cols-2 gap-2">
                                            <label className="rounded-md border border-border bg-paper-2 px-3 py-2">
                                                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
                                                    Mínimo
                                                </span>
                                                <input
                                                    type="number"
                                                    min={minAvailablePrice}
                                                    max={maxAvailablePrice}
                                                    value={priceMin}
                                                    onChange={(event) => setPriceMin(event.target.value)}
                                                    className="mt-0.5 w-full bg-transparent font-mono text-sm font-semibold text-ink outline-none"
                                                />
                                            </label>
                                            <label className="rounded-md border border-border bg-paper-2 px-3 py-2">
                                                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
                                                    Máximo
                                                </span>
                                                <input
                                                    type="number"
                                                    min={minAvailablePrice}
                                                    max={maxAvailablePrice}
                                                    value={priceMax}
                                                    onChange={(event) => setPriceMax(event.target.value)}
                                                    className="mt-0.5 w-full bg-transparent font-mono text-sm font-semibold text-ink outline-none"
                                                />
                                            </label>
                                        </div>
                                        <p className="mt-2 text-xs text-muted">
                                            {formatEuro(minAvailablePrice)} a {formatEuro(maxAvailablePrice)}
                                        </p>
                                    </FilterSection>

                                    <FilterSection title="Categorias">
                                        <div className="space-y-1.5">
                                            {categoryOptions.map((option) => (
                                                <SidebarCheckbox
                                                    key={option.label}
                                                    label={option.label}
                                                    meta={formatEuro(option.minPrice)}
                                                    checked={selectedCategories.includes(option.label)}
                                                    onChange={() => toggleValue(setSelectedCategories, option.label)}
                                                />
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Locadora">
                                        <div className="space-y-1.5">
                                            {supplierOptions.map((option) => (
                                                <SidebarCheckbox
                                                    key={option.label}
                                                    label={option.label}
                                                    meta={formatEuro(option.minPrice)}
                                                    checked={selectedSuppliers.includes(option.label)}
                                                    onChange={() => toggleValue(setSelectedSuppliers, option.label)}
                                                />
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Características">
                                        <div className="flex flex-wrap gap-1.5">
                                            {featureOptions.map((option) => (
                                                <PillButton
                                                    key={option.label}
                                                    active={selectedFeatures.includes(option.label)}
                                                    onClick={() => toggleValue(setSelectedFeatures, option.label)}
                                                >
                                                    {option.label}
                                                </PillButton>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Avaliações">
                                        <div className="flex flex-wrap gap-1.5">
                                            {ratingOptions.map((option) => (
                                                <PillButton
                                                    key={option.label}
                                                    active={selectedRatings.includes(option.label)}
                                                    onClick={() => toggleValue(setSelectedRatings, option.label)}
                                                >
                                                    {option.label}
                                                </PillButton>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Pagamento">
                                        <div className="space-y-1.5">
                                            {paymentOptions.map((option) => (
                                                <SidebarCheckbox
                                                    key={option.label}
                                                    label={option.label}
                                                    meta={option.count}
                                                    checked={selectedPayments.includes(option.label)}
                                                    onChange={() => toggleValue(setSelectedPayments, option.label)}
                                                />
                                            ))}
                                        </div>
                                    </FilterSection>
                                </div>
                            </div>
                        </aside>

                        <div className="min-w-0">
                            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <div className="inline-flex gap-1 rounded-md border border-border bg-paper p-0.5 text-xs shadow-sm">
                                        <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
                                            Todas
                                        </FilterChip>
                                        <FilterChip
                                            active={statusFilter === 'available'}
                                            onClick={() => setStatusFilter('available')}
                                        >
                                            Operacionais
                                        </FilterChip>
                                    </div>
                                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink">
                                        {filteredOffers.length} viatura{filteredOffers.length === 1 ? '' : 's'} disponíve
                                        {filteredOffers.length === 1 ? 'l' : 'is'}
                                    </h2>
                                </div>

                                <label className="flex items-center gap-2 rounded-md border border-border bg-paper px-3 py-2 text-sm shadow-sm">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                                        Ordenar
                                    </span>
                                    <select
                                        value={sortOrder}
                                        onChange={(event) => setSortOrder(event.target.value)}
                                        className="bg-transparent text-sm font-medium text-ink outline-none"
                                    >
                                        {SORT_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            {activeFilterTags.length > 0 && (
                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                                        Filtros ativos
                                    </span>
                                    {activeFilterTags.map((tag) => (
                                        <button
                                            key={`${tag.type}-${tag.value}`}
                                            type="button"
                                            onClick={() => removeActiveFilter(tag)}
                                            className="rounded-sm border border-border bg-paper-3 px-2 py-1 text-xs font-medium text-ink hover:border-ink/40"
                                        >
                                            {tag.value} <span className="text-muted">×</span>
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="ml-1 text-xs font-medium text-muted underline hover:text-ink"
                                    >
                                        Limpar
                                    </button>
                                </div>
                            )}

                            {filteredOffers.length === 0 ? (
                                <div className="rounded-md border border-border bg-paper px-5 py-12 text-center text-sm text-muted shadow-sm">
                                    Nenhuma viatura corresponde aos critérios selecionados.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredOffers.map((offer) => (
                                        <SearchOfferCard key={offer.id} offer={offer} onReserve={onGoToLogin} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function groupByLabel(offers, getLabel, trackMinPrice) {
    const groups = new Map();
    offers.forEach((offer) => {
        const label = getLabel(offer);
        const current = groups.get(label) || { label, count: 0, minPrice: offer.price };
        current.count += 1;
        if (trackMinPrice) current.minPrice = Math.min(current.minPrice, offer.price);
        groups.set(label, current);
    });
    const list = [...groups.values()];
    return trackMinPrice ? list.sort((a, b) => a.minPrice - b.minPrice) : list;
}

function groupByList(offers, getList) {
    const groups = new Map();
    offers.forEach((offer) => {
        getList(offer).forEach((item) => groups.set(item, (groups.get(item) || 0) + 1));
    });
    return [...groups.entries()].map(([label, count]) => ({ label, count }));
}

function FilterSection({ title, children }) {
    return (
        <section className="border-t border-border-soft pt-4 first:border-t-0 first:pt-0">
            <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted">{title}</h4>
            {children}
        </section>
    );
}

function SidebarCheckbox({ label, meta, checked, onChange }) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-ink">
            <span className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="h-4 w-4 rounded-sm border-border text-ink focus:ring-ink/20"
                />
                <span>{label}</span>
            </span>
            <span className="text-xs text-muted">{meta}</span>
        </label>
    );
}

function FilterChip({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-sm px-2.5 py-1 font-medium transition ${
                active ? 'bg-ink text-paper' : 'text-muted hover:bg-paper-2 hover:text-ink'
            }`}
        >
            {children}
        </button>
    );
}

function PillButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-sm border px-2.5 py-1 text-xs transition ${
                active ? 'border-ink bg-ink text-paper' : 'border-border bg-paper-2 text-ink hover:border-ink/40'
            }`}
        >
            {children}
        </button>
    );
}

function SearchOfferCard({ offer, onReserve }) {
    const isInoperational = offer.vehicle.availability === 'inoperational';

    return (
        <article className="overflow-hidden rounded-md border border-border bg-paper shadow-sm transition hover:border-ink/30">
            <div className="grid gap-0 md:grid-cols-[200px_minmax(0,1fr)_220px]">
                <div className="border-b border-border-soft md:border-b-0 md:border-r">
                    <div className="aspect-[16/10] overflow-hidden bg-paper-2">
                        <VehicleMedia
                            vehicle={offer.vehicle}
                            imageClassName="h-full w-full object-cover"
                            className="h-full w-full"
                        />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 text-xs">
                        <span className="font-medium text-ink">{offer.supplier}</span>
                        <span className="rounded-sm border border-border bg-paper-2 px-1.5 py-0.5 font-mono font-semibold text-ink">
                            {offer.rating}
                        </span>
                    </div>
                </div>

                <div className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="text-lg font-bold tracking-tight text-ink">{offer.title}</h3>
                            <p className="mt-0.5 text-xs text-muted">{offer.subtitle}</p>
                        </div>
                        <span
                            className={`rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                isInoperational
                                    ? 'border-danger/30 bg-danger-soft text-danger'
                                    : 'border-positive/30 bg-positive-soft text-positive'
                            }`}
                        >
                            {isInoperational ? 'Inoperacional' : 'Operacional'}
                        </span>
                    </div>

                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink">
                        <SpecItem>{offer.vehicle.seats} lugares</SpecItem>
                        <SpecItem>{offer.luggage} bagagens</SpecItem>
                        <SpecItem>{offer.transmission}</SpecItem>
                        <SpecItem>{offer.fuelLabel}</SpecItem>
                        <SpecItem>Km ilimitada</SpecItem>
                    </ul>

                    <ul className="mt-3 space-y-1 text-xs text-muted">
                        {offer.protections.map((item) => (
                            <li key={item}>— {item}</li>
                        ))}
                    </ul>

                    <div className="mt-3 flex items-center gap-2 border-t border-border-soft pt-3 text-xs text-muted">
                        <span className="font-medium text-ink">{offer.pickupLabel}</span>
                        <span>·</span>
                        <span>{offer.pickupMode}</span>
                    </div>
                </div>

                <div className="flex flex-col justify-between border-t border-border-soft p-4 md:border-l md:border-t-0">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">A sua reserva</p>
                        <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-ink">
                            {formatEuro(offer.price)}
                        </p>
                        <p className="mt-0.5 text-xs text-positive">Cancelamento grátis</p>

                        <div className="mt-3 space-y-0.5 text-xs text-muted">
                            <p>{offer.payment}</p>
                            {offer.included.map((item) => (
                                <p key={item}>{item}</p>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onReserve}
                        disabled={isInoperational}
                        className="mt-4 w-full rounded-md bg-ink px-3 py-2 text-sm font-semibold text-paper transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-muted-soft"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        </article>
    );
}

function SpecItem({ children }) {
    return <li className="font-medium">{children}</li>;
}
