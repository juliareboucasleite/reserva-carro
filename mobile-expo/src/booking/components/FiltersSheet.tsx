import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../icons';
import { useI18n } from '../../i18n';
import {
  categoryLabel,
  DEFAULT_FILTERS,
  type CatalogVehicle,
  type VehicleFilters,
} from '../catalog';
import { GreenButton } from '../ui';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

export function FiltersSheet({
  open,
  vehicles,
  filters,
  onChange,
  onClose,
  resultCount,
}: {
  open: boolean;
  vehicles: CatalogVehicle[];
  filters: VehicleFilters;
  onChange: (filters: VehicleFilters) => void;
  onClose: () => void;
  resultCount: number;
}) {
  const { t, lang } = useI18n();
  const b = t.booking;

  const categories = [...new Set(vehicles.map((v) => v.category))];
  const bases = [...new Set(vehicles.map((v) => v.base).filter(Boolean))] as string[];
  const seatOptions = [2, 3, 4, 5, 9];

  const toggleCategory = (category: string) => {
    const next = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: next });
  };

  const toggleBase = (base: string) => {
    const next = filters.bases.includes(base)
      ? filters.bases.filter((b) => b !== base)
      : [...filters.bases, base];
    onChange({ ...filters, bases: next });
  };

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{b.filters}</Text>
          <Pressable onPress={onClose} style={styles.close}>
            <Icon name="close" size={18} color={colors.ink} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={styles.section}>{b.categories}</Text>
          <View style={styles.chips}>
            {categories.map((category) => (
              <Pressable
                key={category}
                style={[styles.chip, filters.categories.includes(category) && styles.chipOn]}
                onPress={() => toggleCategory(category)}
              >
                <Text
                  style={[
                    styles.chipText,
                    filters.categories.includes(category) && styles.chipTextOn,
                  ]}
                >
                  {categoryLabel(category, lang)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.section}>{b.passengers}</Text>
          <View style={styles.chips}>
            {seatOptions.map((seats) => (
              <Pressable
                key={seats}
                style={[styles.circle, filters.minSeats === seats && styles.chipOn]}
                onPress={() =>
                  onChange({
                    ...filters,
                    minSeats: filters.minSeats === seats ? null : seats,
                  })
                }
              >
                <Text
                  style={[styles.chipText, filters.minSeats === seats && styles.chipTextOn]}
                >
                  {seats}
                </Text>
              </Pressable>
            ))}
          </View>

          {bases.length > 0 ? (
            <>
              <Text style={styles.section}>{b.bases}</Text>
              {bases.map((base) => (
                <Pressable key={base} style={styles.checkRow} onPress={() => toggleBase(base)}>
                  <Icon
                    name={filters.bases.includes(base) ? 'checkmark-circle' : 'radio-off'}
                    size={20}
                    color={filters.bases.includes(base) ? colors.brandGreen : colors.muted}
                  />
                  <Text style={styles.checkLabel}>{base}</Text>
                </Pressable>
              ))}
            </>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={() => onChange(DEFAULT_FILTERS)}>
            <Text style={styles.clear}>{b.clearFilters}</Text>
          </Pressable>
          <GreenButton
            label={b.showOffers.replace('{n}', String(resultCount))}
            onPress={onClose}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingTop: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.bold,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.paper3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipOn: {
    backgroundColor: colors.brandGreen,
    borderColor: colors.brandGreen,
  },
  chipText: {
    color: colors.ink,
    fontSize: fontSizes.small,
  },
  chipTextOn: {
    color: colors.paper,
    fontWeight: fontWeights.semibold,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  checkLabel: {
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.paper,
  },
  clear: {
    color: colors.focusBlue,
    fontWeight: fontWeights.semibold,
    paddingHorizontal: spacing.sm,
  },
});
