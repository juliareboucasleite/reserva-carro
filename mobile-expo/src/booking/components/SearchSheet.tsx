import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../i18n';
import { useBooking } from '../context';
import { formatBookingDate } from '../format';
import { GreenButton } from '../ui';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

export function SearchSheet() {
  const { t, lang } = useI18n();
  const b = t.booking;
  const {
    searchOpen,
    setSearchOpen,
    pickup,
    returnLoc,
    differentReturn,
    setDifferentReturn,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
    openLocationPicker,
    navigate,
    confirmSearch,
  } = useBooking();

  const displayReturn = differentReturn && returnLoc ? returnLoc : pickup;
  const locationLabel = pickup?.label ?? b.searchPlaceholder;

  return (
    <Modal visible={searchOpen} animationType="slide" onRequestClose={() => setSearchOpen(false)}>
      <View style={styles.container}>
        <Pressable style={styles.close} onPress={() => setSearchOpen(false)}>
          <Ionicons name="close" size={22} color={colors.ink} />
        </Pressable>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionLabel}>{b.pickupReturn}</Text>
          <Pressable style={styles.locationInput} onPress={() => openLocationPicker('pickup')}>
            <Ionicons name="location-outline" size={20} color={colors.muted} />
            <Text style={styles.locationText} numberOfLines={2}>
              {locationLabel}
            </Text>
          </Pressable>

          {!differentReturn ? (
            <Pressable
              style={styles.linkRow}
              onPress={() => {
                setDifferentReturn(true);
                openLocationPicker('return');
              }}
            >
              <Ionicons name="add" size={18} color={colors.muted} />
              <Text style={styles.linkText}>{b.differentReturn}</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.locationInput, { marginTop: spacing.md }]}
              onPress={() => openLocationPicker('return')}
            >
              <Ionicons name="location-outline" size={20} color={colors.muted} />
              <Text style={styles.locationText} numberOfLines={2}>
                {displayReturn?.label ?? b.returnLocation}
              </Text>
            </Pressable>
          )}

          <View style={styles.divider} />

          <View style={styles.dateRow}>
            <View style={styles.dateCol}>
              <Text style={styles.colLabel}>{b.pickup}</Text>
              <View style={styles.dateBox}>
                <Pressable style={styles.dateHalf}>
                  <Ionicons name="calendar-outline" size={18} color={colors.muted} />
                  <Text style={styles.dateText}>{formatBookingDate(pickupDate, lang)}</Text>
                </Pressable>
                <View style={styles.innerDivider} />
                <Pressable
                  style={styles.dateHalf}
                  onPress={() => {
                    setSearchOpen(false);
                    navigate('time-picker');
                  }}
                >
                  <Ionicons name="time-outline" size={18} color={colors.muted} />
                  <Text style={styles.dateText}>{pickupTime}</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.dateCol}>
              <Text style={styles.colLabel}>{b.return}</Text>
              <View style={styles.dateBox}>
                <Pressable style={styles.dateHalf}>
                  <Ionicons name="calendar-outline" size={18} color={colors.muted} />
                  <Text style={styles.dateText}>{formatBookingDate(returnDate, lang)}</Text>
                </Pressable>
                <View style={styles.innerDivider} />
                <Pressable
                  style={styles.dateHalf}
                  onPress={() => {
                    setSearchOpen(false);
                    navigate('time-picker');
                  }}
                >
                  <Ionicons name="time-outline" size={18} color={colors.muted} />
                  <Text style={styles.dateText}>{returnTime}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>{b.residenceCountry}</Text>
          <View style={styles.countryRow}>
            <Text style={styles.flag}>🇵🇹</Text>
            <Text style={styles.countryText}>Portugal</Text>
            <Ionicons name="chevron-down" size={18} color={colors.muted} />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <GreenButton label={b.search} onPress={confirmSearch} />
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
  close: {
    marginLeft: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.paper3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  sectionLabel: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  locationText: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  linkText: {
    color: colors.muted,
    fontSize: fontSizes.body,
  },
  divider: {
    height: 8,
    backgroundColor: colors.paper3,
    marginVertical: spacing.lg,
    marginHorizontal: -spacing.lg,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateCol: {
    flex: 1,
  },
  colLabel: {
    fontWeight: fontWeights.bold,
    marginBottom: spacing.sm,
    color: colors.ink,
  },
  dateBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  dateHalf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  innerDivider: {
    height: 1,
    backgroundColor: colors.borderSoft,
  },
  dateText: {
    fontSize: fontSizes.small,
    color: colors.ink,
    flex: 1,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  flag: {
    fontSize: 20,
  },
  countryText: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
});
