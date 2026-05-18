import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useAuth } from '../state';
import { useI18n, type Lang } from '../i18n';
import { Button, Card, Chip, DetailRow, Field, Input, PageHeader } from '../ui';
import { normalizeBaseUrl } from '../api';
import { spacing } from '../theme';

export function AccountScreen() {
  const { t, lang, setLang } = useI18n();
  const { user, apiBaseUrl, setApiBaseUrl, logout } = useAuth();
  const [url, setUrl] = useState(apiBaseUrl);

  if (!user) return null;

  const saveUrl = async () => {
    const normalized = normalizeBaseUrl(url);
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      Alert.alert('', t.auth.invalidApi);
      return;
    }
    await setApiBaseUrl(normalized);
    setUrl(normalized);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
      <PageHeader
        kicker={t.account.kicker}
        title={t.account.title}
        subtitle={`${user.name} ${user.surname ?? ''}`.trim()}
      />

      <Card style={{ marginBottom: spacing.lg }}>
        <DetailRow label={t.account.email} value={user.email} />
        <DetailRow label={t.account.role} value={t.roles[user.role] || user.role} />
        <DetailRow label={t.account.team} value={user.team || '—'} />
        <DetailRow label={t.account.phone} value={user.phone || '—'} />
      </Card>

      <Card style={{ marginBottom: spacing.lg }}>
        <Field label={t.account.language}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {(['pt', 'en'] as Lang[]).map((option) => (
              <Chip
                key={option}
                label={option === 'pt' ? 'Português' : 'English'}
                active={lang === option}
                onPress={() => setLang(option)}
              />
            ))}
          </View>
        </Field>
      </Card>

      <Card>
        <Field label={t.auth.apiBaseUrl} hint={t.auth.apiBaseUrlHint}>
          <Input autoCapitalize="none" autoCorrect={false} value={url} onChangeText={setUrl} />
        </Field>
        <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'flex-end' }}>
          <Button label={t.auth.saveApi} onPress={saveUrl} variant="secondary" size="sm" />
          <Button label={t.auth.logout} variant="danger" size="sm" onPress={logout} />
        </View>
      </Card>
    </ScrollView>
  );
}
