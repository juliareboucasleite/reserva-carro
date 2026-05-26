import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../icons';
import { useI18n } from '../../i18n';
import { ScreenHeader } from '../components/ScreenHeader';
import { useBooking } from '../context';
import { formatSearchPeriod } from '../format';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

export function MapScreen() {
  const { t, lang } = useI18n();
  const b = t.booking;
  const { goBack, setMenuOpen, pickup, pickupDate, returnDate, pickupTime, returnTime, navigate, vehicles } =
    useBooking();

  const period = formatSearchPeriod(pickupDate, returnDate, pickupTime, returnTime, lang);

  return (
    <View style={styles.root}>
      <ScreenHeader title={b.mapTitle} onBack={goBack} onMenu={() => setMenuOpen(true)} />

      <View style={styles.searchPill}>
        <Text style={styles.searchText}>
          {pickup?.label ?? '—'} ({period})
        </Text>
      </View>

      <View style={styles.mapArea}>
        <Icon name="map" size={48} color={colors.brandGreen} />
        <Text style={styles.mapHint}>{b.mapPlaceholder}</Text>
        <View style={styles.markerRow}>
          <View style={styles.marker}>
            <Icon name="car-sport" size={16} color={colors.paper} />
          </View>
          <View style={styles.marker}>
            <Text style={styles.markerText}>{vehicles.length}</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.listFab} onPress={() => navigate('results')}>
        <Icon name="list" size={18} color={colors.paper} />
        <Text style={styles.listFabText}>{b.list}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper2,
  },
  searchPill: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchText: {
    fontSize: fontSizes.small,
    color: colors.ink,
    fontWeight: fontWeights.medium,
  },
  mapArea: {
    flex: 1,
    marginHorizontal: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: '#e8f5ee',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  mapHint: {
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  markerRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brandGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: colors.paper,
    fontWeight: fontWeights.bold,
  },
  listFab: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
  },
  listFabText: {
    color: colors.paper,
    fontWeight: fontWeights.bold,
  },
});
