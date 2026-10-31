import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeContext';

export default function ToastBanner({ message, type = 'info', onClose }) {
  const { theme } = useTheme();
  const [slideAnim] = useState(() => new Animated.Value(-100));

  useEffect(() => {
    if (message) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }).start();
    }
  }, [message, slideAnim]);

  if (!message) return null;

  const config = {
    info: { border: '#FFEFB3', icon: 'information-circle', bg: 'rgba(1, 62, 55, 0.95)' },
    success: { border: '#10B981', icon: 'checkmark-circle', bg: 'rgba(1, 62, 55, 0.95)' },
    error: { border: '#F43F5E', icon: 'alert-circle', bg: 'rgba(1, 62, 55, 0.95)' },
  }[type] || { border: '#FFEFB3', icon: 'information-circle', bg: 'rgba(1, 62, 55, 0.95)' };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          borderColor: config.border, 
          backgroundColor: config.bg,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Ionicons name={config.icon} size={22} color={config.border} style={{ marginRight: 10 }} />
      <Text style={[styles.text, { color: theme.isDarkMode ? '#FFEFB3' : '#FFF' }]}>{message}</Text>
      {onClose ? (
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={18} color={theme.subtext} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    borderWidth: 1.5,
    shadowColor: '#FFEFB3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    letterSpacing: 0.3,
  },
  closeButton: {
    paddingLeft: 10,
  },
});
