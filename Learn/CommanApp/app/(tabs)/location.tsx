import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { AppHeader } from '@/components/app-header';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setLoading(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Permission Denied',
          'Location permission is required to acquire your GPS position.'
        );
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
        const parts = [
          a.name,
          a.street,
          a.district,
          a.city,
          a.region,
          a.country,
        ].filter(Boolean);
        setAddress(parts.join(', '));
      } else {
        setAddress('');
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Unable to fetch current location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const copyToClipboard = async () => {
    if (!coords) return;
    const text = `Lat: ${coords.latitude.toFixed(6)}, Lng: ${coords.longitude.toFixed(6)}`;
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Location Copied', `Copied to clipboard:\n${text}`);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <AppHeader title="Location Module" subtitle="Module 4 · GPS Positioning" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.dark} />
            <Text style={styles.loadingText}>ACQUIRING GPS SIGNAL...</Text>
          </View>
        ) : coords ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>GPS DATA</Text>
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>ACQUIRED</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridBox}>
                <Text style={styles.gridLabel}>LATITUDE</Text>
                <Text style={styles.gridValue}>{coords.latitude.toFixed(6)}</Text>
              </View>

              <View style={styles.gridBox}>
                <Text style={styles.gridLabel}>LONGITUDE</Text>
                <Text style={styles.gridValue}>{coords.longitude.toFixed(6)}</Text>
              </View>
            </View>

            <View style={styles.accuracyBox}>
              <IconSymbol name="location.fill" size={16} color={Colors.dark} />
              <Text style={styles.accuracyLabel}>ACCURACY:</Text>
              <Text style={styles.accuracyValue}>
                {coords.accuracy != null ? `±${coords.accuracy.toFixed(1)} meters` : 'N/A'}
              </Text>
            </View>

            {address ? (
              <View style={styles.addressBox}>
                <Text style={styles.addressLabel}>REVERSE GEOCODED ADDRESS</Text>
                <Text style={styles.addressText}>{address}</Text>
              </View>
            ) : null}

            <View style={styles.actionBlock}>
              <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard}>
                <IconSymbol name="doc.on.doc.fill" size={18} color={Colors.dark} />
                <Text style={styles.copyText}>COPY TO CLIPBOARD</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.refreshBtn} onPress={getLocation}>
                <IconSymbol name="arrow.clockwise" size={18} color={Colors.dark} />
                <Text style={styles.refreshText}>REFRESH LOCATION</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.errorCard}>
            <IconSymbol name="exclamationmark.triangle.fill" size={36} color={Colors.danger} />
            <Text style={styles.errorTitle}>LOCATION UNAVAILABLE</Text>
            <Text style={styles.errorSub}>
              Unable to acquire GPS coordinates. Ensure Location permissions are enabled.
            </Text>

            <TouchableOpacity style={styles.refreshBtn} onPress={getLocation}>
              <Text style={styles.refreshText}>TRY AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}
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
  loadingCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 40,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
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
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
  },
  activeTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.dark,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.dark,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  gridBox: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark,
    padding: 12,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.light.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.dark,
  },
  accuracyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.dark,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    marginBottom: 14,
  },
  accuracyLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.dark,
  },
  accuracyValue: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.dark,
  },
  addressBox: {
    backgroundColor: '#FAF8F5',
    borderWidth: 2,
    borderColor: Colors.dark,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.light.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark,
    lineHeight: 18,
  },
  actionBlock: {
    gap: 10,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  },
  copyText: {
    color: Colors.dark,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    paddingVertical: 14,
  },
  refreshText: {
    color: Colors.dark,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  errorCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.danger,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    marginTop: 30,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.danger,
  },
  errorSub: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
});
