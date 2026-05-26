import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../i18n';
import { useBooking } from '../context';
import { BrandLogo, DarkButton } from '../ui';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';

export function BenefitsScreen() {
  const { t } = useI18n();
  const b = t.booking;
  const { showBenefits, dismissBenefits, setAuthOpen } = useBooking();

  const items = [
    { title: b.benefit1Title, desc: b.benefit1Desc },
    { title: b.benefit2Title, desc: b.benefit2Desc },
    { title: b.benefit3Title, desc: b.benefit3Desc },
  ];

  return (
    <Modal visible={showBenefits} animationType="fade">
      <View style={styles.root}>
        <BrandLogo compact variant="dark" />
        <Text style={styles.title}>{b.benefitsTitle}</Text>

        {items.map((item) => (
          <View key={item.title} style={styles.item}>
            <Ionicons name="checkmark" size={20} color={colors.ink} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <DarkButton
            label={b.loginCta}
            onPress={() => {
              dismissBenefits();
              setAuthOpen(true);
            }}
            style={{ width: '100%' }}
          />
          <Pressable onPress={dismissBenefits} style={styles.skip}>
            <Text style={styles.skipText}>{b.notNow}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ink,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    lineHeight: 34,
  },
  item: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  itemTitle: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: fontSizes.body,
    color: colors.muted,
    lineHeight: 20,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  skip: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  skipText: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.ink,
  },
});
