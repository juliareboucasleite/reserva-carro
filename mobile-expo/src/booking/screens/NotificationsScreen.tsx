import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../icons';
import { useI18n } from '../../i18n';
import { useBooking } from '../context';
import { ScreenHeader } from '../components/ScreenHeader';
import { DarkButton } from '../ui';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

export function NotificationsScreen() {
  const { t } = useI18n();
  const b = t.booking;
  const { goBack, setMenuOpen, setAuthOpen } = useBooking();

  return (
    <View style={styles.root}>
      <ScreenHeader title={b.notificationsTitle} onBack={goBack} onMenu={() => setMenuOpen(true)} />
      <View style={styles.body}>
        <View style={styles.illusCard}>
          <View style={styles.avatar}>
            <Icon name="person-outline" size={32} color={colors.brandYellow} />
            <View style={styles.check}>
              <Icon name="checkmark" size={10} color={colors.paper} />
            </View>
          </View>
          <View style={styles.skeleton}>
            <View style={styles.line} />
            <View style={[styles.line, { width: '70%' }]} />
          </View>
        </View>
        <Text style={styles.headline}>{b.notificationsHeadline}</Text>
        <Text style={styles.desc}>{b.notificationsDesc}</Text>
        <DarkButton label={b.notificationsCta} onPress={() => setAuthOpen(true)} style={{ width: '100%' }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    width: '100%',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brandGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeleton: {
    flex: 1,
    gap: spacing.sm,
  },
  line: {
    height: 10,
    backgroundColor: colors.paper3,
    borderRadius: radii.pill,
    width: '100%',
  },
  headline: {
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  desc: {
    fontSize: fontSizes.body,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
});
