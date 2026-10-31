import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { File } from 'expo-file-system';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/theme';
import { getRecords, updateRecord, deleteRecord } from '../utils/records';
import { formatCoordinates, formatDateTime, formatFileSize, openGoogleMaps } from '../utils/geo';

function RecordVideo({ uri }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.play();
  });
  return <VideoView player={player} style={styles.fullMedia} contentFit="contain" nativeControls />;
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

export default function RecordDetailsScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [record, setRecord] = useState(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    (async () => {
      const records = await getRecords();
      setRecord(records.find((r) => r.id === id) || null);
    })();
  }, [id]);

  if (!record) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted }}>Record not found.</Text>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </View>
    );
  }

  const savePatch = async (patch) => {
    const updated = await updateRecord(record.id, patch);
    if (updated) setRecord(updated);
  };

  const openRename = () => {
    setRenameValue(record.fileName || '');
    setRenameOpen(true);
  };

  const doRename = async () => {
    const name = renameValue.trim();
    if (!name) return;
    let uri = record.uri;
    let fileName = name;
    try {
      const file = new File(record.uri);
      if (file.exists) {
        const ext = file.extension || (record.type === 'video' ? '.mp4' : '.jpg');
        const base = name.toLowerCase().endsWith(ext) ? name : `${name}${ext}`;
        file.rename(base);
        uri = file.uri;
        fileName = file.name;
      }
    } catch {
      // keep old uri
    }
    await savePatch({ uri, fileName });
    setRenameOpen(false);
  };

  const doDelete = () => {
    Alert.alert('Delete photo?', `"${record.fileName}" will be removed permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteRecord(record.id);
          router.back();
        },
      },
    ]);
  };

  const doFavorite = () => savePatch({ favorite: !record.favorite });

  const shareOpenMaps = () => {
    if (record.latitude == null) return;
    Linking.openURL(openGoogleMaps(record.latitude, record.longitude));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Photo Details</Text>
        <Pressable style={[styles.closeButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.mediaCard, { borderColor: colors.border }]}>
          {record.type === 'photo' ? (
            <Image source={{ uri: record.uri }} style={styles.fullMedia} resizeMode="contain" />
          ) : (
            <RecordVideo uri={record.uri} />
          )}
        </View>

        {record.latitude != null && (
          <View style={[styles.locationBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={[styles.locationBannerText, { color: colors.text }]} numberOfLines={2}>
              {record.address || formatCoordinates(record.latitude, record.longitude)}
            </Text>
            <Pressable onPress={shareOpenMaps}>
              <Ionicons name="open-outline" size={20} color={colors.primary} />
            </Pressable>
          </View>
        )}

        <Pressable
          style={[styles.starButton, { backgroundColor: colors.surface, borderColor: record.favorite ? colors.warning : colors.border }]}
          onPress={doFavorite}
        >
          <Ionicons name={record.favorite ? 'star' : 'star-outline'} size={20} color={record.favorite ? colors.warning : colors.textMuted} />
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>
            {record.favorite ? 'Favorited' : 'Add to Favorites'}
          </Text>
        </Pressable>

        <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <DetailRow label="File name" value={record.fileName} />
          <DetailRow label="Type" value={record.type.toUpperCase()} />
          <DetailRow label="Size" value={formatFileSize(record.size)} />
          <DetailRow label="Created" value={formatDateTime(record.createdAt)} />
          <DetailRow label="Latitude" value={record.latitude != null ? record.latitude.toFixed(6) : 'None'} />
          <DetailRow label="Longitude" value={record.longitude != null ? record.longitude.toFixed(6) : 'None'} />
          <DetailRow label="Address" value={record.address || 'None'} />
          <DetailRow label="Media URI" value={record.uri} />
        </View>

        <View style={styles.actionRow}>
          <Pressable style={[styles.actionButton, { backgroundColor: colors.surfaceHover }]} onPress={openRename}>
            <Ionicons name="create-outline" size={18} color={colors.text} />
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>Rename</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, { backgroundColor: colors.danger }]} onPress={doDelete}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Delete</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={renameOpen} transparent animationType="fade" onRequestClose={() => setRenameOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setRenameOpen(false)}>
          <Pressable style={[styles.renamePanel, { backgroundColor: colors.surface }]}>
            <Text style={[styles.renameTitle, { color: colors.text }]}>Rename photo</Text>
            <TextInput
              style={[
                styles.renameInput,
                { backgroundColor: colors.surfaceHover, color: colors.text, borderColor: colors.border },
              ]}
              autoFocus
              value={renameValue}
              onChangeText={setRenameValue}
              onSubmitEditing={doRename}
            />
            <View style={styles.renameButtons}>
              <Pressable style={[styles.renameButton, { backgroundColor: colors.surfaceHover }]} onPress={() => setRenameOpen(false)}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.renameButton, { backgroundColor: colors.primary }]} onPress={doRename}>
                <Text style={{ color: colors.onPrimary, fontSize: 15, fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  screenTitle: { fontSize: 20, fontWeight: '800' },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: { fontSize: 15, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 32 },
  mediaCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    alignItems: 'center',
  },
  fullMedia: { width: '100%', aspectRatio: 3 / 4, backgroundColor: '#000' },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  locationBannerText: { flex: 1, fontSize: 14, fontWeight: '600' },
  starButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  detailsCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.25)',
  },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: '600', maxWidth: '62%', textAlign: 'right' },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 13,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 28 },
  renamePanel: {
    borderRadius: 16,
    padding: 20,
  },
  renameTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  renameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  renameButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  renameButton: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
});