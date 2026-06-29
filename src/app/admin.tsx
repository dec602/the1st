import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors, Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/auth';

type ManagedUser = {
  id: string;
  email: string;
  nickname: string;
  tier: 'free' | 'premium';
  role: 'user' | 'admin';
};

export default function AdminScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    fetchUsers();
  }, [isAdmin]);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('id, email, nickname, tier, role')
      .order('created_at', { ascending: true });
    setUsers((data as ManagedUser[]) ?? []);
    setLoading(false);
  }

  async function toggleTier(userId: string, currentTier: 'free' | 'premium') {
    const newTier = currentTier === 'free' ? 'premium' : 'free';
    setUpdating(userId);
    const { error } = await supabase
      .from('users')
      .update({ tier: newTier })
      .eq('id', userId);
    if (error) {
      Alert.alert('오류', '변경에 실패했습니다.');
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, tier: newTier } : u))
      );
    }
    setUpdating(null);
  }

  if (!isAdmin) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.backgroundElement }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>관리자 페이지</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.center}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🚫</Text>
          <Text style={[styles.noAccessText, { color: colors.text }]}>접근 권한이 없습니다</Text>
          <Text style={[styles.noAccessSub, { color: colors.textSecondary }]}>관리자 계정으로 로그인하세요</Text>
        </View>
      </View>
    );
  }

  const freeUsers = users.filter((u) => u.tier === 'free');
  const premiumUsers = users.filter((u) => u.tier === 'premium');

  const sections = [
    { title: `무료 회원 (${freeUsers.length}명)`, data: freeUsers, isFree: true },
    { title: `유료 회원 (${premiumUsers.length}명)`, data: premiumUsers, isFree: false },
  ];

  function renderUser({ item }: { item: ManagedUser }) {
    const isPending = updating === item.id;
    const isFree = item.tier === 'free';
    return (
      <View style={[styles.userRow, { borderBottomColor: colors.backgroundElement }]}>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={[styles.nickname, { color: colors.text }]}>{item.nickname}</Text>
            {item.role === 'admin' && (
              <Text style={{ color: BrandColors.primary, fontSize: 13 }}>👑</Text>
            )}
          </View>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{item.email}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.tierBtn,
            { backgroundColor: isFree ? BrandColors.primary : colors.backgroundElement },
            isPending && { opacity: 0.5 },
          ]}
          onPress={() => toggleTier(item.id, item.tier)}
          disabled={isPending}
          activeOpacity={0.8}>
          {isPending ? (
            <ActivityIndicator size="small" color={isFree ? '#fff' : colors.textSecondary} />
          ) : (
            <Text style={[styles.tierBtnText, { color: isFree ? '#fff' : colors.textSecondary }]}>
              {isFree ? '유료로 변경' : '무료로 변경'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.backgroundElement }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>🛡️ 관리자 페이지</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary, textAlign: 'center' }]}>전체 회원 {users.length}명</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              <View style={[styles.sectionBadge, {
                backgroundColor: section.isFree ? colors.backgroundElement : '#FFD70033',
              }]}>
                <Text style={{ fontSize: 11, color: section.isFree ? colors.textSecondary : '#B8860B', fontWeight: '600' }}>
                  {section.isFree ? '무료' : '유료'}
                </Text>
              </View>
            </View>
          )}
          stickySectionHeadersEnabled
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={{ color: colors.textSecondary, fontSize: 15 }}>회원이 없습니다</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noAccessText: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  noAccessSub: { fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 44, alignItems: 'center' },
  backIcon: { fontSize: 22 },
  headerTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  headerSub: { fontSize: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  sectionBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  list: { paddingBottom: 24 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  userInfo: { flex: 1, gap: 2 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nickname: { fontSize: 15, fontWeight: '600' },
  email: { fontSize: 12 },
  tierBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierBtnText: { fontSize: 12, fontWeight: '700' },
  emptyBox: { paddingTop: 60, alignItems: 'center' },
});
