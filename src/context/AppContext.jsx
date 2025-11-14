import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Add your global state here
  const [state, setState] = useState({
    // Example state properties
    // user: null,
    // tasks: [],
  });

  const value = {
    state,
    setState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

