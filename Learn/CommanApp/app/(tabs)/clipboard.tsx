import { useEffect, useState } from 'react';
import {
  Alert,
  Clipboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

function generateSurveyId(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SRV-${new Date().getFullYear()}-${rand}`;
}

export default function ClipboardScreen() {
  const [surveyId, setSurveyId] = useState(generateSurveyId());
  const [notes, setNotes] = useState('');
  const [pasted, setPasted] = useState('');

  useEffect(() => {
    // nothing to fetch on mount
  }, []);

  const copySurveyId = () => {
    Clipboard.setString(surveyId);
    Alert.alert('Copied', `Survey ID copied: ${surveyId}`);
  };

  const copyContactNumber = () => {
    const number = '+919999888777';
    Clipboard.setString(number);
    Alert.alert('Copied', `Contact number copied: ${number}`);
  };

  const copyCurrentLocation = () => {
    const loc = 'Lat: 21.1458, Lng: 79.0882';
    Clipboard.setString(loc);
    Alert.alert('Copied', `Location copied: ${loc}`);
  };

  const pasteNotes = async () => {
    const text = await Clipboard.getString();
    setPasted(text);
    setNotes((prev) => (prev ? `${prev}\n${text}` : text));
  };

  const clearClipboard = () => {
    Alert.alert('Clear Clipboard', 'Remove the current clipboard content?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          Clipboard.setString('');
          setPasted('');
          Alert.alert('Cleared', 'Clipboard data cleared.');
        },
      },
    ]);
  };

  const regenerateId = () => setSurveyId(generateSurveyId());

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Clipboard Module</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Survey ID</Text>
        <Text style={styles.value}>{surveyId}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.btnPrimary} onPress={copySurveyId}>
            <Text style={styles.btnText}>Copy Survey ID</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGhost} onPress={regenerateId}>
            <Text style={styles.btnGhostText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact Number</Text>
        <Text style={styles.value}>+919999888777</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={copyContactNumber}>
          <Text style={styles.btnText}>Copy Contact Number</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Location</Text>
        <Text style={styles.value}>Lat: 21.1458, Lng: 79.0882</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={copyCurrentLocation}>
          <Text style={styles.btnText}>Copy Current Location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notes (Paste from Clipboard)</Text>
        <TextInput
          style={styles.notes}
          placeholder="Paste clipboard content into notes…"
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.btnSecondary} onPress={pasteNotes}>
          <Text style={styles.btnText}>Paste Notes</Text>
        </TouchableOpacity>
        {pasted.length > 0 ? (
          <Text style={styles.pastedHint}>Last pasted: {pasted}</Text>
        ) : null}
      </View>

      <TouchableOpacity style={styles.btnDanger} onPress={clearClipboard}>
        <Text style={styles.btnText}>Clear Clipboard Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0a7ea4',
    textAlign: 'center',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: '#e0f2f7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnGhost: {
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  btnGhostText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  btnDanger: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 30,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  notes: {
    height: 90,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    color: '#222',
    marginBottom: 12,
  },
  pastedHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
