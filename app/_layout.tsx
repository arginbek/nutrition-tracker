import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
} from '@expo-google-fonts/inter';
import { colors } from '../theme';
import { initDb } from '../db';
import { seedIfEmpty } from '../db/seed';
import { AppProvider } from '../state/AppContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
  });
  const [dbReady, setDbReady] = useState(false);
  useEffect(() => {
    (async () => { await initDb(); await seedIfEmpty(); setDbReady(true); })();
  }, []);
  if (!loaded || !dbReady) return null;
  return (
    <AppProvider>
      <>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="log/[foodId]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="food/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="recipe/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="recipe/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
          <Stack.Screen name="photo" options={{ presentation: 'modal' }} />
        </Stack>
      </>
    </AppProvider>
  );
}
