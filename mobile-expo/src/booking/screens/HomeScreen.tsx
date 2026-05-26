import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useI18n } from '../../i18n';
import { useBooking } from '../context';
import { BrandLogo, GreenButton, IconButton } from '../ui';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

export function HomeScreen() {
  const { t } = useI18n();
  const b = t.booking;
  const { setMenuOpen, navigate, setSearchOpen } = useBooking();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <BrandLogo />
          <View style={styles.headerActions}>
            <IconButton onPress={() => navigate('notifications')}>
              <Ionicons name="notifications-outline" size={24} color={colors.paper} />
            </IconButton>
            <View style={styles.flag}>
              <Text style={styles.flagText}>🇵🇹</Text>
            </View>
            <IconButton onPress={() => setMenuOpen(true)}>
              <Ionicons name="menu" size={26} color={colors.paper} />
            </IconButton>
          </View>
        </View>
        <Text style={styles.hello}>{b.hello}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchCard}>
          <Text style={styles.searchTitle}>{b.searchTitle}</Text>
          <Pressable style={styles.searchInput} onPress={() => setSearchOpen(true)}>
            <Ionicons name="location-outline" size={20} color={colors.muted} />
            <Text style={styles.searchPlaceholder}>{b.searchPlaceholder}</Text>
          </Pressable>
          <GreenButton label={b.search} onPress={() => setSearchOpen(true)} />
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerTitle}>{b.promo1Title}</Text>
            <Text style={styles.bannerSub}>{b.promo1Subtitle}</Text>
            <Pressable style={styles.bannerCta}>
              <Text style={styles.bannerCtaText}>{b.promo1Cta}</Text>
            </Pressable>
          </View>
          <View style={styles.bannerArt}>
            <Ionicons name="car-sport" size={64} color={colors.inkSoft} />
          </View>
        </View>

        <View style={[styles.banner, styles.bannerAlt]}>
          <View style={styles.bannerArt}>
            <Ionicons name="people" size={48} color={colors.paper} />
          </View>
          <View style={styles.bannerLeft}>
            <Text style={[styles.bannerTitle, { color: colors.paper }]}>{b.promo2Title}</Text>
            <Text style={[styles.bannerSub, { color: colors.paper }]}>{b.promo2Subtitle}</Text>
            <Pressable style={[styles.bannerCta, { backgroundColor: colors.brandGreen }]}>
              <Text style={styles.bannerCtaText}>{b.promo2Cta}</Text>
            </Pressable>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{b.promo2Badge}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper2,
  },
  header: {
    backgroundColor: colors.headerDark,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: 56,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flag: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagText: {
    fontSize: 16,
  },
  hello: {
    fontSize: 36,
    fontWeight: fontWeights.bold,
    color: colors.paper,
    letterSpacing: -0.5,
  },
  scroll: {
    flex: 1,
    marginTop: -36,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  searchCard: {
    backgroundColor: colors.paper,
    borderRadius: radii['2xl'],
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  searchTitle: {
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  searchPlaceholder: {
    color: colors.mutedSoft,
    fontSize: fontSizes.body,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: colors.brandOrange,
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    marginBottom: spacing.lg,
    minHeight: 140,
  },
  bannerAlt: {
    backgroundColor: colors.inkSoft,
  },
  bannerLeft: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  bannerSub: {
    marginTop: 4,
    fontSize: fontSizes.body,
    color: colors.ink,
    opacity: 0.85,
  },
  bannerCta: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    backgroundColor: colors.brandGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  bannerCtaText: {
    color: colors.paper,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.bold,
  },
  bannerArt: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  badgeText: {
    color: colors.brandOrange,
    fontSize: 10,
    fontWeight: fontWeights.bold,
  },
});
