import { Platform, StyleSheet } from 'react-native';

const lightTheme = {
  text: '#2D1B69',
  textMuted: '#645986',
  background: '#F5F3EE',
  card: '#FFFFFF',
  border: '#2D1B69',
  tint: '#2D1B69',
  accent: '#C8FF3D',
  icon: '#2D1B69',
  tabIconDefault: '#7D70A3',
  tabIconSelected: '#2D1B69',
};

const darkTheme = {
  text: '#F5F3EE',
  textMuted: '#A79CC4',
  background: '#150F26',
  card: '#20163B',
  border: '#C8FF3D',
  tint: '#C8FF3D',
  accent: '#C8FF3D',
  icon: '#C8FF3D',
  tabIconDefault: '#7D70A3',
  tabIconSelected: '#C8FF3D',
};

export const Colors = {
  // Neo-Brutalism Core Palette
  primary: '#C8FF3D',       // Cyber Lime Accent
  secondary: '#d3f00a',     // Electric Lime-Yellow
  dark: '#2D1B69',          // Deep Midnight Ink / Primary Dark
  danger: '#f9100c',        // Vibrant Alert Red
  dangerLight: '#FFEDED',
  success: '#00D66C',
  warning: '#FFB800',

  light: lightTheme,
  darkTheme: darkTheme,
};

export const BrutalistStyle = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#2D1B69',
    shadowColor: '#2D1B69',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  cardDark: {
    backgroundColor: '#20163B',
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#C8FF3D',
    shadowColor: '#C8FF3D',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2D1B69',
    fontWeight: '800',
  },
  buttonPrimary: {
    backgroundColor: '#C8FF3D',
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: '#2D1B69',
    shadowColor: '#2D1B69',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDanger: {
    backgroundColor: '#f9100c',
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: '#2D1B69',
    shadowColor: '#2D1B69',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});
