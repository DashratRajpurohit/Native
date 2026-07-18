import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
  multiline?: boolean;
};

export function FormField({
  label,
  error,
  multiline = false,
  style,
  ...rest
}: FormFieldProps) {
  const borderColor = useThemeColor(
    { light: error ? '#d32f2f' : 'rgba(0,0,0,0.15)', dark: error ? '#ff6b6b' : 'rgba(255,255,255,0.2)' },
    'text',
  );

  return (
    <ThemedView style={styles.wrap}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          { borderColor, textAlignVertical: multiline ? 'top' : 'center' },
          style,
        ]}
        placeholderTextColor={useThemeColor(
          { light: '#9ba1a6', dark: '#687076' },
          'text',
        )}
        multiline={multiline}
        {...rest}
      />
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: {
    height: 100,
    paddingTop: 12,
  },
  error: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 6,
  },
});
