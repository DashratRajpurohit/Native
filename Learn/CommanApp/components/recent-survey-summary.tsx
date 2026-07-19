import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
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
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>RECENT SURVEYS</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{surveys.length} TOTAL</Text>
        </View>
      </View>
      {surveys.length === 0 ? (
        <View style={styles.emptyWrap}>
          <IconSymbol name="tray.fill" size={32} color={Colors.light.textMuted} />
          <Text style={styles.empty}>No surveys recorded yet.</Text>
        </View>
      ) : (
        surveys.map((s) => (
          <View key={s.id} style={styles.item}>
            <View style={styles.itemLeft}>
              <View style={styles.iconBox}>
                <IconSymbol name="location.fill" size={16} color={Colors.dark} />
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {s.title}
                </Text>
                <Text style={styles.itemSub} numberOfLines={1}>
                  {s.location} · {s.time}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                s.status === 'completed' ? styles.done : styles.pending,
              ]}>
              <IconSymbol
                name={
                  s.status === 'completed'
                    ? 'checkmark.circle.fill'
                    : 'clock.fill'
                }
                size={12}
                color={s.status === 'completed' ? '#007A3D' : '#8A5D00'}
              />
              <Text
                style={[
                  styles.statusText,
                  s.status === 'completed'
                    ? styles.doneText
                    : styles.pendingText,
                ]}>
                {s.status === 'completed' ? 'DONE' : 'PENDING'}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(45, 27, 105, 0.1)',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.dark,
  },
  badgeText: {
    color: Colors.dark,
    fontSize: 10,
    fontWeight: '900',
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  empty: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textMuted,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45, 27, 105, 0.08)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    marginLeft: 10,
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.dark,
  },
  itemSub: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.dark,
    gap: 4,
  },
  done: {
    backgroundColor: '#C8FF3D',
  },
  pending: {
    backgroundColor: '#FFE600',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  doneText: {
    color: Colors.dark,
  },
  pendingText: {
    color: Colors.dark,
  },
});
