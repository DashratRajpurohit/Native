import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Colors.dark,
        tabBarInactiveTintColor: Colors.light.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      {/* Tab 1: Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconBox, focused && styles.iconBoxFocused]}>
              <IconSymbol size={22} name="house.fill" color={color} />
            </View>
          ),
        }}
      />

      {/* Tab 2: New Survey */}
      <Tabs.Screen
        name="create-survey"
        options={{
          title: 'New Survey',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconBox, focused && styles.iconBoxFocused]}>
              <IconSymbol size={22} name="plus.circle.fill" color={color} />
            </View>
          ),
        }}
      />

      {/* Tab 3: History */}
      <Tabs.Screen
        name="survey-history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconBox, focused && styles.iconBoxFocused]}>
              <IconSymbol size={22} name="clock.fill" color={color} />
            </View>
          ),
        }}
      />

      {/* Tab 4: Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconBox, focused && styles.iconBoxFocused]}>
              <IconSymbol size={22} name="person.fill" color={color} />
            </View>
          ),
        }}
      />

      {/* Auxiliary module routes hidden from bottom tab bar but accessible via navigation */}
      <Tabs.Screen
        name="camera"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="clipboard"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="survey-preview"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderTopColor: Colors.dark,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  iconBox: {
    padding: 4,
    borderRadius: 8,
  },
  iconBoxFocused: {
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.dark,
  },
});
