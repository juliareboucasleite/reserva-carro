import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useAuth } from '../state';
import { useI18n } from '../i18n';
import { Button, Card, Field, Input, Kicker, PageHeader } from '../ui';
import { normalizeBaseUrl } from '../api';
import { spacing } from '../theme';

export function LoginScreen() {
  const { t } = useI18n();
  const { apiBaseUrl, setApiBaseUrl, login } = useAuth();
  const [urlInput, setUrlInput] = useState(apiBaseUrl);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const saveUrl = async () => {
    const normalized = normalizeBaseUrl(urlInput);
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      Alert.alert(t.auth.title, t.auth.invalidApi);
      return;
    }
    await setApiBaseUrl(normalized);
    setUrlInput(normalized);
  };

  const handleLogin = async () => {
    const normalized = normalizeBaseUrl(urlInput);
    if (!normalized) {
      Alert.alert(t.auth.title, t.auth.missingApi);
      return;
    }
    if (normalized !== apiBaseUrl) await setApiBaseUrl(normalized);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert(t.auth.loginFailed, error instanceof Error ? error.message : '');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing['2xl'] }}>
        <PageHeader kicker={t.auth.sessionActive} title={t.auth.title} subtitle={t.auth.subtitle} />

        <Card style={{ marginBottom: spacing.lg }}>
          <View style={{ marginBottom: spacing.md }}>
            <Kicker>API</Kicker>
          </View>
          <Field label={t.auth.apiBaseUrl} hint={t.auth.apiBaseUrlHint}>
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="http://192.168.1.10:8000"
            />
          </Field>
          <Button label={t.auth.saveApi} variant="secondary" onPress={saveUrl} />
        </Card>

        <Card>
          <Field label={t.auth.email}>
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder={t.auth.emailPlaceholder}
            />
          </Field>

          <Field label={t.auth.password}>
            <Input
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder={t.auth.passwordPlaceholder}
            />
          </Field>

          <Button
            label={submitting ? t.auth.loggingIn : t.auth.loginButton}
            onPress={handleLogin}
            disabled={submitting}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
