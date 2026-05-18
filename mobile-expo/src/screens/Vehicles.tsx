import { useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth, useData } from '../state';
import { useI18n, formatKm } from '../i18n';
import { Badge, Button, Card, DetailRow, Empty, PageHeader } from '../ui';
import type { Vehicle } from '../api';
import { colors, fontSizes, fontWeights, spacing } from '../theme';

export function VehiclesScreen({
  onReserve,
}: {
  onReserve: (vehicleId: number) => void;
}) {
  const { t, lang } = useI18n();
  const { vehicles, loading, refresh } = useData();
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.lg }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.ink} />}
    >
      <PageHeader kicker={t.vehicles.kicker} title={t.vehicles.title} subtitle={t.vehicles.subtitle} />

      {vehicles.length === 0 ? (
        <Empty label={t.vehicles.empty} />
      ) : (
        vehicles.map((vehicle) => (
          <VehicleItem
            key={vehicle.id}
            vehicle={vehicle}
            open={openId === vehicle.id}
            onToggle={() => setOpenId((current) => (current === vehicle.id ? null : vehicle.id))}
            onReserve={() => onReserve(vehicle.id)}
            lang={lang}
          />
        ))
      )}
    </ScrollView>
  );
}

function VehicleItem({
  vehicle,
  open,
  onToggle,
  onReserve,
  lang,
}: {
  vehicle: Vehicle;
  open: boolean;
  onToggle: () => void;
  onReserve: () => void;
  lang: 'pt' | 'en';
}) {
  const { t } = useI18n();
  const availability = vehicle.availability || (vehicle.operational ? 'available' : 'inoperational');
  const availabilityLabel = t.vehicles.availability[availability] || availability;
  const tone =
    availability === 'available'
      ? 'approved'
      : availability === 'in_use'
        ? 'inProgress'
        : availability === 'inoperational'
          ? 'rejected'
          : 'pending';

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <Pressable onPress={onToggle}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{`${vehicle.brand} ${vehicle.model}`}</Text>
            <Text style={styles.plate}>{vehicle.plate}</Text>
          </View>
          <Badge tone={tone}>{availabilityLabel}</Badge>
        </View>
        <Text style={styles.meta}>
          {formatKm(vehicle.current_km, lang)} · {vehicle.base || '—'}
        </Text>
        {vehicle.active_reservation && (
          <Text style={styles.metaSecondary}>
            {t.vehicles.activeReservation}: {formatActive(vehicle.active_reservation)}
          </Text>
        )}
      </Pressable>

      {open && (
        <View style={{ marginTop: spacing.md }}>
          <DetailRow label={t.vehicles.seats} value={String(vehicle.seats ?? '—')} />
          <DetailRow label={t.vehicles.km} value={formatKm(vehicle.current_km, lang)} />
          <DetailRow label={t.vehicles.base} value={vehicle.base || '—'} />
          <DetailRow label={t.vehicles.nextInspection} value={vehicle.next_inspection || '—'} />
          <DetailRow label={t.vehicles.insuranceCompany} value={vehicle.insurance_company || '—'} />
          <DetailRow label={t.vehicles.insuranceType} value={vehicle.insurance_type || '—'} />
          <DetailRow label={t.vehicles.insuranceRenewal} value={vehicle.insurance_renewal || '—'} />
          <DetailRow label={t.vehicles.responsible} value={vehicle.responsible || '—'} />
          <DetailRow label={t.vehicles.phone} value={vehicle.phone || '—'} />
          <DetailRow
            label={t.vehicles.operational}
            value={vehicle.operational ? t.vehicles.operationalYes : t.vehicles.operationalNo}
          />
          {availability === 'available' || availability === 'pre_reserved' ? (
            <View style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}>
              <Button label={t.vehicles.reserveThis} onPress={onReserve} size="sm" />
            </View>
          ) : (
            <Pressable
              onPress={() =>
                Alert.alert(t.vehicles.availability[availability], `${vehicle.brand} ${vehicle.model}`)
              }
            />
          )}
        </View>
      )}
    </Card>
  );
}

function formatActive(reservation: NonNullable<Vehicle['active_reservation']>) {
  const start = reservation.start_date || reservation.date || '';
  const end = reservation.end_date || start;
  const range = end && end !== start ? `${start} → ${end}` : start;
  const requester = reservation.requester_name || '';
  return [range, requester].filter(Boolean).join(' · ');
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  name: {
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  plate: {
    marginTop: 2,
    color: colors.muted,
    fontSize: fontSizes.small,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  meta: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: fontSizes.small,
  },
  metaSecondary: {
    marginTop: 2,
    color: colors.muted,
    fontSize: fontSizes.small,
  },
});
