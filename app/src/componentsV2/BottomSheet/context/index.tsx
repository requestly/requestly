import React, { createContext, useState, useContext } from "react";
import { BottomSheetPlacement } from "../types";

interface BottomSheetContextProps {
  isBottomSheetOpen: boolean;
  sheetPlacement: BottomSheetPlacement;
  toggleBottomSheet: () => void;
  changeSheetPlacement: (placement: BottomSheetPlacement) => void;
}

const BottomSheetContext = createContext<BottomSheetContextProps | undefined>(undefined);

export const BottomSheetProvider: React.FC<{ children: React.ReactNode; defaultPlacement: BottomSheetPlacement }> = ({
  children,
  defaultPlacement,
}) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [sheetPlacement, setSheetPlacement] = useState(defaultPlacement);

  const toggleBottomSheet = () => setIsBottomSheetOpen(!isBottomSheetOpen);
  const changeSheetPlacement = (placement: BottomSheetPlacement) => {
    if (placement === BottomSheetPlacement.BOTTOM) {
      setSheetPlacement(BottomSheetPlacement.RIGHT);
    } else {
      setSheetPlacement(BottomSheetPlacement.BOTTOM);
    }
  };

  return (
    <BottomSheetContext.Provider
      value={{
        isBottomSheetOpen,
        toggleBottomSheet,
        sheetPlacement,
        changeSheetPlacement,
      }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheetContext = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error("useBottomSheetContext must be used within a BottomSheetProvider");
  }
  return context;
};
