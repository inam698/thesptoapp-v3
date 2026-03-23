import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors, SpotColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useLanguage();
  const inactiveColor = Colors[colorScheme ?? 'light'].tabIconDefault;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: SpotColors.rose,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarAccessibilityLabel: 'Home tab',
          tabBarIcon: ({ focused }) => (
            <MaterialIcons 
              size={28} 
              name="favorite" 
              color={focused ? SpotColors.rose : inactiveColor} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="period-tracker"
        options={{
          title: t('tabs.period'),
          tabBarAccessibilityLabel: 'Period tracker tab',
          tabBarIcon: ({ focused }) => (
            <MaterialIcons 
              size={28} 
              name="local-florist" 
              color={focused ? SpotColors.lavender : inactiveColor} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: t('tabs.journal'),
          tabBarAccessibilityLabel: 'Journal tab',
          tabBarIcon: ({ focused }) => (
            <MaterialIcons 
              size={28} 
              name="auto-stories" 
              color={focused ? SpotColors.primary : inactiveColor} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: t('tabs.library'),
          tabBarAccessibilityLabel: 'Library tab',
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              size={28}
              name="bookmark"
              color={focused ? SpotColors.lavender : inactiveColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarAccessibilityLabel: 'Profile tab',
          tabBarIcon: ({ focused }) => (
            <MaterialIcons 
              size={28} 
              name="face" 
              color={focused ? SpotColors.softPink : inactiveColor} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
