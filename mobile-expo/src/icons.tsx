import { useEffect, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import glyphs from './icons/glyphs.json';
import { iconFontFamily, isIconFontLoaded, loadIconFont } from './icons/loadFont';

const iconNames = {
  'arrow-back': 'arrow-back',
  menu: 'menu',
  close: 'close',
  'notifications-outline': 'notifications-outline',
  'location-outline': 'location-outline',
  'car-sport': 'car-sport-outline',
  people: 'people-outline',
  person: 'person',
  'person-outline': 'person-outline',
  checkmark: 'checkmark',
  add: 'add',
  'return-up-back': 'return-up-back-outline',
  'calendar-outline': 'calendar-outline',
  'time-outline': 'time-outline',
  'chevron-down': 'chevron-down',
  airplane: 'airplane-outline',
  'home-outline': 'home-outline',
  'ticket-outline': 'ticket-outline',
  'trophy-outline': 'trophy-outline',
  'gift-outline': 'gift-outline',
  'settings-outline': 'settings-outline',
  'help-circle-outline': 'help-circle-outline',
  'headset-outline': 'headset-outline',
  'lock-closed-outline': 'lock-closed-outline',
  'document-text-outline': 'document-text-outline',
  'chatbubble-ellipses-outline': 'chatbubble-ellipses-outline',
  'logo-facebook': 'logo-facebook',
  'logo-instagram': 'logo-instagram',
  'logo-linkedin': 'logo-linkedin',
} as const;

export type IconName = keyof typeof iconNames;

type GlyphKey = keyof typeof glyphs;

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
  const [ready, setReady] = useState(isIconFontLoaded());

  useEffect(() => {
    if (ready) return;
    loadIconFont()
      .then(() => setReady(true))
      .catch(() => undefined);
  }, [ready]);

  const glyphKey = iconNames[name] as GlyphKey;
  const code = glyphs[glyphKey];

  if (!ready || code == null) {
    return <Text style={[{ width: size, height: size }, style]} />;
  }

  return (
    <Text
      style={[
        {
          fontFamily: iconFontFamily,
          fontSize: size,
          lineHeight: size + 2,
          color,
          width: size + 2,
          textAlign: 'center',
        },
        style,
      ]}
    >
      {String.fromCharCode(code)}
    </Text>
  );
}

export { loadIconFont };
