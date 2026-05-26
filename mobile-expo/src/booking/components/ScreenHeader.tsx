import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../icons';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';

export function ScreenHeader({
  title,
  onBack,
  onMenu,
}: {
  title?: string;
  onBack?: () => void;
  onMenu?: () => void;
}) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={styles.side}>
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}
      {title ? <Text style={styles.title}>{title}</Text> : <View style={{ flex: 1 }} />}
      {onMenu ? (
        <Pressable onPress={onMenu} hitSlop={12} style={styles.side}>
          <Icon name="menu" size={24} color={colors.ink} />
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  side: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
});
