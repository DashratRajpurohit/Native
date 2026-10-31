import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

import { darkColors, lightColors } from '../constants/theme';

const THEME_KEY = '@travelguardian/darkMode';
export const ThemeContext = createContext({ isDark: true, colors: darkColors, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((value) => {
        if (value !== null) setIsDark(value === 'true');
      })
      .catch(() => {});
  }, []);

  const toggle = async () => {
    setIsDark((current) => {
      AsyncStorage.setItem(THEME_KEY, String(!current)).catch(() => {});
      return !current;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}