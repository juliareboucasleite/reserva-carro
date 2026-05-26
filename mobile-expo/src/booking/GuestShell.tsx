import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BookingProvider, useBooking } from './context';
import { AuthSheet } from './components/AuthSheet';
import { MenuDrawer } from './components/MenuDrawer';
import { SearchSheet } from './components/SearchSheet';
import { BenefitsScreen } from './screens/BenefitsScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LocationSearchScreen } from './screens/LocationSearchScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { TimePickerScreen } from './screens/TimePickerScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { ConfigureScreen } from './screens/ConfigureScreen';
import { MapScreen } from './screens/MapScreen';
import { colors } from '../theme';

function BookingRouter() {
  const { screen } = useBooking();

  switch (screen) {
    case 'notifications':
      return <NotificationsScreen />;
    case 'location-pickup':
      return <LocationSearchScreen mode="pickup" />;
    case 'location-return':
      return <LocationSearchScreen mode="return" />;
    case 'time-picker':
      return <TimePickerScreen />;
    case 'results':
      return <ResultsScreen />;
    case 'map':
      return <MapScreen />;
    case 'configure':
      return <ConfigureScreen />;
    case 'home':
    default:
      return <HomeScreen />;
  }
}

function BookingOverlays() {
  return (
    <>
      <BenefitsScreen />
      <MenuDrawer />
      <AuthSheet />
      <SearchSheet />
    </>
  );
}

export function GuestShell() {
  return (
    <BookingProvider>
      <View style={{ flex: 1, backgroundColor: colors.paper }}>
        <StatusBar style="auto" />
        <BookingRouter />
        <BookingOverlays />
      </View>
    </BookingProvider>
  );
}
