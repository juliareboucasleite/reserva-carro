import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSizes, fontWeights, radii, spacing } from '../theme';

export function BrandLogo({
  compact,
  variant = 'light',
}: {
  compact?: boolean;
  variant?: 'light' | 'dark';
}) {
  const mainColor = variant === 'light' ? colors.paper : colors.ink;
  return (
    <View style={styles.logoRow}>
      <Text style={[styles.logoMain, compact && styles.logoCompact, { color: mainColor }]}>
        reserva<Text style={styles.logoAccent}>carro</Text>
      </Text>
    </View>
  );
}

export function GreenButton({
  label,
  onPress,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.greenBtn,
        style,
        disabled && { opacity: 0.5 },
        pressed && !disabled && { opacity: 0.9 },
      ]}
    >
      <Text style={styles.greenBtnText}>{label}</Text>
    </Pressable>
  );
}

export function DarkButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.darkBtn, style, pressed && { opacity: 0.9 }]}
    >
      <Text style={styles.darkBtnText}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.iconBtn}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoMain: {
    fontSize: 22,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
  },
  logoCompact: {
    fontSize: 18,
  },
  logoAccent: {
    color: colors.brandOrange,
  },
  greenBtn: {
    backgroundColor: colors.brandGreen,
    borderRadius: radii.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenBtnText: {
    color: colors.paper,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  darkBtn: {
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  darkBtnText: {
    color: colors.paper,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
