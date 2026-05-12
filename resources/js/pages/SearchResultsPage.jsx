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

function buildSearchOffer(vehicle, search) {
    const preset = getOfferPreset(vehicle);
    const distanceExtra = search?.routeData?.distance_km ? Math.min(search.routeData.distance_km * 0.12, 22) : 0;
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
    const [selectedPickupModes, setSelectedPickupModes] = useState([]);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const [selectedProtections, setSelectedProtections] = useState([]);
    const [selectedIncluded, setSelectedIncluded] = useState([]);
    const [selectedMileage, setSelectedMileage] = useState([]);
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [promoOnly, setPromoOnly] = useState(false);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [sortOrder, setSortOrder] = useState('recommended');

    const offers = useMemo(() => vehicles.map((vehicle) => buildSearchOffer(vehicle, search)), [vehicles, search]);

    const categoryOptions = useMemo(() => {
        const groups = new Map();
        offers.forEach((offer) => {
            const current = groups.get(offer.categoryLabel) || { label: offer.categoryLabel, count: 0, minPrice: offer.price };
            current.count += 1;
            current.minPrice = Math.min(current.minPrice, offer.price);
            groups.set(offer.categoryLabel, current);
        });
        return [...groups.values()].sort((a, b) => a.minPrice - b.minPrice);
    }, [offers]);

    const supplierOptions = useMemo(() => {
        const groups = new Map();
        offers.forEach((offer) => {
            const current = groups.get(offer.supplier) || { label: offer.supplier, count: 0, minPrice: offer.price };
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
            offer.features.forEach((feature) => groups.set(feature, (groups.get(feature) || 0) + 1));
        });
        return [...groups.entries()].map(([label, count]) => ({ label, count }));
    }, [offers]);

    const protectionOptions = useMemo(() => {
        const groups = new Map();
        offers.forEach((offer) => {
            offer.protections.forEach((item) => groups.set(item, (groups.get(item) || 0) + 1));
        });
        return [...groups.entries()].map(([label, count]) => ({ label, count }));
    }, [offers]);

    const includedOptions = useMemo(() => {
        const groups = new Map();
        offers.forEach((offer) => {
            offer.included.forEach((item) => groups.set(item, (groups.get(item) || 0) + 1));
        });
        return [...groups.entries()].map(([label, count]) => ({ label, count }));
    }, [offers]);

    const mileageOptions = useMemo(() => {
        const groups = new Map();
        offers.forEach((offer) => groups.set(offer.mileageLabel, (groups.get(offer.mileageLabel) || 0) + 1));
        return [...groups.entries()].map(([label, count]) => ({ label, count }));
    }, [offers]);

    const paymentOptions = useMemo(() => {
        const groups = new Map();
        offers.forEach((offer) => groups.set(offer.payment, (groups.get(offer.payment) || 0) + 1));
        return [...groups.entries()].map(([label, count]) => ({ label, count }));
    }, [offers]);

    const ratingOptions = useMemo(() => {
        const labels = ['Excelente', 'Muito Bom', 'Bom', 'Regular'];
        return labels
            .map((label) => ({ label, count: offers.filter((offer) => getRatingBucketLabel(offer.rating) === label).length }))
            .filter((item) => item.count > 0);
    }, [offers]);

    const minAvailablePrice = useMemo(() => (offers.length ? Math.floor(Math.min(...offers.map((offer) => offer.price))) : 0), [offers]);
    const maxAvailablePrice = useMemo(() => (offers.length ? Math.ceil(Math.max(...offers.map((offer) => offer.price))) : 0), [offers]);

    useEffect(() => {
        if (!offers.length) return;
        if (priceMin === '') setPriceMin(String(minAvailablePrice));
        if (priceMax === '') setPriceMax(String(maxAvailablePrice));
    }, [offers, priceMin, priceMax, minAvailablePrice, maxAvailablePrice]);

    const filteredOffers = useMemo(() => {
        let result = offers.filter((offer) => {
            if (statusFilter === 'available' && offer.vehicle.availability === 'inoperational') return false;
            if (promoOnly && offer.cashback < 5) return false;
            if (selectedCategories.length && !selectedCategories.includes(offer.categoryLabel)) return false;
            if (selectedSuppliers.length && !selectedSuppliers.includes(offer.supplier)) return false;
            if (selectedPickupModes.length && !selectedPickupModes.includes(offer.pickupMode)) return false;
            if (selectedFeatures.length && !selectedFeatures.every((feature) => offer.features.includes(feature))) return false;
            if (selectedRatings.length && !selectedRatings.includes(getRatingBucketLabel(offer.rating))) return false;
            if (selectedProtections.length && !selectedProtections.every((item) => offer.protections.includes(item))) return false;
            if (selectedIncluded.length && !selectedIncluded.every((item) => offer.included.includes(item))) return false;
            if (selectedMileage.length && !selectedMileage.includes(offer.mileageLabel)) return false;
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
    }, [offers, statusFilter, selectedCategories, selectedSuppliers, selectedPickupModes, selectedFeatures, selectedRatings, selectedProtections, selectedIncluded, selectedMileage, selectedPayments, promoOnly, priceMin, priceMax, sortOrder]);

    const activeFilterTags = [
        ...(promoOnly ? [{ type: 'promo', value: 'Goleada de Ofertas' }] : []),
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

    function toggleFilterValue(setter, value) {
        setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
    }

    function clearSearchFilters() {
        setPromoOnly(false);
        setSelectedCategories([]);
        setSelectedSuppliers([]);
        setSelectedPickupModes([]);
        setSelectedFeatures([]);
        setSelectedRatings([]);
        setSelectedProtections([]);
        setSelectedIncluded([]);
        setSelectedMileage([]);
        setSelectedPayments([]);
        setPriceMin(String(minAvailablePrice));
        setPriceMax(String(maxAvailablePrice));
        setSortOrder('recommended');
        setStatusFilter('all');
    }

    function removeActiveFilter(tag) {
        if (tag.type === 'promo') setPromoOnly(false);
        if (tag.type === 'category') toggleFilterValue(setSelectedCategories, tag.value);
        if (tag.type === 'supplier') toggleFilterValue(setSelectedSuppliers, tag.value);
        if (tag.type === 'pickup') toggleFilterValue(setSelectedPickupModes, tag.value);
        if (tag.type === 'feature') toggleFilterValue(setSelectedFeatures, tag.value);
        if (tag.type === 'rating') toggleFilterValue(setSelectedRatings, tag.value);
        if (tag.type === 'protection') toggleFilterValue(setSelectedProtections, tag.value);
        if (tag.type === 'included') toggleFilterValue(setSelectedIncluded, tag.value);
        if (tag.type === 'mileage') toggleFilterValue(setSelectedMileage, tag.value);
        if (tag.type === 'payment') toggleFilterValue(setSelectedPayments, tag.value);
    }

    return (
        <div className="min-h-screen bg-paper-2 text-ink">
            <div className="border-b border-border-soft bg-paper">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <button type="button" onClick={onBack} className="rounded-2xl border border-border px-4 py-2 text-sm font-medium hover:border-ink/20">
                        ← Voltar
                    </button>
                    <button type="button" onClick={onGoToLogin} className="text-sm font-medium text-ink underline">
                        Iniciar sessão
                    </button>
                </div>
            </div>

            <section className="bg-paper-2 py-8">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="rounded-[28px] border border-border bg-paper px-6 py-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-lg font-bold text-ink">
                                    {search?.pickupLocationData?.label || search?.pickupLocation || 'Portugal'} <span className="px-2 text-muted">›</span> {search?.returnLocationData?.label || search?.returnLocation || search?.pickupLocationData?.label || search?.pickupLocation || 'Portugal'}
                                </p>
                                <p className="mt-1 text-sm text-muted">{searchSummary}</p>
                            </div>
                            {search?.routeData && (
                                <div className="rounded-2xl bg-paper-2 px-4 py-2 text-sm text-ink">
                                    {search.routeData.distance_km} km · {search.routeData.duration_min} min · {search.routeData.scope_label || search.routeData.route_kind}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className="space-y-5">
                            <div className="overflow-hidden rounded-[28px] border border-border bg-paper shadow-sm">
                                <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
                                    <h3 className="text-3xl font-bold tracking-tight text-ink">Filtros</h3>
                                    <button type="button" onClick={clearSearchFilters} className="text-sm font-medium text-[#0f6bdf] hover:text-[#0a55b4]">
                                        Limpar filtros
                                    </button>
                                </div>

                                <div className="space-y-5 px-5 py-5">
                                    <FilterSection title="Promoções">
                                        <button type="button" onClick={() => setPromoOnly((current) => !current)} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${promoOnly ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-border bg-paper-2 text-ink hover:border-ink/20'}`}>
                                            Goleada de Ofertas
                                        </button>
                                    </FilterSection>

                                    <FilterSection title="Preço total">
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="rounded-2xl border border-border bg-paper-2 px-3 py-2">
                                                <span className="block text-xs text-muted">Mínimo</span>
                                                <input type="number" min={minAvailablePrice} max={maxAvailablePrice} value={priceMin} onChange={(event) => setPriceMin(event.target.value)} className="mt-1 w-full bg-transparent text-base font-semibold text-ink outline-none" />
                                            </label>
                                            <label className="rounded-2xl border border-border bg-paper-2 px-3 py-2">
                                                <span className="block text-xs text-muted">Máximo</span>
                                                <input type="number" min={minAvailablePrice} max={maxAvailablePrice} value={priceMax} onChange={(event) => setPriceMax(event.target.value)} className="mt-1 w-full bg-transparent text-base font-semibold text-ink outline-none" />
                                            </label>
                                        </div>
                                        <p className="mt-3 text-xs text-muted">{formatEuro(minAvailablePrice)} até {formatEuro(maxAvailablePrice)}</p>
                                    </FilterSection>

                                    <FilterSection title="Levantamento">
                                        <div className="space-y-2">
                                            {pickupModeOptions.map((option) => (
                                                <SidebarCheckbox key={option.label} label={option.label} meta={option.count} checked={selectedPickupModes.includes(option.label)} onChange={() => toggleFilterValue(setSelectedPickupModes, option.label)} />
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Características">
                                        <div className="flex flex-wrap gap-2">
                                            {featureOptions.map((option) => (
                                                <PillButton key={option.label} active={selectedFeatures.includes(option.label)} onClick={() => toggleFilterValue(setSelectedFeatures, option.label)}>
                                                    {option.label}
                                                </PillButton>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Categorias">
                                        <div className="space-y-2">
                                            {categoryOptions.map((option) => (
                                                <SidebarCheckbox key={option.label} label={option.label} meta={formatEuro(option.minPrice)} checked={selectedCategories.includes(option.label)} onChange={() => toggleFilterValue(setSelectedCategories, option.label)} />
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Locadora">
                                        <div className="space-y-2">
                                            {supplierOptions.map((option) => (
                                                <SidebarCheckbox key={option.label} label={option.label} meta={formatEuro(option.minPrice)} checked={selectedSuppliers.includes(option.label)} onChange={() => toggleFilterValue(setSelectedSuppliers, option.label)} />
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Avaliações">
                                        <div className="flex flex-wrap gap-2">
                                            {ratingOptions.map((option) => (
                                                <PillButton key={option.label} active={selectedRatings.includes(option.label)} onClick={() => toggleFilterValue(setSelectedRatings, option.label)}>
                                                    {option.label}
                                                </PillButton>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Proteções">
                                        <div className="flex flex-wrap gap-2">
                                            {protectionOptions.map((option) => (
                                                <PillButton key={option.label} active={selectedProtections.includes(option.label)} onClick={() => toggleFilterValue(setSelectedProtections, option.label)}>
                                                    {option.label}
                                                </PillButton>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Incluído no Preço">
                                        <div className="flex flex-wrap gap-2">
                                            {includedOptions.map((option) => (
                                                <PillButton key={option.label} active={selectedIncluded.includes(option.label)} onClick={() => toggleFilterValue(setSelectedIncluded, option.label)}>
                                                    {option.label}
                                                </PillButton>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Quilometragem">
                                        <div className="space-y-2">
                                            {mileageOptions.map((option) => (
                                                <SidebarCheckbox key={option.label} label={option.label} meta={option.count} checked={selectedMileage.includes(option.label)} onChange={() => toggleFilterValue(setSelectedMileage, option.label)} />
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Pagamento">
                                        <div className="space-y-2">
                                            {paymentOptions.map((option) => (
                                                <SidebarCheckbox key={option.label} label={option.label} meta={option.count} checked={selectedPayments.includes(option.label)} onChange={() => toggleFilterValue(setSelectedPayments, option.label)} />
                                            ))}
                                        </div>
                                    </FilterSection>
                                </div>
                            </div>
                        </aside>

                        <div className="min-w-0">
                            <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
                                {categoryOptions.map((option) => (
                                    <button key={option.label} type="button" onClick={() => toggleFilterValue(setSelectedCategories, option.label)} className={`min-w-[170px] rounded-[24px] border bg-paper px-4 py-4 text-left shadow-sm transition ${selectedCategories.includes(option.label) ? 'border-ink shadow-md' : 'border-border hover:border-ink/20'}`}>
                                        <p className="text-lg font-bold text-ink">{option.label}</p>
                                        <p className="mt-1 text-sm text-muted">A partir de {formatEuro(option.minPrice)}</p>
                                        <p className="mt-2 text-xs text-muted">{option.count} opção(ões)</p>
                                    </button>
                                ))}
                            </div>

                            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <div className="flex gap-1 rounded-full border border-border bg-paper p-1 text-xs shadow-sm">
                                        <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>Todas</FilterChip>
                                        <FilterChip active={statusFilter === 'available'} onClick={() => setStatusFilter('available')}>Disponíveis</FilterChip>
                                    </div>
                                    <h2 className="mt-4 text-4xl font-bold tracking-tight text-ink">{filteredOffers.length} carro{filteredOffers.length === 1 ? '' : 's'} encontrados</h2>
                                </div>

                                <label className="flex items-center gap-3 rounded-2xl border border-border bg-paper px-4 py-3 text-sm shadow-sm">
                                    <span className="font-medium text-ink">Ordenar por</span>
                                    <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="bg-transparent font-medium text-ink outline-none">
                                        <option value="recommended">Mais procurados</option>
                                        <option value="price_asc">Preço mais baixo</option>
                                        <option value="price_desc">Preço mais alto</option>
                                        <option value="rating">Melhor avaliação</option>
                                    </select>
                                </label>
                            </div>

                            {activeFilterTags.length > 0 && (
                                <div className="mb-5 flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-muted">Filtros ativos:</span>
                                    {activeFilterTags.map((tag) => (
                                        <button key={`${tag.type}-${tag.value}`} type="button" onClick={() => removeActiveFilter(tag)} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-900">
                                            {tag.value} ×
                                        </button>
                                    ))}
                                    <button type="button" onClick={clearSearchFilters} className="ml-2 text-sm font-medium text-[#0f6bdf] hover:text-[#0a55b4]">
                                        Limpar filtros
                                    </button>
                                </div>
                            )}

                            {filteredOffers.length === 0 ? (
                                <div className="rounded-3xl border border-border bg-paper px-5 py-14 text-center text-sm text-muted shadow-sm">
                                    Sem carros com estes critérios.
                                </div>
                            ) : (
                                <div className="space-y-4">
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

function FilterSection({ title, children }) {
    return (
        <section className="border-t border-border-soft pt-5 first:border-t-0 first:pt-0">
            <h4 className="mb-4 text-xl font-semibold tracking-tight text-ink">{title}</h4>
            {children}
        </section>
    );
}

function SidebarCheckbox({ label, meta, checked, onChange }) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-1 py-1 text-sm text-ink">
            <span className="flex items-center gap-3">
                <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-border text-ink focus:ring-ink/20" />
                <span>{label}</span>
            </span>
            <span className="text-xs text-muted">{meta}</span>
        </label>
    );
}

function FilterChip({ active, onClick, children }) {
    return (
        <button type="button" onClick={onClick} className={`rounded-full px-3 py-2 font-medium transition ${active ? 'bg-ink text-white' : 'text-muted hover:bg-paper-2 hover:text-ink'}`}>
            {children}
        </button>
    );
}

function PillButton({ active, onClick, children }) {
    return (
        <button type="button" onClick={onClick} className={`rounded-full border px-3 py-2 text-sm transition ${active ? 'border-sky-500 bg-sky-50 text-sky-900' : 'border-border bg-paper-2 text-ink hover:border-ink/20'}`}>
            {children}
        </button>
    );
}

function SearchOfferCard({ offer, onReserve }) {
    return (
        <article className="overflow-hidden rounded-[28px] border border-border bg-paper shadow-sm transition hover:border-ink/20 hover:shadow-md">
            <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)_210px]">
                <div className="border-b border-border-soft bg-paper-2 lg:border-b-0 lg:border-r">
                    <div className="aspect-[5/4] overflow-hidden">
                        <VehicleMedia vehicle={offer.vehicle} imageClassName="h-full w-full object-cover" className="h-full w-full" />
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm">
                        <span className="font-medium text-ink">{offer.supplier}</span>
                        <span className="rounded-full bg-sky-600 px-2 py-1 text-xs font-semibold text-white">{offer.rating}</span>
                    </div>
                </div>

                <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight text-ink">{offer.title}</h3>
                            <p className="mt-1 text-sm text-muted">{offer.subtitle}</p>
                        </div>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            Cashback de {formatEuro(offer.cashback)}
                        </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                        <SpecPill>{offer.vehicle.seats} lugares</SpecPill>
                        <SpecPill>{offer.luggage} bagagens</SpecPill>
                        <SpecPill>{offer.transmission}</SpecPill>
                        <SpecPill>{offer.mileageLabel}</SpecPill>
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_220px]">
                        <div>
                            <div className="space-y-2 text-sm text-ink">
                                {offer.protections.map((item) => (
                                    <p key={item}>✓ {item}</p>
                                ))}
                            </div>

                            <div className="mt-5 rounded-2xl bg-paper-2 px-4 py-3 text-sm">
                                <p className="font-medium text-ink">{offer.pickupLabel}</p>
                                <p className="mt-1 text-muted">{offer.pickupMode}</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border-soft bg-paper-2/60 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted">A sua reserva</p>
                            <p className="mt-3 text-3xl font-bold tracking-tight text-ink">{formatEuro(offer.price)}</p>
                            <p className="mt-1 text-sm text-positive">Cancelamento grátis</p>

                            <div className="mt-4 space-y-1 text-sm text-muted">
                                <p>{offer.fuelLabel}</p>
                                <p>{offer.payment}</p>
                                {offer.included.map((item) => (
                                    <p key={item}>{item}</p>
                                ))}
                            </div>

                            <button type="button" onClick={onReserve} disabled={offer.vehicle.availability === 'inoperational'} className="mt-5 w-full rounded-2xl bg-[#17894e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#117241] disabled:cursor-not-allowed disabled:bg-slate-300">
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="hidden border-l border-border-soft bg-paper xl:block">
                    <div className="flex h-full flex-col justify-between p-5">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Categoria</p>
                            <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{offer.categoryLabel}</p>
                            <p className="mt-1 text-sm text-muted">Desde {formatEuro(offer.price)}/dia</p>
                        </div>

                        <div className="space-y-2 text-sm text-muted">
                            <p>{offer.pickupLabel}</p>
                            <p>{offer.dropoffLabel}</p>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

function SpecPill({ children }) {
    return <span className="rounded-xl bg-paper-2 px-3 py-2 text-sm font-medium text-ink">{children}</span>;
}
