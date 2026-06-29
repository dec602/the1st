import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
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
import type { Product } from '@/store/products';

type Tab = 'sales' | 'purchases' | 'likes';

const TABS: { key: Tab; label: string }[] = [
  { key: 'sales', label: '판매내역' },
  { key: 'purchases', label: '구매내역' },
  { key: 'likes', label: '관심 목록' },
];

type DbRow = {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string | null;
  image_uri: string | null;
  chat_count: number;
  like_count: number;
  created_at: string;
  user_id: string | null;
};

function calcTimeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

function rowToProduct(row: DbRow): Product {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    location: row.location,
    category: row.category ?? undefined,
    imageUri: row.image_uri ?? undefined,
    chatCount: row.chat_count,
    likeCount: row.like_count,
    timeAgo: calcTimeAgo(row.created_at),
    userId: row.user_id ?? undefined,
  };
}

function formatPrice(price: number) {
  return price > 0 ? price.toLocaleString('ko-KR') + '원' : '가격 미정';
}

function ProductCard({ item, colors }: { item: Product; colors: typeof Colors.light | typeof Colors.dark }) {
  return (
    <View style={[cardStyles.item, { borderBottomColor: colors.backgroundElement }]}>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={cardStyles.thumbnail} />
      ) : (
        <View style={[cardStyles.thumbnail, { backgroundColor: colors.backgroundElement }]} />
      )}
      <View style={cardStyles.info}>
        <Text style={[cardStyles.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[cardStyles.meta, { color: colors.textSecondary }]}>
          {item.location} · {item.timeAgo}
        </Text>
        <View style={cardStyles.bottom}>
          <Text style={[cardStyles.price, { color: colors.text }]}>{formatPrice(item.price)}</Text>
          <View style={cardStyles.counts}>
            {item.chatCount > 0 && (
              <Text style={[cardStyles.count, { color: colors.textSecondary }]}>💬 {item.chatCount}</Text>
            )}
            {item.likeCount > 0 && (
              <Text style={[cardStyles.count, { color: colors.textSecondary }]}>♡ {item.likeCount}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { profile, session, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('sales');
  const [tabData, setTabData] = useState<Product[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  const nickname = profile?.nickname ?? session?.user.email?.split('@')[0] ?? '';
  const email = profile?.email ?? session?.user.email ?? '';
  const location = profile?.location ?? '서현동';
  const isAdmin = profile?.role === 'admin';
  const isPremium = profile?.tier === 'premium';

  useEffect(() => {
    if (!session) return;
    fetchTab(activeTab);
  }, [activeTab, session]);

  async function fetchTab(tab: Tab) {
    if (!session) return;
    setTabLoading(true);
    setTabData([]);

    if (tab === 'sales') {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      setTabData((data as DbRow[] ?? []).map(rowToProduct));

    } else if (tab === 'likes') {
      const { data } = await supabase
        .from('likes')
        .select('products(*)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      const products = (data ?? [])
        .map((r: { products: unknown }) => r.products as DbRow | null)
        .filter((row): row is DbRow => row != null)
        .map(rowToProduct);
      setTabData(products);

    } else {
      setTabData([]);
    }

    setTabLoading(false);
  }

  const emptyLabel =
    activeTab === 'sales' ? '등록한 상품이 없어요' :
    activeTab === 'purchases' ? '구매 내역이 없어요' :
    '관심 목록이 비어있어요';

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>

      {/* 프로필 카드 */}
      <View style={[styles.profileCard, { backgroundColor: colors.backgroundElement }]}>
        <View style={[styles.avatar, { backgroundColor: BrandColors.primary }]}>
          <Text style={styles.avatarText}>{nickname.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.nickname, { color: colors.text }]}>{nickname}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.roleBadge, { backgroundColor: isAdmin ? BrandColors.primary + '22' : colors.backgroundElement }]}>
              <Text style={[styles.roleText, { color: isAdmin ? BrandColors.primary : colors.textSecondary }]}>
                {isAdmin ? '👑 관리자' : '일반 유저'}
              </Text>
            </View>
            <View style={[styles.tierBadge, { backgroundColor: isPremium ? '#FFD70033' : colors.backgroundElement }]}>
              <Text style={[styles.tierText, { color: isPremium ? '#B8860B' : colors.textSecondary }]}>
                {isPremium ? '⭐ 유료 회원' : '무료 회원'}
              </Text>
            </View>
          </View>
          <Text style={[styles.locationText, { color: colors.textSecondary }]}>{location}</Text>
          <Text style={[styles.emailText, { color: colors.textSecondary }]}>{email}</Text>
        </View>
      </View>

      {/* 서브탭 */}
      <View style={[styles.tabBar, { borderBottomColor: colors.backgroundElement }]}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(t.key)}
            activeOpacity={0.7}>
            <Text style={[styles.tabLabel, {
              color: activeTab === t.key ? BrandColors.primary : colors.textSecondary,
              fontWeight: activeTab === t.key ? '700' : '400',
            }]}>
              {t.label}
            </Text>
            {activeTab === t.key && (
              <View style={styles.tabUnderline} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* 탭 콘텐츠 */}
      {tabLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={BrandColors.primary} />
        </View>
      ) : (
        <FlatList
          data={tabData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard item={item} colors={colors} />}
          contentContainerStyle={tabData.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{emptyLabel}</Text>
            </View>
          }
        />
      )}

      {/* 업그레이드 버튼 (무료 회원만 표시) */}
      {!isPremium && (
        <TouchableOpacity
          style={[styles.upgradeBtn, { marginHorizontal: 16, marginBottom: 8 }]}
          onPress={() => router.push('/payment')}
          activeOpacity={0.85}>
          <Text style={styles.upgradeBtnText}>⭐ 유료 회원 업그레이드</Text>
        </TouchableOpacity>
      )}

      {/* 관리자 버튼 (관리자만 표시) */}
      {isAdmin && (
        <TouchableOpacity
          style={[styles.adminBtn, { marginHorizontal: 16, marginBottom: 8, backgroundColor: colors.backgroundElement }]}
          onPress={() => router.push('/admin')}
          activeOpacity={0.8}>
          <Text style={[styles.adminBtnText, { color: BrandColors.primary }]}>🛡️ 관리자 페이지</Text>
        </TouchableOpacity>
      )}

      {/* 로그아웃 */}
      <TouchableOpacity
        style={[styles.logoutBtn, { marginHorizontal: 16, marginBottom: 8 }]}
        onPress={signOut}
        activeOpacity={0.8}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  profileCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1, gap: 2 },
  nickname: { fontSize: 18, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  roleBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleText: { fontSize: 12, fontWeight: '600' },
  tierBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tierText: { fontSize: 12, fontWeight: '600' },
  locationText: { fontSize: 13 },
  emailText: { fontSize: 12 },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabLabel: { fontSize: 14 },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: BrandColors.primary,
    borderRadius: 1,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1 },
  emptyBox: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15 },
  upgradeBtn: {
    backgroundColor: BrandColors.primary,
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  adminBtn: {
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BrandColors.primary,
  },
  adminBtnText: { fontSize: 15, fontWeight: '700' },
  logoutBtn: {
    backgroundColor: BrandColors.primary,
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

const cardStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  thumbnail: { width: 80, height: 80, borderRadius: 8, flexShrink: 0 },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  meta: { fontSize: 12 },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: { fontSize: 14, fontWeight: '700' },
  counts: { flexDirection: 'row', gap: 8 },
  count: { fontSize: 11 },
});
