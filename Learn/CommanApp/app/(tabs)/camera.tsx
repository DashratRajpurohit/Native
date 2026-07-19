import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';

import { AppHeader } from '@/components/app-header';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { loadSettings } from '@/constants/settings';
import { playShutterSound } from '@/utils/sound';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [openingCamera, setOpeningCamera] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [captureTime, setCaptureTime] = useState<string | null>(null);

  const openCamera = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOpeningCamera(true);

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setOpeningCamera(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to capture photos for inspection.'
        );
        return;
      }
    }

    setTimeout(() => {
      setOpeningCamera(false);
      setShowCamera(true);
    }, 400);
  };

  const takePhoto = async () => {
    const settings = await loadSettings();
    await playShutterSound(settings.customCameraSound);
    if (cameraRef.current) {
      const pic = await cameraRef.current.takePictureAsync();
      if (pic) {
        setPhoto(pic.uri);
        setCaptureTime(new Date().toLocaleString());
        setShowCamera(false);
      }
    }
  };

  const retakePhoto = () => {
    Haptics.selectionAsync();
    setPhoto(null);
    setCaptureTime(null);
    setShowCamera(true);
  };

  const confirmDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this captured photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setPhoto(null);
            setCaptureTime(null);
          },
        },
      ]
    );
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
      <AppHeader title="Camera Module" subtitle="Module 3 · Photo Inspection" />

      <View style={styles.container}>
        {openingCamera ? (
          <View style={styles.center}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.dark} />
              <Text style={styles.loadingText}>OPENING CAMERA...</Text>
            </View>
          </View>
        ) : photo ? (
          <View style={styles.photoContainer}>
            <View style={styles.imageCard}>
              <Image source={{ uri: photo }} style={styles.image} />
            </View>

            <View style={styles.timeTag}>
              <IconSymbol name="clock.fill" size={14} color={Colors.dark} />
              <Text style={styles.timeText}>Captured at: {captureTime}</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.retakeBtn} onPress={retakePhoto}>
                <IconSymbol name="arrow.triangle.2.circlepath" size={18} color={Colors.dark} />
                <Text style={styles.retakeText}>RETAKE PHOTO</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
                <IconSymbol name="trash.fill" size={18} color="#FFF" />
                <Text style={styles.deleteText}>DELETE</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <IconSymbol name="camera.fill" size={48} color={Colors.dark} />
            </View>
            <Text style={styles.emptyTitle}>NO PHOTO CAPTURED</Text>
            <Text style={styles.emptySub}>
              Take a field inspection photo to tag your survey.
            </Text>

            <TouchableOpacity style={styles.capturePhotoBtn} onPress={openCamera}>
              <IconSymbol name="camera.fill" size={20} color={Colors.dark} />
              <Text style={styles.capturePhotoText}>CAPTURE PHOTO</Text>
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
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  emptyIconBox: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.5,
  },
  emptySub: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  capturePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  capturePhotoText: {
    color: Colors.dark,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  photoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  imageCard: {
    width: 300,
    height: 380,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    overflow: 'hidden',
    backgroundColor: Colors.dark,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.dark,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    color: Colors.dark,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  retakeText: {
    color: Colors.dark,
    fontWeight: '900',
    fontSize: 13,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.danger,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  deleteText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 13,
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
