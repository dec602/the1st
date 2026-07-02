import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { AppState } from 'react-native';
import { Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';

export type UserProfile = {
  id: string;
  email: string;
  nickname: string;
  location: string;
  avatar_url: string | null;
  tier: 'free' | 'premium';
  role: 'user' | 'admin';
  created_at: string;
};

type AuthContextType = {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<string | null>;
  signInWithKakao: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return data ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionRef = useRef<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      sessionRef.current = data.session;
      if (data.session) {
        setProfile(await fetchProfile(data.session.user.id));
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      sessionRef.current = s;
      if (s) {
        setProfile(await fetchProfile(s.user.id));
      } else {
        setProfile(null);
      }
    });

    const appStateSub = AppState.addEventListener('change', async (state) => {
      if (state === 'active' && sessionRef.current) {
        setProfile(await fetchProfile(sessionRef.current.user.id));
      }
    });

    return () => {
      listener.subscription.unsubscribe();
      appStateSub.remove();
    };
  }, []);

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }

  async function signUp(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  }

  async function signOut() {
    console.log('[signOut] ===== 로그아웃 시작 =====');
    console.log('[signOut] 현재 세션 user:', sessionRef.current?.user?.id ?? 'none');
    console.log('[signOut] provider:', sessionRef.current?.user?.app_metadata?.provider ?? 'unknown');

    try {
      const keysBefore = await AsyncStorage.getAllKeys();
      const authKeysBefore = keysBefore.filter((k) => k.includes('auth') || k.includes('supabase') || k.startsWith('sb-'));
      console.log('[signOut] AsyncStorage 세션 키 (before):', authKeysBefore);
    } catch (e) {
      console.log('[signOut] AsyncStorage 키 조회 실패(before):', e);
    }

    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        console.log('[signOut] supabase.auth.signOut 에러:', error.message, error);
      } else {
        console.log('[signOut] supabase.auth.signOut 성공');
      }
    } catch (e) {
      console.log('[signOut] supabase.auth.signOut 예외:', e);
    }

    setSession(null);
    setProfile(null);
    sessionRef.current = null;
    console.log('[signOut] React state (session/profile/ref) 초기화 완료');

    try {
      const keysAfter = await AsyncStorage.getAllKeys();
      const authKeysAfter = keysAfter.filter((k) => k.includes('auth') || k.includes('supabase') || k.startsWith('sb-'));
      console.log('[signOut] AsyncStorage 세션 키 (after):', authKeysAfter);
      const { data } = await supabase.auth.getSession();
      console.log('[signOut] 로그아웃 후 getSession 잔존 세션:', data.session?.user?.id ?? 'none');
    } catch (e) {
      console.log('[signOut] 로그아웃 후 확인 실패:', e);
    }
    console.log('[signOut] ===== 로그아웃 종료 =====');
  }

  async function refreshProfile() {
    if (!sessionRef.current) return;
    setProfile(await fetchProfile(sessionRef.current.user.id));
  }

  async function handleOAuthRedirect(url: string): Promise<string | null> {
    // implicit flow: tokens arrive in hash fragment (#access_token=...&refresh_token=...)
    if (url.includes('access_token=')) {
      const fragment = url.split('#')[1] ?? url.split('?')[1] ?? '';
      const params = new URLSearchParams(fragment);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token') ?? '';
      if (access_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        return error?.message ?? null;
      }
    }
    // pkce fallback: code in query string
    if (url.includes('code=')) {
      const { error } = await supabase.auth.exchangeCodeForSession(url);
      if (error) {
        await new Promise(r => setTimeout(r, 500));
        const { data: { session: current } } = await supabase.auth.getSession();
        if (!current) return error.message;
      }
    }
    return null;
  }

  async function signInWithGoogle(): Promise<string | null> {
    const redirectTo = Linking.createURL('/');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) return error?.message ?? '구글 로그인 오류';

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success' || !result.url) return null;

    return handleOAuthRedirect(result.url);
  }

  async function signInWithKakao(): Promise<string | null> {
    const redirectTo = Linking.createURL('/');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) return error?.message ?? '카카오 로그인 오류';

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success' || !result.url) return null;

    return handleOAuthRedirect(result.url);
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut, refreshProfile, signInWithGoogle, signInWithKakao }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
