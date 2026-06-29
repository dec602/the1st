import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ColorValue, useColorScheme } from 'react-native';

import DanggunHeader from '@/components/DanggunHeader';
import { BrandColors, Colors } from '@/constants/theme';

function TabIcon({ name, color, size = 24 }: { name: React.ComponentProps<typeof Ionicons>['name']; color: string | ColorValue; size?: number }) {
  return <Ionicons name={name} size={size} color={color as string} />;
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
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: '동네생활',
          tabBarIcon: ({ color }) => <TabIcon name="chatbubble-ellipses" color={color} />,
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: '내 근처',
          tabBarIcon: ({ color }) => <TabIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: '채팅',
          tabBarIcon: ({ color }) => <TabIcon name="chatbubbles" color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '나의 당근',
          tabBarIcon: ({ color }) => <TabIcon name="person" color={color} />,
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
