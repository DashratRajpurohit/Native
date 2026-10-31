import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { loginUser } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../constants/ThemeContext';
import GraphicIllustration from '../components/GraphicIllustration';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('authToken').then((token) => {
      if (token) {
        router.replace('/');
      }
    });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Authentication Error', 'Please enter email address and password');
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(email.trim(), password);
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('userName', data.name);
      router.replace('/');
    } catch (error) {
      Alert.alert('Access Denied', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <GraphicIllustration type="shield" size={80} />
        <Text style={[styles.logoText, { color: theme.text }]}>DELIVERY <Text style={{ color: '#FFEFB3' }}>PROOF</Text></Text>
        <Text style={[styles.subLogoText, { color: theme.subtext }]}>EVIDENCE VERIFICATION NETWORK</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.title, { color: theme.text }]}>AGENT LOGIN</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>Sign in to access parcel proof network</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.subtext }]}>EMAIL ADDRESS</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <Ionicons name="mail-outline" size={18} color="#FFEFB3" style={{ marginRight: 10 }} />
            <TextInput 
              style={[styles.input, { color: theme.inputText }]}
              value={email}
              onChangeText={setEmail}
              placeholder="agent@deliveryproof.com"
              placeholderTextColor={theme.subtext}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.subtext }]}>PASSWORD</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <Ionicons name="lock-closed-outline" size={18} color="#FFEFB3" style={{ marginRight: 10 }} />
            <TextInput 
              style={[styles.input, { color: theme.inputText }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••••"
              placeholderTextColor={theme.subtext}
              secureTextEntry
            />
          </View>
        </View>

        <Pressable 
          style={[styles.button, { backgroundColor: '#FFEFB3' }, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: '#0B0F17' }]}>
            {loading ? 'SIGNING IN...' : 'SIGN IN TO SYSTEM'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#0B0F17" style={{ marginLeft: 8 }} />
        </Pressable>

        <View style={styles.linkContainer}>
          <Text style={[styles.text, { color: theme.subtext }]}>New agent?</Text>
          <Pressable onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>Create Account</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, justifyContent: 'center' },
  headerBox: { alignItems: 'center', marginVertical: 16 },
  logoText: { fontSize: 24, fontWeight: '800', letterSpacing: 1, marginTop: 8 },
  subLogoText: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 4 },
  card: { borderRadius: 16, padding: 22, borderWidth: 1 },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14 },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 20 },
  text: { fontSize: 13 },
  registerText: { fontSize: 13, fontWeight: '800', color: '#FFEFB3' },
});