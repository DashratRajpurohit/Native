import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type StatCardProps = {
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  value: string | number;
  label: string;
  color?: string;
};

export function StatCard({ icon, value, label, color }: StatCardProps) {
  const colorScheme = useColorScheme();
  const tint = color ?? Colors[colorScheme ?? 'light'].tint;

  return (
    <ThemedView style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: `${tint}22` }]}>
        <IconSymbol name={icon} size={24} color={tint} />
      </View>
      <ThemedText style={styles.value}>{value}</ThemedText>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 2,
  },
});
