import React, { createContext, useContext, useState } from 'react';

type NavigationContextType = {
  expandedItems: Record<string, boolean>;
  toggleExpanded: (name: string) => void;
  handleTestDetailNavigate?: (path: string) => void;
  setHandleTestDetailNavigate: (handler: ((path: string) => void) | undefined) => void;
};

const NavigationContext = createContext<NavigationContextType>({
  expandedItems: {},
  toggleExpanded: () => {},
  handleTestDetailNavigate: undefined,
  setHandleTestDetailNavigate: () => {},
});

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [handleTestDetailNavigate, setHandleTestDetailNavigate] = useState<((path: string) => void) | undefined>(undefined);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => {
      // Cria um novo objeto com todos os itens fechados
      const allClosed = Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: false
      }), {});

      // Se o item clicado já estava aberto, fecha ele também
      // Se estava fechado, abre apenas ele
      return {
        ...allClosed,
        [name]: !prev[name]
      };
    });
  };

  return (
    <NavigationContext.Provider 
      value={{ 
        expandedItems, 
        toggleExpanded,
        handleTestDetailNavigate, 
        setHandleTestDetailNavigate 
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
