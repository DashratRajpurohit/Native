import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { Colors } from '@/constants/theme';

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
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor="#8679A8"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}
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
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: Colors.dark,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  inputError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  multiline: {
    height: 100,
    paddingTop: 12,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 6,
  },
});
