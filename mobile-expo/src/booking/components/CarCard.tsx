import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../icons';
import { useI18n } from '../../i18n';
import type { CatalogVehicle } from '../catalog';
import { totalEstimate } from '../catalog';
import { formatMoney } from '../format';
import { resolveVehicleImage } from '../vehicleImages';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

export function CarCard({
  vehicle,
  days,
  onPress,
}: {
  vehicle: CatalogVehicle;
  days: number;
  onPress: () => void;
}) {
  const { t, lang } = useI18n();
  const b = t.booking;
  const image = resolveVehicleImage(vehicle.image);
  const total = totalEstimate(vehicle, days);
  const similar =
    vehicle.category === 'van'
      ? b.orSimilarVan
      : vehicle.category === 'bus'
        ? b.orSimilarBus
        : b.orSimilarCar;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{b.freeCancellation}</Text>
      </View>

      <Text style={styles.title}>{`${vehicle.brand} ${vehicle.model}`}</Text>
      <Text style={styles.subtitle}>{similar}</Text>

      <View style={styles.specRow}>
        <Spec icon="people" label={String(vehicle.seats)} />
        <Spec icon="luggage" label={vehicle.category === 'bus' ? '8' : '2'} />
        <Spec icon="snow" label="A/C" />
        <Spec
          icon="speedometer"
          label={vehicle.transmission === 'auto' ? b.automatic : b.manual}
        />
        <Spec icon="speedometer" label={b.unlimitedKm} />
      </View>

      <View style={styles.bodyRow}>
        <View style={styles.includes}>
          <Include text={b.includeProtection} />
          <Include text={b.includeInsurance} />
          <Include text={b.includeFees} />
        </View>
        {image ? (
          <Image source={image} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Icon name="car-sport" size={40} color={colors.mutedSoft} />
          </View>
        )}
      </View>

      <View style={styles.locationBox}>
        <Icon name="location-outline" size={16} color={colors.muted} />
        <Text style={styles.locationText} numberOfLines={2}>
          {vehicle.base ? `${vehicle.base} · ${b.serviceShop}` : b.serviceShop}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.company}>{vehicle.company}</Text>
        <View>
          <Text style={styles.price}>{formatMoney(total, lang)}</Text>
          <Text style={styles.priceHint}>{b.referencePrice}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function Spec({ icon, label }: { icon: Parameters<typeof Icon>[0]['name']; label: string }) {
  return (
    <View style={styles.spec}>
      <Icon name={icon} size={14} color={colors.muted} />
      <Text style={styles.specText}>{label}</Text>
    </View>
  );
}

function Include({ text }: { text: string }) {
  return (
    <View style={styles.includeRow}>
      <Icon name="checkmark" size={14} color={colors.ink} />
      <Text style={styles.includeText} numberOfLines={2}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.paper,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.positiveSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    marginBottom: spacing.sm,
  },
  badgeText: {
    color: colors.brandGreen,
    fontSize: fontSizes.micro,
    fontWeight: fontWeights.bold,
  },
  title: {
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  subtitle: {
    color: colors.muted,
    fontSize: fontSizes.small,
    marginBottom: spacing.sm,
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  specText: {
    fontSize: fontSizes.micro,
    color: colors.ink,
  },
  bodyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  includes: {
    flex: 1,
    gap: 6,
  },
  includeRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  includeText: {
    flex: 1,
    fontSize: fontSizes.small,
    color: colors.inkSoft,
    lineHeight: 18,
  },
  image: {
    width: 120,
    height: 80,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper3,
    borderRadius: radii.md,
  },
  locationBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.paper3,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  locationText: {
    flex: 1,
    fontSize: fontSizes.small,
    color: colors.muted,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  company: {
    fontWeight: fontWeights.bold,
    color: colors.brandGreen,
    fontSize: fontSizes.body,
  },
  price: {
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    textAlign: 'right',
  },
  priceHint: {
    fontSize: fontSizes.micro,
    color: colors.muted,
    textAlign: 'right',
  },
});
