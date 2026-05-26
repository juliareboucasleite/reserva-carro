import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../i18n';
import { TIME_SECTIONS } from '../times';
import { useBooking } from '../context';
import { GreenButton } from '../ui';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

type ActiveField = 'pickup' | 'return';

export function TimePickerScreen() {
  const { t } = useI18n();
  const b = t.booking;
  const {
    goBack,
    pickupTime,
    returnTime,
    setPickupTime,
    setReturnTime,
    setSearchOpen,
  } = useBooking();
  const [active, setActive] = useState<ActiveField>('pickup');

  const periodLabel = {
    dawn: b.timeDawn,
    morning: b.timeMorning,
    afternoon: b.timeAfternoon,
    night: b.timeNight,
  };

  const selected = active === 'pickup' ? pickupTime : returnTime;
  const setSelected = active === 'pickup' ? setPickupTime : setReturnTime;

  const confirm = () => {
    setSearchOpen(true);
    goBack();
  };

  return (
    <View style={styles.root}>
      <Pressable onPress={goBack} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={colors.ink} />
      </Pressable>

      <View style={styles.topRow}>
        <TimeBox
          label={b.pickup}
          value={pickupTime}
          active={active === 'pickup'}
          onPress={() => setActive('pickup')}
        />
        <TimeBox
          label={b.return}
          value={returnTime}
          active={active === 'return'}
          onPress={() => setActive('return')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {TIME_SECTIONS.map((section) => (
          <View key={section.period} style={styles.section}>
            <Text style={styles.sectionTitle}>{periodLabel[section.period]}</Text>
            <View style={styles.grid}>
              {section.slots.map((slot) => {
                const isSelected = slot === selected;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => setSelected(slot)}
                    style={[styles.slot, isSelected && styles.slotSelected]}
                  >
                    <Text style={[styles.slotText, isSelected && styles.slotTextSelected]}>
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <GreenButton label={b.selectTimes} onPress={confirm} />
      </View>
    </View>
  );
}

function TimeBox({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.boxWrap}>
      <Text style={styles.boxLabel}>{label}</Text>
      <Pressable
        onPress={onPress}
        style={[styles.box, active && { borderColor: colors.focusBlue }]}
      >
        <Ionicons name="time-outline" size={18} color={colors.muted} />
        <Text style={styles.boxValue}>{value}</Text>
      </Pressable>
    </View>
  );
}

const SLOT_WIDTH = '31%';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingTop: spacing.lg,
  },
  back: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  boxWrap: {
    flex: 1,
  },
  boxLabel: {
    fontWeight: fontWeights.bold,
    marginBottom: spacing.sm,
    color: colors.ink,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  boxValue: {
    fontSize: fontSizes.body,
    color: colors.ink,
    fontWeight: fontWeights.medium,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.body,
    marginBottom: spacing.md,
    color: colors.ink,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  slot: {
    width: SLOT_WIDTH,
    paddingVertical: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.paper3,
    alignItems: 'center',
  },
  slotSelected: {
    backgroundColor: colors.brandYellow,
  },
  slotText: {
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  slotTextSelected: {
    fontWeight: fontWeights.semibold,
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
