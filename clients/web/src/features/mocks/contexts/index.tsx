import React, { createContext, useContext } from "react";
import { MocksModalsContextProvider } from "./modals";
import { MocksActionContextProvider } from "./actions";

type MocksContextType = {};

const MocksContext = createContext<MocksContextType>(null);

interface MocksContextProviderProps {
  children: React.ReactElement;
}

export const MocksContextProvider: React.FC<MocksContextProviderProps> = ({ children }) => {
  const value = {};

  return (
    <MocksContext.Provider value={value}>
      <MocksModalsContextProvider>
        <MocksActionContextProvider>{children}</MocksActionContextProvider>
      </MocksModalsContextProvider>
    </MocksContext.Provider>
  );
};

export const useMocksContext = () => useContext(MocksContext);
