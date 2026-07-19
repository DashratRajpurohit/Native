import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { AppHeader } from '@/components/app-header';
import { StudentCard } from '@/components/student-card';
import { Colors } from '@/constants/theme';
import { loadSettings, saveSettings } from '@/constants/settings';
import { playShutterSound } from '@/utils/sound';
import { IconSymbol } from '@/components/ui/icon-symbol';

const STUDENT = {
  name: 'Dashrat Rajpurohit',
  rollNo: '21CS014',
  course: 'B.Tech CSE',
  semester: '6',
};

export default function ProfileScreen() {
  const [customSoundEnabled, setCustomSoundEnabled] = useState(false);

  useEffect(() => {
    loadSettings().then((res) => {
      setCustomSoundEnabled(res.customCameraSound);
    });
  }, []);

  const handleToggleCustomSound = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCustomSoundEnabled(value);
    await saveSettings({ customCameraSound: value });
    // Play test audio if turning ON
    if (value) {
      await playShutterSound(true);
    }
  };

  const testPlaySound = async () => {
    Haptics.selectionAsync();
    await playShutterSound(customSoundEnabled);
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Log Out', 'Are you sure you want to log out of the session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <AppHeader title="Profile & Settings" subtitle="Inspector Profile" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Student Profile Card */}
        <StudentCard student={STUDENT} />

        {/* Audio & Camera Sound Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CAMERA AUDIO SETTINGS</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconBox}>
                <IconSymbol name="speaker.wave.2.fill" size={18} color={Colors.dark} />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingTitle}>Custom Camera Audio</Text>
                <Text style={styles.settingSub}>
                  {customSoundEnabled
                    ? 'Using @audiomass-output.wav sound'
                    : 'Using default camera click sound'}
                </Text>
              </View>
            </View>

            <Switch
              value={customSoundEnabled}
              onValueChange={handleToggleCustomSound}
              trackColor={{ false: '#D0C9E0', true: Colors.primary }}
              thumbColor={customSoundEnabled ? Colors.dark : '#FFF'}
              ios_backgroundColor="#D0C9E0"
            />
          </View>

          <TouchableOpacity style={styles.testBtn} onPress={testPlaySound}>
            <IconSymbol name="speaker.3.fill" size={16} color={Colors.dark} />
            <Text style={styles.testBtnText}>
              TEST SHUTTER SOUND ({customSoundEnabled ? 'CUSTOM WAV' : 'NORMAL'})
            </Text>
          </TouchableOpacity>
        </View>

        {/* System Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SYSTEM CONFIGURATION</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconBox}>
                <IconSymbol name="gearshape.fill" size={18} color={Colors.dark} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Aesthetics Style System</Text>
                <Text style={styles.settingSub}>Neo-Brutalist High Contrast UI</Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ACTIVE</Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconBox}>
                <IconSymbol name="slider.horizontal.3" size={18} color={Colors.dark} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Color System Palette</Text>
                <Text style={styles.settingSub}>Cyber Lime & Midnight Ink</Text>
              </View>
            </View>
            <View style={styles.badgeColor}>
              <Text style={styles.badgeColorText}>#C8FF3D</Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconBox}>
                <IconSymbol name="internaldrive.fill" size={18} color={Colors.dark} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Expo File System API</Text>
                <Text style={styles.settingSub}>SDK 54 Paths.document</Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>v54.0</Text>
            </View>
          </View>
        </View>

        {/* Modules Navigation Quick Index */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ALL ASSIGNMENT MODULES</Text>

          {[
            { mod: 'Module 1', name: 'Dashboard', route: '/' },
            { mod: 'Module 2', name: 'Create Survey', route: '/create-survey' },
            { mod: 'Module 3', name: 'Camera & Preview', route: '/camera' },
            { mod: 'Module 4', name: 'Location & GPS', route: '/location' },
            { mod: 'Module 5', name: 'Contacts Directory', route: '/contacts' },
            { mod: 'Module 6', name: 'Clipboard Tools', route: '/clipboard' },
            { mod: 'Module 7', name: 'Survey Preview', route: '/survey-preview' },
            { mod: 'Module 8', name: 'Survey History', route: '/survey-history' },
          ].map((item) => (
            <TouchableOpacity
              key={item.mod}
              style={styles.moduleRow}
              activeOpacity={0.8}
              onPress={() => {
                Haptics.selectionAsync();
                router.push(item.route as any);
              }}>
              <Text style={styles.moduleCode}>{item.mod}</Text>
              <Text style={styles.moduleName}>{item.name}</Text>
              <IconSymbol name="chevron.right" size={16} color={Colors.dark} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={18} color="#FFF" />
          <Text style={styles.logoutText}>LOG OUT OF SESSION</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45, 27, 105, 0.08)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  settingTextWrap: {
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.dark,
  },
  settingSub: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.dark,
    paddingVertical: 10,
    marginTop: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.dark,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.dark,
  },
  badgeColor: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeColorText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primary,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45, 27, 105, 0.08)',
  },
  moduleCode: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.dark,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.dark,
    width: 72,
    textAlign: 'center',
  },
  moduleName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.dark,
    marginLeft: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.danger,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    paddingVertical: 15,
    marginTop: 4,
    marginBottom: 20,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
