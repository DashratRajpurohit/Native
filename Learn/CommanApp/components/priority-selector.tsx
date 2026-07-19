import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';

export type Priority = 'Low' | 'Medium' | 'High';

export type PrioritySelectorProps = {
  value: Priority;
  onChange: (priority: Priority) => void;
};

const OPTIONS: Priority[] = ['Low', 'Medium', 'High'];

const COLORS: Record<Priority, { bg: string; text: string }> = {
  Low: { bg: '#C8FF3D', text: Colors.dark },
  Medium: { bg: '#FFB800', text: Colors.dark },
  High: { bg: '#f9100c', text: '#FFFFFF' },
};

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>PRIORITY LEVEL</Text>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const selected = option === value;
          const config = COLORS[option];
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.8}
              style={[
                styles.chip,
                selected
                  ? { backgroundColor: config.bg, borderColor: Colors.dark }
                  : styles.chipUnselected,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                onChange(option);
              }}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: selected ? config.text : Colors.dark },
                ]}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? config.text : Colors.dark },
                ]}>
                {option.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.dark,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    gap: 6,
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
