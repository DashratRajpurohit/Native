import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { AppHeader } from '@/components/app-header';
import { Colors } from '@/constants/theme';
import { generateId } from '@/constants/survey';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ClipboardScreen() {
  const [surveyId, setSurveyId] = useState(generateId());
  const [notes, setNotes] = useState('');
  const [pasted, setPasted] = useState('');

  const copySurveyId = async () => {
    await Clipboard.setStringAsync(surveyId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Survey ID Copied', `Survey ID copied to clipboard: ${surveyId}`);
  };

  const copyContactNumber = async () => {
    const number = '+91 99998 88777';
    await Clipboard.setStringAsync(number);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Contact Number Copied', `Contact number copied to clipboard: ${number}`);
  };

  const copyCurrentLocation = async () => {
    const loc = 'Lat: 21.145800, Lng: 79.088200';
    await Clipboard.setStringAsync(loc);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Location Copied', `Location copied to clipboard: ${loc}`);
  };

  const pasteNotes = async () => {
    Haptics.selectionAsync();
    const text = await Clipboard.getStringAsync();
    if (!text) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Clipboard Empty', 'No text found in clipboard to paste.');
      return;
    }
    setPasted(text);
    setNotes((prev) => (prev ? `${prev}\n${text}` : text));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const clearClipboard = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Clear Clipboard Data',
      'Are you sure you want to erase current clipboard contents?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await Clipboard.setStringAsync('');
            setPasted('');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Cleared', 'Clipboard data erased successfully.');
          },
        },
      ]
    );
  };

  const regenerateId = () => {
    Haptics.selectionAsync();
    setSurveyId(generateId());
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <AppHeader title="Clipboard Module" subtitle="Module 6 · Quick Copy & Paste" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Survey ID Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SURVEY IDENTIFIER</Text>
          <Text style={styles.valueText}>{surveyId}</Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.btnPrimary} onPress={copySurveyId}>
              <IconSymbol name="doc.on.doc.fill" size={16} color={Colors.dark} />
              <Text style={styles.btnPrimaryText}>COPY SURVEY ID</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnOutline} onPress={regenerateId}>
              <Text style={styles.btnOutlineText}>NEW ID</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Number Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>FIELD INSPECTOR CONTACT</Text>
          <Text style={styles.valueText}>+91 99998 88777</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={copyContactNumber}>
            <IconSymbol name="phone.fill" size={16} color={Colors.dark} />
            <Text style={styles.btnPrimaryText}>COPY CONTACT NUMBER</Text>
          </TouchableOpacity>
        </View>

        {/* Current Location Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CURRENT GPS COORDINATES</Text>
          <Text style={styles.valueText}>Lat: 21.145800, Lng: 79.088200</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={copyCurrentLocation}>
            <IconSymbol name="location.fill" size={16} color={Colors.dark} />
            <Text style={styles.btnPrimaryText}>COPY CURRENT LOCATION</Text>
          </TouchableOpacity>
        </View>

        {/* Paste Notes Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>NOTES (PASTE FROM CLIPBOARD)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Paste clipboard contents into notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#8679A8"
          />

          <TouchableOpacity style={styles.btnPaste} onPress={pasteNotes}>
            <IconSymbol name="arrow.right.doc.on.clipboard" size={18} color={Colors.dark} />
            <Text style={styles.btnPasteText}>PASTE FROM CLIPBOARD</Text>
          </TouchableOpacity>

          {pasted ? (
            <View style={styles.pastedBox}>
              <Text style={styles.pastedLabel}>LAST PASTED CONTENT:</Text>
              <Text style={styles.pastedText} numberOfLines={2}>
                &quot;{pasted}&quot;
              </Text>
            </View>
          ) : null}
        </View>

        {/* Clear Clipboard Button */}
        <TouchableOpacity style={styles.btnDanger} onPress={clearClipboard}>
          <IconSymbol name="trash.fill" size={18} color="#FFF" />
          <Text style={styles.btnDangerText}>CLEAR CLIPBOARD DATA</Text>
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
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.dark,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    paddingVertical: 12,
  },
  btnPrimaryText: {
    color: Colors.dark,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  btnOutline: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    color: Colors.dark,
    fontWeight: '900',
    fontSize: 12,
  },
  notesInput: {
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: Colors.dark,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark,
    height: 90,
    marginBottom: 12,
  },
  btnPaste: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    paddingVertical: 12,
  },
  btnPasteText: {
    color: Colors.dark,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pastedBox: {
    marginTop: 12,
    backgroundColor: '#F7F5F0',
    borderWidth: 1.5,
    borderColor: Colors.dark,
    borderRadius: 8,
    padding: 10,
  },
  pastedLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.light.textMuted,
    marginBottom: 2,
  },
  pastedText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.dark,
    fontStyle: 'italic',
  },
  btnDanger: {
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
    marginTop: 6,
    marginBottom: 20,
  },
  btnDangerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
