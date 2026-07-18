import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';

export default function LocationScreen() {
  const [permission, requestPermission] = Location.useForegroundPermissions();

  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null>(null);
  const [address, setAddress] = useState('');

  const getLocation = async () => {
    setLoading(true);
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setLoading(false);
        Alert.alert('Permission denied', 'Location permission is required to show your position.');
        return;
      }
    }

    try {
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
      });
      const addrs = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (addrs.length > 0) {
        const a = addrs[0];
        const parts = [a.name, a.street, a.district, a.city, a.region, a.country].filter(Boolean);
        setAddress(parts.join(', '));
      } else {
        setAddress('');
      }
    } catch {
      Alert.alert('Error', 'Unable to fetch location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const copyToClipboard = () => {
    if (!coords) return;
    const text = `Lat: ${coords.latitude.toFixed(6)}, Lng: ${coords.longitude.toFixed(6)}`;
    Clipboard.setString(text);
    Alert.alert('Copied', 'Current location copied to clipboard.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Location Module</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.loadingText}>Fetching location…</Text>
        </View>
      ) : coords ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Latitude</Text>
          <Text style={styles.value}>{coords.latitude.toFixed(6)}</Text>

          <Text style={styles.cardTitle}>Longitude</Text>
          <Text style={styles.value}>{coords.longitude.toFixed(6)}</Text>

          <Text style={styles.cardTitle}>Accuracy</Text>
          <Text style={styles.value}>
            {coords.accuracy != null ? `${coords.accuracy.toFixed(1)} m` : 'N/A'}
          </Text>

          {address ? (
            <>
              <Text style={styles.cardTitle}>Address</Text>
              <Text style={styles.address}>{address}</Text>
            </>
          ) : null}

          <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard}>
            <Text style={styles.copyText}>Copy to Clipboard</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.refreshBtn} onPress={getLocation}>
            <Text style={styles.refreshText}>Refresh Location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.errorText}>Location unavailable</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={getLocation}>
            <Text style={styles.refreshText}>Try Again</Text>
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
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    gap: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  address: {
    fontSize: 15,
    color: '#555',
    fontStyle: 'italic',
  },
  copyBtn: {
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    alignItems: 'center',
  },
  copyText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  refreshBtn: {
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: '#e0f2f7',
    borderRadius: 10,
    alignItems: 'center',
  },
  refreshText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: '600',
  },
});
