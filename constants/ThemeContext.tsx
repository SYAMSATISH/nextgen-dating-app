import React, { createContext, useContext, useState } from 'react';

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  accent: string;
};

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
  uiVersion: string;
  updateMessage: string;
};

const darkColors: ThemeColors = {
  background: '#000000',
  card: '#1a1a2e',
  text: '#ffffff',
  subtext: '#888888',
  border: '#333333',
  primary: '#E91E63',
  accent: '#FF2D7A',
};

const lightColors: ThemeColors = {
  background: '#ffffff',
  card: '#f5f5f5',
  text: '#1a1a1a',
  subtext: '#666666',
  border: '#e0e0e0',
  primary: '#E91E63',
  accent: '#FF2D7A',
};

export const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  colors: darkColors,
  uiVersion: '1.0',
  updateMessage: '',
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(prev => !prev);

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors, uiVersion: '1.0', updateMessage: '' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);