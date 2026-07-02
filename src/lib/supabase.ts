import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// 웹은 output: "static"으로 Node에서 정적 렌더링(SSR)된다. 이때 window가 없어
// AsyncStorage(웹 구현이 window.localStorage 접근)가 크래시하므로 네이티브에서만 지정한다.
// (웹은 supabase-js 기본 저장소 사용 — SSR 안전, 브라우저에선 localStorage 자동)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS === 'web' ? {} : { storage: AsyncStorage }),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'implicit',
  },
});
