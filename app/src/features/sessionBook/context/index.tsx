import React, { createContext, useContext } from "react";
import { SessionsActionContextProvider } from "./actions";

type SessionsContextType = {};

const SessionsContext = createContext<SessionsContextType>(null);

interface SessionsContextProviderProps {
  children: React.ReactElement;
}

export const SessionsContextProvider: React.FC<SessionsContextProviderProps> = ({ children }) => {
  const value = {};

  return (
    <SessionsContext.Provider value={value}>
      <SessionsActionContextProvider>{children}</SessionsActionContextProvider>
    </SessionsContext.Provider>
  );
};

export const useSessionsContext = () => useContext(SessionsContext);
