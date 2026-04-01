import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, LogBox, View } from 'react-native';
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

// Prevent unhandled promise rejections from crashing the app
if (typeof global !== 'undefined') {
  const originalHandler = (global as any).onunhandledrejection;
  (global as any).onunhandledrejection = (event: any) => {
    console.warn('[App] Unhandled promise rejection:', event?.reason ?? event);
    // Prevent the default crash behaviour
    if (event?.preventDefault) event.preventDefault();
    // Chain to any existing handler
    if (typeof originalHandler === 'function') originalHandler(event);
  };
}

// Suppress noisy logs that are not actionable
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted',
  'Require cycle:',
]);

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

  // Check for OTA updates only after the user is past auth/onboarding.
  // Running this on the sign-in screen causes the "Update Available" Alert to
  // appear over the form, which blocks credential entry during App Review.
  const updateChecked = useRef(false);
  useEffect(() => {
    if (!isAppReady || showSplash || shouldShowAuth || shouldShowOnboarding) return;
    if (updateChecked.current) return;
    updateChecked.current = true;
    checkForUpdates().catch((e) =>
      console.warn('[Layout] checkForUpdates failed:', e)
    );
  }, [isAppReady, showSplash, shouldShowAuth, shouldShowOnboarding]);

  // Handle deep links (thespotapp://article/{id})
  useEffect(() => {
    function handleDeepLink(event: { url: string }) {
      try {
        const articleId = parseDeepLink(event.url);
        if (articleId) {
          router.push(`/information/article/${articleId}` as any);
        }
      } catch (e) {
        console.warn('[Layout] Deep link error:', e);
      }
    }

    // Handle link that opened the app
    Linking.getInitialURL()
      .then((url) => {
        if (url) handleDeepLink({ url });
      })
      .catch((e) => console.warn('[Layout] getInitialURL error:', e));

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
