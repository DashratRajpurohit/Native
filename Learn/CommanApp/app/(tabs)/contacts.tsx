import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { AppHeader } from '@/components/app-header';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Permission Denied',
          'Contacts permission is required to view field inspection contacts.'
        );
        return;
      }
    }

    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });
      const mapped: Contact[] = data.map((c) => ({
        id: c.id ?? `${c.name}-${Math.random()}`,
        name: c.name ?? 'Unknown Contact',
        phoneNumbers: c.phoneNumbers,
      }));
      mapped.sort((a, b) => a.name.localeCompare(b.name));
      setContacts(mapped);
    } catch {
      Alert.alert('Error', 'Failed to fetch contacts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContacts();
  }, []);

  const copyNumber = async (contact: Contact) => {
    const number = getPrimaryNumber(contact);
    if (!number) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('No Number Available', `${contact.name} has no phone number recorded.`);
      return;
    }
    await Clipboard.setStringAsync(number);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Contact Number Copied', `Copied ${number} to clipboard.`);
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <AppHeader title="Contacts Module" subtitle="Module 5 · Field Directory" />

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <IconSymbol name="magnifyingglass" size={18} color={Colors.dark} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts by name..."
            placeholderTextColor="#8679A8"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Counter Badge */}
        <View style={styles.counterRow}>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {filtered.length} {filtered.length === 1 ? 'CONTACT' : 'CONTACTS'}
              {query.length > 0 ? ` (OF ${contacts.length})` : ''}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.dark} />
            <Text style={styles.loadingText}>FETCHING CONTACTS...</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.dark}
              />
            }
            renderItem={({ item }) => {
              const number = getPrimaryNumber(item);
              return (
                <TouchableOpacity
                  style={styles.contactRow}
                  activeOpacity={0.8}
                  onPress={() => copyNumber(item)}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.number, !number && styles.noNumberText]}>
                      {number ?? 'No Number'}
                    </Text>
                  </View>

                  {number ? (
                    <View style={styles.copyIconBox}>
                      <IconSymbol name="doc.on.doc.fill" size={14} color={Colors.dark} />
                    </View>
                  ) : (
                    <View style={styles.disabledIconBox}>
                      <Text style={styles.dashText}>—</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIconBox}>
                  <IconSymbol name="person.crop.circle.badge.exclamationmark" size={40} color={Colors.dark} />
                </View>
                <Text style={styles.emptyTitle}>NO CONTACTS FOUND</Text>
                <Text style={styles.emptySub}>
                  {query
                    ? 'No contacts match your current search query.'
                    : 'No device contacts available or permission not granted.'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    paddingTop: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
  },
  clearSearchText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.dark,
    padding: 4,
  },
  counterRow: {
    marginHorizontal: 16,
    marginVertical: 12,
    alignItems: 'flex-start',
  },
  counterBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.dark,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.5,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.dark,
    fontSize: 16,
    fontWeight: '900',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.dark,
  },
  number: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  noNumberText: {
    color: Colors.danger,
    fontStyle: 'italic',
  },
  copyIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F0ECE3',
    borderWidth: 1.5,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashText: {
    color: Colors.dark,
    fontWeight: '900',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 10,
    marginTop: 20,
  },
  emptyIconBox: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    borderWidth: 2.5,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.dark,
  },
  emptySub: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
});
