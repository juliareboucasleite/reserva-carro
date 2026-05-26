import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../icons';
import { useI18n } from '../../i18n';
import type { SortOption } from '../catalog';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

export function SortSheet({
  open,
  value,
  onChange,
  onClose,
}: {
  open: boolean;
  value: SortOption;
  onChange: (sort: SortOption) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const b = t.booking;

  const options: { key: SortOption; label: string }[] = [
    { key: 'recommended', label: b.sortRecommended },
    { key: 'price_asc', label: b.sortPriceAsc },
    { key: 'price_desc', label: b.sortPriceDesc },
  ];

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>{b.sortBy}</Text>
          <Pressable onPress={onClose} style={styles.close}>
            <Icon name="close" size={18} color={colors.ink} />
          </Pressable>
        </View>
        {options.map((option) => {
          const selected = value === option.key;
          return (
            <Pressable
              key={option.key}
              style={styles.row}
              onPress={() => {
                onChange(option.key);
                onClose();
              }}
            >
              <Icon
                name={selected ? 'checkmark-circle' : 'radio-off'}
                size={22}
                color={selected ? colors.brandGreen : colors.muted}
              />
              <Text style={styles.rowLabel}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.h3,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowLabel: {
    fontSize: fontSizes.body,
    color: colors.ink,
  },
});
