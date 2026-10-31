import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../contexts/theme';
import { getRecords, exportRecordsAsJson } from '../../utils/records';
import { formatCoordinates, formatDateTime } from '../../utils/geo';

export default function JournalScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setRecords(await getRecords());
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

  const exportJournal = async () => {
    setExporting(true);
    try {
      const uri = await exportRecordsAsJson();
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Travel Journal',
        UTI: 'public.json',
      });
    } catch {
      // ignore share errors
    } finally {
      setExporting(false);
    }
  };

  const openRecord = (id) => router.push(`/record-details?id=${id}`);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Travel Journal</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {records.length} {records.length === 1 ? 'entry' : 'entries'} saved with AsyncStorage
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.exportButton,
            { backgroundColor: colors.primary },
            pressed && styles.buttonPressed,
            exporting && styles.buttonDisabled,
          ]}
          onPress={exportJournal}
          disabled={exporting}
        >
          <Ionicons name="download" size={18} color={colors.onPrimary} />
          <Text style={[styles.exportButtonText, { color: colors.onPrimary }]}>Export JSON</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {records.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: colors.border }]}>
            <Ionicons name="book-outline" size={48} color={colors.textSubtle} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Your journal is empty</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Take a photo in the Camera tab to start recording your travels. Photos captured with
              location stamping store the address and coordinates automatically.
            </Text>
            <Pressable
              style={[styles.goCamera, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/Camera')}
            >
              <Text style={[styles.goCameraText, { color: colors.onPrimary }]}>Open Camera</Text>
            </Pressable>
          </View>
        ) : (
          records.map((record) => (
            <Pressable
              key={record.id}
              style={({ pressed }) => [
                styles.recordCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.buttonPressed,
              ]}
              onPress={() => openRecord(record.id)}
            >
              {record.type === 'photo' ? (
                <Image source={{ uri: record.uri }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, styles.videoThumb, { backgroundColor: colors.surfaceHover }]}>
                  <Ionicons name="videocam" size={26} color={colors.textSubtle} />
                </View>
              )}
              <View style={styles.recordBody}>
                <Text style={[styles.recordName, { color: colors.text }]} numberOfLines={1}>
                  {record.fileName}
                </Text>
                <Text style={[styles.recordDate, { color: colors.textMuted }]}>
                  {formatDateTime(record.createdAt)}
                </Text>
                {record.address ? (
                  <Text style={[styles.recordAddress, { color: colors.text }]} numberOfLines={2}>
                    {record.address}
                  </Text>
                ) : null}
                {record.latitude != null && (
                  <Text style={[styles.recordCoords, { color: colors.primary }]}>
                    {formatCoordinates(record.latitude, record.longitude)}
                  </Text>
                )}
                <View style={styles.recordFooter}>
                  <Text style={[styles.recordMeta, { color: colors.textSubtle }]}>{record.type.toUpperCase()}</Text>
                  {record.latitude != null && (
                    <Ionicons name="location" size={14} color={colors.primary} />
                  )}
                  {record.favorite ? (
                    <Ionicons name="star" size={14} color={colors.warning} />
                  ) : null}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  screenTitle: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  exportButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  exportButtonText: { fontSize: 13, fontWeight: '700' },
  buttonPressed: { opacity: 0.7 },
  buttonDisabled: { opacity: 0.5 },
  content: { padding: 16, paddingBottom: 40 },
  emptyBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginTop: 24,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  goCamera: { marginTop: 16, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 12 },
  goCameraText: { fontSize: 14, fontWeight: '700' },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    gap: 12,
  },
  thumbnail: { width: 64, height: 64, borderRadius: 10 },
  videoThumb: { alignItems: 'center', justifyContent: 'center' },
  recordBody: { flex: 1 },
  recordName: { fontSize: 15, fontWeight: '700' },
  recordDate: { fontSize: 12, marginTop: 2 },
  recordAddress: { fontSize: 13, marginTop: 4 },
  recordCoords: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  recordFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  recordMeta: { fontSize: 11, fontWeight: '700' },
});