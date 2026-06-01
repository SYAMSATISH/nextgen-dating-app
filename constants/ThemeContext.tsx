import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from './appwrite';
import { doc, onSnapshot } from 'firebase/firestore';

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

const defaultDarkColors: ThemeColors = {
  background: '#000000',
  card: '#1a1a2e',
  text: '#ffffff',
  subtext: '#888888',
  border: '#333333',
  primary: '#E91E63',
  accent: '#FF2D7A',
};

const defaultLightColors: ThemeColors = {
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#1a1a1a',
  subtext: '#666666',
  border: '#e0e0e0',
  primary: '#E91E63',
  accent: '#FF2D7A',
};

export const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  colors: defaultDarkColors,
  uiVersion: '1.0',
  updateMessage: '',
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true);
  const [uiVersion, setUiVersion] = useState('1.0');
  const [updateMessage, setUpdateMessage] = useState('');
  const [firebaseColors, setFirebaseColors] = useState<Partial<ThemeColors>>({});

  useEffect(() => {
    // Firebase lo appConfig/theme document listen cheyyi
    const unsubscribe = onSnapshot(doc(db, 'appConfig', 'theme'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFirebaseColors({
          primary: data.primaryColor,
          accent: data.accentColor,
          background: isDark ? data.backgroundColor : '#f5f5f5',
          card: isDark ? data.cardColor : '#ffffff',
        });
        setUiVersion(data.uiVersion || '1.0');
        setUpdateMessage(data.updateMessage || '');
      }
    });
    return () => unsubscribe();
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const baseColors = isDark ? defaultDarkColors : defaultLightColors;

  // Firebase colors tho merge cheyyi
  const colors: ThemeColors = {
    ...baseColors,
    ...firebaseColors,
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors, uiVersion, updateMessage }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);