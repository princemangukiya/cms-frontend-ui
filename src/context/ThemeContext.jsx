import React, { createContext, useState, useContext } from 'react';

// 1. Context Create kar rahe hain
const ThemeContext = createContext();

// 2. Provider Component jo puri app ko wrap karega
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <div className={darkMode ? 'dark-theme' : 'light-theme'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// 3. Custom Hook easy use ke liye
export const useTheme = () => useContext(ThemeContext);