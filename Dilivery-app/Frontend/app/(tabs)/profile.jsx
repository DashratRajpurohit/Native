import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Switch, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../constants/ThemeContext';
import { updateUserProfile } from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';
import ToastBanner from '../../components/ToastBanner';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { userName, userProfile, logout, reloadProfile } = useAuth();
  const { isDarkMode, toggleTheme, theme } = useTheme();

  const [name, setName] = useState(userProfile?.name || userName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [password, setPassword] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [logoutModal, setLogoutModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Pulse animation for Profile Orb
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      showToast('Name and Email cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = { name: name.trim(), email: email.trim() };
      if (password.trim()) payload.password = password.trim();

      await updateUserProfile(payload);
      showToast('Profile updated successfully', 'success');
      setEditing(false);
      setPassword('');
      reloadProfile();
    } catch (error) {
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      {toast && <ToastBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <View style={styles.headerCard}>
        <View style={styles.avatarWrapper}>
          <Animated.View style={[styles.pulseRing, { borderColor: '#FFEFB3', transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName ? userName.charAt(0).toUpperCase() : 'U'}</Text>
          </View>
        </View>
        <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
        <Text style={styles.userEmail}>{userProfile?.email || 'Logged in user'}</Text>
      </View>

      {/* APP SETTINGS CARD */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>App Settings</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelGroup}>
            <Ionicons name={isDarkMode ? "moon-outline" : "sunny-outline"} size={20} color="#FFEFB3" style={{ marginRight: 10 }} />
            <Text style={[styles.settingText, { color: theme.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: '#FFEFB3' }}
            thumbColor={isDarkMode ? '#0B0F17' : "#FFFFFF"}
          />
        </View>
      </View>

      {/* ACCOUNT DETAILS CARD */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Account Details</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Text style={{ color: '#FFEFB3', fontWeight: '700' }}>{editing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.subtext }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
            value={name}
            onChangeText={setName}
            editable={editing}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.subtext }]}>Email Address</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={editing}
          />
        </View>

        {editing ? (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.subtext }]}>New Password (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
              placeholder="Leave empty to keep current"
              placeholderTextColor={theme.subtext}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        ) : null}

        {editing ? (
          <Pressable style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#0B0F17" /> : <Text style={styles.saveBtnText}>Save Profile Changes</Text>}
          </Pressable>
        ) : null}
      </View>

      {/* LOGOUT BUTTON */}
      <Pressable style={styles.logoutBtn} onPress={() => setLogoutModal(true)}>
        <Ionicons name="log-out-outline" size={20} color="#F87171" style={{ marginRight: 8 }} />
        <Text style={styles.logoutBtnText}>Log Out Account</Text>
      </Pressable>

      <ConfirmModal
        visible={logoutModal}
        title="Confirm Logout?"
        message="Are you sure you want to log out of Delivery Chacker?"
        confirmText="Log Out"
        isDanger
        onConfirm={logout}
        onCancel={() => setLogoutModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 50 },
  headerCard: { alignItems: 'center', marginVertical: 16 },
  avatarWrapper: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  pulseRing: { position: 'absolute', width: 88, height: 88, borderRadius: 44, borderWidth: 1.5, opacity: 0.5 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#FFEFB3', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#0B0F17', fontSize: 30, fontWeight: '900' },
  userName: { fontSize: 20, fontWeight: '800' },
  userEmail: { fontSize: 13, fontWeight: '600', color: '#FFEFB3', marginTop: 3 },
  card: { borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  settingText: { fontSize: 14, fontWeight: '600' },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14 },
  saveBtn: { backgroundColor: '#FFEFB3', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#0B0F17', fontWeight: '800', fontSize: 14 },
  logoutBtn: { backgroundColor: 'rgba(248, 113, 113, 0.1)', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F87171' },
  logoutBtnText: { color: '#F87171', fontWeight: '700', fontSize: 15 },
});
