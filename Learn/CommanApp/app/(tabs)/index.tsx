import { ScrollView, StyleSheet } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { QuickActionCard } from '@/components/quick-action-card';
import { RecentSurveySummary } from '@/components/recent-survey-summary';
import { StatCard } from '@/components/stat-card';
import { StudentCard } from '@/components/student-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const STUDENT = {
  name: 'Dashrat Rajpurohit',
  rollNo: '21CS014',
  course: 'B.Tech CSE',
  semester: '6',
};

const TODAY_COUNTS = [
  { icon: 'chart.bar.fill' as const, value: 12, label: 'Surveys Today' },
  { icon: 'checkmark.circle.fill' as const, value: 9, label: 'Completed' },
  { icon: 'clock.fill' as const, value: 3, label: 'Pending' },
];

const RECENT_SURVEYS = [
  {
    id: '1',
    title: 'Water Pipeline Inspection',
    location: 'Sector 12, Nagpur',
    time: '10:30 AM',
    status: 'completed' as const,
  },
  {
    id: '2',
    title: 'School Building Survey',
    location: 'Ward 4, Nagpur',
    time: '12:15 PM',
    status: 'completed' as const,
  },
  {
    id: '3',
    title: 'Road Condition Check',
    location: 'MH Highway 64',
    time: 'Pending',
    status: 'pending' as const,
  },
];

export default function DashboardScreen() {
  return (
    <ThemedView style={styles.container}>
          <AppHeader title="Smart Survey" subtitle="Welcome back, Dashrat!" />


      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <StudentCard student={STUDENT} />

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Today&apos;s Survey Count
        </ThemedText>
        <ThemedView style={styles.statsRow}>
          {TODAY_COUNTS.map((c) => (
            <StatCard
              key={c.label}
              icon={c.icon}
              value={c.value}
              label={c.label}
            />
          ))}
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Quick Actions
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsRow}>
          <QuickActionCard
            icon="camera.fill"
            title="New Survey"
            subtitle="Capture & record"
            href="/create-survey"
          />
          <QuickActionCard
            icon="book.fill"
            title="Contacts"
            subtitle="Field contacts"
            href="/contacts"
          />
          <QuickActionCard
            icon="location.fill"
            title="Locate"
            subtitle="GPS tagging"
            href="/fieldvisit"
          />
          <QuickActionCard
            icon="doc.text.fill"
            title="Reports"
            subtitle="View summaries"
            href="/explore"
          />
        </ScrollView>

        <RecentSurveySummary surveys={RECENT_SURVEYS} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionsRow: {
    paddingRight: 8,
  },
});
