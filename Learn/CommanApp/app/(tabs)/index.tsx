import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import { AppHeader } from '@/components/app-header';
import { QuickActionCard } from '@/components/quick-action-card';
import { RecentSurveySummary, type SurveySummary } from '@/components/recent-survey-summary';
import { StatCard } from '@/components/stat-card';
import { StudentCard } from '@/components/student-card';
import { Colors } from '@/constants/theme';
import { loadSurveys, type Survey } from '@/constants/survey';

const STUDENT = {
  name: 'Dashrat Rajpurohit',
  rollNo: '21CS014',
  course: 'B.Tech CSE',
  semester: '6',
};

export default function DashboardScreen() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    const data = await loadSurveys();
    setSurveys(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSurveys();
    }, [fetchSurveys])
  );

  const totalCount = surveys.length;
  const completedCount = surveys.filter(
    (s) => !s.status || s.status === 'completed'
  ).length;
  const pendingCount = surveys.filter((s) => s.status === 'pending').length;

  const recentSummaries: SurveySummary[] = surveys
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      title: s.siteName,
      location: s.clientName || 'Field Site',
      time: s.date || new Date(s.createdAt).toLocaleDateString(),
      status: s.status ?? 'completed',
    }));

  return (
    <SafeAreaView style={styles.safeContainer}>
      <AppHeader
        title="Field Inspection"
        subtitle={`Welcome, ${STUDENT.name.split(' ')[0]}!`}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchSurveys}
            tintColor={Colors.dark}
          />
        }>
        {/* Student Details Card */}
        <StudentCard student={STUDENT} />

        {/* Today's Survey Count */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SURVEY METRICS</Text>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE DYNAMIC</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="chart.bar.fill"
            value={totalCount}
            label="Total Surveys"
            color={Colors.primary}
          />
          <StatCard
            icon="checkmark.circle.fill"
            value={completedCount}
            label="Completed"
            color={Colors.primary}
          />
          <StatCard
            icon="clock.fill"
            value={pendingCount}
            label="Pending"
            color="#FFB800"
          />
        </View>

        {/* Quick Action Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsRow}>
          <QuickActionCard
            icon="plus.circle.fill"
            title="New Survey"
            subtitle="Start inspection"
            color={Colors.primary}
            href="/create-survey"
          />
          <QuickActionCard
            icon="camera.fill"
            title="Camera"
            subtitle="Capture photo"
            color="#FFB800"
            href="/camera"
          />
          <QuickActionCard
            icon="location.fill"
            title="Location"
            subtitle="GPS Tagging"
            color={Colors.primary}
            href="/location"
          />
          <QuickActionCard
            icon="book.fill"
            title="Contacts"
            subtitle="Directory"
            color="#FFB800"
            href="/contacts"
          />
          <QuickActionCard
            icon="doc.on.clipboard.fill"
            title="Clipboard"
            subtitle="Paste tools"
            color={Colors.primary}
            href="/clipboard"
          />
          <QuickActionCard
            icon="clock.fill"
            title="History"
            subtitle="All records"
            color="#FFB800"
            href="/survey-history"
          />
        </ScrollView>

        {/* Recent Survey Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT SUMMARY</Text>
        </View>

        <RecentSurveySummary surveys={recentSummaries} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  liveText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionsRow: {
    paddingRight: 8,
  },
});
