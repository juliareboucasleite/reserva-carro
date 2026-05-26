import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Icon } from '../../icons';
import { normalizeBaseUrl } from '../../api';
import { useAuth } from '../../state';
import { useI18n } from '../../i18n';
import { useBooking } from '../context';
import { GreenButton } from '../ui';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

export function AuthSheet() {
  const { t } = useI18n();
  const b = t.booking;
  const a = t.auth;
  const { authOpen, setAuthOpen } = useBooking();
  const { apiBaseUrl, setApiBaseUrl, login } = useAuth();
  const [urlInput, setUrlInput] = useState(apiBaseUrl);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [submitting, setSubmitting] = useState(false);
  const needsApi = !apiBaseUrl;

  const close = () => {
    setAuthOpen(false);
    setStep('email');
    setPassword('');
  };

  const continueEmail = () => {
    if (!email.trim()) return;
    setStep('password');
  };

  const saveApi = async () => {
    const normalized = normalizeBaseUrl(urlInput);
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      Alert.alert(a.title, a.invalidApi);
      return;
    }
    await setApiBaseUrl(normalized);
    setUrlInput(normalized);
  };

  const handleLogin = async () => {
    if (needsApi) {
      const normalized = normalizeBaseUrl(urlInput);
      if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        Alert.alert(a.title, a.invalidApi);
        return;
      }
      await setApiBaseUrl(normalized);
    }
    setSubmitting(true);
    try {
      const base =
        needsApi || urlInput.trim()
          ? normalizeBaseUrl(urlInput)
          : apiBaseUrl;
      await login(email.trim(), password, base);
      close();
    } catch (error) {
      Alert.alert(a.loginFailed, error instanceof Error ? error.message : '');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={authOpen} animationType="slide" transparent onRequestClose={close}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.dim} onPress={close} />
        <View style={styles.sheet}>
          <View style={styles.sheetTop}>
            <View style={styles.sheetIcon}>
              <Icon name="person" size={28} color={colors.brandGreen} />
            </View>
            <Pressable onPress={close} style={styles.closeBtn}>
              <Icon name="close" size={20} color={colors.muted} />
            </Pressable>
          </View>

          <Text style={styles.title}>{b.authTitle}</Text>
          <Text style={styles.subtitle}>{b.authSubtitle}</Text>

          {needsApi ? (
            <>
              <Text style={styles.label}>{a.apiBaseUrl}</Text>
              <TextInput
                style={styles.input}
                value={urlInput}
                onChangeText={setUrlInput}
                placeholder="http://192.168.1.10:8000"
                placeholderTextColor={colors.mutedSoft}
                autoCapitalize="none"
              />
              <Text style={styles.apiHint}>{a.apiBaseUrlHint}</Text>
            </>
          ) : null}

          <Text style={[styles.label, needsApi && { marginTop: spacing.md }]}>{a.email}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={a.emailPlaceholder}
            placeholderTextColor={colors.mutedSoft}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {step === 'password' ? (
            <>
              <Text style={[styles.label, { marginTop: spacing.md }]}>{a.password}</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={a.passwordPlaceholder}
                placeholderTextColor={colors.mutedSoft}
                secureTextEntry
              />
            </>
          ) : null}

          <GreenButton
            label={
              step === 'email'
                ? b.continueEmail
                : submitting
                  ? a.loggingIn
                  : a.loginButton
            }
            onPress={step === 'email' ? continueEmail : handleLogin}
            disabled={submitting}
            style={{ marginTop: spacing.lg }}
          />

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>{b.or}</Text>
            <View style={styles.orLine} />
          </View>

          <Pressable style={styles.googleBtn} onPress={() => setAuthOpen(true)}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleLabel}>{b.continueGoogle}</Text>
          </Pressable>

          <Text style={styles.legal}>{b.legal}</Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    padding: spacing.xl,
    maxHeight: '88%',
  },
  sheetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.positiveSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.paper3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.body,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSizes.small,
    color: colors.muted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    color: colors.muted,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.semibold,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  googleG: {
    fontSize: 18,
    fontWeight: fontWeights.bold,
    color: '#4285F4',
  },
  googleLabel: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  legal: {
    marginTop: spacing.lg,
    fontSize: fontSizes.small,
    color: colors.muted,
    lineHeight: 18,
    textAlign: 'center',
  },
  apiHint: {
    marginTop: 6,
    fontSize: fontSizes.small,
    color: colors.muted,
    lineHeight: 18,
  },
});
