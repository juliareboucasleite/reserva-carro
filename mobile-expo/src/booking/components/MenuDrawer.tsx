import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../i18n';
import { useBooking } from '../context';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

export function MenuDrawer() {
  const { t, lang, setLang } = useI18n();
  const b = t.booking;
  const { menuOpen, setMenuOpen, navigate, setAuthOpen } = useBooking();

  const close = () => setMenuOpen(false);

  const run = (fn: () => void) => {
    close();
    fn();
  };

  const forYou: MenuItem[] = [
    { icon: 'home-outline', label: b.menuHome, onPress: () => run(() => navigate('home')) },
    {
      icon: 'ticket-outline',
      label: b.menuReservations,
      onPress: () => run(() => setAuthOpen(true)),
    },
    { icon: 'trophy-outline', label: b.menuRewards, onPress: () => run(() => setAuthOpen(true)) },
    { icon: 'gift-outline', label: b.menuPromos, onPress: () => run(() => navigate('home')) },
    {
      icon: 'settings-outline',
      label: b.menuSettings,
      onPress: () => run(() => setAuthOpen(true)),
    },
  ];

  const about: MenuItem[] = [
    { icon: 'help-circle-outline', label: b.menuHelp, onPress: close },
    { icon: 'headset-outline', label: b.menuContact, onPress: close },
    { icon: 'lock-closed-outline', label: b.menuPrivacy, onPress: close },
    { icon: 'document-text-outline', label: b.menuTerms, onPress: close },
  ];

  return (
    <Modal visible={menuOpen} animationType="slide" onRequestClose={close}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={colors.brandGreen} />
            </View>
            <Text style={styles.hello}>{b.menuHello}</Text>
          </View>

          <View style={styles.authRow}>
            <Pressable
              style={styles.loginBtn}
              onPress={() => run(() => setAuthOpen(true))}
            >
              <Text style={styles.loginBtnText}>{b.menuLogin}</Text>
            </Pressable>
            <Pressable
              style={styles.signupBtn}
              onPress={() => run(() => setAuthOpen(true))}
            >
              <Text style={styles.signupBtnText}>{b.menuSignup}</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <Text style={styles.section}>{b.menuPrefs}</Text>
          <Pressable style={styles.row} onPress={() => setLang(lang === 'pt' ? 'en' : 'pt')}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.ink} />
            <Text style={styles.rowLabel}>{b.menuLang}</Text>
            <View style={styles.langPill}>
              <Text style={styles.langPillText}>€ · {lang.toUpperCase()}</Text>
            </View>
          </Pressable>

          <Text style={styles.section}>{b.menuForYou}</Text>
          {forYou.map((item) => (
            <MenuRow key={item.label} {...item} />
          ))}

          <Text style={styles.section}>{b.menuAbout}</Text>
          {about.map((item) => (
            <MenuRow key={item.label} {...item} />
          ))}

          <View style={styles.footer}>
            <Text style={styles.follow}>{b.menuFollow}</Text>
            <View style={styles.social}>
              <Ionicons name="logo-facebook" size={22} color={colors.muted} />
              <Ionicons name="logo-instagram" size={22} color={colors.muted} />
              <Ionicons name="logo-linkedin" size={22} color={colors.muted} />
            </View>
          </View>
        </ScrollView>

        <Pressable style={styles.closeFab} onPress={close}>
          <Ionicons name="close" size={22} color={colors.ink} />
        </Pressable>
      </View>
    </Modal>
  );
}

function MenuRow({ icon, label, onPress }: MenuItem) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.ink} />
      <Text style={styles.rowLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingTop: spacing['2xl'],
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.positiveSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hello: {
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  authRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  loginBtn: {
    flex: 1,
    backgroundColor: colors.brandGreen,
    borderRadius: radii.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginBtnText: {
    color: colors.paper,
    fontWeight: fontWeights.bold,
  },
  signupBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signupBtnText: {
    color: colors.ink,
    fontWeight: fontWeights.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginBottom: spacing.lg,
  },
  section: {
    fontSize: fontSizes.small,
    color: colors.muted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowLabel: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  langPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  langPillText: {
    fontSize: fontSizes.small,
    color: colors.ink,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  follow: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.body,
    marginBottom: spacing.md,
  },
  social: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  closeFab: {
    position: 'absolute',
    top: spacing['2xl'],
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.paper3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
