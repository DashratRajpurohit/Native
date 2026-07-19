import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/theme';
import { saveSurvey, type Survey } from '@/constants/survey';
import { IconSymbol } from '@/components/ui/icon-symbol';

function SurveyField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export default function SurveyPreviewScreen() {
  const { data, mode } = useLocalSearchParams<{ data: string; mode?: string }>();
  const [submitting, setSubmitting] = useState(false);

  if (!data) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No survey data provided.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>GO BACK</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const survey: Survey = JSON.parse(data);
  const readOnly = mode === 'view';

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    try {
      await saveSurvey(survey);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Survey Submitted', 'Your field survey report has been saved successfully!', [
        {
          text: 'VIEW HISTORY',
          onPress: () => router.push('/survey-history'),
        },
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)'),
        },
      ]);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Submission Error', 'Failed to save survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const priorityColor =
    survey.priority === 'High'
      ? Colors.danger
      : survey.priority === 'Medium'
      ? '#FFB800'
      : Colors.primary;

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {readOnly ? 'SURVEY DETAILS' : 'SURVEY PREVIEW'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Survey ID Banner */}
        <View style={styles.idBanner}>
          <Text style={styles.idLabel}>SURVEY ID</Text>
          <Text style={styles.idValue}>{survey.id}</Text>
        </View>

        {/* Site Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>SITE DETAILS</Text>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityColor },
              ]}>
              <Text
                style={[
                  styles.priorityText,
                  { color: survey.priority === 'High' ? '#FFF' : Colors.dark },
                ]}>
                {survey.priority.toUpperCase()} PRIORITY
              </Text>
            </View>
          </View>
          <SurveyField label="Site Name" value={survey.siteName} />
          <SurveyField label="Inspection Date" value={survey.date} />
        </View>

        {/* Client Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CLIENT & SCOPE</Text>
          <SurveyField label="Client Name" value={survey.clientName} />
          <SurveyField label="Description" value={survey.description} />
        </View>

        {/* Photo Card */}
        {survey.photo ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>CAPTURED PHOTO</Text>
            <Image source={{ uri: survey.photo }} style={styles.photo} />
          </View>
        ) : null}

        {/* Contact Card */}
        {survey.contact ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>FIELD CONTACT</Text>
            <SurveyField label="Phone Number" value={survey.contact} />
          </View>
        ) : null}

        {/* Location Card */}
        {survey.latitude != null ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>GPS LOCATION</Text>
            <View style={styles.locRow}>
              <SurveyField label="Latitude" value={survey.latitude.toFixed(6)} />
              <SurveyField label="Longitude" value={survey.longitude!.toFixed(6)} />
            </View>
          </View>
        ) : null}

        {/* Notes Card */}
        {survey.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ADDITIONAL NOTES</Text>
            <Text style={styles.notesText}>{survey.notes}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        {readOnly ? (
          <TouchableOpacity style={styles.fullBtn} onPress={() => router.back()}>
            <Text style={styles.fullBtnText}>CLOSE PREVIEW</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
              <Text style={styles.editBtnText}>EDIT SURVEY</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.disabled]}
              onPress={handleSubmit}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={Colors.dark} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>SUBMIT SURVEY</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderColor: Colors.dark,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  idBanner: {
    backgroundColor: Colors.dark,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  idLabel: {
    color: '#A79CC4',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  idValue: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.dark,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  field: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.light.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.dark,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark,
  },
  locRow: {
    flexDirection: 'row',
    gap: 20,
  },
  notesText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 3,
    borderTopColor: Colors.dark,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editBtnText: {
    color: Colors.dark,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    color: Colors.dark,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  fullBtn: {
    backgroundColor: Colors.dark,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  fullBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.dark,
  },
  backBtnText: {
    color: Colors.dark,
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.6,
  },
});
