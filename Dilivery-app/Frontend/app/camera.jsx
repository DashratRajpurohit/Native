import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert, TouchableOpacity, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../constants/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function CameraScreen() {
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [zoom, setZoom] = useState(0);

  const cameraRef = useRef(null);
  const [scanLineAnim] = useState(() => new Animated.Value(0));

  const { orderId, courier, condition, description } = useLocalSearchParams();

  useEffect(() => {
    // Loop laser scan line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 260,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanLineAnim]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="camera" size={60} color={theme.isDarkMode ? '#FFEFB3' : '#013E37'} style={{ marginBottom: 16 }} />
        <Text style={[styles.permissionTitle, { color: theme.text }]}>CAMERA ACCESS REQUIRED</Text>
        <Text style={[styles.permissionText, { color: theme.subtext }]}>Grant permission to capture real-time parcel evidence photo.</Text>
        <Pressable style={[styles.button, { backgroundColor: theme.isDarkMode ? '#FFEFB3' : '#013E37' }]} onPress={requestPermission}>
          <Text style={[styles.buttonText, { color: theme.isDarkMode ? '#013E37' : '#FFEFB3' }]}>GRANT CAMERA PERMISSION</Text>
        </Pressable>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        setPhotoUri(photo.uri);
      } catch (_error) {
        Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
      }
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (_error) {
      Alert.alert('Gallery Error', 'Could not select image from gallery.');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const toggleZoom = () => {
    setZoom(current => (current === 0 ? 0.3 : current === 0.3 ? 0.6 : 0));
  };

  const handleRetake = () => {
    setPhotoUri(null);
  };

  const handleContinue = () => {
    if (!photoUri) {
      Alert.alert('Missing Evidence', 'Please take a photo or select an image before continuing.');
      return;
    }

    router.push({
      pathname: '/location',
      params: {
        orderId,
        courier,
        condition,
        description,
        photoUri,
      }
    });
  };

  // Preview Mode
  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="contain" />
        <View style={[styles.actionRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <TouchableOpacity style={[styles.actionButton, styles.retakeButton, { borderColor: theme.cardBorder }]} onPress={handleRetake}>
            <Ionicons name="refresh-outline" size={20} color={theme.text} style={{ marginRight: 6 }} />
            <Text style={[styles.retakeText, { color: theme.text }]}>RETAKE PHOTO</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.isDarkMode ? '#FFEFB3' : '#013E37' }]} onPress={handleContinue}>
            <Text style={[styles.continueText, { color: theme.isDarkMode ? '#013E37' : '#FFEFB3' }]}>USE EVIDENCE</Text>
            <Ionicons name="arrow-forward" size={20} color={theme.isDarkMode ? '#013E37' : '#FFEFB3'} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Live Camera Mode
  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing} 
        enableTorch={flash === 'on'}
        zoom={zoom}
        ref={cameraRef}
      >
        {/* TOP CONTROLS */}
        <View style={styles.topControlBar}>
          <TouchableOpacity style={styles.controlIconBtn} onPress={toggleFlash}>
            <Ionicons name={flash === 'on' ? "flash" : "flash-off"} size={22} color="#FFEFB3" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlIconBtn} onPress={toggleZoom}>
            <Text style={styles.zoomText}>{zoom === 0 ? '1x' : zoom === 0.3 ? '2x' : '3x'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlIconBtn} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={24} color="#FFEFB3" />
          </TouchableOpacity>
        </View>

        {/* SCANNING LASER VIEWFINDER OVERLAY */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinderFrame}>
            <View style={[styles.cornerBracket, styles.topLeft]} />
            <View style={[styles.cornerBracket, styles.topRight]} />
            <View style={[styles.cornerBracket, styles.bottomLeft]} />
            <View style={[styles.cornerBracket, styles.bottomRight]} />

            {/* SCANNING LASER SWEEP LINE */}
            <Animated.View 
              style={[
                styles.scanLaserLine, 
                { transform: [{ translateY: scanLineAnim }] }
              ]} 
            />
          </View>
          <Text style={styles.scanInstruction}>ALIGN PARCEL DAMAGE IN FRAME</Text>
        </View>

        {/* BOTTOM CAPTURE BAR */}
        <View style={styles.cameraBottomContainer}>
          <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery}>
            <Ionicons name="images" size={26} color="#FFEFB3" />
            <Text style={styles.galleryText}>GALLERY</Text>
          </TouchableOpacity>

          <Pressable style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </Pressable>

          <View style={{ width: 60 }} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permissionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  permissionText: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  button: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16 },
  buttonText: { fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  camera: { flex: 1 },
  topControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(1, 41, 36, 0.6)',
  },
  controlIconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(1, 62, 55, 0.8)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFEFB3' },
  zoomText: { color: '#FFEFB3', fontWeight: '900', fontSize: 14 },
  viewfinderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  viewfinderFrame: { width: 280, height: 280, position: 'relative', justifyContent: 'flex-start' },
  cornerBracket: { position: 'absolute', width: 24, height: 24, borderColor: '#FFEFB3' },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  scanLaserLine: { width: '100%', height: 2.5, backgroundColor: '#FFEFB3', shadowColor: '#FFEFB3', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8 },
  scanInstruction: { color: '#FFEFB3', fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 16, backgroundColor: 'rgba(1, 62, 55, 0.8)', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  cameraBottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  galleryBtn: { alignItems: 'center', width: 60 },
  galleryText: { color: '#FFEFB3', fontSize: 11, fontWeight: '800', marginTop: 4 },
  captureButton: { width: 78, height: 78, borderRadius: 39, backgroundColor: 'rgba(255, 239, 179, 0.4)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFEFB3' },
  captureButtonInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#FFEFB3' },
  previewImage: { flex: 1, width: '100%' },
  actionRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopWidth: 1.5,
    justifyContent: 'space-between',
  },
  actionButton: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16, flexDirection: 'row', alignItems: 'center' },
  retakeButton: { backgroundColor: 'transparent', borderWidth: 1 },
  retakeText: { fontWeight: '800', fontSize: 14 },
  continueText: { fontWeight: '900', fontSize: 14 },
});
