import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { BrandColors, Colors } from '@/constants/theme';
import { PREMIUM_CATEGORIES } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/auth';
import { useProducts, type Product } from '@/store/products';

const MOCK_PRODUCTS: Product[] = [
  { id: 'm1', title: '아이폰 14 Pro 256GB 스페이스블랙', price: 850000, location: '서현동', timeAgo: '30분 전', chatCount: 3, likeCount: 5, category: '디지털기기' },
  { id: 'm2', title: '맥북 에어 M2 8GB 스타라이트', price: 1100000, location: '이매동', timeAgo: '1시간 전', chatCount: 1, likeCount: 8, category: '디지털기기' },
  { id: 'm3', title: '닌텐도 스위치 OLED 화이트', price: 280000, location: '판교동', timeAgo: '2시간 전', chatCount: 5, likeCount: 12, category: '게임·취미' },
  { id: 'm4', title: '에어팟 프로 2세대 (거의 새것)', price: 220000, location: '분당동', timeAgo: '3시간 전', chatCount: 2, likeCount: 4, category: '디지털기기' },
  { id: 'm5', title: '다이슨 에어랩 컴플리트', price: 450000, location: '수내동', timeAgo: '5시간 전', chatCount: 7, likeCount: 15, category: '생활가전' },
  { id: 'm6', title: '소파 2인용 패브릭 (직거래)', price: 80000, location: '정자동', timeAgo: '6시간 전', chatCount: 0, likeCount: 2, category: '가구·인테리어' },
  { id: 'm7', title: '갤럭시 버즈2 프로 보라색', price: 95000, location: '야탑동', timeAgo: '어제', chatCount: 1, likeCount: 3, category: '디지털기기' },
  { id: 'm8', title: '러닝화 나이키 줌X 270mm', price: 65000, location: '서현동', timeAgo: '어제', chatCount: 0, likeCount: 1, category: '스포츠·레저' },
  { id: 'm9', title: '아이패드 미니 6세대 64GB 와이파이', price: 520000, location: '미금동', timeAgo: '2일 전', chatCount: 4, likeCount: 9, category: '디지털기기' },
  { id: 'm10', title: '캠핑 의자 2개 세트 헬리녹스 스타일', price: 45000, location: '이매동', timeAgo: '3일 전', chatCount: 2, likeCount: 6, category: '스포츠·레저' },
  { id: 'm11', title: '[개념노트] 알고리즘 핵심 개념 정리 PDF', price: 15000, location: '분당동', timeAgo: '1일 전', chatCount: 0, likeCount: 3, category: '개념노트' },
  { id: 'm12', title: '[개념노트] 자료구조 A to Z 완벽 정리', price: 20000, location: '서현동', timeAgo: '2일 전', chatCount: 1, likeCount: 7, category: '개념노트' },
];

function formatPrice(price: number) {
  return price > 0 ? price.toLocaleString('ko-KR') + '원' : '가격 미정';
}

type ProductItemProps = {
  item: Product;
  liked: boolean;
  onToggleLike: (productId: string, liked: boolean) => void;
};

function ProductItem({ item, liked, onToggleLike }: ProductItemProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [localLikeCount, setLocalLikeCount] = useState(item.likeCount);

  function handleLike() {
    const next = !liked;
    setLocalLikeCount((c) => c + (next ? 1 : -1));
    onToggleLike(item.id, liked);
  }

  return (
    <TouchableOpacity style={[styles.item, { borderBottomColor: colors.backgroundElement }]} activeOpacity={0.7}>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, { backgroundColor: colors.backgroundElement }]} />
      )}
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {item.location} · {item.timeAgo}
        </Text>
        <View style={styles.bottom}>
          <Text style={[styles.price, { color: colors.text }]}>{formatPrice(item.price)}</Text>
          <View style={styles.counts}>
            {item.chatCount > 0 && (
              <Text style={[styles.count, { color: colors.textSecondary }]}>💬 {item.chatCount}</Text>
            )}
            <TouchableOpacity onPress={handleLike} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.count, { color: liked ? BrandColors.primary : colors.textSecondary }]}>
                {liked ? '♥' : '♡'} {localLikeCount > 0 ? localLikeCount : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { userProducts, loading, selectedCategory } = useProducts();
  const { session, profile } = useAuth();
  const isPremium = profile?.tier === 'premium';

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session) return;
    supabase
      .from('likes')
      .select('product_id')
      .eq('user_id', session.user.id)
      .then(({ data }) => {
        if (data) setLikedIds(new Set(data.map((r: { product_id: string }) => r.product_id)));
      });
  }, [session]);

  async function handleToggleLike(productId: string, currentlyLiked: boolean) {
    if (!session) return;
    const userId = session.user.id;
    if (currentlyLiked) {
      await supabase.from('likes').delete().match({ user_id: userId, product_id: productId });
      setLikedIds((prev) => { const next = new Set(prev); next.delete(productId); return next; });
    } else {
      await supabase.from('likes').insert({ user_id: userId, product_id: productId });
      setLikedIds((prev) => new Set(prev).add(productId));
    }
  }

  const allProducts = [...userProducts, ...MOCK_PRODUCTS].filter(
    (p) => isPremium || !PREMIUM_CATEGORIES.includes(p.category ?? '')
  );
  const filtered = selectedCategory === '전체'
    ? allProducts
    : allProducts.filter((p) => p.category === selectedCategory);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductItem
            item={item}
            liked={likedIds.has(item.id)}
            onToggleLike={handleToggleLike}
          />
        )}
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              '{selectedCategory}' 카테고리 상품이 없어요
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/register')}
        activeOpacity={0.85}>
        <Text style={styles.fabText}>+ 글쓰기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: BrandColors.primary,
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 8 },
    }),
  },
  fabText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  list: { paddingBottom: 16 },
  item: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumbnail: { width: 100, height: 100, borderRadius: 8, flexShrink: 0 },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: '500', lineHeight: 20 },
  meta: { fontSize: 13 },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: { fontSize: 15, fontWeight: '700' },
  counts: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  count: { fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15 },
});
