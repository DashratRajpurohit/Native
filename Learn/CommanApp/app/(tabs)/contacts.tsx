import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Contacts from 'expo-contacts';

type PhoneNumber = { number?: string; label?: string };

type Contact = {
  id: string;
  name: string;
  phoneNumbers?: PhoneNumber[];
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getPrimaryNumber(contact: Contact): string | null {
  return contact.phoneNumbers?.[0]?.number ?? null;
}

export default function ContactsScreen() {
  const [permission, setPermission] = useState<Contacts.ContactsPermissionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');

  const loadContacts = async () => {
    let status = permission;
    if (!status?.granted) {
      status = await Contacts.requestPermissionsAsync();
      setPermission(status);
      if (!status.granted) {
        setLoading(false);
        setRefreshing(false);
        Alert.alert('Permission denied', 'Contacts permission is required to view your contacts.');
        return;
      }
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    });
    const mapped: Contact[] = data.map((c) => ({
      id: c.id ?? `${c.name}-${Math.random()}`,
      name: c.name ?? 'Unknown',
      phoneNumbers: c.phoneNumbers,
    }));
    mapped.sort((a, b) => a.name.localeCompare(b.name));
    setContacts(mapped);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContacts();
  }, []);

  const copyNumber = (contact: Contact) => {
    const number = getPrimaryNumber(contact);
    if (!number) {
      Alert.alert('No Number', 'This contact has no phone number.');
      return;
    }
    Clipboard.setString(number);
    Alert.alert('Copied', `Copied ${number} to clipboard.`);
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Loading contacts…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Contacts</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <Text style={styles.counter}>
        {filtered.length} {filtered.length === 1 ? 'contact' : 'contacts'}
        {query.length > 0 ? ` (of ${contacts.length})` : ''}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />
        }
        renderItem={({ item }) => {
          const number = getPrimaryNumber(item);
          return (
            <TouchableOpacity style={styles.contactRow} onPress={() => copyNumber(item)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.number}>{number ?? 'No Number'}</Text>
              </View>
              {number ? (
                <Text style={styles.copyIcon}>⧉</Text>
              ) : (
                <Text style={styles.noNumIcon}>—</Text>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No contacts found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0a7ea4',
    textAlign: 'center',
    marginBottom: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  searchBox: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  searchInput: {
    height: 44,
    fontSize: 16,
  },
  counter: {
    fontSize: 13,
    color: '#888',
    marginHorizontal: 16,
    marginVertical: 10,
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  number: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  copyIcon: {
    fontSize: 20,
    color: '#0a7ea4',
  },
  noNumIcon: {
    fontSize: 20,
    color: '#bbb',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 15,
  },
});
