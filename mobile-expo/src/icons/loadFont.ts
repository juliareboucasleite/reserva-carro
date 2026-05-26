import * as Font from 'expo-font';

const FONT_FAMILY = 'ionicons';

let loaded = false;
let loading: Promise<void> | null = null;

export function loadIconFont() {
  if (loaded) return Promise.resolve();
  if (!loading) {
    loading = Font.loadAsync({
      [FONT_FAMILY]: require('../../assets/fonts/Ionicons.ttf'),
    }).then(() => {
      loaded = true;
    });
  }
  return loading;
}

export function isIconFontLoaded() {
  return loaded || Font.isLoaded(FONT_FAMILY);
}

export const iconFontFamily = FONT_FAMILY;
