import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textWrap}>
          {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
        </View>
        {showNotification ? (
          <View style={styles.iconBtn}>
            <IconSymbol name="bell.fill" size={22} color={tint} />
            <View style={styles.badge} />
          </View>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textWrap: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
  },
  iconBtn: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
  },
});
