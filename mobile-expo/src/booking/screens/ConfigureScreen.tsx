import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../icons';
import { useI18n } from '../../i18n';
import { totalEstimate } from '../catalog';
import { ScreenHeader } from '../components/ScreenHeader';
import { useBooking } from '../context';
import { formatBookingDate, formatMoney } from '../format';
import { GreenButton } from '../ui';
import { resolveVehicleImage } from '../vehicleImages';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

export function ConfigureScreen() {
  const { t, lang } = useI18n();
  const b = t.booking;
  const {
    goBack,
    setMenuOpen,
    selectedVehicle,
    rentalDays,
    pickup,
    returnLoc,
    differentReturn,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
    childSeats,
    setChildSeats,
    coveragePlan,
    setCoveragePlan,
    setAuthOpen,
  } = useBooking();

  if (!selectedVehicle) {
    return (
      <View style={styles.root}>
        <ScreenHeader title={b.configureTitle} onBack={goBack} onMenu={() => setMenuOpen(true)} />
        <Text style={styles.empty}>{b.noCars}</Text>
      </View>
    );
  }

  const vehicle = selectedVehicle;
  const image = resolveVehicleImage(vehicle.image);
  const total = totalEstimate(vehicle, rentalDays) + childSeats * 12 * rentalDays;
  return (
    <View style={styles.root}>
      <ScreenHeader title={b.configureTitle} onBack={goBack} onMenu={() => setMenuOpen(true)} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{`${vehicle.brand} ${vehicle.model}`}</Text>
            <Text style={styles.heroSub}>{b.orSimilarCar}</Text>
            <View style={styles.tags}>
              <Tag label={`${vehicle.seats}`} icon="people" />
              <Tag label="A/C" icon="snow" />
              <Tag
                label={vehicle.transmission === 'auto' ? b.automatic : b.manual}
                icon="speedometer"
              />
            </View>
            <Text style={styles.company}>{vehicle.company}</Text>
          </View>
          {image ? (
            <Image source={image} style={styles.heroImage} resizeMode="contain" />
          ) : null}
        </View>

        <Text style={styles.section}>{b.includesTitle}</Text>
        <Include text={b.includeProtection} />
        <Include text={b.includeInsurance} />
        <Include text={b.includeFees} />

        <Text style={[styles.section, { marginTop: spacing.lg }]}>{b.extrasTitle}</Text>
        <View style={styles.extraCard}>
          <Icon name="info" size={16} color={colors.muted} />
          <Text style={styles.extraName}>{b.childSeat}</Text>
          <Text style={styles.extraPrice}>{b.childSeatPrice}</Text>
          <View style={styles.qtyRow}>
            <Pressable
              style={styles.qtyBtn}
              onPress={() => setChildSeats(Math.max(0, childSeats - 1))}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </Pressable>
            <Text style={styles.qtyValue}>{childSeats}</Text>
            <Pressable style={styles.qtyBtn} onPress={() => setChildSeats(childSeats + 1)}>
              <Text style={styles.qtyBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.section, { marginTop: spacing.lg }]}>{b.coverageTitle}</Text>
        <Text style={styles.sectionSub}>{b.coverageSub}</Text>

        <CoverageCard
          title="Flex"
          badge={b.included}
          selected={coveragePlan === 'flex'}
          onPress={() => setCoveragePlan('flex')}
          items={[b.includeProtection, b.includeInsurance]}
        />
        <CoverageCard
          title="Promo"
          badge={b.promoPrice}
          selected={coveragePlan === 'promo'}
          onPress={() => setCoveragePlan('promo')}
          items={[b.includeProtection, b.includeInsurance]}
        />

        <Text style={[styles.section, { marginTop: spacing.lg }]}>{b.pickupReturnSection}</Text>
        <View style={styles.timeline}>
          <TimelineItem
            date={`${formatBookingDate(pickupDate, lang)} · ${pickupTime}`}
            place={pickup?.label ?? '—'}
            shop={b.serviceShop}
          />
          <View style={styles.timelineLine} />
          <TimelineItem
            date={`${formatBookingDate(returnDate, lang)} · ${returnTime}`}
            place={(differentReturn && returnLoc ? returnLoc : pickup)?.label ?? '—'}
            shop={b.serviceShop}
          />
        </View>

        <Text style={styles.legal}>{b.reservationLegal}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{b.totalLabel}</Text>
          <Text style={styles.priceValue}>{formatMoney(total, lang)}</Text>
        </View>
        <Text style={styles.priceNote}>{b.referencePrice}</Text>
        <GreenButton
          label={b.continueReservation}
          onPress={() => setAuthOpen(true)}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </View>
  );
}

function Tag({ label, icon }: { label: string; icon: Parameters<typeof Icon>[0]['name'] }) {
  return (
    <View style={styles.tag}>
      <Icon name={icon} size={12} color={colors.muted} />
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

function Include({ text }: { text: string }) {
  return (
    <View style={styles.includeRow}>
      <Icon name="checkmark" size={16} color={colors.ink} />
      <Text style={styles.includeText}>{text}</Text>
    </View>
  );
}

function CoverageCard({
  title,
  badge,
  selected,
  onPress,
  items,
}: {
  title: string;
  badge: string;
  selected: boolean;
  onPress: () => void;
  items: string[];
}) {
  return (
    <Pressable
      style={[styles.coverageCard, selected && { borderColor: colors.focusBlue }]}
      onPress={onPress}
    >
      <View style={styles.coverageTop}>
        <Icon name={selected ? 'checkmark-circle' : 'radio-off'} size={20} color={colors.brandGreen} />
        <Text style={styles.coverageTitle}>{title}</Text>
        <View style={styles.coverageBadge}>
          <Text style={styles.coverageBadgeText}>{badge}</Text>
        </View>
      </View>
      {items.map((item) => (
        <Text key={item} style={styles.coverageItem}>
          ✓ {item}
        </Text>
      ))}
    </Pressable>
  );
}

function TimelineItem({
  date,
  place,
  shop,
}: {
  date: string;
  place: string;
  shop: string;
}) {
  return (
    <View style={styles.timelineItem}>
      <Icon name="location-outline" size={18} color={colors.muted} />
      <View style={{ flex: 1 }}>
        <Text style={styles.timelineDate}>{date}</Text>
        <Text style={styles.timelinePlace}>{place}</Text>
        <Text style={styles.timelineShop}>
          {shop}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: spacing.lg, paddingBottom: 140 },
  empty: { padding: spacing.lg, color: colors.muted },
  hero: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  heroTitle: { fontSize: fontSizes.h2, fontWeight: fontWeights.bold },
  heroSub: { color: colors.muted, marginBottom: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  tagText: { fontSize: fontSizes.micro, color: colors.ink },
  company: { color: colors.brandGreen, fontWeight: fontWeights.bold },
  heroImage: { width: 130, height: 90 },
  section: { fontSize: fontSizes.h3, fontWeight: fontWeights.bold, marginBottom: spacing.sm },
  sectionSub: { color: colors.muted, marginBottom: spacing.md, lineHeight: 20 },
  includeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: 8 },
  includeText: { flex: 1, fontSize: fontSizes.body, color: colors.ink },
  extraCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  extraName: { fontWeight: fontWeights.bold, fontSize: fontSizes.body },
  extraPrice: { color: colors.brandGreen, fontWeight: fontWeights.semibold },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  qtyBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 18, color: colors.ink },
  qtyValue: { fontSize: fontSizes.body, fontWeight: fontWeights.bold, minWidth: 20, textAlign: 'center' },
  coverageCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  coverageTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  coverageTitle: { flex: 1, fontWeight: fontWeights.bold, fontSize: fontSizes.body },
  coverageBadge: {
    backgroundColor: colors.brandYellow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  coverageBadgeText: { fontSize: fontSizes.micro, fontWeight: fontWeights.bold },
  coverageItem: { fontSize: fontSizes.small, color: colors.inkSoft, marginBottom: 4 },
  timeline: { marginBottom: spacing.lg },
  timelineItem: { flexDirection: 'row', gap: spacing.md },
  timelineLine: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginLeft: 9,
    marginVertical: 4,
  },
  timelineDate: { fontSize: fontSizes.small, color: colors.muted },
  timelinePlace: { fontWeight: fontWeights.bold, color: colors.ink },
  timelineShop: { fontSize: fontSizes.small, color: colors.muted },
  legal: { fontSize: fontSizes.small, color: colors.muted, lineHeight: 18 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.paper,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontWeight: fontWeights.bold, fontSize: fontSizes.body },
  priceValue: { fontWeight: fontWeights.bold, fontSize: fontSizes.h3 },
  priceNote: { fontSize: fontSizes.micro, color: colors.muted, marginBottom: spacing.xs },
});
