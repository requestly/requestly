import { ContextId } from "features/apiClient/contexts/contextId.context";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ImportModalContext = createContext<{
  setImportModalContext: (id: string) => void;
}>(null);

export const ImportModalContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contextId, setContextId] = useState<string | null>(null);

  const setImportModalContext = useCallback((id: string) => {
    setContextId(id);
  }, []);

  const value = useMemo(() => {
    return {
      setImportModalContext,
    };
  }, [setImportModalContext]);

  return (
    <ImportModalContext.Provider value={value}>
      <ContextId id={contextId}>{children}</ContextId>
    </ImportModalContext.Provider>
  );
};

export const useImportModalContext = () => useContext(ImportModalContext);
