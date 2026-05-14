import React, { createContext, useContext, useState } from 'react';
import { Appearance } from 'react-native';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    subtext: string;
    border: string;
    primary: string;
  };
};

const darkColors = {
  background: '#0a0a0a',
  card: '#1a1a1a',
  text: '#ffffff',
  subtext: '#888888',
  border: '#2a2a2a',
  primary: '#FF2D7A',
};

const lightColors = {
  background: '#f2f2f2',
  card: '#ffffff',
  text: '#1a1a1a',
  subtext: '#666666',
  border: '#e0e0e0',
  primary: '#FF2D7A',
};

export const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  colors: darkColors,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newMode = !prev;
      Appearance.setColorScheme(newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleTheme,
      colors: isDark ? darkColors : lightColors,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);