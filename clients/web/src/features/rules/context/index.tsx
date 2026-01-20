/**
 * Contains all the common modals and state
 */

import React, { createContext, useContext } from "react";
import { RulesActionContextProvider } from "./actions";
import { RulesModalsContextProvider } from "./modals";

type RulesContextType = {};

const RulesContext = createContext<RulesContextType>(null);

interface RulesContextProviderProps {
  children: React.ReactElement;
}

export const RulesContextProvider: React.FC<RulesContextProviderProps> = ({ children }) => {
  const value = {};

  return (
    <RulesContext.Provider value={value}>
      <RulesModalsContextProvider>
        <RulesActionContextProvider>{children}</RulesActionContextProvider>
      </RulesModalsContextProvider>
    </RulesContext.Provider>
  );
};

export const useRulesContext = () => useContext(RulesContext);
