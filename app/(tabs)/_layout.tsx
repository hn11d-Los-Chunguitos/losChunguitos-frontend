import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';



export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
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
          title: 'Hacker News',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="newest"
        options={{
          title: 'Newest',
          tabBarIcon: undefined,
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: 'Ask',
          tabBarIcon: undefined,
        }}

      />
      <Tabs.Screen
        name="comments"
        options={{
          title: 'Comments',
          tabBarIcon: undefined,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: 'account',
        }}
      />

      <Tabs.Screen name="[submission]" options={{ href: null }}></Tabs.Screen>
      <Tabs.Screen name="favoriteSubmissions" options={{ href: null }}></Tabs.Screen>
      <Tabs.Screen name="hiddenSubmissions" options={{ href: null }}></Tabs.Screen>
      <Tabs.Screen name="createSubmission" options={{ href: null }}></Tabs.Screen>
      <Tabs.Screen name="replyComment/[comment]" options={{ href: null }}></Tabs.Screen>
      <Tabs.Screen name="editComment/[comment]" options={{ href: null }}></Tabs.Screen>
      <Tabs.Screen name="editSubmission/[submission]" options={{ href: null }}></Tabs.Screen>
    </Tabs>
  );
}
