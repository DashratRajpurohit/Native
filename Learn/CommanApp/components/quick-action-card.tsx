import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { type Href, Link } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
  const accentColor = color ?? Colors.primary;

  return (
    <Link href={href} asChild>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => Haptics.selectionAsync()}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: accentColor }]}>
            <IconSymbol name={icon} size={24} color={Colors.dark} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3.5, height: 3.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginRight: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.dark,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textMuted,
    marginTop: 2,
  },
});
