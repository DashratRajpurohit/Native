import React from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router, usePathname } from 'expo-router';

import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export type DrawerMenuProps = {
  visible: boolean;
  onClose: () => void;
};

type DrawerItem = {
  name: string;
  route: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
};

const DRAWER_ITEMS: DrawerItem[] = [
  { name: 'Dashboard', route: '/', icon: 'house.fill' },
  { name: 'Create Survey', route: '/create-survey', icon: 'plus.circle.fill' },
  { name: 'Camera', route: '/camera', icon: 'camera.fill' },
  { name: 'Contacts', route: '/contacts', icon: 'book.fill' },
  { name: 'Location', route: '/location', icon: 'location.fill' },
  { name: 'Clipboard', route: '/clipboard', icon: 'doc.on.clipboard.fill' },
  { name: 'Survey History', route: '/survey-history', icon: 'clock.fill' },
  { name: 'Profile & Settings', route: '/profile', icon: 'gearshape.fill' },
];

export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const pathname = usePathname();

  const handleNavigate = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    // Route matching logic
    if (route === '/') {
      router.push('/(tabs)');
    } else {
      router.push(route as any);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlayContainer}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Neo-Brutalist Drawer Sheet */}
        <View style={styles.drawerSheet}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View style={styles.brandBadge}>
                <Text style={styles.brandTitle}>FIELD APP</Text>
                <Text style={styles.brandTag}>IOS NEO-BRUTALISM</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  Haptics.selectionAsync();
                  onClose();
                }}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.menuList}>
              {DRAWER_ITEMS.map((item) => {
                const isActive =
                  pathname === item.route ||
                  (item.route === '/' && pathname === '/(tabs)');

                return (
                  <TouchableOpacity
                    key={item.route}
                    style={[
                      styles.menuItem,
                      isActive && styles.menuItemActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleNavigate(item.route)}>
                    <View
                      style={[
                        styles.iconWrap,
                        isActive && styles.iconWrapActive,
                      ]}>
                      <IconSymbol
                        name={item.icon}
                        size={20}
                        color={isActive ? Colors.dark : Colors.primary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.menuText,
                        isActive && styles.menuTextActive,
                      ]}>
                      {item.name}
                    </Text>
                    {isActive ? (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>ACTIVE</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Smart Survey v1.0.0</Text>
              <Text style={styles.footerSub}>Expo SDK 54 · iOS Brutalism</Text>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(45, 27, 105, 0.65)',
  },
  drawerSheet: {
    width: '82%',
    maxWidth: 320,
    height: '100%',
    backgroundColor: Colors.dark,
    borderRightWidth: 3,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  safeArea: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  brandBadge: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000',
  },
  brandTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 16,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 1,
  },
  brandTag: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.dark,
    opacity: 0.8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.danger,
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.3,
    marginVertical: 10,
  },
  menuList: {
    flex: 1,
    gap: 8,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: Colors.primary,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 255, 61, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapActive: {
    backgroundColor: Colors.dark,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
  },
  menuTextActive: {
    color: Colors.dark,
    fontWeight: '900',
  },
  activePill: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activePillText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  footer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 255, 61, 0.2)',
    alignItems: 'center',
  },
  footerText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  footerSub: {
    color: '#A79CC4',
    fontSize: 10,
    marginTop: 2,
  },
});
