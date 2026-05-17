import React, { useMemo, useState } from 'react';
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
        rating: '8.7',
        ratingCount: 1248,
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
        rating: '8.3',
        ratingCount: 982,
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
        rating: '7.9',
        ratingCount: 614,
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
        rating: '8.0',
        ratingCount: 736,
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
        rating: '7.5',
        ratingCount: 412,
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
        rating: '8.8',
        ratingCount: 322,
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
        rating: '9.0',
        ratingCount: 287,
        luggage: 16,
    },
};

const SORT_OPTIONS = [
    { value: 'recommended', label: 'Mais procurados' },
    { value: 'rating', label: 'Melhor avaliação' },
];

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
            rating: '8.0',
            ratingCount: 250,
            luggage: Math.max(2, Math.ceil((vehicle.seats || 4) / 2)),
        }
    );
}

function buildSearchOffer(vehicle, search) {
    const preset = getOfferPreset(vehicle);

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
        subtitle: `ou ${preset.categoryLabel} similar`,
        categoryLabel: preset.categoryLabel,
        supplier: preset.supplier,
        pickupMode: preset.pickupMode,
        features: preset.features,
        protections: preset.protections,
        included: preset.included,
        payment: preset.payment,
        rating: preset.rating,
        ratingCount: preset.ratingCount,
        luggage: preset.luggage,
        transmission: preset.features.includes('Automático') ? 'Automático' : 'Manual',
        mileageLabel: 'Quilometragem ilimitada',
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

export default function SearchResultsPage({
    search,
    onBack,
    onGoToLogin,
    onStartReservation,
    isAuthenticated,
    onGoToDashboard,
}) {
    const { vehicles } = useData();
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [selectedPickupModes, setSelectedPickupModes] = useState([]);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const [selectedProtections, setSelectedProtections] = useState([]);
    const [selectedIncluded, setSelectedIncluded] = useState([]);
    const [selectedMileage, setSelectedMileage] = useState([]);
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [sortOrder, setSortOrder] = useState('recommended');

    const offers = useMemo(
        () => vehicles.map((vehicle) => buildSearchOffer(vehicle, search)),
        [vehicles, search]
    );

    const categoryOptions = useMemo(() => groupByLabel(offers, (o) => o.categoryLabel), [offers]);
    const supplierOptions = useMemo(() => groupByLabel(offers, (o) => o.supplier), [offers]);
    const pickupModeOptions = useMemo(() => groupByLabel(offers, (o) => o.pickupMode), [offers]);
    const paymentOptions = useMemo(() => groupByLabel(offers, (o) => o.payment), [offers]);
    const mileageOptions = useMemo(() => groupByLabel(offers, (o) => o.mileageLabel), [offers]);
    const featureOptions = useMemo(() => groupByList(offers, (o) => o.features), [offers]);
    const protectionOptions = useMemo(() => groupByList(offers, (o) => o.protections), [offers]);
    const includedOptions = useMemo(() => groupByList(offers, (o) => o.included), [offers]);
    const ratingOptions = useMemo(() => {
        const labels = ['Excelente', 'Muito Bom', 'Bom', 'Regular'];
        return labels
            .map((label) => ({
                label,
                count: offers.filter((offer) => getRatingBucketLabel(offer.rating) === label).length,
            }))
            .filter((item) => item.count > 0);
    }, [offers]);

    const filteredOffers = useMemo(() => {
        let result = offers.filter((offer) => {
            if (statusFilter === 'available' && offer.vehicle.availability === 'inoperational') return false;
            if (selectedCategories.length && !selectedCategories.includes(offer.categoryLabel)) return false;
            if (selectedSuppliers.length && !selectedSuppliers.includes(offer.supplier)) return false;
            if (selectedPickupModes.length && !selectedPickupModes.includes(offer.pickupMode)) return false;
            if (selectedFeatures.length && !selectedFeatures.every((f) => offer.features.includes(f))) return false;
            if (selectedRatings.length && !selectedRatings.includes(getRatingBucketLabel(offer.rating))) return false;
            if (selectedProtections.length && !selectedProtections.every((p) => offer.protections.includes(p))) return false;
            if (selectedIncluded.length && !selectedIncluded.every((p) => offer.included.includes(p))) return false;
            if (selectedMileage.length && !selectedMileage.includes(offer.mileageLabel)) return false;
            if (selectedPayments.length && !selectedPayments.includes(offer.payment)) return false;
            return true;
        });

        if (sortOrder === 'rating') result = [...result].sort((a, b) => Number(b.rating) - Number(a.rating));
        else result = [...result].sort((a, b) => Number(b.rating) - Number(a.rating) || a.title.localeCompare(b.title));

        return result;
    }, [
        offers,
        statusFilter,
        selectedCategories,
        selectedSuppliers,
        selectedPickupModes,
        selectedFeatures,
        selectedRatings,
        selectedProtections,
        selectedIncluded,
        selectedMileage,
        selectedPayments,
        sortOrder,
    ]);

    const activeFilterTags = [
        ...selectedCategories.map((value) => ({ type: 'category', value })),
        ...selectedSuppliers.map((value) => ({ type: 'supplier', value })),
        ...selectedPickupModes.map((value) => ({ type: 'pickup', value })),
        ...selectedFeatures.map((value) => ({ type: 'feature', value })),
        ...selectedRatings.map((value) => ({ type: 'rating', value })),
        ...selectedProtections.map((value) => ({ type: 'protection', value })),
        ...selectedIncluded.map((value) => ({ type: 'included', value })),
        ...selectedMileage.map((value) => ({ type: 'mileage', value })),
        ...selectedPayments.map((value) => ({ type: 'payment', value })),
    ];

    const searchSummary = [
        search?.pickupLocation ? `Levantamento: ${search.pickupLocation}` : null,
        search?.returnLocation ? `Devolução: ${search.returnLocation}` : null,
        search?.pickupDate && search?.pickupTime && search?.returnDate && search?.returnTime
            ? `${search.pickupDate} ${search.pickupTime} → ${search.returnDate} ${search.returnTime}`
            : null,
        search?.residence ? `Residência: ${search.residence}` : null,
    ]
        .filter(Boolean)
        .join(' · ');

    function toggleValue(setter, value) {
        setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
    }

    function clearFilters() {
        setSelectedCategories([]);
        setSelectedSuppliers([]);
        setSelectedPickupModes([]);
        setSelectedFeatures([]);
        setSelectedRatings([]);
        setSelectedProtections([]);
        setSelectedIncluded([]);
        setSelectedMileage([]);
        setSelectedPayments([]);
        setSortOrder('recommended');
        setStatusFilter('all');
    }

    function removeActiveFilter(tag) {
        if (tag.type === 'category') toggleValue(setSelectedCategories, tag.value);
        if (tag.type === 'supplier') toggleValue(setSelectedSuppliers, tag.value);
        if (tag.type === 'pickup') toggleValue(setSelectedPickupModes, tag.value);
        if (tag.type === 'feature') toggleValue(setSelectedFeatures, tag.value);
        if (tag.type === 'rating') toggleValue(setSelectedRatings, tag.value);
        if (tag.type === 'protection') toggleValue(setSelectedProtections, tag.value);
        if (tag.type === 'included') toggleValue(setSelectedIncluded, tag.value);
        if (tag.type === 'mileage') toggleValue(setSelectedMileage, tag.value);
        if (tag.type === 'payment') toggleValue(setSelectedPayments, tag.value);
    }

    return (
        <div className="min-h-screen bg-paper-2 text-ink">
            <header className="sticky top-0 z-20 border-b border-border bg-paper">
                <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between px-6">
                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-paper-2"
                    >
                        ← Voltar
                    </button>
                    <button
                        type="button"
                        onClick={isAuthenticated ? onGoToDashboard : onGoToLogin}
                        className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink-soft"
                    >
                        {isAuthenticated ? 'Voltar ao painel' : 'Iniciar sessão'}
                    </button>
                </div>
            </header>

            <section className="py-5">
                <div className="mx-auto max-w-[1320px] px-6">
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

                    <div className="mt-5 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                        <aside className="lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-88px)] lg:overflow-y-auto">
                            <div className="rounded-md border border-border bg-paper shadow-sm">
                                <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
                                    <h3 className="text-sm font-semibold tracking-wide text-ink">Filtros</h3>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-xs font-medium text-[#0f6bdf] hover:text-[#0a55b4]"
                                    >
                                        Limpar filtros
                                    </button>
                                </div>

                                <div className="space-y-5 px-4 py-4">
                                    <FilterSection title="Tipos de Pagamento">
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

                                    <FilterSection title="Locação">
                                        <div className="space-y-1.5">
                                            {pickupModeOptions.map((option) => (
                                                <SidebarCheckbox
                                                    key={option.label}
                                                    label={option.label}
                                                    meta={option.count}
                                                    checked={selectedPickupModes.includes(option.label)}
                                                    onChange={() => toggleValue(setSelectedPickupModes, option.label)}
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

                                    <FilterSection title="Sub-Categoria">
                                        <div className="space-y-1.5">
                                            {categoryOptions.map((option) => (
                                                <SidebarCheckbox
                                                    key={option.label}
                                                    label={option.label}
                                                    meta={option.count}
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
                                                    meta={option.count}
                                                    checked={selectedSuppliers.includes(option.label)}
                                                    onChange={() => toggleValue(setSelectedSuppliers, option.label)}
                                                />
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

                                    <FilterSection title="Coberturas">
                                        <div className="space-y-1.5">
                                            {protectionOptions.map((option) => (
                                                <SidebarCheckbox
                                                    key={option.label}
                                                    label={option.label}
                                                    meta={option.count}
                                                    checked={selectedProtections.includes(option.label)}
                                                    onChange={() => toggleValue(setSelectedProtections, option.label)}
                                                />
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Itens Inclusos">
                                        <div className="space-y-1.5">
                                            {includedOptions.map((option) => (
                                                <SidebarCheckbox
                                                    key={option.label}
                                                    label={option.label}
                                                    meta={option.count}
                                                    checked={selectedIncluded.includes(option.label)}
                                                    onChange={() => toggleValue(setSelectedIncluded, option.label)}
                                                />
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Quilometragem">
                                        <div className="space-y-1.5">
                                            {mileageOptions.map((option) => (
                                                <SidebarCheckbox
                                                    key={option.label}
                                                    label={option.label}
                                                    meta={option.count}
                                                    checked={selectedMileage.includes(option.label)}
                                                    onChange={() => toggleValue(setSelectedMileage, option.label)}
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
                                        {filteredOffers.length} viatura{filteredOffers.length === 1 ? '' : 's'} encontrada
                                        {filteredOffers.length === 1 ? '' : 's'}
                                    </h2>
                                </div>

                                <label className="flex items-center gap-2 rounded-md border border-border bg-paper px-3 py-2 text-sm shadow-sm">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                                        Ordenar por
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
                                            className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900 hover:border-sky-400"
                                        >
                                            {tag.value} <span className="ml-1">×</span>
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="ml-1 text-xs font-medium text-[#0f6bdf] hover:text-[#0a55b4]"
                                    >
                                        Limpar filtros
                                    </button>
                                </div>
                            )}

                            {filteredOffers.length === 0 ? (
                                <div className="rounded-md border border-border bg-paper px-5 py-12 text-center text-sm text-muted shadow-sm">
                                    Nenhuma viatura corresponde aos critérios selecionados.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredOffers.map((offer) => (
                                        <SearchOfferCard
                                            key={offer.id}
                                            offer={offer}
                                            onReserve={() =>
                                                onStartReservation
                                                    ? onStartReservation(offer.vehicle)
                                                    : onGoToLogin?.()
                                            }
                                        />
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

function groupByLabel(offers, getLabel) {
    const groups = new Map();
    offers.forEach((offer) => {
        const label = getLabel(offer);
        const current = groups.get(label) || { label, count: 0 };
        current.count += 1;
        groups.set(label, current);
    });
    return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
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
            className={`rounded-full border px-3 py-1 text-xs transition ${
                active ? 'border-sky-500 bg-sky-50 text-sky-900' : 'border-border bg-paper-2 text-ink hover:border-ink/30'
            }`}
        >
            {children}
        </button>
    );
}

function SearchOfferCard({ offer, onReserve }) {
    const isInoperational = offer.vehicle.availability === 'inoperational';
    const ratingBucket = getRatingBucketLabel(offer.rating);

    return (
        <article className="overflow-hidden rounded-md border border-border bg-paper shadow-sm transition hover:border-ink/30">
            <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)_240px]">
                <div className="bg-paper-2">
                    <div className="aspect-[5/4] overflow-hidden">
                        <VehicleMedia
                            vehicle={offer.vehicle}
                            imageClassName="h-full w-full object-cover"
                            className="h-full w-full"
                        />
                    </div>
                    <div className="border-t border-border-soft px-3 py-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-ink">{offer.supplier}</span>
                            <div className="flex items-center gap-1">
                                <span className="rounded-sm bg-[#0f6bdf] px-1.5 py-0.5 font-mono text-xs font-bold text-white">
                                    {offer.rating}
                                </span>
                            </div>
                        </div>
                        <p className="mt-1 text-[11px] text-muted">
                            <span className="font-semibold text-ink">{ratingBucket}</span> · {offer.ratingCount} avaliações
                        </p>
                    </div>
                </div>

                <div className="border-t border-border-soft p-4 lg:border-l lg:border-t-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="text-xl font-bold tracking-tight text-ink">{offer.title}</h3>
                            <p className="mt-0.5 text-xs text-muted">{offer.subtitle}</p>
                        </div>
                        {isInoperational && (
                            <span className="rounded-sm border border-danger/30 bg-danger-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-danger">
                                Inoperacional
                            </span>
                        )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                        <SpecPill>{offer.vehicle.seats} lugares</SpecPill>
                        <SpecPill>{offer.luggage} bagagens</SpecPill>
                        <SpecPill>{offer.transmission}</SpecPill>
                        <SpecPill>{offer.fuelLabel}</SpecPill>
                    </div>

                    <ul className="mt-3 space-y-1 text-sm text-ink">
                        {offer.protections.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                                <span className="mt-0.5 text-positive">✓</span>
                                <span>{item}</span>
                            </li>
                        ))}
                        <li className="flex items-start gap-2 text-muted">
                            <span className="mt-0.5">·</span>
                            <span>{offer.mileageLabel}</span>
                        </li>
                    </ul>

                    <div className="mt-3 rounded-md bg-paper-2 px-3 py-2 text-sm">
                        <p className="font-semibold text-ink">{offer.pickupLabel}</p>
                        <p className="mt-0.5 text-xs text-muted">{offer.pickupMode}</p>
                    </div>
                </div>

                <div className="flex flex-col justify-between border-t border-border-soft p-4 lg:border-l lg:border-t-0">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Reserva</p>
                        <p className="mt-1 text-lg font-semibold tracking-tight text-ink">
                            Pedido sem valor apresentado
                        </p>
                        <p className="mt-1 text-xs font-semibold text-positive">Cancelamento grátis</p>

                        <div className="mt-3 space-y-1 text-xs text-muted">
                            <p>{offer.fuelLabel}</p>
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
                        className="mt-4 w-full rounded-md bg-[#17894e] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#117241] disabled:cursor-not-allowed disabled:bg-muted-soft"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        </article>
    );
}

function SpecPill({ children }) {
    return (
        <span className="rounded-sm border border-border bg-paper-2 px-2 py-0.5 text-xs font-medium text-ink">
            {children}
        </span>
    );
}
