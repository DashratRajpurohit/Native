import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function StatusBadge({ status, style }) {
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const getStatusStyle = (currentStatus) => {
    switch (currentStatus) {
      case 'Submitted':
        return { bg: 'rgba(255, 239, 179, 0.12)', border: '#FFEFB3', text: '#FFEFB3', dot: '#FFEFB3' };
      case 'In Progress':
        return { bg: 'rgba(96, 165, 250, 0.12)', border: '#60A5FA', text: '#60A5FA', dot: '#60A5FA' };
      case 'Resolved':
        return { bg: 'rgba(52, 211, 153, 0.12)', border: '#34D399', text: '#34D399', dot: '#34D399' };
      case 'Closed':
        return { bg: 'rgba(148, 163, 184, 0.12)', border: '#94A3B8', text: '#94A3B8', dot: '#94A3B8' };
      default:
        return { bg: 'rgba(255, 239, 179, 0.12)', border: '#FFEFB3', text: '#FFEFB3', dot: '#FFEFB3' };
    }
  };

  const colors = getStatusStyle(status);

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }, style]}>
      <Animated.View 
        style={[
          styles.dot, 
          { backgroundColor: colors.dot, transform: [{ scale: pulseAnim }] }
        ]} 
      />
      <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
