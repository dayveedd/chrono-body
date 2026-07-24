import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);

  // Sync dark mode class on render
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Set up listener for database mode toggling and sync to keep state aligned
  useEffect(() => {
    // Check local preferences
    const isDarkSaved = localStorage.getItem('chronobody_theme') !== 'light';
    setDarkMode(isDarkSaved);
  }, []);

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('chronobody_theme', nextDark ? 'dark' : 'light');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
};

export const ThemeContext = React.createContext({
  darkMode: true,
  toggleTheme: () => {},
});

export const useTheme = () => React.useContext(ThemeContext);
