import type { ImageSourcePropType } from 'react-native';

const IMAGE_MAP: Record<string, ImageSourcePropType> = {
  'ford-transit.webp': require('../../assets/carros/ford-transit.webp'),
  'vw-transporter.webp': require('../../assets/carros/vw-transporter.webp'),
  'mitsubishi-l400.webp': require('../../assets/carros/mitsubishi-l400.webp'),
  'opel-vivaro.webp': require('../../assets/carros/opel-vivaro.webp'),
  'opel-benfica.webp': require('../../assets/carros/opel-benfica.webp'),
  'marcopolo-iveco.webp': require('../../assets/carros/marcopolo-iveco.webp'),
  'man-bus.webp': require('../../assets/carros/man-bus.webp'),
};

export function resolveVehicleImage(filename?: string | null): ImageSourcePropType | null {
  if (!filename) return null;
  return IMAGE_MAP[filename] ?? null;
}
