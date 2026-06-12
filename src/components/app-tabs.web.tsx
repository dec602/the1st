import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { Pressable, useColorScheme, View, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { BrandColors, Colors, Spacing } from '@/constants/theme';
import CategoryBar from '@/components/CategoryBar';

function WebHeader() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <View style={{ backgroundColor: colors.background }}>
      <View style={[webHeaderStyles.container, { borderBottomColor: colors.backgroundElement }]}>
        <TouchableOpacity style={webHeaderStyles.locationRow}>
          <Text style={[webHeaderStyles.locationText, { color: colors.text }]}>서현동</Text>
          <Text style={[webHeaderStyles.chevron, { color: colors.text }]}>∨</Text>
        </TouchableOpacity>
        <View style={webHeaderStyles.actions}>
          <TouchableOpacity style={webHeaderStyles.iconBtn}>
            <Text style={[webHeaderStyles.iconText, { color: colors.text }]}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={webHeaderStyles.iconBtn}>
            <Text style={[webHeaderStyles.iconText, { color: colors.text }]}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CategoryBar />
    </View>
  );
}

const webHeaderStyles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
    marginLeft: 4,
  },
  iconText: {
    fontSize: 20,
  },
});

export default function AppTabs() {
  return (
    <Tabs style={styles.container}>
      <WebHeader />
      <TabSlot style={styles.slot} />
      <TabList style={styles.tabList}>
        <TabTrigger name="home" href="/" asChild>
          <TabButton icon="🏠">홈</TabButton>
        </TabTrigger>
        <TabTrigger name="community" href="/community" asChild>
          <TabButton icon="💬">동네생활</TabButton>
        </TabTrigger>
        <TabTrigger name="nearby" href="/nearby" asChild>
          <TabButton icon="📍">내 근처</TabButton>
        </TabTrigger>
        <TabTrigger name="chat" href="/chat" asChild>
          <TabButton icon="💌">채팅</TabButton>
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <TabButton icon="👤">나의 당근</TabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, icon, isFocused, ...props }: TabTriggerSlotProps & { icon: string }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const activeColor = BrandColors.primary;
  const inactiveColor = colors.textSecondary;
  const color = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable {...props} style={styles.tabButton}>
      <Text style={[styles.tabIcon, { color }]}>{icon}</Text>
      <Text style={[styles.tabLabel, { color }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  slot: {
    flex: 1,
  },
  tabList: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    paddingBottom: Spacing.three,
    paddingTop: Spacing.two,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.one,
    gap: 2,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
