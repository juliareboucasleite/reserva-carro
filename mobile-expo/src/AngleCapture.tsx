import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { AngleKey, AngleMediaMap, MediaAsset } from './api';
import { colors, fontSizes, fontWeights, radii, spacing } from './theme';
import { useI18n } from './i18n';

const ANGLES: AngleKey[] = ['front', 'back', 'left', 'right'];

export async function captureAngle(): Promise<MediaAsset | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Câmara', 'Autoriza o uso da câmara para capturar fotos e vídeo.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images', 'videos'],
    quality: 0.8,
    videoMaxDuration: 20,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  const isVideo = asset.type === 'video';
  return {
    uri: asset.uri,
    mimeType: asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'),
    fileName: asset.fileName || `${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`,
    type: isVideo ? 'video' : 'image',
  };
}

export async function capturePhoto(): Promise<MediaAsset | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Câmara', 'Autoriza o uso da câmara.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    mimeType: asset.mimeType || 'image/jpeg',
    fileName: asset.fileName || `${Date.now()}.jpg`,
    type: 'image',
  };
}

export function AngleCaptureGrid({
  media,
  onCapture,
}: {
  media: AngleMediaMap;
  onCapture: (angle: AngleKey, asset: MediaAsset) => void;
}) {
  const { t } = useI18n();
  const labels = t.reservations.angles;

  const handle = async (angle: AngleKey) => {
    const asset = await captureAngle();
    if (asset) onCapture(angle, asset);
  };

  return (
    <View>
      {ANGLES.map((angle) => {
        const asset = media[angle];
        return (
          <View key={angle} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{labels[angle]}</Text>
              <Text style={styles.hint}>
                {asset
                  ? asset.type === 'video'
                    ? t.reservations.videoCaptured
                    : t.reservations.photoCaptured
                  : t.reservations.noMedia}
              </Text>
            </View>
            <Pressable style={styles.captureButton} onPress={() => handle(angle)}>
              <Text style={styles.captureText}>
                {asset ? t.reservations.retake : t.reservations.capture}
              </Text>
            </Pressable>
          </View>
        );
      })}

      <View style={styles.grid}>
        {ANGLES.map((angle) => {
          const asset = media[angle];
          return (
            <View key={angle} style={styles.previewCell}>
              <Text style={styles.previewLabel}>{labels[angle]}</Text>
              {asset?.type === 'image' ? (
                <Image source={{ uri: asset.uri }} style={styles.previewImage} />
              ) : asset?.type === 'video' ? (
                <View style={styles.previewVideo}>
                  <Text style={styles.previewVideoText}>VIDEO</Text>
                </View>
              ) : (
                <View style={styles.previewEmpty} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    gap: spacing.md,
  },
  label: {
    color: colors.ink,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
  hint: {
    marginTop: 2,
    fontSize: fontSizes.small,
    color: colors.muted,
  },
  captureButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  captureText: {
    color: colors.ink,
    fontWeight: fontWeights.semibold,
    fontSize: fontSizes.small,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  previewCell: {
    width: '47%',
  },
  previewLabel: {
    fontSize: fontSizes.micro,
    fontWeight: fontWeights.semibold,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  previewImage: {
    width: '100%',
    height: 110,
    borderRadius: radii.md,
    backgroundColor: colors.paper3,
  },
  previewVideo: {
    width: '100%',
    height: 110,
    borderRadius: radii.md,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewVideoText: {
    color: colors.paper,
    fontWeight: fontWeights.bold,
    letterSpacing: 2,
  },
  previewEmpty: {
    width: '100%',
    height: 110,
    borderRadius: radii.md,
    backgroundColor: colors.paper2,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
});
