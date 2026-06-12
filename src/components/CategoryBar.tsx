import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';

import { ALL_CATEGORIES } from '@/constants/categories';
import { BrandColors, Colors } from '@/constants/theme';
import { useProducts } from '@/store/products';

export default function CategoryBar() {
  const { selectedCategory, setSelectedCategory } = useProducts();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={[styles.scroll, { backgroundColor: colors.background }]}>
      {ALL_CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat;
        return (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.chip,
              isActive
                ? { backgroundColor: BrandColors.primary, borderColor: BrandColors.primary }
                : { backgroundColor: colors.background, borderColor: colors.backgroundSelected },
            ]}>
            <Text style={[styles.chipText, { color: isActive ? '#ffffff' : colors.textSecondary }]}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
