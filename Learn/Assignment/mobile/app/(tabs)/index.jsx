import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../contexts/theme';
import { getRecords, getLocations } from '../../utils/records';
import { formatCoordinates } from '../../utils/geo';

const FEATURES = [
  { key: 'camera', title: 'Camera & Scanner', note: 'Photos, videos, QR & barcode scanning', icon: 'camera', href: '/Camera' },
  { key: 'location', title: 'Location Centre', note: 'GPS, tracking, compass & maps', icon: 'location', href: '/Location' },
  { key: 'journal', title: 'Travel Journal', note: 'Story of your travels with addresses', icon: 'book', href: '/Journal' },
  { key: 'gallery', title: 'Gallery', note: 'Manage & favourite your photos', icon: 'images', href: '/Gallery' },
];

export default function HomeScreen() {
  const { colors, isDark, toggle } = useTheme();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [locations, setLocations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    setRecords(await getRecords());
    setLocations(await getLocations());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const photos = records.filter((r) => r.type === 'photo').length;
  const videos = records.filter((r) => r.type === 'video').length;
  const favorites = records.filter((r) => r.favorite).length;

  const sos = async () => {
    const last = locations[0];
    if (last) {
      await Share.share({
        message: `I need help right now!\nMy location: ${formatCoordinates(last.latitude, last.longitude)}`,
      });
    } else {
      router.push('/Location');
    }
  };

  const stats = [
    { label: 'Photos', value: photos, icon: 'camera' },
    { label: 'Videos', value: videos, icon: 'videocam' },
    { label: 'Locations', value: locations.length, icon: 'navigate' },
    { label: 'Favorites', value: favorites, icon: 'star' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>TRAVEL GUARDIAN</Text>
            <Text style={[styles.title, { color: colors.text }]}>Your travel sidekick</Text>
          </View>
          <Pressable
            style={[styles.darkButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={toggle}
            accessibilityLabel="Toggle dark mode"
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={20}
              color={colors.text}
            />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.statIconCircle, { backgroundColor: colors.surfaceHover }]}>
                <Ionicons name={stat.icon} size={16} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.sosButton, pressed && styles.buttonPressed]}
          onPress={sos}
        >
          <Ionicons name="warning" size={18} color="#fff" />
          <Text style={styles.sosText}>Emergency – Share My Location</Text>
        </Pressable>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
        {FEATURES.map((feature) => (
          <Pressable
            key={feature.key}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push(feature.href)}
          >
            <View style={[styles.cardIcon, { backgroundColor: colors.surfaceHover }]}>
              <Ionicons name={feature.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{feature.title}</Text>
              <Text style={[styles.cardNote, { color: colors.textMuted }]}>{feature.note}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
          </Pressable>
        ))}

        <Text style={[styles.footerHint, { color: colors.textSubtle }]}>
          Travel Guardian · Built as a beginner Expo app
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { fontSize: 26, fontWeight: '800', marginTop: 2 },
  darkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
  },
  statIconCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: 6 },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 16,
  },
  sosText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  buttonPressed: { opacity: 0.75 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 20, marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  cardPressed: { opacity: 0.85 },
  cardIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardNote: { fontSize: 13, marginTop: 2 },
  footerHint: { textAlign: 'center', fontSize: 12, marginTop: 24 },
});