import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { type Survey, saveSurvey } from '@/constants/survey';

function SurveyField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export default function SurveyPreviewScreen() {
  const { data, mode } = useLocalSearchParams<{ data: string; mode?: string }>();
  const [submitting, setSubmitting] = useState(false);

  const survey: Survey = JSON.parse(data!);
  const readOnly = mode === 'view';

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveSurvey(survey);
      Alert.alert('Success', 'Survey submitted successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save survey.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Survey Preview</Text>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Site Details</Text>
          <SurveyField label="Site Name" value={survey.siteName} />
          <SurveyField label="Date" value={survey.date} />
          <SurveyField label="Priority" value={survey.priority} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Client</Text>
          <SurveyField label="Client Name" value={survey.clientName} />
          <SurveyField label="Description" value={survey.description} />
        </View>

        {survey.photo ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Photo</Text>
            <Image source={{ uri: survey.photo }} style={styles.photo} />
          </View>
        ) : null}

        {survey.contact ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contact</Text>
            <SurveyField label="Phone" value={survey.contact} />
          </View>
        ) : null}

        {survey.latitude != null ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location</Text>
            <SurveyField label="Latitude" value={survey.latitude.toFixed(6)} />
            <SurveyField label="Longitude" value={survey.longitude!.toFixed(6)} />
          </View>
        ) : null}

        {survey.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{survey.notes}</Text>
          </View>
        ) : null}
      </ScrollView>

      {readOnly ? (
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
            <Text style={styles.editBtnText}>Edit Survey</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.disabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Survey</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#0a7ea4', textAlign: 'center', marginVertical: 15 },
  content: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  field: { marginBottom: 8 },
  fieldLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
  fieldValue: { fontSize: 16, fontWeight: '500', color: '#222' },
  photo: { width: '100%', height: 220, borderRadius: 10 },
  notesText: { fontSize: 15, color: '#333', lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 12, padding: 20, paddingTop: 0 },
  editBtn: { flex: 1, backgroundColor: '#e0f2f7', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  editBtnText: { color: '#0a7ea4', fontSize: 17, fontWeight: '700' },
  submitBtn: { flex: 1, backgroundColor: '#0a7ea4', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  backBtn: { backgroundColor: '#0a7ea4', borderRadius: 12, paddingVertical: 15, alignItems: 'center', margin: 20, marginTop: 0 },
  backBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
