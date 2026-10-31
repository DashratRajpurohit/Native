import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, ActivityIndicator, Share, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { getProofById, updateProofStatus, deleteProof, getImageUrl } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import ToastBanner from '../components/ToastBanner';
import { useTheme } from '../constants/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProofDetailsScreen() {
  const { theme } = useTheme();
  const { reportId } = useLocalSearchParams();

  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [apiError, setApiError] = useState('');

  const [deleteModal, setDeleteModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!reportId) return;
      try {
        const fetchedProof = await getProofById(reportId);
        if (isMounted) {
          setProof(fetchedProof);
          setApiError('');
        }
      } catch (error) {
        if (isMounted) setApiError(error.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [reportId]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (newStatus) => {
    if (proof.status === newStatus) return;
    
    setUpdating(true);
    try {
      const updatedProof = await updateProofStatus(proof.reportId, newStatus);
      setProof(updatedProof);
      showToast(`Proof is now marked as ${newStatus}`, 'success');
    } catch (error) {
      showToast(error.message || 'Update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProof(proof.reportId);
      showToast('Report deleted successfully', 'success');
      setTimeout(() => router.replace('/(tabs)/proofs'), 1000);
    } catch (error) {
      showToast(error.message || 'Failed to delete report', 'error');
    } finally {
      setDeleteModal(false);
    }
  };

  const handleShare = async () => {
    if (!proof) return;
    try {
      const shareMessage = `
📦 Delivery Chacker Evidence Report
--------------------------------
Report ID: ${proof.reportId}
Status: ${proof.status}
Created: ${new Date(proof.createdAt).toLocaleDateString()}

Order ID: ${proof.orderId}
Courier: ${proof.courier || 'N/A'}
Condition: ${proof.condition}
Description: ${proof.description || 'N/A'}

Location: ${proof.address || 'N/A'}
Coordinates: ${proof.latitude && proof.longitude ? `${proof.latitude}, ${proof.longitude}` : 'N/A'}
Photo Evidence: ${proof.photo ? getImageUrl(proof.photo) : 'N/A'}
--------------------------------
Generated via Delivery Chacker App
      `.trim();

      await Share.share({
        message: shareMessage,
        title: `Delivery Chacker Report - ${proof.reportId}`,
      });
    } catch (error) {
      showToast(error.message || 'Share failed', 'error');
    }
  };

  const copyReportId = async () => {
    if (!proof) return;
    await Clipboard.setStringAsync(proof.reportId);
    showToast('Report ID copied to clipboard', 'success');
  };

  const copyLocation = async () => {
    if (!proof) return;
    const locationString = `Address: ${proof.address || 'N/A'}\nCoordinates: ${proof.latitude && proof.longitude ? `${proof.latitude}, ${proof.longitude}` : 'N/A'}`;
    await Clipboard.setStringAsync(locationString);
    showToast('Location details copied to clipboard', 'success');
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (apiError || !proof) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" style={{ marginBottom: 12 }} />
        <Text style={styles.errorText}>{apiError || 'Proof report not found.'}</Text>
        <Pressable style={[styles.backButton, { backgroundColor: theme.primary }]} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const statuses = ['Submitted', 'In Progress', 'Resolved', 'Closed'];
  const currentIndex = statuses.indexOf(proof.status);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      {toast && <ToastBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>{proof.orderId}</Text>
          <Text style={[styles.reportIdText, { color: theme.subtext }]}>Report ID: {proof.reportId}</Text>
        </View>
        <StatusBadge status={proof.status} />
      </View>
      
      <Text style={[styles.dateText, { color: theme.subtext }]}>Logged: {new Date(proof.createdAt).toLocaleString()}</Text>

      {/* STATUS TIMELINE CARD */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Status Timeline</Text>
        
        <View style={styles.timelineRow}>
          {statuses.map((s, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;

            return (
              <React.Fragment key={s}>
                <View style={styles.timelineItem}>
                  <View style={[
                    styles.timelineDot,
                    isCompleted && styles.timelineDotCompleted,
                    isCurrent && { backgroundColor: theme.primary, transform: [{ scale: 1.2 }] },
                    isFuture && styles.timelineDotFuture
                  ]}>
                    {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[
                    styles.timelineText,
                    { color: isCurrent ? theme.primary : isCompleted ? '#10B981' : theme.subtext },
                    isCurrent && { fontWeight: '700' }
                  ]}>{s}</Text>
                </View>
                {index < statuses.length - 1 && (
                  <View style={[
                    styles.timelineLine,
                    index < currentIndex && styles.timelineLineCompleted
                  ]} />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* STATUS SELECTOR */}
        <Text style={[styles.devLabel, { color: theme.subtext }]}>Update Report Status:</Text>
        {updating ? (
           <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 10 }} />
        ) : (
          <View style={styles.statusButtonsContainer}>
            {statuses.map(s => (
              <TouchableOpacity 
                key={`btn-${s}`}
                style={[
                  styles.statusButton, 
                  { backgroundColor: proof.status === s ? theme.primary : theme.inputBg }
                ]}
                onPress={() => handleStatusChange(s)}
              >
                <Text style={[
                  styles.statusButtonText, 
                  { color: proof.status === s ? theme.buttonText : theme.subtext },
                  proof.status === s && { fontWeight: '800' }
                ]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* PARCEL DETAILS CARD */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Parcel & Claim Info</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>Order / Tracking ID:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{proof.orderId}</Text>
        </View>
        
        {proof.courier ? (
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.subtext }]}>Courier Service:</Text>
            <Text style={[styles.value, { color: theme.text }]}>{proof.courier}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>Package Condition:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{proof.condition}</Text>
        </View>

        {proof.description ? (
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.subtext }]}>Description / Notes:</Text>
            <Text style={[styles.value, { color: theme.text }]}>{proof.description}</Text>
          </View>
        ) : null}
      </View>

      {/* LOCATION EVIDENCE CARD */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Location Verification</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>Delivery Address:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{proof.address || 'Not provided'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>GPS Coordinates:</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {proof.latitude && proof.longitude ? `${proof.latitude}, ${proof.longitude}` : 'Not provided'}
          </Text>
        </View>
      </View>

      {/* PHOTO EVIDENCE CARD */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>Photo Evidence</Text>
        {proof.photo ? (
          <Image source={{ uri: getImageUrl(proof.photo) }} style={styles.evidenceImage} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <Ionicons name="camera-outline" size={32} color={theme.subtext} />
            <Text style={[styles.placeholderText, { color: theme.subtext }]}>No photo uploaded</Text>
          </View>
        )}
      </View>

      {/* BUTTON ACTIONS */}
      <View style={styles.buttonContainer}>
        <View style={styles.copyButtonsRow}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.primary }]} onPress={copyReportId}>
            <Ionicons name="copy-outline" size={18} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.actionButtonText, { color: theme.primary }]}>Copy ID</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.primary }]} onPress={copyLocation}>
            <Ionicons name="location-outline" size={18} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.actionButtonText, { color: theme.primary }]}>Copy Location</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.primary }]} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color={theme.buttonText} style={{ marginRight: 8 }} />
          <Text style={[styles.shareButtonText, { color: theme.buttonText }]}>Share Proof Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteModal(true)}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
          <Text style={styles.deleteBtnText}>Delete This Report</Text>
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={deleteModal}
        title="Delete Proof Report?"
        message={`Are you sure you want to permanently delete report ${proof.reportId}?`}
        confirmText="Delete"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  content: { padding: 20, paddingBottom: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 24, fontWeight: '800' },
  reportIdText: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  dateText: { fontSize: 13, marginBottom: 20 },
  card: { borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingTop: 6 },
  timelineItem: { alignItems: 'center', flex: 1 },
  timelineDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  timelineDotCompleted: { backgroundColor: '#10B981' },
  timelineDotFuture: { backgroundColor: '#475569' },
  checkmark: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  timelineLine: { height: 3, backgroundColor: '#475569', flex: 1, marginHorizontal: -12, marginTop: -14 },
  timelineLineCompleted: { backgroundColor: '#10B981' },
  timelineText: { fontSize: 10, textAlign: 'center', marginTop: 6 },
  devLabel: { fontSize: 12, marginBottom: 8, marginTop: 4 },
  statusButtonsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  statusButtonText: { fontSize: 12 },
  row: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  value: { fontSize: 15 },
  evidenceImage: { width: '100%', height: 250, borderRadius: 12 },
  placeholderImage: { width: '100%', height: 140, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 13, marginTop: 6 },
  buttonContainer: { gap: 14, marginTop: 10 },
  copyButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  actionButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1 },
  actionButtonText: { fontSize: 14, fontWeight: '700' },
  shareButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  shareButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1, borderColor: '#EF4444' },
  deleteBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '700' },
  errorText: { fontSize: 16, color: '#EF4444', marginBottom: 20, textAlign: 'center' },
  backButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  backButtonText: { color: '#FFF', fontWeight: '700' },
});
