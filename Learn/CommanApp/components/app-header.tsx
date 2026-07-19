import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DrawerMenu } from '@/components/drawer-menu';

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showNotification?: boolean;
  onNotificationPress?: () => void;
};

export function AppHeader({
  title,
  subtitle,
  showNotification = true,
  onNotificationPress,
}: AppHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDrawerOpen(true);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.menuBtn}
            activeOpacity={0.8}
            onPress={openDrawer}>
            <IconSymbol name="list.bullet" size={20} color={Colors.dark} />
          </TouchableOpacity>

          <View style={styles.textWrap}>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            <Text style={styles.title}>{title}</Text>
          </View>

          {showNotification ? (
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (onNotificationPress) onNotificationPress();
              }}>
              <IconSymbol name="bell.fill" size={20} color={Colors.dark} />
              <View style={styles.badge} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 42 }} />
          )}
        </View>
      </View>

      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderColor: Colors.dark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.dark,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.5,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
});
