import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Icon } from '../../icons';
import { useI18n } from '../../i18n';
import { LOCATIONS, NEAR_PICKUP } from '../locations';
import { useBooking } from '../context';
import type { LocationFilter, LocationOption } from '../types';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

export function LocationSearchScreen({ mode }: { mode: 'pickup' | 'return' }) {
  const { t } = useI18n();
  const b = t.booking;
  const {
    goBack,
    pickup,
    setPickup,
    setReturnLoc,
    setSearchOpen,
    setDifferentReturn,
  } = useBooking();
  const [query, setQuery] = useState(mode === 'pickup' ? (pickup?.label ?? '') : '');
  const [filter, setFilter] = useState<LocationFilter>('all');

  const title = mode === 'pickup' ? b.pickupLocation : b.returnLocation;

  const filters: { key: LocationFilter; label: string }[] = [
    { key: 'all', label: b.filterAll },
    { key: 'airport', label: b.filterAirports },
    { key: 'city', label: b.filterCities },
    { key: 'neighborhood', label: b.filterNeighborhoods },
  ];

  const results = useMemo(() => {
    const pool = mode === 'return' && query.length < 3 ? NEAR_PICKUP : LOCATIONS;
    const q = query.trim().toLowerCase();
    return pool.filter((loc) => {
      if (filter !== 'all' && loc.kind !== filter) return false;
      if (q.length < 3) return mode === 'return' && !q;
      return loc.label.toLowerCase().includes(q);
    });
  }, [query, filter, mode]);

  const select = (loc: LocationOption) => {
    if (mode === 'pickup') {
      setPickup(loc);
    } else {
      setReturnLoc(loc);
      setDifferentReturn(true);
    }
    setSearchOpen(true);
    goBack();
  };

  const samePickup = () => {
    if (pickup) {
      setReturnLoc(pickup);
      setDifferentReturn(false);
      setSearchOpen(true);
      goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable onPress={goBack} style={styles.back}>
        <Icon name="arrow-back" size={24} color={colors.ink} />
      </Pressable>

      <Text style={styles.title}>{title}</Text>

      <View style={[styles.inputWrap, query.length > 0 && styles.inputFocused]}>
        <Icon name="location-outline" size={20} color={colors.muted} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={b.searchPlaceholder}
          placeholderTextColor={colors.mutedSoft}
          autoFocus
        />
      </View>
      <Text style={styles.hint}>{b.searchHint}</Text>

      {mode === 'pickup' ? (
        <View style={styles.chips}>
          {filters.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, filter === f.key && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {mode === 'return' ? (
        <Pressable style={styles.sameRow} onPress={samePickup}>
          <View style={styles.sameIcon}>
            <Icon name="return-up-back" size={20} color={colors.muted} />
          </View>
          <Text style={styles.sameLabel}>{b.samePickup}</Text>
        </Pressable>
      ) : null}

      {mode === 'return' && query.length < 3 ? (
        <Text style={styles.section}>{b.nearPickup}</Text>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => select(item)}>
            <View style={styles.rowIcon}>
              <Icon
                name={item.kind === 'airport' ? 'airplane' : 'location-outline'}
                size={18}
                color={colors.muted}
              />
            </View>
            <Text style={styles.rowLabel}>{item.label}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          query.length >= 3 ? (
            <Text style={styles.empty}>{t.common.loading}</Text>
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  back: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.sm,
    color: colors.ink,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  inputFocused: {
    borderColor: colors.focusBlue,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  hint: {
    marginTop: spacing.sm,
    fontSize: fontSizes.small,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.brandYellow,
    borderColor: colors.brandYellow,
  },
  chipText: {
    fontSize: fontSizes.small,
    color: colors.ink,
  },
  chipTextActive: {
    fontWeight: fontWeights.semibold,
  },
  sameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sameIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.paper3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sameLabel: {
    fontSize: fontSizes.body,
    color: colors.ink,
    fontWeight: fontWeights.medium,
  },
  section: {
    fontWeight: fontWeights.bold,
    marginBottom: spacing.sm,
    color: colors.ink,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.paper3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    padding: spacing.xl,
  },
});
