import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth, useData, isManager } from '../state';
import { useI18n, formatCurrency, formatTemplate } from '../i18n';
import { Badge, Button, Card, DetailRow, Empty, Field, Input, PageHeader } from '../ui';
import { buildAssetUrl, type Damage } from '../api';
import { colors, fontSizes, fontWeights, radii, spacing } from '../theme';

export function DamagesScreen() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { apiBaseUrl } = useAuth();
  const { damages, loading, refresh, setDamageCost } = useData();
  const [editing, setEditing] = useState<Record<number, { cost: string; message: string }>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const manager = isManager(user?.role);

  const visible = manager
    ? damages
    : damages.filter((damage) => damage.reservation?.requested_by === user?.id);

  const save = async (id: number) => {
    const draft = editing[id];
    if (!draft || !draft.cost) {
      Alert.alert('', t.reservations.missingFields);
      return;
    }
    setSavingId(id);
    try {
      await setDamageCost(id, {
        cost: Number(draft.cost),
        response_message: draft.message || undefined,
      });
      setEditing((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    } catch (error) {
      Alert.alert('', error instanceof Error ? error.message : '');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.lg }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.ink} />}
    >
      <PageHeader
        kicker={t.damages.kicker}
        title={t.damages.title}
        subtitle={manager ? t.damages.subtitleManager : t.damages.subtitleDriver}
      />

      {visible.length === 0 ? (
        <Empty label={t.damages.noItems} />
      ) : (
        visible.map((damage) => {
          const draft = editing[damage.id] ?? {
            cost: damage.cost?.toString() ?? '',
            message: damage.response_message ?? '',
          };
          return (
            <Card key={damage.id} style={{ marginBottom: spacing.md }}>
              <View style={styles.header}>
                <Badge tone={damage.cost !== null ? 'approved' : 'pending'}>
                  {damage.cost !== null ? t.damages.reviewed : t.damages.pending}
                </Badge>
                {damage.created_at ? (
                  <Text style={styles.timestamp}>
                    {new Date(damage.created_at).toLocaleString(lang === 'pt' ? 'pt-PT' : 'en-GB')}
                  </Text>
                ) : null}
              </View>

              <Text style={styles.vehicleTitle}>
                {damage.reservation?.vehicle
                  ? `${damage.reservation.vehicle.brand} ${damage.reservation.vehicle.model} · ${damage.reservation.vehicle.plate}`
                  : '—'}
              </Text>

              <DetailRow
                label={t.damages.reportedBy}
                value={damage.reservation?.requester?.name || '—'}
              />
              <DetailRow
                label={t.damages.type}
                value={t.reservations.damageTypes[damage.damage_type] || damage.damage_type}
              />
              <DetailRow
                label={t.damages.severity}
                value={t.reservations.damageSeverities[damage.severity] || damage.severity}
              />
              {damage.description ? (
                <DetailRow label={t.damages.description} value={damage.description} />
              ) : null}

              {damage.photo_url ? (
                <Image
                  source={{ uri: buildAssetUrl(apiBaseUrl, damage.photo_url) || undefined }}
                  style={styles.photo}
                />
              ) : null}

              {damage.cost !== null ? (
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>{t.damages.costAmount}</Text>
                  <Text style={styles.costValue}>{formatCurrency(damage.cost, lang)}</Text>
                </View>
              ) : null}

              {manager && (
                <View style={{ marginTop: spacing.md }}>
                  <Field label={t.damages.costAmount}>
                    <Input
                      value={draft.cost}
                      onChangeText={(value) =>
                        setEditing((current) => ({
                          ...current,
                          [damage.id]: { cost: value, message: draft.message },
                        }))
                      }
                      keyboardType="numeric"
                    />
                  </Field>
                  <Field label={t.damages.costResponse}>
                    <Input
                      multiline
                      value={draft.message}
                      onChangeText={(value) =>
                        setEditing((current) => ({
                          ...current,
                          [damage.id]: { cost: draft.cost, message: value },
                        }))
                      }
                    />
                  </Field>
                  <Button
                    label={savingId === damage.id ? t.damages.saving : t.damages.setCost}
                    onPress={() => save(damage.id)}
                    disabled={savingId === damage.id}
                  />
                </View>
              )}

              {!manager && damage.response_message ? (
                <View style={styles.driverMessage}>
                  <Text style={styles.driverMessageText}>{damage.response_message}</Text>
                </View>
              ) : null}
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  timestamp: {
    color: colors.muted,
    fontSize: fontSizes.small,
  },
  vehicleTitle: {
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  photo: {
    width: '100%',
    height: 160,
    borderRadius: radii.md,
    marginTop: spacing.md,
    backgroundColor: colors.paper3,
  },
  costRow: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.paper2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    color: colors.muted,
    fontSize: fontSizes.small,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: fontWeights.semibold,
  },
  costValue: {
    color: colors.ink,
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  driverMessage: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.paper2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  driverMessageText: {
    color: colors.ink,
    fontSize: fontSizes.body,
    lineHeight: 20,
  },
});
