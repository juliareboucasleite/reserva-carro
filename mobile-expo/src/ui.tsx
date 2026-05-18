import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, fontSizes, fontWeights, letterSpacing, radii, spacing } from './theme';

export function Kicker({ children }: { children: ReactNode }) {
  return <Text style={styles.kicker}>{children}</Text>;
}

export function PageHeader({
  kicker,
  title,
  subtitle,
  action,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.pageHeader}>
      <View style={{ flex: 1 }}>
        {kicker ? <Kicker>{kicker}</Kicker> : null}
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={{ marginTop: spacing.xs }}>{action}</View> : null}
    </View>
  );
}

export function Card({
  children,
  style,
  flush,
}: {
  children: ReactNode;
  style?: ViewStyle;
  flush?: boolean;
}) {
  return (
    <View style={[styles.card, flush ? undefined : { padding: spacing.lg }, style]}>
      {children}
    </View>
  );
}

export function SectionHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {meta ? <Text style={styles.sectionMeta}>{meta}</Text> : null}
        {action}
      </View>
    </View>
  );
}

export function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  tone?: 'default' | 'good' | 'warn' | 'danger';
}) {
  const valueColor =
    tone === 'good'
      ? colors.positive
      : tone === 'warn'
        ? colors.warn
        : tone === 'danger'
          ? colors.danger
          : colors.ink;
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{String(value)}</Text>
    </View>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'approved' | 'pending' | 'inProgress' | 'done' | 'rejected';
}) {
  const bg = {
    neutral: colors.paper3,
    approved: colors.positiveSoft,
    pending: colors.warnSoft,
    inProgress: '#eff6ff',
    done: '#ecfeff',
    rejected: colors.dangerSoft,
  }[tone];
  const fg = {
    neutral: colors.ink,
    approved: colors.positive,
    pending: colors.warn,
    inProgress: '#1d4ed8',
    done: '#0e7490',
    rejected: colors.danger,
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{children}</Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  size = 'md',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  size?: 'sm' | 'md';
}) {
  const bg = {
    primary: colors.ink,
    secondary: colors.paper,
    ghost: 'transparent',
    danger: colors.danger,
  }[variant];
  const fg = variant === 'secondary' || variant === 'ghost' ? colors.ink : colors.paper;
  const border = variant === 'secondary' ? colors.border : 'transparent';
  const paddingV = size === 'sm' ? 8 : 12;
  const paddingH = size === 'sm' ? 12 : 16;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          { color: fg, fontSize: size === 'sm' ? fontSizes.small : fontSizes.body },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export function Input({ multiline, style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.mutedSoft}
      {...props}
      multiline={multiline}
      style={[styles.input, multiline ? styles.inputMultiline : undefined, style]}
    />
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <ScrollView contentContainerStyle={styles.sheetScroll}>
          <View style={styles.sheetCard}>{children}</View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export function SheetHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <View style={styles.sheetHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sheetTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sheetSubtitle}>{subtitle}</Text> : null}
      </View>
      <Pressable onPress={onClose} hitSlop={12}>
        <Text style={styles.sheetClose}>×</Text>
      </Pressable>
    </View>
  );
}

export function Empty({ label }: { label: string }) {
  return <Text style={styles.empty}>{label}</Text>;
}

export function Hairline({ vertical }: { vertical?: boolean }) {
  return <View style={vertical ? styles.hairlineV : styles.hairlineH} />;
}

export function Spinner() {
  return (
    <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
      <ActivityIndicator color={colors.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    gap: spacing.md,
  },
  pageTitle: {
    fontSize: fontSizes.h1,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    marginTop: 6,
    color: colors.muted,
    fontSize: fontSizes.body,
    lineHeight: 20,
  },
  kicker: {
    fontSize: fontSizes.kicker,
    fontWeight: fontWeights.semibold,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.kicker,
    marginBottom: 6,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  sectionTitle: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  sectionMeta: {
    fontSize: fontSizes.micro,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.mono,
    fontVariant: ['tabular-nums'],
  },
  stat: {
    paddingVertical: spacing.md,
  },
  statLabel: {
    fontSize: fontSizes.micro,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.mono,
    fontWeight: fontWeights.medium,
  },
  statValue: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.2,
  },
  button: {
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  buttonLabel: {
    fontWeight: fontWeights.semibold,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    color: colors.ink,
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.small,
  },
  chipTextActive: {
    color: colors.paper,
  },
  fieldLabel: {
    fontSize: fontSizes.micro,
    fontWeight: fontWeights.semibold,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  fieldHint: {
    marginTop: 6,
    fontSize: fontSizes.small,
    color: colors.muted,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: fontSizes.body,
  },
  inputMultiline: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  detailRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  detailLabel: {
    fontSize: fontSizes.micro,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.mono,
    fontWeight: fontWeights.medium,
  },
  detailValue: {
    marginTop: 3,
    color: colors.ink,
    fontSize: fontSizes.body,
  },
  empty: {
    paddingVertical: spacing.xl,
    textAlign: 'center',
    color: colors.muted,
    fontSize: fontSizes.body,
  },
  hairlineH: {
    height: 1,
    backgroundColor: colors.borderSoft,
    alignSelf: 'stretch',
  },
  hairlineV: {
    width: 1,
    backgroundColor: colors.borderSoft,
    alignSelf: 'stretch',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetScroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.xl,
    maxHeight: '92%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  sheetTitle: {
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  sheetSubtitle: {
    marginTop: 4,
    color: colors.muted,
    fontSize: fontSizes.body,
  },
  sheetClose: {
    fontSize: 28,
    color: colors.muted,
    lineHeight: 28,
    paddingHorizontal: 4,
  },
});
