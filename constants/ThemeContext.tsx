import React, { createContext, useContext, useState } from 'react';
import { useColorScheme, Appearance } from 'react-native';

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

export const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  colors: {
    background: '#000000',
    card: '#1a1a2e',
    text: '#ffffff',
    subtext: '#888888',
    border: '#333333',
    primary: '#E91E63',
  },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    Appearance.setColorScheme(newMode ? 'dark' : 'light');
  };

  const colors = isDark ? {
    background: '#000000',
    card: '#1a1a2e',
    text: '#ffffff',
    subtext: '#888888',
    border: '#333333',
    primary: '#E91E63',
  } : {
    background: '#ffffff',
    card: '#f5f5f5',
    text: '#1a1a1a',
    subtext: '#666666',
    border: '#e0e0e0',
    primary: '#E91E63',
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);