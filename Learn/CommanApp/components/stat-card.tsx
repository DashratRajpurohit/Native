import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export type StatCardProps = {
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  value: string | number;
  label: string;
  color?: string;
};

export function StatCard({ icon, value, label, color }: StatCardProps) {
  const badgeBg = color ?? Colors.primary;

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: badgeBg }]}>
        <IconSymbol name={icon} size={22} color={Colors.dark} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3.5, height: 3.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  value: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.dark,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
