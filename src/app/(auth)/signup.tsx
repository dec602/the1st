import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors, Colors } from '@/constants/theme';
import { useAuth } from '@/store/auth';

export default function SignupScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordMismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = email.trim() && password.length >= 6 && password === confirm;

  async function handleSignup() {
    if (!canSubmit) return;
    setLoading(true);
    const error = await signUp(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('회원가입 실패', error);
    } else {
      router.replace('/(auth)/login');
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.inner, { paddingTop: insets.top + 40 }]}>

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>회원가입</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          당근에서 동네 이웃과 거래해 보세요
        </Text>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text }]}
            placeholder="이메일"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text }]}
            placeholder="비밀번호 (6자 이상)"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <View>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.backgroundElement, color: colors.text },
                passwordMismatch && styles.inputError,
              ]}
              placeholder="비밀번호 확인"
              placeholderTextColor={colors.textSecondary}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
            {passwordMismatch && (
              <Text style={styles.errorText}>비밀번호가 일치하지 않습니다</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.btn, { opacity: loading || !canSubmit ? 0.5 : 1 }]}
            onPress={handleSignup}
            disabled={loading || !canSubmit}
            activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>회원가입</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.switchRow}
          onPress={() => router.back()}>
          <Text style={[styles.switchText, { color: colors.textSecondary }]}>
            이미 계정이 있으신가요?{'  '}
            <Text style={{ color: BrandColors.primary, fontWeight: '700' }}>로그인</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  backBtn: { marginBottom: 24 },
  backIcon: { fontSize: 22 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 15, marginBottom: 32 },
  form: { gap: 12 },
  input: {
    height: 52,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: '#FF3B30',
  },
  errorText: { color: '#FF3B30', fontSize: 12, marginTop: 4, marginLeft: 4 },
  btn: {
    height: 52,
    backgroundColor: BrandColors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchRow: { alignItems: 'center', marginTop: 24 },
  switchText: { fontSize: 14 },
});
