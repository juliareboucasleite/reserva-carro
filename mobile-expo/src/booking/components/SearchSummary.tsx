import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../icons';
import { useBooking } from '../context';
import { formatSearchPeriod } from '../format';
import { useI18n } from '../../i18n';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

export function SearchSummary({ onEdit }: { onEdit?: () => void }) {
  const { lang } = useI18n();
  const { pickup, returnLoc, differentReturn, pickupDate, returnDate, pickupTime, returnTime, setSearchOpen } =
    useBooking();

  const location = differentReturn && returnLoc ? returnLoc.label : pickup?.label ?? '—';
  const period = formatSearchPeriod(pickupDate, returnDate, pickupTime, returnTime, lang);

  return (
    <Pressable
      style={styles.box}
      onPress={onEdit ?? (() => setSearchOpen(true))}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.location}>{location}</Text>
        <Text style={styles.period}>{period}</Text>
      </View>
      <Icon name="create-outline" size={20} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: colors.paper,
  },
  location: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  period: {
    marginTop: 4,
    fontSize: fontSizes.small,
    color: colors.muted,
  },
});
