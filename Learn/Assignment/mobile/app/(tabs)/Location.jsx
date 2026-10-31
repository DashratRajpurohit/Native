import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../contexts/theme';
import { getLocations, getCachedAddress, cacheAddress, addLocation } from '../../utils/records';
import {
  compassLabel,
  formatAddress,
  formatCoordinates,
  formatDateTime,
  formatDistance,
  haversineDistance,
  openGoogleMaps,
} from '../../utils/geo';

function accuracyInfo(accuracy) {
  if (accuracy == null) return { color: '#64748b', label: 'Unknown' };
  if (accuracy <= 10) return { color: '#22c55e', label: 'Excellent' };
  if (accuracy <= 50) return { color: '#84cc16', label: 'Good' };
  if (accuracy <= 150) return { color: '#f59e0b', label: 'Fair' };
  return { color: '#ef4444', label: 'Poor' };
}

function DetailRow({ label, value }) {
  const { colors } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value ?? '–'}</Text>
    </View>
  );
}

function SectionCard({ title, children }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function ActionButton({ label, icon, onPress, color, filled }) {
  const { colors } = useTheme();
  const bg = filled ? color || colors.primary : colors.surfaceHover;
  const fg = filled ? colors.onPrimary : colors.text;
  return (
    <Pressable
      style={({ pressed }) => [styles.actionButton, { backgroundColor: bg }, pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      {icon && <Ionicons name={icon} size={16} color={fg} />}
      <Text style={[styles.actionButtonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export default function LocationScreen() {
  const { colors } = useTheme();
  const [permission, setPermission] = useState(null);
  const [current, setCurrent] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [highAccuracy, setHighAccuracy] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [trackingPoint, setTrackingPoint] = useState(null);
  const [trackCount, setTrackCount] = useState(0);

  const [heading, setHeading] = useState(null);
  const [provider, setProvider] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  const [destLat, setDestLat] = useState('');
  const [destLng, setDestLng] = useState('');
  const [distance, setDistance] = useState(null);

  const [history, setHistory] = useState([]);

  const watchSubRef = useRef(null);
  const headingSubRef = useRef(null);

  const accuracy = highAccuracy ? Location.Accuracy.Highest : Location.Accuracy.Balanced;

  const loadHistory = useCallback(async () => {
    setHistory(await getLocations());
  }, []);

  const requestPermission = async () => {
    const result = await Location.requestForegroundPermissionsAsync();
    setPermission(result);
    return result.granted;
  };

  const startHeading = async () => {
    try {
      headingSubRef.current?.remove();
      headingSubRef.current = await Location.watchHeadingAsync(({ magHeading }) => setHeading(magHeading));
    } catch {
      headingSubRef.current = null;
    }
  };

  const fetchCurrent = async (showAlerts = true) => {
    if (loading) return;
    setLoading(true);
    if (!permission?.granted) {
      const granted = await requestPermission();
      if (!granted) {
        if (showAlerts) Alert.alert('Permission needed', 'Location permission is required.');
        setLoading(false);
        return;
      }
    }
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy,
        mayShowUserSettingsDialog: true,
      });
      setCurrent(position);
      setTrackingPoint(position);
      setTrackCount((c) => c + 1);
      return position;
    } catch (error) {
      if (showAlerts) Alert.alert('Location error', error.message || 'Could not get location.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchLastKnown = async () => {
    if (!permission?.granted) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    try {
      const position = await Location.getLastKnownPositionAsync({ requiredAccuracy: 300 });
      if (!position) {
        Alert.alert('No last known location', 'Falling back to a fresh position fix.');
        await fetchCurrent();
        return;
      }
      setCurrent(position);
    } catch (error) {
      Alert.alert('Location error', error.message || 'Could not get last known location.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCurrent(false);
    loadHistory();
    setRefreshing(false);
  };

  useEffect(() => {
    (async () => {
      const existing = await Location.getForegroundPermissionsAsync();
      setPermission(existing);
      loadHistory();
      if (existing.granted) {
        try {
          setProvider(await Location.getProviderStatusAsync());
        } catch {
          // ignore
        }
        await fetchCurrent(false);
        startHeading();
      }
    })();
    return () => {
      watchSubRef.current?.remove();
      headingSubRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAddress = async () => {
    const point = current || trackingPoint;
    if (!point) {
      Alert.alert('No location', 'Fetch a location first.');
      return;
    }
    setLoading(true);
    const { latitude, longitude } = point.coords;
    const cached = await getCachedAddress(latitude, longitude);
    if (cached) {
      setAddress(cached);
      setLoading(false);
      return;
    }
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      const formatted = result && result.length ? formatAddress(result[0]) : 'No address found';
      setAddress(formatted);
      if (formatted && formatted !== 'No address found') {
        await cacheAddress(latitude, longitude, formatted);
      }
    } catch {
      setAddress('Could not fetch address (try again later).');
    } finally {
      setLoading(false);
    }
  };

  const toggleTracking = async () => {
    if (tracking) {
      watchSubRef.current?.remove();
      watchSubRef.current = null;
      setTracking(false);
      return;
    }
    if (!permission?.granted) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    try {
      setTracking(true);
      watchSubRef.current?.remove();
      watchSubRef.current = await Location.watchPositionAsync(
        { accuracy, timeInterval: 3000, distanceInterval: 5 },
        (position) => {
          setTrackingPoint(position);
          setTrackCount((c) => c + 1);
          addLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }).then(loadHistory);
        }
      );
    } catch (error) {
      setTracking(false);
      Alert.alert('Tracking error', error.message || 'Could not start tracking.');
    }
  };

  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    if (!permission?.granted) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    setSearching(true);
    try {
      const result = await Location.geocodeAsync(searchQuery);
      if (!result.length) {
        Alert.alert('No results', 'Address not found.');
        return;
      }
      const first = result[0];
      const target = { latitude: first.latitude, longitude: first.longitude, name: searchQuery.trim() };
      setSearchResult(target);
      setDestLat(first.latitude.toFixed(6));
      setDestLng(first.longitude.toFixed(6));
    } catch (error) {
      Alert.alert('Search error', error.message || 'Could not geocode that address.');
    } finally {
      setSearching(false);
    }
  };

  const calculateDistance = () => {
    const start = current?.coords || trackingPoint?.coords;
    const lat = parseFloat(destLat);
    const lng = parseFloat(destLng);
    if (!start || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      Alert.alert('Missing points', 'Fetch your location and enter a destination.');
      return;
    }
    setDistance(haversineDistance(start, { latitude: lat, longitude: lng }));
  };

  const shareCoordinates = async () => {
    if (searchResult) {
      await Share.share({
        message: `${searchResult.name}\n${formatCoordinates(searchResult.latitude, searchResult.longitude)}`,
      });
      return;
    }
    const coords = current?.coords || trackingPoint?.coords;
    if (coords) {
      await Share.share({ message: formatCoordinates(coords.latitude, coords.longitude) });
    } else {
      fetchCurrent();
    }
  };

  const sos = async () => {
    let coords = current?.coords || trackingPoint?.coords;
    if (!coords) {
      const position = await fetchCurrent(false);
      coords = position?.coords || current?.coords;
    }
    if (!coords) {
      Alert.alert('No location', 'Could not get your location yet.');
      return;
    }
    const message =
      `I need help right now!\nMy location: ${formatCoordinates(coords.latitude, coords.longitude)}\n${openGoogleMaps(coords.latitude, coords.longitude)}`;
    await Share.share({ message });
  };

  const openMaps = () => {
    const coords = current?.coords || trackingPoint?.coords;
    if (!coords) {
      fetchCurrent();
      return;
    }
    Linking.openURL(openGoogleMaps(coords.latitude, coords.longitude));
  };

  const point = current?.coords || trackingPoint?.coords;
  const acc = point ? accuracyInfo(point.accuracy) : null;

  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Checking location permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Location Access</Text>
        <Text style={[styles.permissionText, { color: colors.textMuted }]}>
          Travel Guardian needs your location to track your journey, attach places to photos and
          help you in an emergency.
        </Text>
        {permission.canAskAgain ? (
          <Pressable
            style={({ pressed }) => [
              styles.permissionButton,
              { backgroundColor: colors.primary },
              pressed && styles.buttonPressed,
            ]}
            onPress={requestPermission}
          >
            <Text style={[styles.permissionButtonText, { color: colors.onPrimary }]}>
              Grant Location Permission
            </Text>
          </Pressable>
        ) : (
          <Text style={[styles.permissionText, { color: colors.danger }]}>
            Permission denied. Enable it in device settings to continue.
          </Text>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[styles.screenTitle, { color: colors.text }]}>Location</Text>

        <SectionCard title="Current Location">
          {point ? (
            <View style={styles.coordsBox}>
              <Text style={[styles.coordsText, { color: colors.text }]}>
                {formatCoordinates(point.latitude, point.longitude)}
              </Text>
              {acc && (
                <View style={styles.accuracyRow}>
                  <View style={[styles.accuracyDot, { backgroundColor: acc.color }]} />
                  <Text style={[styles.accuracyText, { color: colors.textMuted }]}>
                    Accuracy {Math.round(point.accuracy ?? 0)} m · {acc.label}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSubtle }]}>
              No location yet. Tap “Get Current” below.
            </Text>
          )}

          <View style={styles.actionRow}>
            <ActionButton label="Get Current" icon="locate" onPress={() => fetchCurrent()} filled />
            <ActionButton label="Last Known" icon="time" onPress={fetchLastKnown} />
            <ActionButton label="Refresh" icon="refresh" onPress={() => fetchCurrent()} />
          </View>
          <Pressable style={styles.switchRow} onPress={() => setHighAccuracy((value) => !value)}>
            <View>
              <Text style={[styles.switchLabel, { color: colors.text }]}>High accuracy mode</Text>
              <Text style={[styles.switchHint, { color: colors.textSubtle }]}>
                Uses {highAccuracy ? 'the best GPS fix available' : 'a balanced battery-saving fix'}
              </Text>
            </View>
            <Ionicons
              name={highAccuracy ? 'checkbox' : 'square-outline'}
              size={22}
              color={highAccuracy ? colors.primary : colors.textSubtle}
            />
          </Pressable>
        </SectionCard>

        <SectionCard title="Address (Reverse Geocoding)">
          <Text style={[styles.addressText, { color: colors.text }]}>
            {loading ? 'Loading address...' : address || 'Fetch the address of your current location.'}
          </Text>
          <ActionButton label={address ? 'Refresh Address' : 'Fetch Address'} icon="map" onPress={fetchAddress} filled />
        </SectionCard>

        <SectionCard title="Search Address (Geocoding)">
          <View style={styles.searchRow}>
            <TextInput
              style={[
                styles.searchInput,
                { backgroundColor: colors.surfaceHover, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="e.g. Eiffel Tower, Paris"
              placeholderTextColor={colors.textSubtle}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={searchAddress}
              returnKeyType="search"
            />
            <Pressable
              style={[styles.searchButton, { backgroundColor: colors.primary }]}
              onPress={searchAddress}
              disabled={searching}
            >
              <Ionicons name="search" size={18} color={colors.onPrimary} />
            </Pressable>
          </View>
          {searchResult && (
            <View style={[styles.searchResultBox, { backgroundColor: colors.surfaceHover }]}>
              <Text style={[styles.searchResultName, { color: colors.text }]}>{searchResult.name}</Text>
              <Text style={[styles.searchResultCoords, { color: colors.textMuted }]}>
                {formatCoordinates(searchResult.latitude, searchResult.longitude)}
              </Text>
              <View style={styles.actionRow}>
                <ActionButton label="Share" icon="share-social" onPress={shareCoordinates} />
                <ActionButton label="Use as Dist." icon="git-compare" onPress={() => {}} filled />
              </View>
            </View>
          )}
        </SectionCard>

        <SectionCard title="Distance & Navigation">
          <View style={styles.twoCol}>
            <TextInput
              style={[
                styles.coordInput,
                { backgroundColor: colors.surfaceHover, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Dest. latitude"
              placeholderTextColor={colors.textSubtle}
              keyboardType="numeric"
              value={destLat}
              onChangeText={setDestLat}
            />
            <TextInput
              style={[
                styles.coordInput,
                { backgroundColor: colors.surfaceHover, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Dest. longitude"
              placeholderTextColor={colors.textSubtle}
              keyboardType="numeric"
              value={destLng}
              onChangeText={setDestLng}
            />
          </View>
          {distance != null && (
            <Text style={[styles.distanceText, { color: colors.primary }]}>
              Distance: {formatDistance(distance)}
            </Text>
          )}
          <View style={styles.actionRow}>
            <ActionButton label="Distance" icon="calculator" onPress={calculateDistance} filled />
            <ActionButton label="Google Maps" icon="navigate" onPress={openMaps} />
            <ActionButton label="Share" icon="share-social" onPress={shareCoordinates} />
          </View>
        </SectionCard>

        <SectionCard title="Live Tracking">
          <Text style={[styles.trackingText, { color: colors.textMuted }]}>
            {tracking ? `Tracking live · ${trackCount} updates` : 'Start live tracking to collect route points.'}
          </Text>
          <Pressable
            style={[
              styles.trackingButton,
              { backgroundColor: tracking ? colors.danger : colors.primary },
            ]}
            onPress={toggleTracking}
          >
            <Ionicons
              name={tracking ? 'stop-circle' : 'play-circle'}
              size={18}
              color={colors.onPrimary}
            />
            <Text style={[styles.trackingButtonText, { color: colors.onPrimary }]}>
              {tracking ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
          </Pressable>
        </SectionCard>

        <SectionCard title="Compass Heading">
          <View style={styles.compassRow}>
            <View style={[styles.compassCircle, { borderColor: colors.border, backgroundColor: colors.surfaceHover }]}>
              <Ionicons
                name="navigate"
                size={26}
                color={colors.primary}
                style={{ transform: [{ rotate: `${heading != null ? heading : 0}deg` }] }}
              />
            </View>
            <View>
              <Text style={[styles.headingText, { color: colors.text }]}>
                {compassLabel(heading)}
              </Text>
              <Text style={[styles.headingHint, { color: colors.textSubtle }]}>
                Magnetic north heading
              </Text>
            </View>
          </View>
        </SectionCard>

        <SectionCard title="Location History">
          {history.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSubtle }]}>
              Saved points will appear here.
            </Text>
          ) : (
            history.map((entry) => (
              <View key={entry.id} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.historyCoords, { color: colors.text }]}>
                    {formatCoordinates(entry.latitude, entry.longitude)}
                  </Text>
                  <Text style={[styles.historyMeta, { color: colors.textSubtle }]}>
                    {formatDateTime(entry.timestamp)}
                    {entry.accuracy != null ? ` · ±${entry.accuracy} m` : ''}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [pressed && styles.buttonPressed]}
                  onPress={() => Linking.openURL(openGoogleMaps(entry.latitude, entry.longitude))}
                >
                  <Ionicons name="open-outline" size={20} color={colors.primary} />
                </Pressable>
              </View>
            ))
          )}
        </SectionCard>

        <SectionCard title="Complete Location Details">
          <DetailRow label="Latitude" value={point ? point.latitude.toFixed(6) : null} />
          <DetailRow label="Longitude" value={point ? point.longitude.toFixed(6) : null} />
          <DetailRow label="Accuracy" value={point ? `${Math.round(point.accuracy ?? 0)} m` : null} />
          <DetailRow label="Altitude" value={point ? `${Math.round(point.altitude ?? 0)} m` : null} />
          <DetailRow label="Altitude accuracy" value={point && point.altitudeAccuracy != null ? `${Math.round(point.altitudeAccuracy)} m` : null} />
          <DetailRow label="Heading" value={point && point.heading != null ? `${Math.round(point.heading)}°` : null} />
          <DetailRow label="Speed" value={point && point.speed != null ? `${(point.speed * 3.6).toFixed(1)} km/h` : null} />
          <DetailRow label="Timestamp" value={point ? new Date(point.timestamp).toLocaleString() : null} />
          <DetailRow label="GPS available" value={provider ? (provider.gpsAvailable ? 'Yes' : 'No') : null} />
          <DetailRow label="Services enabled" value={provider != null ? (provider.locationServicesEnabled ? 'Yes' : 'No') : null} />
        </SectionCard>

        <Pressable
          style={({ pressed }) => [styles.sosButton, pressed && styles.buttonPressed]}
          onPress={sos}
        >
          <Ionicons name="warning" size={20} color="#fff" />
          <Text style={styles.sosText}>Emergency – Share My Location</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  loadingText: { fontSize: 16 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 16 },
  permissionText: { fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  permissionButton: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  permissionButtonText: { fontSize: 16, fontWeight: '600' },
  content: { padding: 16, paddingBottom: 40 },
  screenTitle: { fontSize: 26, fontWeight: '800', marginBottom: 12 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  coordsBox: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  coordsText: { fontSize: 18, fontWeight: '700' },
  accuracyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  accuracyDot: { width: 10, height: 10, borderRadius: 5 },
  accuracyText: { fontSize: 13 },
  emptyText: { fontSize: 14, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
  },
  actionButtonText: { fontSize: 13, fontWeight: '700' },
  buttonPressed: { opacity: 0.7 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  switchLabel: { fontSize: 15, fontWeight: '600' },
  switchHint: { fontSize: 12, marginTop: 2 },
  addressText: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  searchButton: {
    width: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultBox: { borderRadius: 12, padding: 12, marginTop: 10 },
  searchResultName: { fontSize: 15, fontWeight: '700' },
  searchResultCoords: { fontSize: 13, marginTop: 2, marginBottom: 4 },
  twoCol: { flexDirection: 'row', gap: 8 },
  coordInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  distanceText: { fontSize: 18, fontWeight: '800', marginTop: 10 },
  trackingText: { fontSize: 14, marginBottom: 12 },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
  },
  trackingButtonText: { fontSize: 15, fontWeight: '800' },
  compassRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  compassCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: { fontSize: 20, fontWeight: '800' },
  headingHint: { fontSize: 12, marginTop: 2 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 10,
    gap: 8,
  },
  historyCoords: { fontSize: 14, fontWeight: '600' },
  historyMeta: { fontSize: 12, marginTop: 2 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.25)',
  },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  sosText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});