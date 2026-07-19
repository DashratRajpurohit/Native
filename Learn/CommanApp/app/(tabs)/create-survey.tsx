import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
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
import * as Haptics from 'expo-haptics';

import { AppHeader } from '@/components/app-header';
import { FormField } from '@/components/form-field';
import { PrioritySelector, type Priority } from '@/components/priority-selector';
import { Colors } from '@/constants/theme';
import { generateId, type Survey } from '@/constants/survey';
import { loadSettings } from '@/constants/settings';
import { playShutterSound } from '@/utils/sound';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
        return;
      }
    }
    setShowCamera(true);
  };

  const takePhoto = async () => {
    const settings = await loadSettings();
    await playShutterSound(settings.customCameraSound);
    if (cameraRef.current) {
      const pic = await cameraRef.current.takePictureAsync();
      if (pic) {
        setPhoto(pic.uri);
        setShowCamera(false);
      }
    }
  };

  const getLocation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setLocLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
    } catch {
      Alert.alert('Location Error', 'Unable to fetch current position.');
    } finally {
      setLocLoading(false);
    }
  };

  const handlePreview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Validation Error', 'Please fill in all required fields marked with *');
      return;
    }

    const surveyData: Survey = {
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
      status: 'completed',
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
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowCamera(false)}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <AppHeader title="Create Survey" subtitle="Module 2 · Inspection Form" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>SITE & CLIENT DETAILS</Text>
            <Text style={styles.requiredNotice}>* Required</Text>
          </View>

          <FormField
            label="Site Name *"
            placeholder="e.g. Metro Pipeline Sector 12"
            value={siteName}
            onChangeText={setSiteName}
            error={errors.siteName}
          />

          <FormField
            label="Client Name *"
            placeholder="e.g. City Municipal Corporation"
            value={clientName}
            onChangeText={setClientName}
            error={errors.clientName}
          />

          <FormField
            label="Description *"
            placeholder="Detailed findings and inspection tasks..."
            value={description}
            onChangeText={setDescription}
            multiline
            error={errors.description}
          />

          <PrioritySelector value={priority} onChange={setPriority} />

          <FormField
            label="Survey Date (YYYY-MM-DD)"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
          />
        </View>

        {/* Media & Attachments Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PHOTO ATTACHMENT</Text>
          {photo ? (
            <View style={styles.photoRow}>
              <Image source={{ uri: photo }} style={styles.thumb} />
              <View style={styles.photoMeta}>
                <Text style={styles.photoCapturedText}>✓ Photo Captured</Text>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPhoto(null);
                  }}>
                  <Text style={styles.removeText}>Remove Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.actionBtn} onPress={openCamera}>
              <IconSymbol name="camera.fill" size={18} color={Colors.dark} />
              <Text style={styles.actionBtnText}>CAPTURE PHOTO</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact & Location Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CONTACT & LOCATION TAGGING</Text>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>FIELD CONTACT PHONE</Text>
            <TextInput
              style={styles.inputField}
              placeholder="e.g. +91 9876543210"
              value={contact}
              onChangeText={setContact}
              keyboardType="phone-pad"
              placeholderTextColor="#8679A8"
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>GPS POSITION</Text>
            {latitude != null ? (
              <View style={styles.locBadge}>
                <Text style={styles.locText}>
                  LAT: {latitude.toFixed(6)} | LNG: {longitude!.toFixed(6)}
                </Text>
              </View>
            ) : (
              <Text style={styles.locEmpty}>No GPS location captured yet.</Text>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, locLoading && styles.disabled]}
              onPress={getLocation}
              disabled={locLoading}>
              {locLoading ? (
                <ActivityIndicator size="small" color={Colors.dark} />
              ) : (
                <IconSymbol name="location.fill" size={18} color={Colors.dark} />
              )}
              <Text style={styles.actionBtnText}>
                {latitude != null ? 'REFRESH GPS LOCATION' : 'GET GPS LOCATION'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Notes Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ADDITIONAL NOTES</Text>
          <TextInput
            style={[styles.inputField, styles.notesField]}
            placeholder="Add any extra field inspection comments..."
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#8679A8"
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.previewBtn}
          onPress={handlePreview}
          activeOpacity={0.85}>
          <IconSymbol name="eye.fill" size={20} color={Colors.dark} />
          <Text style={styles.previewText}>PREVIEW SURVEY</Text>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  requiredNotice: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.danger,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark,
  },
  photoMeta: {
    flex: 1,
    gap: 6,
  },
  photoCapturedText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#007A3D',
  },
  removeBtn: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  removeText: {
    color: Colors.danger,
    fontWeight: '900',
    fontSize: 11,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  actionBtnText: {
    color: Colors.dark,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.6,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: Colors.dark,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  locBadge: {
    backgroundColor: Colors.dark,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  locText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  locEmpty: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textMuted,
    marginBottom: 8,
  },
  notesField: {
    height: 90,
    paddingTop: 12,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    paddingVertical: 16,
    marginTop: 6,
    marginBottom: 20,
  },
  previewText: {
    color: Colors.dark,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
  },
  cancelBtn: {
    backgroundColor: Colors.danger,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  cancelText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
