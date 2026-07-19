import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { deleteSurvey, loadSurveys, type Survey } from '@/constants/survey';

const PRIORITIES = ['All', 'Low', 'Medium', 'High'] as const;
const COLORS: Record<string, string> = { Low: '#1b8a3f', Medium: '#b7791f', High: '#d32f2f' };

export default function SurveyHistoryScreen() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('All');

  const fetchSurveys = useCallback(async () => {
    const data = await loadSurveys();
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setSurveys(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSurveys();
  }, [fetchSurveys]);

  const viewDetails = (survey: Survey) => {
    router.push({
      pathname: '/survey-preview',
      params: { data: JSON.stringify(survey), mode: 'view' },
    });
  };

  const confirmDelete = (survey: Survey) => {
    Alert.alert('Delete Survey', `Remove the survey "${survey.siteName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSurvey(survey.id);
          setSurveys((prev) => prev.filter((s) => s.id !== survey.id));
        },
      },
    ]);
  };

  const filtered = surveys.filter((s) => {
    const matchesSearch =
      !query ||
      s.siteName.toLowerCase().includes(query.toLowerCase()) ||
      s.clientName.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'All' || s.priority === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Survey History</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by site or client…"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.filters}>
        {PRIORITIES.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.filterChip, filter === p && { backgroundColor: p === 'All' ? '#0a7ea4' : COLORS[p] }]}
            onPress={() => setFilter(p)}
          >
            <Text style={[styles.filterText, filter === p && styles.filterTextSelected]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.counter}>{filtered.length} survey{filtered.length !== 1 ? 's' : ''}</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => viewDetails(item)}>
              <View style={styles.rowHeader}>
                <Text style={styles.rowTitle} numberOfLines={1}>{item.siteName}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: COLORS[item.priority] }]}>
                  <Text style={styles.priorityText}>{item.priority}</Text>
                </View>
              </View>
              <Text style={styles.rowSubtitle}>{item.clientName}</Text>
              <Text style={styles.rowDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              <TouchableOpacity style={styles.deleteRowBtn} onPress={() => confirmDelete(item)}>
                <Text style={styles.deleteRowText}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No surveys found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#0a7ea4', textAlign: 'center', marginBottom: 12 },
  searchBox: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  searchInput: { height: 44, fontSize: 16 },
  filters: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 12 },
  filterChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#e0e0e0' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#444' },
  filterTextSelected: { color: '#fff' },
  counter: { fontSize: 13, color: '#888', marginHorizontal: 16, marginVertical: 10, fontWeight: '500' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  row: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#222', flex: 1, marginRight: 8 },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  priorityText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  rowSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  rowDate: { fontSize: 12, color: '#999', marginTop: 4 },
  deleteRowBtn: { alignSelf: 'flex-end', marginTop: 8 },
  deleteRowText: { color: '#d32f2f', fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 15 },
});
