import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export type Priority = 'Low' | 'Medium' | 'High';

export type PrioritySelectorProps = {
  value: Priority;
  onChange: (priority: Priority) => void;
};

const OPTIONS: Priority[] = ['Low', 'Medium', 'High'];

const COLORS: Record<Priority, string> = {
  Low: '#1b8a3f',
  Medium: '#b7791f',
  High: '#d32f2f',
};

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <ThemedView style={styles.wrap}>
      <ThemedText style={styles.label}>Priority</ThemedText>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const selected = option === value;
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.8}
              style={[
                styles.chip,
                selected && { backgroundColor: COLORS[option] },
                selected && styles.selected,
              ]}
              onPress={() => onChange(option)}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: selected ? '#fff' : COLORS[option] },
                ]}
              />
              <ThemedText
                style={[styles.chipText, selected && styles.chipTextSelected]}>
                {option}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    gap: 8,
  },
  selected: {
    borderColor: 'transparent',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#fff',
  },
});
