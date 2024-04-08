import React, { createContext, useCallback, useContext, useState } from "react";

interface ContentListTableContextType {
  selectedRows: any[];
  setSelectedRows: (rows: any[]) => void;
  clearSelectedRows: () => void;
}

const ContentListTableContext = createContext<ContentListTableContextType>({
  selectedRows: [],
  setSelectedRows: () => {},
  clearSelectedRows: () => {},
});

export const useContentListTableContext = () => useContext(ContentListTableContext);

interface ContentListTableProviderProps {
  children: React.ReactElement;
}
export const ContentListTableProvider: React.FC<ContentListTableProviderProps> = ({ children }) => {
  const [selectedRows, setSelectedRows] = useState<unknown[]>([]);

  const clearSelectedRows = useCallback(() => {
    setSelectedRows([]);
  }, []);

  const value = {
    selectedRows,
    clearSelectedRows,
    setSelectedRows,
  };

  return <ContentListTableContext.Provider value={value}>{children}</ContentListTableContext.Provider>;
};

export const withContentListTableContext = (Component: React.ComponentType) => {
  return (props: any) => (
    <ContentListTableProvider>
      <Component {...props} />
    </ContentListTableProvider>
  );
};
