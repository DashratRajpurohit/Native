import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [openingCamera, setOpeningCamera] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [captureTime, setCaptureTime] = useState<string | null>(null);

  const openCamera = async () => {
    setOpeningCamera(true);
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setOpeningCamera(false);
        Alert.alert('Permission denied', 'Camera permission is required to take a photo.');
        return;
      }
    }
    setOpeningCamera(false);
    setShowCamera(true);
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const pic = await cameraRef.current.takePictureAsync();
      setPhoto(pic.uri);
      setCaptureTime(new Date().toLocaleString());
      setShowCamera(false);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    setCaptureTime(null);
    setShowCamera(true);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPhoto(null);
            setCaptureTime(null);
          },
        },
      ],
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
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Camera Module</Text>

      {openingCamera ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.loadingText}>Opening camera…</Text>
        </View>
      ) : photo ? (
        <View style={styles.photoContainer}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: photo! }} style={styles.image} />
          </View>
          <Text style={styles.captureTime}>Captured at: {captureTime}</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.retakeBtn} onPress={retakePhoto}>
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No photo captured yet</Text>
          <TouchableOpacity style={styles.capturePhotoBtn} onPress={openCamera}>
            <Text style={styles.capturePhotoText}>Capture Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0a7ea4',
    textAlign: 'center',
    marginVertical: 15,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  capturePhotoBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
  },
  capturePhotoText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  photoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  imageWrapper: {
    width: 280,
    height: 360,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  captureTime: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  retakeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
  },
  retakeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteBtn: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    backgroundColor: '#d32f2f',
    borderRadius: 10,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
