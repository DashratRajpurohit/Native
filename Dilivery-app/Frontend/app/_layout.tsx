import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../constants/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1E293B' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            title: 'Login',
            headerLeft: () => null,
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            title: 'Create Account',
          }} 
        />
        <Stack.Screen 
          name="camera" 
          options={{ 
            title: 'Capture Evidence',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#FFF',
          }} 
        />
        <Stack.Screen 
          name="location" 
          options={{ 
            title: 'Delivery Location',
          }} 
        />
        <Stack.Screen 
          name="proof-summary" 
          options={{ 
            title: 'Review & Submit',
          }} 
        />
        <Stack.Screen 
          name="proof-details" 
          options={{ 
            title: 'Proof Details',
          }} 
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
