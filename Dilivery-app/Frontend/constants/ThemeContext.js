import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const themeColors = {
  dark: {
    mode: 'dark',
    background: '#0B0F17',    // Obsidian Charcoal Canvas
    card: '#151C28',          // Elevated Dark Card
    cardBorder: '#232D3F',    // Clean Subtle Border
    cardGlow: 'rgba(255, 239, 179, 0.08)',
    text: '#FFFFFF',          // Pure Crisp White
    subtext: '#94A3B8',       // Muted Slate Text
    primary: '#FFEFB3',       // Signature Cream Gold Main Accent
    primaryDark: '#D4C486',
    buttonText: '#0B0F17',    // Deep Dark Text inside Gold Buttons
    accent: '#FFEFB3',        // Pure Gold Accent
    secondaryBg: '#1E293B',
    inputBg: '#1A2332',
    inputBorder: '#2E3B52',
    inputText: '#FFFFFF',
    danger: '#F87171',
    success: '#34D399',
    warning: '#FFEFB3',
    headerBg: '#0B0F17',
    badgeSubmitted: '#FFEFB3',
    badgeInProgress: '#60A5FA',
    badgeResolved: '#34D399',
    badgeClosed: '#94A3B8',
  },
  light: {
    mode: 'light',
    background: '#F8FAFC',    // Slate Clean Background
    card: '#FFFFFF',          // Clean White Card
    cardBorder: '#E2E8F0',    // Subtle Card Border
    cardGlow: 'rgba(0, 0, 0, 0.04)',
    text: '#0F172A',          // Deep Slate Text
    subtext: '#64748B',       // Muted Slate Text
    primary: '#0F172A',       // Dark Charcoal Buttons in Light Mode
    primaryDark: '#FFEFB3',
    buttonText: '#FFEFB3',    // Gold text inside Dark buttons
    accent: '#D97706',        // Amber Gold Accent
    secondaryBg: '#F1F5F9',
    inputBg: '#F8FAFC',
    inputBorder: '#CBD5E1',
    inputText: '#0F172A',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#D97706',
    headerBg: '#FFFFFF',
    badgeSubmitted: '#D97706',
    badgeInProgress: '#2563EB',
    badgeResolved: '#10B981',
    badgeClosed: '#64748B',
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('appTheme').then((theme) => {
      if (theme) {
        setIsDarkMode(theme === 'dark');
      }
    });
  }, []);

  const toggleTheme = async () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    await AsyncStorage.setItem('appTheme', nextMode ? 'dark' : 'light');
  };

  const theme = isDarkMode ? themeColors.dark : themeColors.light;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
