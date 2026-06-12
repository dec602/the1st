import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PRODUCT_CATEGORIES } from '@/constants/categories';
import { BrandColors, Colors } from '@/constants/theme';
import { useProducts } from '@/store/products';

export default function RegisterScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { addProduct } = useProducts();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [price, setPrice] = useState('');
  const [allowOffer, setAllowOffer] = useState(false);
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const borderColor = colors.backgroundElement;
  const inputColor = colors.text;

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 선택하려면 앨범 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  function handleSubmit() {
    addProduct({
      title: title.trim(),
      price: price ? parseInt(price.replace(/,/g, ''), 10) : 0,
      location: '서현동',
      category: category || undefined,
      imageUri: imageUri ?? undefined,
    });
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: borderColor, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>내 물건 팔기</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

        {/* 사진 추가 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.photoBox, { borderColor, backgroundColor: colors.backgroundElement }]}
            onPress={handlePickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.photoPreview} />
            ) : (
              <>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={[styles.photoLabel, { color: colors.textSecondary }]}>사진 추가</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* 제목 */}
        <View style={styles.section}>
          <TextInput
            style={[styles.input, { color: inputColor }]}
            placeholder="글 제목"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* 카테고리 */}
        <TouchableOpacity style={styles.section} onPress={() => setShowCategoryModal(true)}>
          <Text style={[styles.categoryText, { color: category ? colors.text : colors.textSecondary }]}>
            {category || '카테고리 선택'}
          </Text>
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* 가격 */}
        <View style={styles.section}>
          <Text style={[styles.pricePrefix, { color: colors.textSecondary }]}>₩</Text>
          <TextInput
            style={[styles.input, { flex: 1, color: inputColor }]}
            placeholder="가격 (선택사항)"
            placeholderTextColor={colors.textSecondary}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity
          style={styles.offerRow}
          onPress={() => setAllowOffer((v) => !v)}>
          <View style={[styles.checkbox, { borderColor: allowOffer ? BrandColors.primary : colors.textSecondary, backgroundColor: allowOffer ? BrandColors.primary : 'transparent' }]}>
            {allowOffer && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.offerLabel, { color: colors.text }]}>가격 제안 받기</Text>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* 설명 */}
        <View style={[styles.section, { minHeight: 150 }]}>
          <TextInput
            style={[styles.input, { color: inputColor, flex: 1, textAlignVertical: 'top' }]}
            placeholder={`${category || '당근'} 카테고리에서 판매하기 좋은 물품을 소개해 보세요.`}
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>
      </ScrollView>

      {/* 카테고리 선택 Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>카테고리 선택</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={PRODUCT_CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.categoryRow, { borderBottomColor: borderColor }]}
                  onPress={() => { setCategory(item); setShowCategoryModal(false); }}>
                  <Text style={[styles.categoryRowText, { color: colors.text }]}>{item}</Text>
                  {category === item && (
                    <Text style={{ color: BrandColors.primary, fontSize: 18 }}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 완료 버튼 */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 8, borderTopColor: borderColor, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.submitBtn, { opacity: title.trim() ? 1 : 0.4 }]}
          disabled={!title.trim()}
          onPress={handleSubmit}>
          <Text style={styles.submitText}>완료</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 17, fontWeight: '700' },
  form: { paddingBottom: 24 },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  photoBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  photoPreview: { width: 80, height: 80, borderRadius: 8 },
  photoIcon: { fontSize: 24 },
  photoLabel: { fontSize: 12 },
  input: { fontSize: 16, flex: 1, padding: 0 },
  categoryText: { flex: 1, fontSize: 16 },
  chevron: { fontSize: 20 },
  pricePrefix: { fontSize: 16, fontWeight: '600' },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  offerLabel: { fontSize: 14 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  submitBtn: {
    backgroundColor: BrandColors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalClose: { fontSize: 18 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  categoryRowText: { fontSize: 16 },
});
