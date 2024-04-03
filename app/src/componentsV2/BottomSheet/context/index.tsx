import React, { createContext, useState, useContext } from "react";

interface BottomSheetContextProps {
  isOpen: boolean;
  viewAsPanel: boolean;
  toggleOpen: () => void;
  toggleViewAsPanel: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextProps | undefined>(undefined);

export const BottomSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewAsPanel, setViewAsPanel] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);
  const toggleViewAsPanel = () => setViewAsPanel(!viewAsPanel);

  return (
    <BottomSheetContext.Provider value={{ isOpen, viewAsPanel, toggleOpen, toggleViewAsPanel }}>
      {children}
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheetContext = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error("useBottomPanel must be used within a BottomPanelProvider");
  }
  return context;
};
