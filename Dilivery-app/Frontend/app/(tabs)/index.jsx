import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProofs } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { useTheme } from '../../constants/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeDashboard() {
  const { theme } = useTheme();
  const [userName, setUserName] = useState('');
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const checkAuthAndLoadData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/login');
        return;
      }
      
      const name = await AsyncStorage.getItem('userName');
      setUserName(name || 'Agent');

      const data = await getProofs();
      setProofs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      checkAuthAndLoadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    checkAuthAndLoadData();
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const totalProofs = proofs.length;
  const submittedCount = proofs.filter(p => p.status === 'Submitted').length;
  const inProgressCount = proofs.filter(p => p.status === 'In Progress').length;
  const resolvedCount = proofs.filter(p => p.status === 'Resolved').length;

  const recentProofs = proofs.slice(0, 4);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
    >
      {/* PROFESSIONAL DASHBOARD HEADER */}
      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <Text style={styles.activeTag}>VERIFIED AGENT</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Welcome back, {userName}</Text>
        </View>
        <View style={styles.avatarOrb}>
          <Text style={styles.avatarText}>{userName ? userName.charAt(0).toUpperCase() : 'A'}</Text>
        </View>
      </View>

      {/* STATS METRICS GRID */}
      <View style={styles.statsGrid}>
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]} 
          onPress={() => router.push('/(tabs)/proofs')}
        >
          <Text style={styles.statNumber}>{totalProofs}</Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>TOTAL CLAIMS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]} 
          onPress={() => router.push('/(tabs)/proofs')}
        >
          <Text style={styles.statNumber}>{submittedCount}</Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>SUBMITTED</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]} 
          onPress={() => router.push('/(tabs)/proofs')}
        >
          <Text style={styles.statNumber}>{inProgressCount}</Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>IN PROGRESS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]} 
          onPress={() => router.push('/(tabs)/proofs')}
        >
          <Text style={styles.statNumber}>{resolvedCount}</Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>RESOLVED</Text>
        </TouchableOpacity>
      </View>

      {/* PRIMARY QUICK ACTION BANNER */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={styles.actionBanner}
          onPress={() => router.push('/(tabs)/create-proof')}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.actionBannerTitle}>LOG NEW PARCEL CLAIM</Text>
            <Text style={styles.actionBannerSub}>Capture photo evidence & location coords</Text>
          </View>
          <Ionicons name="add-circle" size={28} color="#0B0F17" />
        </TouchableOpacity>
      </View>

      {/* RECENT RECENT PROOF REPOSTS */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>RECENT CLAIMS</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/proofs')}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>
        
        {recentProofs.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="cube-outline" size={40} color="#FFEFB3" />
            <Text style={[styles.emptyText, { color: theme.subtext }]}>No delivery claims logged yet.</Text>
            <TouchableOpacity 
              style={styles.createBtn}
              onPress={() => router.push('/(tabs)/create-proof')}
            >
              <Text style={styles.createBtnText}>+ CREATE CLAIM</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentProofs.map((proof) => (
            <TouchableOpacity
              key={proof._id || proof.reportId}
              style={[styles.recentCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => router.push({
                pathname: '/proof-details',
                params: { reportId: proof.reportId }
              })}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{proof.orderId}</Text>
                <StatusBadge status={proof.status} />
              </View>
              <Text style={[styles.cardSubText, { color: theme.subtext }]}>ID: {proof.reportId} {proof.courier ? `• ${proof.courier}` : ''}</Text>
              <Text style={[styles.cardSubText, { color: theme.subtext }]}>Condition: {proof.condition}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardDate, { color: theme.subtext }]}>
                  {new Date(proof.createdAt).toLocaleDateString()}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#FFEFB3" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  badgeRow: { flexDirection: 'row', marginBottom: 4 },
  activeTag: { fontSize: 10, fontWeight: '800', color: '#FFEFB3', letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: '800' },
  avatarOrb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEFB3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#0B0F17', fontSize: 18, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  statNumber: { fontSize: 26, fontWeight: '900', color: '#FFEFB3', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  quickActionsContainer: { marginBottom: 20 },
  actionBanner: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#FFEFB3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionBannerTitle: { color: '#0B0F17', fontSize: 15, fontWeight: '900', letterSpacing: 0.5, marginBottom: 2 },
  actionBannerSub: { color: '#334155', fontSize: 12, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  viewAllText: { color: '#FFEFB3', fontWeight: '800', fontSize: 12 },
  recentCard: { borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSubText: { fontSize: 13, marginBottom: 3 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cardDate: { fontSize: 11 },
  emptyCard: { padding: 28, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  emptyText: { fontSize: 14, marginVertical: 12, fontWeight: '600' },
  createBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#FFEFB3' },
  createBtnText: { color: '#0B0F17', fontWeight: '800', fontSize: 13 },
});
