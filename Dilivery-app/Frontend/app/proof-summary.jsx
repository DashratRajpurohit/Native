import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { scheduleProofSubmittedNotification } from '../services/notifications';
import { createProof } from '../services/api';
import { useTheme } from '../constants/ThemeContext';
import GraphicIllustration from '../components/GraphicIllustration';
import { Ionicons } from '@expo/vector-icons';

export default function ProofSummaryScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  const { orderId, courier, condition, description, photoUri, latitude, longitude, address } = params;

  const handleSubmit = async () => {
    setIsSaving(true);
    
    try {
      // Send data (including photo) to MongoDB via Backend API
      const response = await createProof({
        orderId,
        courier,
        condition,
        description,
        photo: photoUri, 
        latitude,
        longitude,
        address
      });

      // Trigger local notification
      await scheduleProofSubmittedNotification(response.reportId);

      Alert.alert(
        'Success', 
        `Proof submitted successfully!\nReport ID: ${response.reportId}`,
        [
          { text: 'View My Proofs', onPress: () => router.replace('/(tabs)/proofs') }
        ]
      );
    } catch (error) {
      Alert.alert('Upload Error', error.message || 'Could not upload proof. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>Review & Submit</Text>
          <Text style={[styles.subtitle, { color: theme.accent }]}>Step 3 of 3: Final confirmation</Text>
        </View>
        <GraphicIllustration type="box" size={60} />
      </View>

      {/* STEP PROGRESS BAR */}
      <View style={[styles.progressTrack, { backgroundColor: theme.cardBorder }]}>
        <View style={[styles.progressBar, { backgroundColor: theme.primary, width: '100%' }]} />
      </View>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Parcel Details</Text>
        <Text style={[styles.text, { color: theme.text }]}>Order ID: {orderId}</Text>
        {courier ? <Text style={[styles.text, { color: theme.text }]}>Courier: {courier}</Text> : null}
        <Text style={[styles.text, { color: theme.text }]}>Condition: {condition}</Text>
        {description ? <Text style={[styles.text, { color: theme.text }]}>Description: {description}</Text> : null}
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Location Verification</Text>
        <Text style={[styles.text, { color: theme.text }]}>Address: {address || 'Not provided'}</Text>
        <Text style={[styles.text, { color: theme.text }]}>
          Coordinates: {latitude && longitude ? `${latitude}, ${longitude}` : 'Not provided'}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Evidence Photo</Text>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.evidenceImage} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <Ionicons name="camera-outline" size={32} color={theme.subtext} />
            <Text style={[styles.placeholderText, { color: theme.subtext }]}>No photo uploaded</Text>
          </View>
        )}
      </View>

      {isSaving ? (
        <View style={styles.savingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.savingText, { color: theme.primary }]}>Uploading Claim to Server...</Text>
        </View>
      ) : (
        <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleSubmit}>
          <Text style={[styles.submitButtonText, { color: theme.buttonText }]}>Submit Parcel Proof</Text>
          <Ionicons name="checkmark-circle-outline" size={22} color={theme.buttonText} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={[styles.backButton, { borderColor: theme.cardBorder }]} 
        onPress={() => router.back()}
        disabled={isSaving}
      >
        <Text style={[styles.backButtonText, { color: theme.subtext }]}>Edit Details</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14, fontWeight: '600' },
  progressTrack: { height: 6, borderRadius: 3, width: '100%', marginBottom: 20, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 },
  card: { borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  text: { fontSize: 15, marginBottom: 6 },
  evidenceImage: { width: '100%', height: 220, borderRadius: 12 },
  placeholderImage: { width: '100%', height: 140, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 13, marginTop: 6 },
  savingContainer: { alignItems: 'center', marginVertical: 20 },
  savingText: { marginTop: 10, fontSize: 15, fontWeight: '700' },
  submitButton: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginBottom: 14 },
  submitButtonText: { fontSize: 16, fontWeight: '800' },
  backButton: { backgroundColor: 'transparent', paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
  backButtonText: { fontSize: 15, fontWeight: '600' },
});
