import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors, Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/auth';

const PLANS = [
  { id: 'monthly', label: '월간 구독', price: '9,900원', sub: '매월 자동 결제' },
  { id: 'yearly', label: '연간 구독', price: '79,900원', sub: '월 6,658원 · 32% 절약', badge: 'BEST' },
];

const FEATURES = [
  '개념노트 무제한 열람',
  '유료 전용 상품 열람',
  '프리미엄 회원 뱃지',
  '내 상품 우선 노출',
];

export default function PaymentScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { session, refreshProfile } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [paying, setPaying] = useState(false);

  async function handlePay() {
    if (!session) return;
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1200));
    const { error } = await supabase
      .from('users')
      .update({ tier: 'premium' })
      .eq('id', session.user.id);
    setPaying(false);
    if (error) {
      Alert.alert('결제 실패', error.message);
      return;
    }
    await refreshProfile();
    Alert.alert('결제 완료', '유료 회원으로 업그레이드되었습니다! 🎉', [
      { text: '확인', onPress: () => router.back() },
    ]);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.backgroundElement }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>프리미엄 멤버십</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 히어로 */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>⭐</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>프리미엄</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>모든 기능을 무제한으로 이용하세요</Text>
        </View>

        {/* 혜택 */}
        <View style={[styles.benefitBox, { backgroundColor: colors.backgroundElement }]}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Text style={styles.check}>✅</Text>
              <Text style={[styles.featureText, { color: colors.text }]}>{f}</Text>
            </View>
          ))}
        </View>

        {/* 요금제 선택 */}
        <Text style={[styles.sectionLabel, { color: colors.text }]}>요금제 선택</Text>
        {PLANS.map((plan) => {
          const active = selectedPlan === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                { borderColor: active ? BrandColors.primary : colors.backgroundElement, backgroundColor: colors.backgroundElement },
                active && styles.planCardActive,
              ]}
              onPress={() => setSelectedPlan(plan.id as 'monthly' | 'yearly')}
              activeOpacity={0.8}>
              <View style={styles.planLeft}>
                <Text style={[styles.planLabel, { color: colors.text }]}>{plan.label}</Text>
                <Text style={[styles.planSub, { color: colors.textSecondary }]}>{plan.sub}</Text>
              </View>
              <View style={styles.planRight}>
                {plan.badge && (
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestText}>{plan.badge}</Text>
                  </View>
                )}
                <Text style={[styles.planPrice, { color: active ? BrandColors.primary : colors.text }]}>{plan.price}</Text>
              </View>
              {active && <View style={styles.planDot} />}
            </TouchableOpacity>
          );
        })}

        {/* 카드 정보 (더미) */}
        <Text style={[styles.sectionLabel, { color: colors.text }]}>카드 정보</Text>
        <View style={[styles.cardSection, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>카드번호</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderBottomColor: colors.backgroundElement }]}
              placeholder="●●●● ●●●● ●●●● ●●●●"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={19}
              editable={!paying}
            />
          </View>
          <View style={styles.inputRowGroup}>
            <View style={[styles.inputRow, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>유효기간</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderBottomColor: colors.backgroundElement }]}
                placeholder="MM / YY"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={7}
                editable={!paying}
              />
            </View>
            <View style={[styles.inputRow, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CVC</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderBottomColor: colors.backgroundElement }]}
                placeholder="●●●"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
                editable={!paying}
              />
            </View>
          </View>
        </View>

        <Text style={[styles.demoNotice, { color: colors.textSecondary }]}>
          * 데모 버전입니다. 실제 결제가 발생하지 않습니다.
        </Text>
      </ScrollView>

      {/* 결제 버튼 */}
      <View style={[styles.footer, { borderTopColor: colors.backgroundElement }]}>
        <TouchableOpacity
          style={[styles.payBtn, paying && { opacity: 0.7 }]}
          onPress={handlePay}
          disabled={paying}
          activeOpacity={0.85}>
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>
              결제하기 · {selectedPlan === 'monthly' ? '9,900원' : '79,900원'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { padding: 20, paddingBottom: 32, gap: 0 },
  hero: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  heroIcon: { fontSize: 48 },
  heroTitle: { fontSize: 26, fontWeight: '900' },
  heroSub: { fontSize: 14, textAlign: 'center' },
  benefitBox: { borderRadius: 12, padding: 16, marginBottom: 24, gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  check: { fontSize: 16 },
  featureText: { fontSize: 15, fontWeight: '500' },
  sectionLabel: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  planCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  planCardActive: { borderWidth: 2 },
  planLeft: { gap: 3 },
  planLabel: { fontSize: 15, fontWeight: '700' },
  planSub: { fontSize: 12 },
  planRight: { alignItems: 'flex-end', gap: 4 },
  planPrice: { fontSize: 17, fontWeight: '800' },
  planDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BrandColors.primary,
  },
  bestBadge: {
    backgroundColor: BrandColors.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bestText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardSection: { borderRadius: 12, padding: 16, marginBottom: 12, gap: 16 },
  inputRow: { gap: 6 },
  inputRowGroup: { flexDirection: 'row', gap: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600' },
  input: {
    fontSize: 15,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  demoNotice: { fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: 8 },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  payBtn: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
