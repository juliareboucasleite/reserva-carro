import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../state';
import { useData } from '../state';
import { useI18n, formatTemplate } from '../i18n';
import { Empty, PageHeader, SectionHeader, Stat } from '../ui';
import { colors, fontSizes, fontWeights, letterSpacing, spacing } from '../theme';

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return Number.POSITIVE_INFINITY;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

export function DashboardScreen() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { vehicles, reservations } = useData();

  const operational = vehicles.filter((v) => v.operational).length;
  const pending = reservations.filter((r) => r.status === 'pending').length;
  const active = reservations.filter(
    (r) => r.status === 'approved' || r.status === 'checked_in',
  ).length;

  type Alert = { key: string; days: number; vehicleName: string; plate: string; label: string };
  const alerts: Alert[] = [];
  vehicles.forEach((v) => {
    const dInsp = daysUntil(v.next_inspection);
    const dIns = daysUntil(v.insurance_renewal);
    if (dInsp <= 30 && dInsp >= 0) {
      alerts.push({
        key: `i-${v.id}`,
        days: dInsp,
        vehicleName: `${v.brand} ${v.model}`,
        plate: v.plate,
        label: formatTemplate(t.dashboard.inspectionSoon, { n: dInsp }),
      });
    }
    if (dIns <= 30 && dIns >= 0) {
      alerts.push({
        key: `s-${v.id}`,
        days: dIns,
        vehicleName: `${v.brand} ${v.model}`,
        plate: v.plate,
        label: formatTemplate(t.dashboard.insuranceSoon, { n: dIns }),
      });
    }
  });
  alerts.sort((a, b) => a.days - b.days);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
      <PageHeader
        kicker={t.dashboard.kicker}
        title={`${t.dashboard.welcome}, ${user?.name.split(' ')[0] ?? ''}.`}
      />

      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Stat label={t.dashboard.statsVehicles} value={vehicles.length} />
        </View>
        <View style={styles.statCell}>
          <Stat
            label={t.dashboard.statsOperational}
            value={`${operational}/${vehicles.length}`}
            tone="good"
          />
        </View>
        <View style={styles.statCell}>
          <Stat
            label={t.dashboard.statsPending}
            value={pending}
            tone={pending > 0 ? 'warn' : 'default'}
          />
        </View>
        <View style={styles.statCell}>
          <Stat label={t.dashboard.statsActive} value={active} />
        </View>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <SectionHeader title={t.dashboard.upcomingAlerts} meta={t.dashboard.alertWindow} />
        {alerts.length === 0 ? (
          <Empty label={t.dashboard.noAlerts} />
        ) : (
          alerts.slice(0, 8).map((alert) => {
            const tone =
              alert.days <= 5 ? colors.danger : alert.days <= 15 ? colors.warn : colors.muted;
            return (
              <View key={alert.key} style={styles.alertRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>
                    {alert.vehicleName}{' '}
                    <Text style={styles.alertPlate}>· {alert.plate}</Text>
                  </Text>
                  <Text style={styles.alertSubtitle}>{alert.label}</Text>
                </View>
                <Text style={[styles.alertDays, { color: tone }]}>
                  {alert.days} {t.dashboard.daysLeft}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCell: {
    width: '50%',
    paddingRight: spacing.md,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    gap: spacing.md,
  },
  alertTitle: {
    color: colors.ink,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
  alertPlate: {
    color: colors.muted,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.regular,
    fontVariant: ['tabular-nums'],
  },
  alertSubtitle: {
    marginTop: 2,
    color: colors.muted,
    fontSize: fontSizes.small,
  },
  alertDays: {
    fontSize: fontSizes.small,
    fontVariant: ['tabular-nums'],
    fontWeight: fontWeights.medium,
  },
});
