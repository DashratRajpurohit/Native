import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, TextInput, ScrollView, TouchableOpacity, Animated } from 'react-native';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../constants/ThemeContext';
import GraphicIllustration from '../components/GraphicIllustration';
import { Ionicons } from '@expo/vector-icons';

export default function LocationScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Fetching address...');
  const [customAddress, setCustomAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWatching, setIsWatching] = useState(false);

  const watcherSubscription = useRef(null);
  const [radarPulseAnim] = useState(() => new Animated.Value(1));

  const reverseGeocode = async (latitude, longitude) => {
    try {
      let reverseResult = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverseResult.length > 0) {
        const place = reverseResult[0];
        const formatted = `${place.name || place.street || ''} ${place.city || ''}, ${place.region || ''} ${place.postalCode || ''}`.trim();
        const finalAddr = formatted || `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
        setAddress(finalAddr);
        setCustomAddress(finalAddr);
      } else {
        setAddress('Address not found');
      }
    } catch (_e) {
      setAddress(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
    }
  };

  const startLocationService = async () => {
    setLoading(true);
    setErrorMsg(null);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      setLoading(false);
      return;
    }

    try {
      let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(currentLocation.coords);

      await reverseGeocode(currentLocation.coords.latitude, currentLocation.coords.longitude);

      // Subscribe to live location updates
      watcherSubscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
        (newLocation) => {
          setLocation(newLocation.coords);
          setIsWatching(true);
        }
      );
    } catch (_error) {
      setErrorMsg('Failed to acquire location. Please enable GPS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (!isMounted) return;
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (!isMounted) return;
        setLocation(currentLocation.coords);

        let reverseResult = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        if (isMounted) {
          if (reverseResult.length > 0) {
            const place = reverseResult[0];
            const formatted = `${place.name || place.street || ''} ${place.city || ''}, ${place.region || ''} ${place.postalCode || ''}`.trim();
            const finalAddr = formatted || `Lat: ${currentLocation.coords.latitude.toFixed(4)}, Lon: ${currentLocation.coords.longitude.toFixed(4)}`;
            setAddress(finalAddr);
            setCustomAddress(finalAddr);
          } else {
            setAddress('Address not found');
          }
        }

        // Subscribe to live location updates
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
          (newLocation) => {
            if (isMounted) {
              setLocation(newLocation.coords);
              setIsWatching(true);
            }
          }
        );
        if (isMounted) {
          watcherSubscription.current = sub;
        } else {
          sub.remove();
        }
      } catch (_error) {
        if (isMounted) setErrorMsg('Failed to acquire location. Please enable GPS.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    // Radar pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(radarPulseAnim, {
          toValue: 1.35,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(radarPulseAnim, {
          toValue: 1.0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      isMounted = false;
      if (watcherSubscription.current) {
        watcherSubscription.current.remove();
      }
    };
  }, [radarPulseAnim]);

  const handleContinue = () => {
    const finalLocationAddress = customAddress.trim() || address;
    router.push({
      pathname: '/proof-summary',
      params: {
        ...params,
        latitude: location?.latitude?.toString() || '',
        longitude: location?.longitude?.toString() || '',
        address: finalLocationAddress,
      }
    });
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <GraphicIllustration type="radar" size={90} />
        <ActivityIndicator size="large" color={theme.isDarkMode ? '#FFEFB3' : '#013E37'} style={{ marginTop: 16 }} />
        <Text style={[styles.loadingText, { color: theme.subtext }]}>LOCKING HIGH-PRECISION SATELLITE GPS...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="location" size={60} color="#F43F5E" style={{ marginBottom: 16 }} />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>GPS verification confirms exactly where parcel evidence was recorded.</Text>
        
        <Pressable style={[styles.button, { backgroundColor: theme.isDarkMode ? '#FFEFB3' : '#013E37' }]} onPress={startLocationService}>
          <Text style={[styles.buttonText, { color: theme.isDarkMode ? '#013E37' : '#FFEFB3' }]}>ALLOW LOCATION & RETRY</Text>
        </Pressable>
        
        <Pressable style={[styles.button, styles.skipButton, { borderColor: theme.cardBorder }]} onPress={handleContinue}>
          <Text style={[styles.skipButtonText, { color: theme.subtext }]}>Skip GPS Verification</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>GPS LOCATION EVIDENCE</Text>
      <Text style={[styles.subtitle, { color: theme.subtext }]}>Satellite coordinates verify physical parcel delivery node.</Text>

      {/* SATELLITE RADAR PANEL WITH ANIMATED PULSE RING */}
      <View style={[styles.mapContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Animated.View 
          style={[
            styles.radarPulseRing, 
            { 
              borderColor: theme.isDarkMode ? '#FFEFB3' : '#013E37',
              transform: [{ scale: radarPulseAnim }] 
            }
          ]} 
        />
        
        <View style={styles.mapGridLines}>
          <Ionicons name="location-sharp" size={44} color={theme.isDarkMode ? '#FFEFB3' : '#013E37'} />
          <Text style={[styles.mapPinLabel, { color: theme.text }]}>Captured Location Pin</Text>
          <Text style={{ color: theme.subtext, fontSize: 12, fontWeight: '700', marginTop: 2 }}>
            {location?.latitude?.toFixed(5)}, {location?.longitude?.toFixed(5)}
          </Text>
        </View>

        {isWatching ? (
          <View style={[styles.liveBadge, { backgroundColor: '#10B981' }]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>GPS LIVE</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={[styles.recenterBtn, { backgroundColor: theme.isDarkMode ? '#FFEFB3' : '#013E37' }]} 
          onPress={startLocationService}
        >
          <Ionicons name="locate" size={16} color={theme.isDarkMode ? '#013E37' : '#FFEFB3'} />
          <Text style={[styles.recenterText, { color: theme.isDarkMode ? '#013E37' : '#FFEFB3' }]}>RECENTER</Text>
        </TouchableOpacity>
      </View>

      {/* LOCATION DETAILS CARD */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>LATITUDE</Text>
          <Text style={[styles.value, { color: theme.text }]}>{location?.latitude}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>LONGITUDE</Text>
          <Text style={[styles.value, { color: theme.text }]}>{location?.longitude}</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>GEOCODED STREET ADDRESS</Text>
          <TextInput
            style={[styles.addressInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
            value={customAddress}
            onChangeText={setCustomAddress}
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      <Pressable 
        style={[styles.button, { backgroundColor: theme.isDarkMode ? '#FFEFB3' : '#013E37' }]} 
        onPress={handleContinue}
      >
        <Text style={[styles.buttonText, { color: theme.isDarkMode ? '#013E37' : '#FFEFB3' }]}>CONTINUE TO REVIEW</Text>
        <Ionicons name="arrow-forward" size={18} color={theme.isDarkMode ? '#013E37' : '#FFEFB3'} style={{ marginLeft: 8 }} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 16, fontSize: 12, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 1, marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 13, marginBottom: 20, textAlign: 'center' },
  mapContainer: {
    height: 190,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  radarPulseRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 239, 179, 0.05)',
  },
  mapGridLines: { alignItems: 'center', zIndex: 2 },
  mapPinLabel: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF', marginRight: 6 },
  liveText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  recenterBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recenterText: { fontSize: 11, fontWeight: '900', marginLeft: 4, letterSpacing: 0.5 },
  card: { borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1.5 },
  row: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  value: { fontSize: 15, fontWeight: '600' },
  addressInput: { borderRadius: 14, borderWidth: 1, padding: 12, fontSize: 14, marginTop: 4, textAlignVertical: 'top' },
  errorText: { fontSize: 18, fontWeight: '800', color: '#F43F5E', marginBottom: 10, textAlign: 'center' },
  button: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#FFEFB3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: { fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  skipButton: { backgroundColor: 'transparent', borderWidth: 1, marginTop: 12 },
  skipButtonText: { fontSize: 14, fontWeight: '700' },
});
