import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Pressable, Modal, ActivityIndicator, Linking, RefreshControl } from 'react-native';
import { getContacts, createContact, deleteContact, updateContact } from '../../services/api';
import { useTheme } from '../../constants/ThemeContext';
import ConfirmModal from '../../components/ConfirmModal';
import ToastBanner from '../../components/ToastBanner';
import GraphicIllustration from '../../components/GraphicIllustration';
import { Ionicons } from '@expo/vector-icons';

export default function ContactsScreen() {
  const { theme } = useTheme();
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [name, setName] = useState('');
  const [courierCompany, setCourierCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const data = await getContacts();
      const list = Array.isArray(data) ? data : [];
      setContacts(list);
    } catch (_error) {
      showToast('Could not load contacts', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  const filteredContacts = useMemo(() => {
    if (searchQuery.trim() === '') {
      return contacts;
    }
    const q = searchQuery.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.courierCompany.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  }, [searchQuery, contacts]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getContacts();
        if (isMounted) {
          setContacts(Array.isArray(data) ? data : []);
        }
      } catch (_error) {
        if (isMounted) showToast('Could not load contacts', 'error');
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();
    return () => { isMounted = false; };
  }, [showToast]);



  const openAddModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setName(contact.name);
      setCourierCompany(contact.courierCompany);
      setPhone(contact.phone || '');
      setEmail(contact.email || '');
      setNotes(contact.notes || '');
    } else {
      setEditingContact(null);
      setName('');
      setCourierCompany('');
      setPhone('');
      setEmail('');
      setNotes('');
    }
    setModalVisible(true);
  };

  const handleSaveContact = async () => {
    if (!name.trim() || !courierCompany.trim()) {
      showToast('Name and Courier/Company are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = { name: name.trim(), courierCompany: courierCompany.trim(), phone: phone.trim(), email: email.trim(), notes: notes.trim() };
      if (editingContact) {
        await updateContact(editingContact._id, payload);
        showToast('Contact updated successfully', 'success');
      } else {
        await createContact(payload);
        showToast('New contact added', 'success');
      }
      setModalVisible(false);
      fetchContacts();
    } catch (error) {
      showToast(error.message || 'Failed to save contact', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContact(deleteTarget._id);
      showToast('Contact removed', 'success');
      setContacts(prev => prev.filter(c => c._id !== deleteTarget._id));
    } catch (error) {
      showToast(error.message || 'Failed to delete contact', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`).catch(() => showToast('Unable to open phone dialer', 'error'));
  };

  const handleEmail = (emailAddress) => {
    if (!emailAddress) return;
    Linking.openURL(`mailto:${emailAddress}`).catch(() => showToast('Unable to open email client', 'error'));
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.contactName, { color: theme.text }]}>{item.name}</Text>
          <Text style={styles.courierTag}>📦 {item.courierCompany}</Text>
        </View>
        <View style={styles.actionIcons}>
          <TouchableOpacity onPress={() => openAddModal(item)} style={styles.iconBtn}>
            <Ionicons name="pencil-outline" size={18} color={theme.subtext} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDeleteTarget(item)} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={18} color="#F87171" />
          </TouchableOpacity>
        </View>
      </View>

      {item.notes ? <Text style={[styles.notesText, { color: theme.subtext }]}>{item.notes}</Text> : null}

      <View style={styles.contactButtonsRow}>
        {item.phone ? (
          <TouchableOpacity 
            style={styles.callBtn} 
            onPress={() => handleCall(item.phone)}
          >
            <Ionicons name="call" size={14} color="#0B0F17" style={{ marginRight: 6 }} />
            <Text style={styles.callBtnText}>Call ({item.phone})</Text>
          </TouchableOpacity>
        ) : null}

        {item.email ? (
          <TouchableOpacity 
            style={[styles.emailBtn, { borderColor: '#FFEFB3' }]} 
            onPress={() => handleEmail(item.email)}
          >
            <Ionicons name="mail" size={14} color="#FFEFB3" style={{ marginRight: 6 }} />
            <Text style={styles.emailBtnText}>Email</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#FFEFB3" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {toast && <ToastBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <View style={styles.searchHeader}>
        <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={18} color={theme.subtext} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.inputText }]}
            placeholder="Search courier support or agents..."
            placeholderTextColor={theme.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => openAddModal()}
        >
          <Ionicons name="add" size={24} color="#0B0F17" />
        </TouchableOpacity>
      </View>

      {filteredContacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <GraphicIllustration type="contacts" size={90} />
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            {contacts.length === 0 ? "No courier contacts added yet." : "No matching contacts."}
          </Text>
          <TouchableOpacity style={styles.addFirstBtn} onPress={() => openAddModal()}>
            <Text style={styles.callBtnText}>+ Add Courier Agent</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchContacts(); }} tintColor="#FFEFB3" />
          }
        />
      )}

      {/* ADD/EDIT CONTACT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingContact ? 'Edit Contact' : 'Add Courier Contact'}
            </Text>

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
              placeholder="Agent / Support Name *"
              placeholderTextColor={theme.subtext}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
              placeholder="Courier / Company (e.g. FedEx, Amazon) *"
              placeholderTextColor={theme.subtext}
              value={courierCompany}
              onChangeText={setCourierCompany}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
              placeholder="Phone Number"
              placeholderTextColor={theme.subtext}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
              placeholder="Email Address"
              placeholderTextColor={theme.subtext}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
              placeholder="Notes (e.g. Regional Support Desk)"
              placeholderTextColor={theme.subtext}
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.cancelModalBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: '#FFEFB3' }]} onPress={handleSaveContact} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#0B0F17" /> : <Text style={styles.callBtnText}>Save Contact</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Contact?"
        message={`Are you sure you want to delete ${deleteTarget?.name}?`}
        confirmText="Delete"
        isDanger
        onConfirm={handleDeleteContact}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchHeader: { flexDirection: 'row', padding: 16, gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFEFB3', justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFEFB3', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#0B0F17', fontSize: 18, fontWeight: '800' },
  cardInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: '700' },
  courierTag: { fontSize: 13, fontWeight: '700', color: '#FFEFB3', marginTop: 2 },
  actionIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },
  notesText: { fontSize: 13, marginTop: 10, fontStyle: 'italic' },
  contactButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  callBtn: { backgroundColor: '#FFEFB3', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  callBtnText: { color: '#0B0F17', fontSize: 13, fontWeight: '700' },
  emailBtn: { backgroundColor: 'transparent', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  emailBtnText: { color: '#FFEFB3', fontSize: 13, fontWeight: '700' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { fontSize: 15, marginVertical: 16, textAlign: 'center' },
  addFirstBtn: { backgroundColor: '#FFEFB3', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalCard: { borderRadius: 16, padding: 20, borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  modalInput: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
  modalBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  cancelModalBtn: { backgroundColor: '#334155' },
  cancelBtnText: { color: '#FFF', fontWeight: '600' },
});
