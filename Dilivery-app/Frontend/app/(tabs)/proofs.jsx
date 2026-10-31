import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, TextInput, RefreshControl, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getProofs, deleteProof } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import ToastBanner from '../../components/ToastBanner';
import GraphicIllustration from '../../components/GraphicIllustration';
import { useTheme } from '../../constants/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProofsScreen() {
  const { theme } = useTheme();
  const [allProofs, setAllProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Modal & Toast state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const filters = ['All', 'Submitted', 'In Progress', 'Resolved', 'Closed'];

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadProofs = useCallback(async () => {
    try {
      const data = await getProofs();
      setAllProofs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load proofs from backend:', error);
      showToast('Failed to load proof reports', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  const filteredProofs = useMemo(() => {
    let result = Array.isArray(allProofs) ? allProofs : [];

    if (activeFilter !== 'All') {
      result = result.filter(proof => proof.status === activeFilter);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(proof => 
        (proof.orderId && proof.orderId.toLowerCase().includes(query)) ||
        (proof.reportId && proof.reportId.toLowerCase().includes(query)) ||
        (proof.courier && proof.courier.toLowerCase().includes(query))
      );
    }

    return result;
  }, [allProofs, searchQuery, activeFilter]);

  useFocusEffect(
    useCallback(() => {
      loadProofs();
    }, [loadProofs])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProofs();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProof(deleteTarget.reportId);
      showToast(`Proof ${deleteTarget.reportId} deleted successfully`, 'success');
      setAllProofs(prev => prev.filter(p => p.reportId !== deleteTarget.reportId));
    } catch (error) {
      showToast(error.message || 'Failed to delete proof', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable 
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
      onPress={() => router.push({
        pathname: '/proof-details',
        params: { reportId: item.reportId }
      })}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{item.orderId}</Text>
        <StatusBadge status={item.status} />
      </View>
      
      <Text style={[styles.cardText, { color: theme.subtext }]}>ID: {item.reportId} {item.courier ? `• ${item.courier}` : ''}</Text>
      <Text style={[styles.cardText, { color: theme.subtext }]}>Condition: {item.condition}</Text>
      
      <View style={[styles.cardFooter, { borderTopColor: theme.cardBorder }]}>
        <Text style={[styles.cardDate, { color: theme.subtext }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>

        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => setDeleteTarget(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#F87171" />
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#FFEFB3" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {toast && <ToastBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={18} color={theme.subtext} style={{ marginRight: 8 }} />
          <TextInput 
            style={[styles.searchInput, { color: theme.inputText }]}
            placeholder="Search Order ID, Report ID, Courier..."
            placeholderTextColor={theme.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.subtext} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable 
              style={[
                styles.filterChip, 
                { 
                  backgroundColor: activeFilter === item ? '#FFEFB3' : theme.card, 
                  borderColor: activeFilter === item ? '#FFEFB3' : theme.cardBorder 
                }
              ]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[
                styles.filterText,
                { color: activeFilter === item ? '#0B0F17' : theme.subtext }
              ]}>
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* LIST OF PROOFS */}
      {filteredProofs.length === 0 ? (
        <View style={styles.emptyState}>
          <GraphicIllustration type="empty" size={80} />
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            {allProofs.length === 0 ? "No parcel claim logs recorded yet." : "No matching claim logs found."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProofs}
          keyExtractor={(item) => item._id || item.reportId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFEFB3" />
          }
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Claim Log?"
        message={`Are you sure you want to delete report ${deleteTarget?.reportId}? This action cannot be undone.`}
        confirmText="Delete Log"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 16, paddingBottom: 8 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },
  filtersContainer: { paddingHorizontal: 16, marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 50 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 14, marginTop: 14, textAlign: 'center', fontWeight: '600' },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardText: { fontSize: 13, marginBottom: 3 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1 },
  cardDate: { fontSize: 11, fontWeight: '500' },
  deleteBtn: { padding: 4 },
});
