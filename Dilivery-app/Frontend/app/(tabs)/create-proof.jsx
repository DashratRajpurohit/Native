import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../constants/ThemeContext';
import GraphicIllustration from '../../components/GraphicIllustration';
import { Ionicons } from '@expo/vector-icons';

export default function CreateProofScreen() {
  const { theme } = useTheme();
  const [orderId, setOrderId] = useState('');
  const [courier, setCourier] = useState('');
  const [condition, setCondition] = useState('Damaged Box');
  const [description, setDescription] = useState('');

  const conditions = [
    'Damaged Box', 
    'Open / Tampered', 
    'Missing Items', 
    'Wrong Item Delivered',
    'Wet / Stained',
    'Perfect Condition'
  ];

  const handleNext = () => {
    if (!orderId.trim()) {
      Alert.alert('Missing Field', 'Please enter an Order ID or Tracking Number.');
      return;
    }

    router.push({
      pathname: '/camera',
      params: {
        orderId: orderId.trim(),
        courier: courier.trim(),
        condition,
        description: description.trim(),
      }
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>Log Parcel Proof</Text>
          <Text style={[styles.subtitle, { color: '#FFEFB3' }]}>Step 1 of 3: Enter parcel details</Text>
        </View>
        <GraphicIllustration type="box" size={60} />
      </View>

      {/* STEP PROGRESS BAR */}
      <View style={[styles.progressTrack, { backgroundColor: theme.cardBorder }]}>
        <View style={[styles.progressBar, { backgroundColor: '#FFEFB3', width: '33.3%' }]} />
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Order ID / Tracking Number *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
            placeholder="e.g. ORD-98234 or AMZ-102938"
            placeholderTextColor={theme.subtext}
            value={orderId}
            onChangeText={setOrderId}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Courier / Delivery Service</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
            placeholder="e.g. FedEx, DHL, Amazon, BlueDart"
            placeholderTextColor={theme.subtext}
            value={courier}
            onChangeText={setCourier}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Package Condition *</Text>
          <View style={styles.chipContainer}>
            {conditions.map((item) => {
              const isSelected = condition === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: isSelected ? '#FFEFB3' : theme.inputBg,
                      borderColor: isSelected ? '#FFEFB3' : theme.inputBorder 
                    }
                  ]}
                  onPress={() => setCondition(item)}
                >
                  <Text style={[styles.chipText, { color: isSelected ? '#0B0F17' : theme.subtext }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Detailed Description / Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
            placeholder="Describe the issue, missing items, or damage in detail..."
            placeholderTextColor={theme.subtext}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <Pressable style={[styles.button, { backgroundColor: '#FFEFB3' }]} onPress={handleNext}>
          <Text style={[styles.buttonText, { color: '#0B0F17' }]}>Next: Take Evidence Photo</Text>
          <Ionicons name="arrow-forward" size={20} color="#0B0F17" style={{ marginLeft: 8 }} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 40 },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  subtitle: { fontSize: 13, fontWeight: '600' },
  progressTrack: { height: 5, borderRadius: 3, width: '100%', marginBottom: 18, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 },
  card: { borderRadius: 16, padding: 18, borderWidth: 1 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14 },
  textArea: { height: 90, textAlignVertical: 'top' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '700' },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: { fontSize: 16, fontWeight: '800' },
});
