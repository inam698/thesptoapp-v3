import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import AnimatedSplash from '@/components/AnimatedSplash';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SpotColors } from '@/constants/Colors';
import { useAppState } from '@/hooks/useAppState';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { checkForUpdates } from '@/lib/checkForUpdates';
import { parseDeepLink } from '@/lib/deepLink';
import '@/lib/i18n';

function LoadingScreen() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: SpotColors.primary 
    }}>
      <ActivityIndicator size="large" color={SpotColors.textOnPrimary} />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAppReady, shouldShowOnboarding, shouldShowAuth } = useAppState();
  const { user } = useAuth();
  usePushNotifications(user?.uid ?? null);
  const router = useRouter();
  const segments = useSegments();
  const [showSplash, setShowSplash] = useState(true);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Check for OTA updates silently on app launch
  useEffect(() => {
    checkForUpdates();
  }, []);

  // Handle deep links (thespotapp://article/{id})
  useEffect(() => {
    function handleDeepLink(event: { url: string }) {
      const articleId = parseDeepLink(event.url);
      if (articleId) {
        router.push(`/information/article/${articleId}` as any);
      }
    }

    // Handle link that opened the app
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Handle links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    if (!loaded || !isAppReady || showSplash) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (shouldShowOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (shouldShowAuth && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (!shouldShowOnboarding && !shouldShowAuth && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)');
    }
    // Only react to actual auth/onboarding state changes, not intra-group navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, isAppReady, showSplash, shouldShowOnboarding, shouldShowAuth]);

  // Show plain loading until fonts + app state are ready
  if (!loaded || !isAppReady) {
    return <LoadingScreen />;
  }

  // Show animated splash once everything is loaded
  if (showSplash) {
    return <AnimatedSplash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="information" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
