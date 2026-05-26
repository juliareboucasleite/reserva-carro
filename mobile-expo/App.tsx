import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { loadIconFont } from './src/icons';
import { AuthProvider, DataProvider, useAuth, useData } from './src/state';
import { I18nProvider, useI18n } from './src/i18n';
import { GuestShell } from './src/booking/GuestShell';
import { DashboardScreen } from './src/screens/Dashboard';
import { VehiclesScreen } from './src/screens/Vehicles';
import { ReservationsScreen } from './src/screens/Reservations';
import { DamagesScreen } from './src/screens/Damages';
import { MaintenanceScreen } from './src/screens/Maintenance';
import { AccountScreen } from './src/screens/Account';
import { colors, fontSizes, fontWeights, letterSpacing, spacing } from './src/theme';

type Tab = 'dashboard' | 'vehicles' | 'reservations' | 'damages' | 'maintenance' | 'account';

const TAB_ORDER: Tab[] = [
  'dashboard',
  'vehicles',
  'reservations',
  'damages',
  'maintenance',
  'account',
];

export default function App() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AuthProvider>
          <DataProvider>
            <Shell />
          </DataProvider>
        </AuthProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

function Shell() {
  const { booting, user } = useAuth();

  useEffect(() => {
    loadIconFont().catch(() => undefined);
  }, []);

  if (booting) {
    return (
      <SafeAreaView style={styles.bootContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator color={colors.ink} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      {user ? <AuthenticatedShell /> : <GuestShell />}
    </SafeAreaView>
  );
}

function AuthenticatedShell() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { unreadCount } = useData();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [reservationDraftVehicleId, setReservationDraftVehicleId] = useState<number | null>(null);

  const goReserve = (vehicleId: number) => {
    setReservationDraftVehicleId(vehicleId);
    setTab('reservations');
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.topKicker}>{t.auth.sessionActive}</Text>
          <Text style={styles.topName}>{`${user!.name} ${user!.surname ?? ''}`.trim()}</Text>
          <Text style={styles.topMeta}>
            {t.roles[user!.role] || user!.role}
            {user!.team ? ` · ${user!.team}` : ''}
          </Text>
        </View>
        {unreadCount > 0 ? (
          <View style={styles.notifBadge}>
            <Text style={styles.notifBadgeText}>{unreadCount}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.lg }}
      >
        {TAB_ORDER.map((entry) => (
          <Pressable key={entry} onPress={() => setTab(entry)} hitSlop={8}>
            <Text style={[styles.tabLabel, tab === entry && styles.tabLabelActive]}>
              {t.nav[entry]}
            </Text>
            {tab === entry ? <View style={styles.tabUnderline} /> : null}
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flex: 1 }}>
        {tab === 'dashboard' && <DashboardScreen />}
        {tab === 'vehicles' && <VehiclesScreen onReserve={goReserve} />}
        {tab === 'reservations' && (
          <ReservationsScreen
            draftVehicleId={reservationDraftVehicleId}
            onDraftConsumed={() => setReservationDraftVehicleId(null)}
          />
        )}
        {tab === 'damages' && <DamagesScreen />}
        {tab === 'maintenance' && <MaintenanceScreen />}
        {tab === 'account' && <AccountScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  bootContainer: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  topKicker: {
    fontSize: fontSizes.kicker,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.kicker,
    fontWeight: fontWeights.semibold,
    marginBottom: 4,
  },
  topName: {
    fontSize: fontSizes.h2,
    color: colors.ink,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.3,
  },
  topMeta: {
    marginTop: 2,
    color: colors.muted,
    fontSize: fontSizes.small,
  },
  notifBadge: {
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    minWidth: 22,
    alignItems: 'center',
  },
  notifBadgeText: {
    color: colors.paper,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.bold,
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    flexGrow: 0,
  },
  tabLabel: {
    color: colors.muted,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.medium,
    paddingVertical: spacing.md,
  },
  tabLabelActive: {
    color: colors.ink,
    fontWeight: fontWeights.semibold,
  },
  tabUnderline: {
    height: 2,
    backgroundColor: colors.ink,
    marginTop: -1,
  },
});
