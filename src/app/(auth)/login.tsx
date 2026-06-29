import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
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

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { signIn, signInWithGoogle, signInWithKakao } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const googleBtnBg = scheme === 'dark' ? '#131314' : '#FFFFFF';
  const googleTextColor = scheme === 'dark' ? '#E3E3E3' : '#1F1F1F';

  async function handleLogin() {
    if (!email.trim() || !password) return;
    setLoading(true);
    const error = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('로그인 실패', error);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    const error = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) Alert.alert('구글 로그인 실패', error);
  }

  async function handleKakaoLogin() {
    setKakaoLoading(true);
    const error = await signInWithKakao();
    setKakaoLoading(false);
    if (error) Alert.alert('카카오 로그인 실패', error);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.inner, { paddingTop: insets.top + 60 }]}>

        <View style={styles.logoArea}>
          <Text style={styles.logo}>🥕</Text>
          <Text style={[styles.appName, { color: BrandColors.primary }]}>당근</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            우리 동네 중고 거래
          </Text>
        </View>

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
            placeholder="비밀번호"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, { opacity: loading || !email.trim() || !password ? 0.5 : 1 }]}
            onPress={handleLogin}
            disabled={loading || !email.trim() || !password}
            activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>로그인</Text>
            }
          </TouchableOpacity>
        </View>

        {/* 구분선 */}
        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: colors.backgroundElement }]} />
          <Text style={[styles.orText, { color: colors.textSecondary }]}>또는</Text>
          <View style={[styles.line, { backgroundColor: colors.backgroundElement }]} />
        </View>

        {/* 구글 로그인 */}
        <TouchableOpacity
          style={[styles.googleBtn, { backgroundColor: googleBtnBg, opacity: googleLoading ? 0.6 : 1 }]}
          onPress={handleGoogleLogin}
          disabled={googleLoading}
          activeOpacity={0.85}>
          {googleLoading
            ? <ActivityIndicator color={googleTextColor} />
            : <>
                <View style={styles.googleLogo}>
                  <Text style={styles.googleLogoText}>G</Text>
                </View>
                <Text style={[styles.googleBtnText, { color: googleTextColor }]}>Google 계정으로 로그인</Text>
              </>
          }
        </TouchableOpacity>

        {/* 카카오 로그인 */}
        <TouchableOpacity
          style={[styles.kakaoBtn, { opacity: kakaoLoading ? 0.6 : 1 }]}
          onPress={handleKakaoLogin}
          disabled={kakaoLoading}
          activeOpacity={0.85}>
          {kakaoLoading
            ? <ActivityIndicator color="#3C1E1E" />
            : <>
                <View style={styles.kakaoLogo}>
                  <Text style={styles.kakaoLogoText}>K</Text>
                </View>
                <Text style={styles.kakaoBtnText}>카카오 계정으로 로그인</Text>
              </>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchRow}
          onPress={() => router.push('/(auth)/signup')}>
          <Text style={[styles.switchText, { color: colors.textSecondary }]}>
            아직 계정이 없으신가요?{'  '}
            <Text style={{ color: BrandColors.primary, fontWeight: '700' }}>회원가입</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  logoArea: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 64, marginBottom: 8 },
  appName: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  tagline: { fontSize: 15, marginTop: 6 },
  form: { gap: 12 },
  input: {
    height: 52,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
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
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  orText: { fontSize: 13 },
  googleBtn: {
    height: 52, borderRadius: 10, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1, borderColor: '#747775',
    paddingHorizontal: 16,
  },
  googleBtnText: { fontSize: 14, fontWeight: '500' },
  googleLogo: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  googleLogoText: { fontSize: 15, fontWeight: '700', color: '#EA4335', lineHeight: 18 },
  kakaoBtn: {
    height: 52, borderRadius: 10, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#FEE500',
    paddingHorizontal: 16,
  },
  kakaoBtnText: { fontSize: 14, fontWeight: '500', color: '#3C1E1E' },
  kakaoLogo: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#3C1E1E',
    alignItems: 'center', justifyContent: 'center',
  },
  kakaoLogoText: { fontSize: 15, fontWeight: '700', color: '#FEE500', lineHeight: 18 },
});
