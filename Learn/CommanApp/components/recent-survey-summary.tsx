import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export type SurveySummary = {
  id: string;
  title: string;
  location: string;
  time: string;
  status: 'completed' | 'pending';
};

export type RecentSurveySummaryProps = {
  surveys: SurveySummary[];
};

export function RecentSurveySummary({ surveys }: RecentSurveySummaryProps) {
  return (
    <ThemedView style={styles.card}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle">Recent Surveys</ThemedText>
        <IconSymbol name="list.bullet" size={20} color="#687076" />
      </View>
      {surveys.length === 0 ? (
        <ThemedText style={styles.empty}>No surveys recorded yet.</ThemedText>
      ) : (
        surveys.map((s) => (
          <View key={s.id} style={styles.item}>
            <View style={styles.itemLeft}>
              <IconSymbol
                name="location.fill"
                size={18}
                color="#0a7ea4"
              />
              <View style={styles.itemText}>
                <ThemedText style={styles.itemTitle}>{s.title}</ThemedText>
                <ThemedText style={styles.itemSub}>
                  {s.location} · {s.time}
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                s.status === 'completed' ? styles.done : styles.pending,
              ]}>
              <IconSymbol
                name={
                  s.status === 'completed' ? 'checkmark.circle.fill' : 'clock.fill'
                }
                size={14}
                color={s.status === 'completed' ? '#1b8a3f' : '#b7791f'}
              />
              <ThemedText
                style={[
                  styles.statusText,
                  s.status === 'completed' ? styles.doneText : styles.pendingText,
                ]}>
                {s.status === 'completed' ? 'Done' : 'Pending'}
              </ThemedText>
            </View>
          </View>
        ))
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  empty: {
    fontSize: 14,
    opacity: 0.6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemText: {
    marginLeft: 10,
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  done: {
    backgroundColor: 'rgba(27,138,63,0.12)',
  },
  pending: {
    backgroundColor: 'rgba(183,121,31,0.12)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  doneText: {
    color: '#1b8a3f',
  },
  pendingText: {
    color: '#b7791f',
  },
});
