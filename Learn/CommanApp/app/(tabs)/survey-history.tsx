import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { AppHeader } from '@/components/app-header';
import { Colors } from '@/constants/theme';
import { deleteSurvey, loadSurveys, type Priority, type Survey } from '@/constants/survey';
import { IconSymbol } from '@/components/ui/icon-symbol';

const PRIORITIES: ('All' | Priority)[] = ['All', 'Low', 'Medium', 'High'];

const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  Low: { bg: Colors.primary, text: Colors.dark },
  Medium: { bg: '#FFB800', text: Colors.dark },
  High: { bg: Colors.danger, text: '#FFF' },
};

export default function SurveyHistoryScreen() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | Priority>('All');

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    const data = await loadSurveys();
    data.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setSurveys(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSurveys();
    }, [fetchSurveys])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSurveys();
  }, [fetchSurveys]);

  const viewDetails = (survey: Survey) => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/survey-preview',
      params: { data: JSON.stringify(survey), mode: 'view' },
    });
  };

  const confirmDelete = (survey: Survey) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Survey',
      `Are you sure you want to delete "${survey.siteName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSurvey(survey.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setSurveys((prev) => prev.filter((s) => s.id !== survey.id));
          },
        },
      ]
    );
  };

  const filtered = surveys.filter((s) => {
    const matchesSearch =
      !query ||
      s.siteName.toLowerCase().includes(query.toLowerCase()) ||
      s.clientName.toLowerCase().includes(query.toLowerCase()) ||
      s.id.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'All' || s.priority === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.safeContainer}>
      <AppHeader title="Survey History" subtitle="Module 8 · Saved Inspection Logs" />

      <View style={styles.container}>
        {/* Search Input */}
        <View style={styles.searchBox}>
          <IconSymbol name="magnifyingglass" size={18} color={Colors.dark} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by site name, client, or ID..."
            placeholderTextColor="#8679A8"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersRow}>
          {PRIORITIES.map((p) => {
            const selected = filter === p;
            return (
              <TouchableOpacity
                key={p}
                activeOpacity={0.8}
                style={[
                  styles.filterChip,
                  selected && styles.filterChipSelected,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilter(p);
                }}>
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextSelected,
                  ]}>
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Counter Badge */}
        <View style={styles.counterRow}>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {filtered.length} {filtered.length === 1 ? 'SURVEY RECORD' : 'SURVEY RECORDS'}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.dark} />
            <Text style={styles.loadingText}>LOADING SURVEY RECORDS...</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.dark}
              />
            }
            renderItem={({ item }) => {
              const priorityConfig = PRIORITY_COLORS[item.priority];
              return (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => viewDetails(item)}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.siteName}
                    </Text>
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: priorityConfig.bg },
                      ]}>
                      <Text
                        style={[
                          styles.priorityText,
                          { color: priorityConfig.text },
                        ]}>
                        {item.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.clientText} numberOfLines={1}>
                    Client: {item.clientName}
                  </Text>
                  <Text style={styles.dateText}>
                    Date: {item.date || new Date(item.createdAt).toLocaleDateString()} · ID: {item.id}
                  </Text>

                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.viewBtn}
                      onPress={() => viewDetails(item)}>
                      <IconSymbol name="eye.fill" size={14} color={Colors.dark} />
                      <Text style={styles.viewBtnText}>VIEW</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => confirmDelete(item)}>
                      <IconSymbol name="trash.fill" size={14} color="#FFF" />
                      <Text style={styles.deleteBtnText}>DELETE</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIconBox}>
                  <IconSymbol name="doc.text.magnifyingglass" size={40} color={Colors.dark} />
                </View>
                <Text style={styles.emptyTitle}>NO SURVEYS FOUND</Text>
                <Text style={styles.emptySub}>
                  {surveys.length === 0
                    ? "You haven't submitted any field surveys yet. Tap 'New Survey' to create one!"
                    : 'No survey records match your search query or filter.'}
                </Text>
                {surveys.length === 0 ? (
                  <TouchableOpacity
                    style={styles.createBtn}
                    onPress={() => router.push('/create-survey')}>
                    <Text style={styles.createBtnText}>CREATE NEW SURVEY</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    paddingTop: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark,
  },
  clearSearchText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.dark,
    padding: 4,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.5,
  },
  filterTextSelected: {
    color: Colors.dark,
  },
  counterRow: {
    marginHorizontal: 16,
    marginVertical: 12,
    alignItems: 'flex-start',
  },
  counterBadge: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  counterText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3.5, height: 3.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.dark,
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.dark,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  clientText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textMuted,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(45, 27, 105, 0.08)',
    paddingTop: 10,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.dark,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewBtnText: {
    color: Colors.dark,
    fontWeight: '900',
    fontSize: 11,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: Colors.dark,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 11,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 12,
    marginTop: 20,
  },
  emptyIconBox: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.dark,
  },
  emptySub: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  createBtnText: {
    color: Colors.dark,
    fontWeight: '900',
    fontSize: 13,
  },
});
