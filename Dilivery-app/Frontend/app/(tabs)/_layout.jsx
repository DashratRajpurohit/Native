import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../constants/ThemeContext';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { 
          backgroundColor: theme.headerBg,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.cardBorder,
        },
        headerTintColor: theme.text,
        headerTitleStyle: { 
          fontWeight: '800', 
          fontSize: 17, 
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: theme.headerBg,
          borderTopColor: theme.cardBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FFEFB3',
        tabBarInactiveTintColor: theme.subtext,
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerTitle: 'DELIVERY PROOF',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="proofs"
        options={{
          title: 'Claims',
          headerTitle: 'ALL CLAIMS',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "documents" : "documents-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-proof"
        options={{
          title: 'New Claim',
          headerTitle: 'NEW PROOF CLAIM',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.createBtnTab}>
              <Ionicons name="add" size={24} color="#0B0F17" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Directory',
          headerTitle: 'COURIER CONTACTS',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'MY PROFILE',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createBtnTab: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFEFB3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
});
