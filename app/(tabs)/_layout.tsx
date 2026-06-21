import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, ColorValue } from 'react-native';
import { colors } from '../../theme';

const icon = (name: React.ComponentProps<typeof Feather>['name']) =>
  ({ color, size }: { focused: boolean; color: ColorValue; size: number }) => <Feather name={name} size={size} color={color as string} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.amber,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { position: 'absolute', borderTopColor: colors.border, backgroundColor: 'transparent' },
        tabBarBackground: () => <BlurView tint="dark" intensity={40} style={StyleSheet.absoluteFill} />,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="add" options={{ title: 'Add', tabBarIcon: icon('plus-circle') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="foods" options={{ title: 'Foods', tabBarIcon: icon('book') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('sliders') }} />
    </Tabs>
  );
}
