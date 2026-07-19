import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { router } from 'expo-router';

import { AppHeader } from '@/components/app-header';
import { FormField } from '@/components/form-field';
import { PrioritySelector, type Priority } from '@/components/priority-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { generateId } from '@/constants/survey';

export default function CreateSurveyScreen() {
  const cameraRef = useRef<CameraView>(null);

  const [siteName, setSiteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [contact, setContact] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locLoading, setLocLoading] = useState(false);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!siteName.trim()) next.siteName = 'Site name is required.';
    if (!clientName.trim()) next.clientName = 'Client name is required.';
    if (!description.trim()) next.description = 'Description is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const openCamera = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permission denied', 'Camera permission is required to take a photo.');
        return;
      }
    }
    setShowCamera(true);
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const pic = await cameraRef.current.takePictureAsync();
      setPhoto(pic.uri);
      setShowCamera(false);
    }
  };

  const getLocation = async () => {
    setLocLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocLoading(false);
      Alert.alert('Permission denied', 'Location permission is required.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLatitude(loc.coords.latitude);
    setLongitude(loc.coords.longitude);
    setLocLoading(false);
  };

  const handlePreview = () => {
    if (!validate()) return;
    const surveyData = {
      id: generateId(),
      siteName: siteName.trim(),
      clientName: clientName.trim(),
      description: description.trim(),
      priority,
      date,
      photo,
      contact: contact.trim(),
      latitude,
      longitude,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };
    router.push({
      pathname: '/survey-preview',
      params: { data: JSON.stringify(surveyData) },
    });
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back">
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCamera(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Create Survey" subtitle="Fill in the survey details" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.card}>
          <FormField label="Site Name *" placeholder="e.g. Water Pipeline Sector 12" value={siteName} onChangeText={setSiteName} error={errors.siteName} />
          <FormField label="Client Name *" placeholder="e.g. Nagpur Municipal Corp." value={clientName} onChangeText={setClientName} error={errors.clientName} />
          <FormField label="Description *" placeholder="Brief about the inspection task" value={description} onChangeText={setDescription} multiline error={errors.description} />
          <PrioritySelector value={priority} onChange={setPriority} />
          <FormField label="Date" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.sectionLabel}>Photo</ThemedText>
          {photo ? (
            <View style={styles.photoRow}>
              <Image source={{ uri: photo }} style={styles.thumb} />
              <TouchableOpacity onPress={() => setPhoto(null)}><Text style={styles.removeText}>Remove</Text></TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={openCamera}>
              <IconSymbol name="camera.fill" size={18} color="#0a7ea4" />
              <ThemedText style={styles.addBtnText}>Capture Photo</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.sectionLabel}>Contact</ThemedText>
          <TextInput style={styles.inputField} placeholder="Contact phone number" value={contact} onChangeText={setContact} keyboardType="phone-pad" />
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.sectionLabel}>Location</ThemedText>
          {latitude != null ? (
            <ThemedText style={styles.locText}>Lat: {latitude.toFixed(6)}, Lng: {longitude!.toFixed(6)}</ThemedText>
          ) : null}
          <TouchableOpacity style={[styles.addBtn, locLoading && styles.disabled]} onPress={getLocation} disabled={locLoading}>
            {locLoading ? (
              <ActivityIndicator size="small" color="#0a7ea4" />
            ) : (
              <IconSymbol name="location.fill" size={18} color="#0a7ea4" />
            )}
            <ThemedText style={styles.addBtnText}>{latitude != null ? 'Refresh Location' : 'Get Location'}</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.sectionLabel}>Notes</ThemedText>
          <TextInput style={[styles.inputField, styles.notesField]} placeholder="Additional notes…" value={notes} onChangeText={setNotes} multiline textAlignVertical="top" />
        </ThemedView>

        <TouchableOpacity style={styles.submitBtn} onPress={handlePreview} activeOpacity={0.85}>
          <IconSymbol name="eye.fill" size={20} color="#fff" />
          <ThemedText style={styles.submitText}>Preview Survey</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 8 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', marginBottom: 14 },
  sectionLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.7, marginBottom: 10 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 80, height: 80, borderRadius: 10 },
  removeText: { color: '#d32f2f', fontWeight: '600' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#e0f2f7' },
  addBtnText: { color: '#0a7ea4', fontWeight: '600', fontSize: 14 },
  disabled: { opacity: 0.6 },
  locText: { fontSize: 14, color: '#333', marginBottom: 8 },
  inputField: { height: 44, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)', borderRadius: 12, paddingHorizontal: 14, fontSize: 16 },
  notesField: { height: 90, paddingTop: 12 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0a7ea4', borderRadius: 12, paddingVertical: 16, marginTop: 4, marginBottom: 30 },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  captureBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 20 },
  cancelText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
