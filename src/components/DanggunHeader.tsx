import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import CategoryBar from '@/components/CategoryBar';

export default function DanggunHeader() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const iconColor = scheme === 'dark' ? '#ffffff' : '#1a1a1a';

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.inner}>
        <TouchableOpacity style={styles.locationRow}>
          <Text style={[styles.locationText, { color: colors.text }]}>서현동</Text>
          <SymbolView name="chevron.down" size={14} tintColor={iconColor} style={styles.chevron} />
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn}>
            <SymbolView name="magnifyingglass" size={22} tintColor={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <SymbolView name="bell" size={22} tintColor={iconColor} />
          </TouchableOpacity>
        </View>
      </View>
      <CategoryBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  inner: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 17,
    fontWeight: '700',
  },
  chevron: {
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
    marginLeft: 4,
  },
});
