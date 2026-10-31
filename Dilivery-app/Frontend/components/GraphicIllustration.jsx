import React, { useEffect, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GraphicIllustration({ type = 'parcel', size = 80 }) {
  const [floatAnim] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // Gentle floating motion
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse halo ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim, pulseAnim]);

  const renderIcon = () => {
    const iconColor = '#FFEFB3'; // Always crisp Gold
    const iconSize = size * 0.48;

    switch (type) {
      case 'parcel':
      case 'box':
        return <Ionicons name="cube-outline" size={iconSize} color={iconColor} />;
      case 'shield':
        return <Ionicons name="shield-checkmark-outline" size={iconSize} color={iconColor} />;
      case 'camera':
        return <Ionicons name="camera-outline" size={iconSize} color={iconColor} />;
      case 'radar':
      case 'location':
        return <Ionicons name="location-outline" size={iconSize} color={iconColor} />;
      case 'contacts':
        return <Ionicons name="people-outline" size={iconSize} color={iconColor} />;
      case 'empty':
        return <Ionicons name="file-tray-outline" size={iconSize} color={iconColor} />;
      default:
        return <Ionicons name="sparkles-outline" size={iconSize} color={iconColor} />;
    }
  };

  return (
    <Animated.View style={[styles.outerContainer, { transform: [{ translateY: floatAnim }] }]}>
      <Animated.View 
        style={[
          styles.glowRing, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2, 
            borderColor: 'rgba(255, 239, 179, 0.25)',
            transform: [{ scale: pulseAnim }]
          }
        ]} 
      />
      <View style={[styles.iconBox, { width: size * 0.82, height: size * 0.82, borderRadius: (size * 0.82) / 2, backgroundColor: '#1A2332', borderColor: '#FFEFB344', borderWidth: 1 }]}>
        {renderIcon()}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
