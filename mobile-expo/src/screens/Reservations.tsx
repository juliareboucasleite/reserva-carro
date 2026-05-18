import { useMemo, useState } from 'react';
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
import { useI18n, formatKm, formatTemplate } from '../i18n';
import {
  Badge,
  Button,
  Card,
  Chip,
  DetailRow,
  Empty,
  Field,
  Input,
  Kicker,
  PageHeader,
  SectionHeader,
  Sheet,
  SheetHeader,
} from '../ui';
import { AngleCaptureGrid, capturePhoto } from '../AngleCapture';
import type {
  AngleMediaMap,
  Damage,
  DamageDraft,
  MediaAsset,
  Reservation,
  ReservationStatus,
  Vehicle,
} from '../api';
import { buildAssetUrl } from '../api';
import { colors, fontSizes, fontWeights, radii, spacing } from '../theme';

const ALL_STATUSES: ReservationStatus[] = [
  'pending',
  'approved',
  'checked_in',
  'checked_out',
  'rejected',
];

type Filter = 'all' | 'mine' | ReservationStatus;

export function ReservationsScreen({
  draftVehicleId,
  onDraftConsumed,
}: {
  draftVehicleId: number | null;
  onDraftConsumed: () => void;
}) {
  const { t } = useI18n();
  const { user } = useAuth();
  const {
    vehicles,
    reservations,
    loading,
    refresh,
    createReservation,
    approveReservation,
    rejectReservation,
    checkIn,
    checkOut,
    confirmOperational,
  } = useData();

  const [filter, setFilter] = useState<Filter>('all');
  const [composerOpen, setComposerOpen] = useState(Boolean(draftVehicleId));
  const [composerVehicleId, setComposerVehicleId] = useState<number | null>(draftVehicleId);
  const [openId, setOpenId] = useState<number | null>(null);
  const [checkInId, setCheckInId] = useState<number | null>(null);
  const [checkOutId, setCheckOutId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return reservations.filter((reservation) => {
      if (filter === 'mine') return reservation.requested_by === user?.id;
      if (filter === 'all') return true;
      return reservation.status === filter;
    });
  }, [reservations, filter, user?.id]);

  const handleApprove = (id: number) =>
    approveReservation(id).catch((error) => Alert.alert('', getMessage(error)));
  const handleReject = (id: number) =>
    rejectReservation(id).catch((error) => Alert.alert('', getMessage(error)));

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.lg }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.ink} />
      }
    >
      <PageHeader
        kicker={t.reservations.kicker}
        title={t.reservations.title}
        subtitle={t.reservations.subtitle}
        action={
          <Button
            label={t.reservations.newReservation}
            onPress={() => {
              setComposerVehicleId(vehicles[0]?.id ?? null);
              setComposerOpen(true);
            }}
            size="sm"
          />
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}
      >
        <Chip label={t.common.all} active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip
          label={t.reservations.myOnly}
          active={filter === 'mine'}
          onPress={() => setFilter('mine')}
        />
        {ALL_STATUSES.map((status) => (
          <Chip
            key={status}
            label={t.reservations.status[status]}
            active={filter === status}
            onPress={() => setFilter(status)}
          />
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <Empty label={t.reservations.empty} />
      ) : (
        filtered.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            open={openId === reservation.id}
            onToggle={() =>
              setOpenId((current) => (current === reservation.id ? null : reservation.id))
            }
            onCheckIn={() => setCheckInId(reservation.id)}
            onCheckOut={() => setCheckOutId(reservation.id)}
            onApprove={() => handleApprove(reservation.id)}
            onReject={() => handleReject(reservation.id)}
            onConfirmOperational={(operational) =>
              confirmOperational(reservation.id, operational).catch((error) =>
                Alert.alert('', getMessage(error)),
              )
            }
          />
        ))
      )}

      <ComposerSheet
        open={composerOpen}
        vehicles={vehicles}
        initialVehicleId={composerVehicleId}
        onClose={() => {
          setComposerOpen(false);
          if (draftVehicleId) onDraftConsumed();
        }}
        onSubmit={async (payload) => {
          await createReservation(payload);
          setComposerOpen(false);
          if (draftVehicleId) onDraftConsumed();
        }}
      />

      <CheckInSheet
        reservation={reservations.find((r) => r.id === checkInId) ?? null}
        defaultDriver={user ? `${user.name} ${user.surname ?? ''}`.trim() : ''}
        onClose={() => setCheckInId(null)}
        onSubmit={async (payload) => {
          await checkIn(checkInId!, payload);
          setCheckInId(null);
        }}
      />

      <CheckOutSheet
        reservation={reservations.find((r) => r.id === checkOutId) ?? null}
        onClose={() => setCheckOutId(null)}
        onSubmit={async (payload) => {
          await checkOut(checkOutId!, payload);
          setCheckOutId(null);
        }}
      />
    </ScrollView>
  );
}

function ReservationCard({
  reservation,
  open,
  onToggle,
  onCheckIn,
  onCheckOut,
  onApprove,
  onReject,
  onConfirmOperational,
}: {
  reservation: Reservation;
  open: boolean;
  onToggle: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onApprove: () => void;
  onReject: () => void;
  onConfirmOperational: (operational: boolean) => void;
}) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { apiBaseUrl } = useAuth();
  const tone: Parameters<typeof Badge>[0]['tone'] = (
    {
      pending: 'pending',
      approved: 'approved',
      checked_in: 'inProgress',
      checked_out: 'done',
      rejected: 'rejected',
    } as const
  )[reservation.status];

  const period = formatPeriod(reservation);
  const isOwner = reservation.requested_by === user?.id;
  const startMedia = (reservation.media || []).filter((item) => item.phase === 'start');
  const endMedia = (reservation.media || []).filter((item) => item.phase === 'end');

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <Pressable onPress={onToggle}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{vehicleLabel(reservation.vehicle)}</Text>
            <Text style={styles.cardSubtle}>{reservation.trip}</Text>
          </View>
          <Badge tone={tone}>{t.reservations.status[reservation.status]}</Badge>
        </View>
        <Text style={styles.cardMeta}>
          {period} · {reservation.requester?.name || '—'}
        </Text>
      </Pressable>

      <View style={styles.actionsRow}>
        {reservation.status === 'pending' && isManager(user?.role) ? (
          <>
            <Button label={t.common.approve} onPress={onApprove} size="sm" />
            <Button label={t.common.reject} onPress={onReject} variant="secondary" size="sm" />
          </>
        ) : null}
        {reservation.status === 'approved' && isOwner ? (
          <Button label={t.reservations.doCheckIn} onPress={onCheckIn} size="sm" />
        ) : null}
        {reservation.status === 'checked_in' && isOwner ? (
          <Button label={t.reservations.doCheckOut} onPress={onCheckOut} size="sm" />
        ) : null}
      </View>

      {open && (
        <View style={{ marginTop: spacing.md }}>
          <DetailRow label={t.reservations.vehicle} value={vehicleLabel(reservation.vehicle)} />
          <DetailRow label={t.reservations.period} value={period} />
          <DetailRow label={t.reservations.trip} value={reservation.trip} />
          <DetailRow
            label={t.reservations.driver}
            value={reservation.driver || reservation.requester?.name || '—'}
          />
          <DetailRow
            label={t.reservations.startKm}
            value={formatKm(reservation.start_km ?? undefined, lang)}
          />
          <DetailRow
            label={t.reservations.endKm}
            value={formatKm(reservation.end_km ?? undefined, lang)}
          />

          <View style={{ marginTop: spacing.md }}>
            <MediaStrip
              title={t.reservations.mediaStart}
              media={startMedia}
              baseUrl={apiBaseUrl}
              emptyLabel={t.reservations.noMediaPhase}
            />
          </View>
          <View style={{ marginTop: spacing.md }}>
            <MediaStrip
              title={t.reservations.mediaEnd}
              media={endMedia}
              baseUrl={apiBaseUrl}
              emptyLabel={t.reservations.noMediaPhase}
            />
          </View>

          {reservation.status === 'checked_out' &&
          isManager(user?.role) &&
          reservation.operational_confirmed === null ? (
            <View style={{ marginTop: spacing.lg }}>
              <Text style={styles.operationalPrompt}>{t.reservations.operationalQuestion}</Text>
              <View style={styles.actionsRow}>
                <Button
                  label={t.reservations.operationalYes}
                  size="sm"
                  onPress={() => onConfirmOperational(true)}
                />
                <Button
                  label={t.reservations.operationalNo}
                  variant="danger"
                  size="sm"
                  onPress={() => onConfirmOperational(false)}
                />
              </View>
            </View>
          ) : null}
        </View>
      )}
    </Card>
  );
}

function MediaStrip({
  title,
  media,
  baseUrl,
  emptyLabel,
}: {
  title: string;
  media: Reservation['media'];
  baseUrl: string;
  emptyLabel: string;
}) {
  return (
    <View>
      <Text style={styles.stripTitle}>{title}</Text>
      {!media || media.length === 0 ? (
        <Text style={styles.stripEmpty}>{emptyLabel}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {media.map((item) => {
            const uri = buildAssetUrl(baseUrl, item.url);
            const isVideo = (item.mime || '').startsWith('video');
            return (
              <View key={item.id} style={styles.stripItem}>
                <Text style={styles.stripAngle}>{item.angle || '—'}</Text>
                {uri && !isVideo ? (
                  <Image source={{ uri }} style={styles.stripImage} />
                ) : (
                  <View style={[styles.stripImage, styles.stripVideo]}>
                    <Text style={styles.stripVideoText}>{isVideo ? 'VIDEO' : '—'}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function ComposerSheet({
  open,
  vehicles,
  initialVehicleId,
  onClose,
  onSubmit,
}: {
  open: boolean;
  vehicles: Vehicle[];
  initialVehicleId: number | null;
  onClose: () => void;
  onSubmit: (payload: {
    vehicle_id: number;
    trip: string;
    start_date: string;
    end_date: string;
  }) => Promise<void>;
}) {
  const { t } = useI18n();
  const [vehicleId, setVehicleId] = useState<number | null>(initialVehicleId);
  const [trip, setTrip] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!vehicleId || !trip.trim() || !startDate || !endDate) {
      Alert.alert('', t.reservations.missingFields);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ vehicle_id: vehicleId, trip: trip.trim(), start_date: startDate, end_date: endDate });
      setTrip('');
    } catch (error) {
      Alert.alert(t.reservations.failedToCreate, getMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const selected = vehicles.find((vehicle) => vehicle.id === vehicleId);

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetHeader
        title={t.reservations.composerTitle}
        subtitle={selected ? `${selected.brand} ${selected.model} · ${selected.plate}` : t.reservations.chooseVehicle}
        onClose={onClose}
      />

      <Field label={t.reservations.vehicle}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm }}
        >
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
          <Field label={t.reservations.startDate}>
            <Input value={startDate} onChangeText={setStartDate} placeholder={t.reservations.datePlaceholder} />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label={t.reservations.endDate}>
            <Input value={endDate} onChangeText={setEndDate} placeholder={t.reservations.datePlaceholder} />
          </Field>
        </View>
      </View>

      <Field label={t.reservations.trip}>
        <Input multiline value={trip} onChangeText={setTrip} placeholder={t.reservations.tripPlaceholder} />
      </Field>

      <View style={styles.sheetActions}>
        <Button label={t.common.cancel} onPress={onClose} variant="secondary" />
        <Button
          label={submitting ? t.reservations.creating : t.reservations.submit}
          onPress={submit}
          disabled={submitting}
        />
      </View>
    </Sheet>
  );
}

function CheckInSheet({
  reservation,
  defaultDriver,
  onClose,
  onSubmit,
}: {
  reservation: Reservation | null;
  defaultDriver: string;
  onClose: () => void;
  onSubmit: (payload: {
    driver: string;
    start_km: string;
    start_notes?: string;
    angleMedia: AngleMediaMap;
  }) => Promise<void>;
}) {
  const { t } = useI18n();
  const [driver, setDriver] = useState(defaultDriver);
  const [km, setKm] = useState('');
  const [notes, setNotes] = useState('');
  const [media, setMedia] = useState<AngleMediaMap>({});
  const [submitting, setSubmitting] = useState(false);

  if (!reservation) return null;

  const submit = async () => {
    if (!driver.trim() || !km.trim()) {
      Alert.alert('', t.reservations.missingFields);
      return;
    }
    if (!media.front || !media.back || !media.left || !media.right) {
      Alert.alert('', t.reservations.anglesMissing);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        driver: driver.trim(),
        start_km: km.trim(),
        start_notes: notes.trim() || undefined,
        angleMedia: media,
      });
      setKm('');
      setNotes('');
      setMedia({});
    } catch (error) {
      Alert.alert('', getMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open onClose={onClose}>
      <SheetHeader
        title={formatTemplate(t.reservations.reservationId, { n: reservation.id })}
        subtitle={`${t.reservations.checkInTitle} · ${vehicleLabel(reservation.vehicle)}`}
        onClose={onClose}
      />

      <Field label={t.reservations.driver}>
        <Input value={driver} onChangeText={setDriver} placeholder={t.reservations.driverPlaceholder} />
      </Field>
      <Field label={t.reservations.startKm}>
        <Input value={km} onChangeText={setKm} keyboardType="numeric" placeholder={t.reservations.kmPlaceholder} />
      </Field>
      <Field label={t.reservations.startNotes}>
        <Input multiline value={notes} onChangeText={setNotes} placeholder={t.reservations.notesPlaceholder} />
      </Field>

      <View style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
        <Kicker>{t.reservations.mediaTitle}</Kicker>
        <Text style={styles.mediaHint}>{t.reservations.mediaHint}</Text>
      </View>
      <AngleCaptureGrid media={media} onCapture={(angle, asset) => setMedia((c) => ({ ...c, [angle]: asset }))} />

      <View style={styles.sheetActions}>
        <Button label={t.common.cancel} variant="secondary" onPress={onClose} />
        <Button
          label={submitting ? t.reservations.submitting : t.reservations.doCheckIn}
          onPress={submit}
          disabled={submitting}
        />
      </View>
    </Sheet>
  );
}

function CheckOutSheet({
  reservation,
  onClose,
  onSubmit,
}: {
  reservation: Reservation | null;
  onClose: () => void;
  onSubmit: (payload: {
    end_km: string;
    end_notes?: string;
    angleMedia: AngleMediaMap;
    damages?: DamageDraft[];
  }) => Promise<void>;
}) {
  const { t } = useI18n();
  const [km, setKm] = useState('');
  const [notes, setNotes] = useState('');
  const [media, setMedia] = useState<AngleMediaMap>({});
  const [damages, setDamages] = useState<DamageDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!reservation) return null;

  const submit = async () => {
    if (!km.trim()) {
      Alert.alert('', t.reservations.missingFields);
      return;
    }
    if (!media.front || !media.back || !media.left || !media.right) {
      Alert.alert('', t.reservations.anglesMissing);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        end_km: km.trim(),
        end_notes: notes.trim() || undefined,
        angleMedia: media,
        damages,
      });
      setKm('');
      setNotes('');
      setMedia({});
      setDamages([]);
    } catch (error) {
      Alert.alert('', getMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open onClose={onClose}>
      <SheetHeader
        title={formatTemplate(t.reservations.reservationId, { n: reservation.id })}
        subtitle={`${t.reservations.checkOutTitle} · ${vehicleLabel(reservation.vehicle)}`}
        onClose={onClose}
      />

      <Field label={t.reservations.endKm}>
        <Input value={km} onChangeText={setKm} keyboardType="numeric" placeholder={t.reservations.kmPlaceholder} />
      </Field>
      <Field label={t.reservations.endNotes}>
        <Input multiline value={notes} onChangeText={setNotes} placeholder={t.reservations.notesPlaceholder} />
      </Field>

      <View style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
        <Kicker>{t.reservations.mediaTitle}</Kicker>
        <Text style={styles.mediaHint}>{t.reservations.mediaHint}</Text>
      </View>
      <AngleCaptureGrid media={media} onCapture={(angle, asset) => setMedia((c) => ({ ...c, [angle]: asset }))} />

      <View style={{ marginTop: spacing.lg }}>
        <SectionHeader title={t.reservations.damageSection} />
        <Text style={styles.mediaHint}>{t.reservations.damageHint}</Text>
        <DamageDiagram damages={damages} onAdd={(d) => setDamages((current) => [...current, d])} />
        {damages.map((damage, index) => (
          <DamageDraftEditor
            key={index}
            damage={damage}
            onChange={(updated) =>
              setDamages((current) => current.map((d, i) => (i === index ? updated : d)))
            }
            onRemove={() => setDamages((current) => current.filter((_, i) => i !== index))}
          />
        ))}
      </View>

      <View style={styles.sheetActions}>
        <Button label={t.common.cancel} variant="secondary" onPress={onClose} />
        <Button
          label={submitting ? t.reservations.submitting : t.reservations.doCheckOut}
          onPress={submit}
          disabled={submitting}
        />
      </View>
    </Sheet>
  );
}

function DamageDiagram({
  damages,
  onAdd,
}: {
  damages: DamageDraft[];
  onAdd: (damage: DamageDraft) => void;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  return (
    <Pressable
      onLayout={(event) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
      onPress={(event) => {
        const { locationX, locationY } = event.nativeEvent;
        if (!size.width || !size.height) return;
        onAdd({
          x: locationX / size.width,
          y: locationY / size.height,
          damage_type: 'scratch',
          severity: 'low',
          description: '',
          photo: null,
        });
      }}
      style={styles.diagram}
    >
      <Text style={styles.diagramHint}>↑ frente   ↓ trás</Text>
      <View style={styles.diagramCar} />
      {damages.map((damage, index) => (
        <View
          key={index}
          style={[
            styles.diagramMarker,
            {
              left: damage.x * size.width - 6,
              top: damage.y * size.height - 6,
            },
          ]}
        >
          <Text style={styles.diagramMarkerText}>{index + 1}</Text>
        </View>
      ))}
    </Pressable>
  );
}

function DamageDraftEditor({
  damage,
  onChange,
  onRemove,
}: {
  damage: DamageDraft;
  onChange: (damage: DamageDraft) => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const types = Object.keys(t.reservations.damageTypes) as DamageDraft['damage_type'][];
  const severities = Object.keys(t.reservations.damageSeverities) as DamageDraft['severity'][];

  const takePhoto = async () => {
    const asset = await capturePhoto();
    if (asset) onChange({ ...damage, photo: asset });
  };

  return (
    <View style={styles.damageEditor}>
      <Field label={t.reservations.damageType}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {types.map((type) => (
            <Chip
              key={type}
              label={t.reservations.damageTypes[type]}
              active={damage.damage_type === type}
              onPress={() => onChange({ ...damage, damage_type: type })}
            />
          ))}
        </ScrollView>
      </Field>

      <Field label={t.reservations.damageSeverity}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {severities.map((severity) => (
            <Chip
              key={severity}
              label={t.reservations.damageSeverities[severity]}
              active={damage.severity === severity}
              onPress={() => onChange({ ...damage, severity })}
            />
          ))}
        </ScrollView>
      </Field>

      <Field label={t.reservations.damageDescription}>
        <Input
          multiline
          value={damage.description || ''}
          onChangeText={(value) => onChange({ ...damage, description: value })}
        />
      </Field>

      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginBottom: spacing.md }}>
        <Button label={damage.photo ? t.reservations.retake : t.reservations.damagePhotoButton} onPress={takePhoto} variant="secondary" size="sm" />
        {damage.photo?.type === 'image' ? (
          <Image source={{ uri: damage.photo.uri }} style={styles.damagePhoto} />
        ) : null}
      </View>

      <Button label={t.reservations.removeDamage} variant="danger" size="sm" onPress={onRemove} />
    </View>
  );
}

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : '';
}

function vehicleLabel(vehicle?: Vehicle | null) {
  if (!vehicle) return '—';
  return `${vehicle.brand} ${vehicle.model}`;
}

function formatPeriod(reservation: Reservation) {
  const start = reservation.start_date || reservation.date || '';
  const end = reservation.end_date || start;
  if (!start) return '—';
  return end && end !== start ? `${start} → ${end}` : start;
}

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  cardSubtle: {
    marginTop: 2,
    color: colors.inkSoft,
    fontSize: fontSizes.small,
  },
  cardMeta: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: fontSizes.small,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  operationalPrompt: {
    fontSize: fontSizes.body,
    color: colors.ink,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.sm,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    justifyContent: 'flex-end',
  },
  stripTitle: {
    fontSize: fontSizes.micro,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: fontWeights.semibold,
    marginBottom: 6,
  },
  stripEmpty: {
    fontSize: fontSizes.small,
    color: colors.muted,
  },
  stripItem: {
    marginRight: spacing.md,
    width: 120,
  },
  stripAngle: {
    fontSize: fontSizes.micro,
    color: colors.muted,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  stripImage: {
    width: 120,
    height: 90,
    borderRadius: radii.md,
    backgroundColor: colors.paper3,
  },
  stripVideo: {
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripVideoText: {
    color: colors.paper,
    fontWeight: fontWeights.bold,
    letterSpacing: 2,
  },
  mediaHint: {
    color: colors.muted,
    fontSize: fontSizes.small,
    marginBottom: spacing.sm,
  },
  diagram: {
    height: 180,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper2,
    marginVertical: spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  diagramCar: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    top: '15%',
    bottom: '15%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 40,
    backgroundColor: colors.paper,
  },
  diagramHint: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: fontSizes.micro,
    color: colors.muted,
  },
  diagramMarker: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagramMarkerText: {
    color: colors.paper,
    fontSize: 10,
    fontWeight: fontWeights.bold,
  },
  damageEditor: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.paper2,
  },
  damagePhoto: {
    width: 50,
    height: 50,
    borderRadius: radii.sm,
  },
});
