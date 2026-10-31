import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { registerUser } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../constants/ThemeContext';
import GraphicIllustration from '../components/GraphicIllustration';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const [name, setName] = useState('');
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

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Form Error', 'Please fill in all identity fields');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(name.trim(), email.trim(), password);
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('userName', data.name);
      router.replace('/');
    } catch (error) {
      Alert.alert('Registration Error', error.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <GraphicIllustration type="parcel" size={80} />
        <Text style={[styles.logoText, { color: theme.text }]}>REGISTER <Text style={{ color: '#FFEFB3' }}>AGENT</Text></Text>
        <Text style={[styles.subLogoText, { color: theme.subtext }]}>CREATE ACCOUNT IDENTITY</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.title, { color: theme.text }]}>NEW AGENT ACCOUNT</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>Register to log & verify parcel claims</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.subtext }]}>AGENT FULL NAME</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <Ionicons name="person-outline" size={18} color="#FFEFB3" style={{ marginRight: 10 }} />
            <TextInput 
              style={[styles.input, { color: theme.inputText }]}
              value={name}
              onChangeText={setName}
              placeholder="Jordan Lee"
              placeholderTextColor={theme.subtext}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.subtext }]}>EMAIL ADDRESS</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <Ionicons name="mail-outline" size={18} color="#FFEFB3" style={{ marginRight: 10 }} />
            <TextInput 
              style={[styles.input, { color: theme.inputText }]}
              value={email}
              onChangeText={setEmail}
              placeholder="jordan@deliveryproof.com"
              placeholderTextColor={theme.subtext}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.subtext }]}>SECURITY PASSWORD</Text>
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
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: '#0B0F17' }]}>
            {loading ? 'CREATING ACCOUNT...' : 'CREATE AGENT ACCOUNT'}
          </Text>
          <Ionicons name="sparkles" size={18} color="#0B0F17" style={{ marginLeft: 8 }} />
        </Pressable>

        <View style={styles.linkContainer}>
          <Text style={[styles.text, { color: theme.subtext }]}>Already registered?</Text>
          <Pressable onPress={() => router.push('/login')}>
            <Text style={styles.link}>Login here</Text>
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
  link: { fontSize: 13, fontWeight: '800', color: '#FFEFB3' },
});