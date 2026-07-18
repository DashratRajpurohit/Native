import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Image,
  TextInput, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { File, Paths } from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';

export default function FieldVisitScreen() {
  const cameraRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [locLoading, setLocLoading] = useState(true);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState(null);

  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLocLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required');
      setLocLoading(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
    reverseGeocode(loc.coords.latitude, loc.coords.longitude);
    setLocLoading(false);
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const addrs = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (addrs.length > 0) {
        const a = addrs[0];
        const parts = [a.name, a.street, a.district, a.city, a.region, a.country].filter(Boolean);
        setAddress(parts.join(', '));
      }
    } catch {
      setAddress('Unable to fetch address');
    }
  };

  const openCamera = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permission denied', 'Camera permission is required');
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

  const retakePhoto = () => {
    setPhoto(null);
    openCamera();
  };

  const submitAttendance = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!photo) {
      Alert.alert('Error', 'Please take a selfie');
      return;
    }
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    setSubmitting(true);

    const now = new Date();
    const dateTime = now.toLocaleString();

    const srcFile = new File(photo);
    srcFile.move(Paths.document);

    const record = {
      employeeName: name.trim(),
      latitude: location.latitude,
      longitude: location.longitude,
      address,
      selfie: srcFile.uri,
      dateTime,
    };

    const jsonFile = new File(Paths.document, 'attendance.json');
    const existingRaw = jsonFile.exists ? await jsonFile.text() : '[]';
    const records = JSON.parse(existingRaw);
    records.push(record);
    jsonFile.create({ idempotent: true });
    jsonFile.write(JSON.stringify(records, null, 2));

    setSubmitting(false);
    setSubmitted(true);
    Alert.alert('Success', 'Attendance submitted successfully!');
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successTitle}>Attendance Submitted</Text>
        <Text style={styles.successText}>{name}</Text>
        <Text style={styles.successText}>{new Date().toLocaleString()}</Text>
        <TouchableOpacity style={styles.button} onPress={() => setSubmitted(false)}>
          <Text style={styles.buttonText}>Mark Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="front">
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
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.heading}>Field Visit Attendance</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Employee Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location</Text>
        {locLoading ? (
          <ActivityIndicator size="small" color="#1a73e8" />
        ) : location ? (
          <>
            <Text style={styles.locText}>Lat: {location.latitude.toFixed(6)}</Text>
            <Text style={styles.locText}>Lng: {location.longitude.toFixed(6)}</Text>
            <Text style={styles.addressText}>{address}</Text>
          </>
        ) : (
          <Text style={styles.errorText}>Location unavailable</Text>
        )}
        <TouchableOpacity style={styles.refreshBtn} onPress={getLocation}>
          <Text style={styles.refreshText}>Refresh Location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Selfie</Text>
        {photo ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity style={styles.retakeBtn} onPress={retakePhoto}>
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.cameraBtn} onPress={openCamera}>
            <Text style={styles.cameraBtnText}>Take Selfie</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Date & Time</Text>
        <Text style={styles.dateTimeText}>{new Date().toLocaleString()}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={submitAttendance}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Submitting...' : 'Submit Attendance'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a73e8',
    textAlign: 'center',
    marginVertical: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    height: 45,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 5,
  },
  locText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 3,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  refreshBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  refreshText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '500',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photo: {
    width: 200,
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  retakeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
  },
  retakeText: {
    color: '#fff',
    fontWeight: '600',
  },
  cameraBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    alignSelf: 'center',
  },
  cameraBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  captureInner: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
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
  successIcon: {
    fontSize: 60,
    color: '#4caf50',
    marginBottom: 10,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
});
