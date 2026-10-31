import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useTheme } from '../constants/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ConfirmModal({ visible, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, isDanger = false }) {
  const { theme } = useTheme();
  const [scaleAnim] = useState(() => new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0.8);
    }
  }, [visible, scaleAnim]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container, 
            { 
              backgroundColor: theme.card, 
              borderColor: isDanger ? theme.danger : theme.primary,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.headerRow}>
            <Ionicons 
              name={isDanger ? "warning" : "shield-checkmark"} 
              size={28} 
              color={isDanger ? theme.danger : (theme.isDarkMode ? '#FFEFB3' : '#013E37')} 
            />
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          </View>

          <Text style={[styles.message, { color: theme.subtext }]}>{message}</Text>

          <View style={styles.buttonRow}>
            <Pressable 
              style={[styles.button, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]} 
              onPress={onCancel}
            >
              <Text style={[styles.cancelText, { color: theme.text }]}>{cancelText}</Text>
            </Pressable>
            
            <Pressable 
              style={[
                styles.button, 
                { backgroundColor: isDanger ? theme.danger : (theme.isDarkMode ? '#FFEFB3' : '#013E37') }
              ]} 
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, { color: isDanger ? '#FFF' : (theme.isDarkMode ? '#013E37' : '#FFEFB3') }]}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 26, 23, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    borderRadius: 24,
    padding: 26,
    borderWidth: 1.5,
    shadowColor: '#FFEFB3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 14,
    marginBottom: 26,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cancelText: {
    fontWeight: '700',
    fontSize: 14,
  },
  confirmText: {
    fontWeight: '800',
    fontSize: 14,
  },
});
