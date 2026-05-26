import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Icon } from '../../icons';
import { useI18n } from '../../i18n';
import { applyFilters, applySort, categoryLabel } from '../catalog';
import { CarCard } from '../components/CarCard';
import { FiltersSheet } from '../components/FiltersSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchSummary } from '../components/SearchSummary';
import { SortSheet } from '../components/SortSheet';
import { useBooking } from '../context';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

export function ResultsScreen() {
  const { t, lang } = useI18n();
  const b = t.booking;
  const {
    goBack,
    setMenuOpen,
    vehicles,
    vehiclesLoading,
    rentalDays,
    selectVehicle,
    sortBy,
    setSortBy,
    filters,
    setFilters,
    navigate,
  } = useBooking();
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(
    () => applySort(applyFilters(vehicles, filters), sortBy),
    [vehicles, filters, sortBy],
  );

  const categories = useMemo(() => [...new Set(vehicles.map((v) => v.category))], [vehicles]);

  return (
    <View style={styles.root}>
      <ScreenHeader title={b.chooseCar} onBack={goBack} onMenu={() => setMenuOpen(true)} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <SearchSummary />

        <View style={styles.actions}>
          <ActionChip icon="sort" label={b.sort} onPress={() => setSortOpen(true)} />
          <ActionChip icon="filters" label={b.filters} onPress={() => setFiltersOpen(true)} />
          <ActionChip icon="map" label={b.map} onPress={() => navigate('map')} />
        </View>

        <Text style={styles.count}>
          {b.carsFound.replace('{n}', String(filtered.length))}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {categories.map((category) => (
            <Pressable
              key={category}
              style={[
                styles.categoryChip,
                filters.categories.length === 1 &&
                  filters.categories[0] === category &&
                  styles.categoryChipOn,
              ]}
              onPress={() =>
                setFilters({
                  ...filters,
                  categories: filters.categories.includes(category) ? [] : [category],
                })
              }
            >
              <Text
                style={[
                  styles.categoryText,
                  filters.categories.includes(category) && styles.categoryTextOn,
                ]}
              >
                {categoryLabel(category, lang)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {vehiclesLoading ? (
          <ActivityIndicator color={colors.brandGreen} style={{ marginTop: spacing.xl }} />
        ) : filtered.length === 0 ? (
          <Text style={styles.empty}>{b.noCars}</Text>
        ) : (
          filtered.map((vehicle) => (
            <CarCard
              key={vehicle.id}
              vehicle={vehicle}
              days={rentalDays}
              onPress={() => selectVehicle(vehicle)}
            />
          ))
        )}
      </ScrollView>

      <SortSheet
        open={sortOpen}
        value={sortBy}
        onChange={setSortBy}
        onClose={() => setSortOpen(false)}
      />
      <FiltersSheet
        open={filtersOpen}
        vehicles={vehicles}
        filters={filters}
        onChange={setFilters}
        onClose={() => setFiltersOpen(false)}
        resultCount={filtered.length}
      />
    </View>
  );
}

function ActionChip({
  icon,
  label,
  onPress,
}: {
  icon: Parameters<typeof Icon>[0]['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionChip} onPress={onPress}>
      <Icon name={icon} size={16} color={colors.ink} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: fontSizes.small,
    fontWeight: fontWeights.medium,
    color: colors.ink,
  },
  count: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.md,
  },
  categories: {
    marginBottom: spacing.md,
    flexGrow: 0,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginRight: spacing.sm,
    backgroundColor: colors.paper,
  },
  categoryChipOn: {
    backgroundColor: colors.brandYellow,
    borderColor: colors.brandYellow,
  },
  categoryText: {
    fontSize: fontSizes.small,
    color: colors.ink,
  },
  categoryTextOn: {
    fontWeight: fontWeights.semibold,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: spacing.xl,
  },
});
