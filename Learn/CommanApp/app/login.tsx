import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function LoginScreen() {
  const [username, setUsername] = useState('Dashrat');
  const [password, setPassword] = useState('password123');

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (username.trim() && password.trim()) {
      router.replace('/(tabs)');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Authentication Required', 'Please enter a valid username and password.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.brandBadge}>
          <IconSymbol name="shield.fill" size={36} color={Colors.dark} />
          <Text style={styles.brandTitle}>SMART FIELD</Text>
          <Text style={styles.brandSubtitle}>INSPECTION & SURVEY APP</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>OFFICER LOGIN</Text>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>USERNAME / AGENT ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#8679A8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8679A8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={handleLogin}>
            <Text style={styles.buttonText}>AUTHENTICATE & LOG IN</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerTag}>
          <Text style={styles.footerText}>EXPO SDK 54 · NEO-BRUTALIST EDITION</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandBadge: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginBottom: 24,
    gap: 4,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
    opacity: 0.8,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputWrap: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.light.background,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
  },
  button: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Colors.dark,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  footerTag: {
    marginTop: 30,
    backgroundColor: Colors.dark,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  footerText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
