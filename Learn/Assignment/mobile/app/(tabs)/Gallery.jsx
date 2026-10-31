import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../contexts/theme';
import { getRecords } from '../../utils/records';

export default function GalleryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRecords((await getRecords()).filter((r) => r.type === 'photo'));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const photos = filter === 'favorites' ? records.filter((r) => r.favorite) : records;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Gallery</Text>
        <View style={[styles.filterRow, { backgroundColor: colors.surface }]}>
          {[
            { key: 'all', label: 'All' },
            { key: 'favorites', label: 'Favorites' },
          ].map((option) => (
            <Pressable
              key={option.key}
              style={[
                styles.filterChip,
                filter === option.key && { backgroundColor: colors.primary },
              ]}
              onPress={() => setFilter(option.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === option.key ? { color: colors.onPrimary } : { color: colors.textMuted },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {photos.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: colors.border }]}>
            <Ionicons name="images-outline" size={48} color={colors.textSubtle} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {filter === 'favorites' ? 'No favorite photos yet' : 'No photos yet'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Take photos in the Camera tab. Tap a photo to view, rename, favorite or delete it.
            </Text>
            <Pressable
              style={[styles.goCamera, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/Camera')}
            >
              <Text style={[styles.goCameraText, { color: colors.onPrimary }]}>Open Camera</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {photos.map((record) => (
              <Pressable
                key={record.id}
                style={({ pressed }) => [styles.cell, pressed && styles.buttonPressed]}
                onPress={() => router.push(`/record-details?id=${record.id}`)}
              >
                <Image source={{ uri: record.uri }} style={styles.image} />
                {record.favorite ? (
                  <View style={styles.starBadge}>
                    <Ionicons name="star" size={14} color="#fff" />
                  </View>
                ) : null}
                {record.latitude != null ? (
                  <View style={styles.locationBadge}>
                    <Ionicons name="location" size={12} color="#fff" />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  screenTitle: { fontSize: 24, fontWeight: '800' },
  filterRow: { flexDirection: 'row', borderRadius: 999, padding: 3 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  filterChipText: { fontSize: 13, fontWeight: '700' },
  content: { padding: 12, paddingBottom: 40 },
  emptyBox: { borderWidth: 1, borderRadius: 16, padding: 28, alignItems: 'center', marginTop: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  goCamera: { marginTop: 16, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 12 },
  goCameraText: { fontSize: 14, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: '31%', aspectRatio: 1, borderRadius: 10, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  buttonPressed: { opacity: 0.75 },
  starBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(56,189,248,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});