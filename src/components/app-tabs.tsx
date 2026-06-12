import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from 'react-native';

import DanggunHeader from '@/components/DanggunHeader';
import { BrandColors, Colors } from '@/constants/theme';

function TabIcon({ name, color, size = 24 }: { name: string; color: string; size?: number }) {
  return <SymbolView name={name as any} size={size} tintColor={color} />;
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        header: () => <DanggunHeader />,
        tabBarActiveTintColor: BrandColors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.background },
        tabBarLabelStyle: { fontSize: 10, marginBottom: 2 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <TabIcon name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: '동네생활',
          tabBarIcon: ({ color }) => <TabIcon name="text.bubble.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: '내 근처',
          tabBarIcon: ({ color }) => <TabIcon name="map.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: '채팅',
          tabBarIcon: ({ color }) => (
            <TabIcon name="bubble.left.and.bubble.right.fill" color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '나의 당근',
          tabBarIcon: ({ color }) => <TabIcon name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
