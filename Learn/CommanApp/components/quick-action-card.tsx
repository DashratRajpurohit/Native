import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { type Href, Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type QuickActionCardProps = {
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  title: string;
  subtitle?: string;
  color?: string;
  href: Href;
};

export function QuickActionCard({
  icon,
  title,
  subtitle,
  color,
  href,
}: QuickActionCardProps) {
  const colorScheme = useColorScheme();
  const tint = color ?? Colors[colorScheme ?? 'light'].tint;

  return (
    <Link href={href} asChild>
      <TouchableOpacity activeOpacity={0.8}>
        <ThemedView style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: `${tint}22` }]}>
            <IconSymbol name={icon} size={26} color={tint} />
          </View>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {subtitle ? (
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          ) : null}
        </ThemedView>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginRight: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
});
