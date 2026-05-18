import { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useData } from '../state';
import { useI18n, formatCurrency } from '../i18n';
import {
  Button,
  Card,
  Chip,
  Empty,
  Field,
  Input,
  PageHeader,
  Sheet,
  SheetHeader,
  Stat,
} from '../ui';
import { colors, fontSizes, fontWeights, spacing } from '../theme';

export function MaintenanceScreen() {
  const { t, lang } = useI18n();
  const { maintenance, vehicles, loading, refresh, createMaintenance } = useData();
  const [open, setOpen] = useState(false);

  const total = maintenance.reduce((sum, record) => sum + (record.cost || 0), 0);
  const sorted = [...maintenance].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.lg }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.ink} />}
    >
      <PageHeader
        kicker={t.maintenance.kicker}
        title={t.maintenance.title}
        subtitle={t.maintenance.subtitle}
        action={<Button label={t.maintenance.newRecord} onPress={() => setOpen(true)} size="sm" />}
      />

      <View style={{ flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <Stat label={t.maintenance.total} value={formatCurrency(total, lang)} />
        </View>
        <View style={{ flex: 1 }}>
          <Stat label={t.maintenance.records} value={maintenance.length} />
        </View>
      </View>

      {sorted.length === 0 ? (
        <Empty label={t.maintenance.empty} />
      ) : (
        sorted.map((record) => {
          const vehicle = vehicles.find((v) => v.id === record.vehicle_id);
          return (
            <Card key={record.id} style={{ marginBottom: spacing.md }}>
              <View style={styles.row}>
                <Text style={styles.date}>{record.date}</Text>
                <Text style={styles.cost}>{formatCurrency(record.cost, lang)}</Text>
              </View>
              <Text style={styles.vehicleName}>
                {vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'}{' '}
                <Text style={styles.plate}>· {vehicle?.plate ?? ''}</Text>
              </Text>
              <Text style={styles.type}>{record.type}</Text>
              {record.notes ? <Text style={styles.notes}>{record.notes}</Text> : null}
              <Text style={styles.downtime}>
                {t.maintenance.downtimeDays}: {record.downtime_days}
              </Text>
            </Card>
          );
        })
      )}

      <NewMaintenanceSheet
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={async (payload) => {
          await createMaintenance(payload);
          setOpen(false);
        }}
      />
    </ScrollView>
  );
}

function NewMaintenanceSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    vehicle_id: number;
    date: string;
    type: string;
    downtime_days: number;
    notes?: string;
    cost: number;
  }) => Promise<void>;
}) {
  const { t } = useI18n();
  const { vehicles } = useData();
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState('');
  const [downtime, setDowntime] = useState('0');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!vehicleId || !date || !type.trim() || !cost) {
      Alert.alert('', t.maintenance.missingFields);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        vehicle_id: vehicleId,
        date,
        type: type.trim(),
        downtime_days: Number(downtime) || 0,
        notes: notes.trim() || undefined,
        cost: Number(cost) || 0,
      });
      setVehicleId(null);
      setType('');
      setDowntime('0');
      setNotes('');
      setCost('');
    } catch (error) {
      Alert.alert('', error instanceof Error ? error.message : '');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetHeader title={t.maintenance.createTitle} onClose={onClose} />

      <Field label={t.maintenance.vehicle}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {vehicles.map((vehicle) => (
            <Chip
              key={vehicle.id}
              label={`${vehicle.brand} ${vehicle.model}`}
              active={vehicleId === vehicle.id}
              onPress={() => setVehicleId(vehicle.id)}
            />
          ))}
        </ScrollView>
      </Field>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Field label={t.maintenance.date}>
            <Input value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label={t.maintenance.downtimeDays}>
            <Input value={downtime} onChangeText={setDowntime} keyboardType="numeric" />
          </Field>
        </View>
      </View>

      <Field label={t.maintenance.type}>
        <Input value={type} onChangeText={setType} placeholder={t.maintenance.typePlaceholder} />
      </Field>

      <Field label={t.maintenance.notes}>
        <Input multiline value={notes} onChangeText={setNotes} />
      </Field>

      <Field label={`${t.maintenance.cost} (€)`}>
        <Input value={cost} onChangeText={setCost} keyboardType="numeric" />
      </Field>

      <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'flex-end', marginTop: spacing.md }}>
        <Button label={t.common.cancel} onPress={onClose} variant="secondary" />
        <Button label={submitting ? t.common.loading : t.common.create} onPress={submit} disabled={submitting} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  date: {
    color: colors.muted,
    fontSize: fontSizes.small,
    fontVariant: ['tabular-nums'],
  },
  cost: {
    color: colors.ink,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    fontVariant: ['tabular-nums'],
  },
  vehicleName: {
    color: colors.ink,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
  plate: {
    color: colors.muted,
    fontWeight: fontWeights.regular,
    fontSize: fontSizes.small,
  },
  type: {
    color: colors.inkSoft,
    fontSize: fontSizes.body,
    marginTop: 4,
  },
  notes: {
    color: colors.muted,
    fontSize: fontSizes.small,
    marginTop: 6,
    lineHeight: 18,
  },
  downtime: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: fontSizes.micro,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
