import { Text, type StyleProp, type TextStyle } from 'react-native';

export const iconGlyphs = {
  'arrow-back': '←',
  menu: '☰',
  close: '×',
  'notifications-outline': '🔔',
  'location-outline': '⌖',
  'car-sport': '🚗',
  people: '👥',
  person: '👤',
  'person-outline': '👤',
  checkmark: '✓',
  add: '+',
  'return-up-back': '↩',
  'calendar-outline': '📅',
  'time-outline': '🕐',
  'chevron-down': '▾',
  airplane: '✈',
  'home-outline': '⌂',
  'ticket-outline': '🎫',
  'trophy-outline': '🏆',
  'gift-outline': '🎁',
  'settings-outline': '⚙',
  'help-circle-outline': '?',
  'headset-outline': '☎',
  'lock-closed-outline': '🔒',
  'document-text-outline': '📄',
  'chatbubble-ellipses-outline': '💬',
  'logo-facebook': 'f',
  'logo-instagram': '◎',
  'logo-linkedin': 'in',
} as const;

export type IconName = keyof typeof iconGlyphs;

export function Icon({
  name,
  size = 22,
  color = '#111827',
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      style={[
        {
          fontSize: size * 0.9,
          lineHeight: size + 2,
          color,
          width: size + 4,
          textAlign: 'center',
        },
        style,
      ]}
    >
      {iconGlyphs[name]}
    </Text>
  );
}
