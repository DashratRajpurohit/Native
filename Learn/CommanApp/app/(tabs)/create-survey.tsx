import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { FormField } from '@/components/form-field';
import { PrioritySelector, type Priority } from '@/components/priority-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Errors = {
  siteName?: string;
  clientName?: string;
  description?: string;
};

export default function CreateSurveyScreen() {
  const [siteName, setSiteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): boolean => {
    const next: Errors = {};
    if (!siteName.trim()) next.siteName = 'Site name is required.';
    if (!clientName.trim()) next.clientName = 'Client name is required.';
    if (!description.trim()) next.description = 'Description is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    Alert.alert(
      'Survey Created',
      `Site: ${siteName}\nClient: ${clientName}\nPriority: ${priority}\nDate: ${date}`,
      [{ text: 'OK', onPress: resetForm }],
    );
  };

  const resetForm = () => {
    setSiteName('');
    setClientName('');
    setDescription('');
    setPriority('Medium');
    setDate(new Date().toISOString().split('T')[0]);
    setErrors({});
  };

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Create Survey" subtitle="Fill in the survey details" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.card}>
          <FormField
            label="Site Name *"
            placeholder="e.g. Water Pipeline Sector 12"
            value={siteName}
            onChangeText={setSiteName}
            error={errors.siteName}
          />
          <FormField
            label="Client Name *"
            placeholder="e.g. Nagpur Municipal Corp."
            value={clientName}
            onChangeText={setClientName}
            error={errors.clientName}
          />
          <FormField
            label="Description *"
            placeholder="Brief about the inspection task"
            value={description}
            onChangeText={setDescription}
            multiline
            error={errors.description}
          />
          <PrioritySelector value={priority} onChange={setPriority} />
          <FormField
            label="Date"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
          />
        </ThemedView>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
          <ThemedText style={styles.submitText}>Create Survey</ThemedText>
        </TouchableOpacity>
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
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
