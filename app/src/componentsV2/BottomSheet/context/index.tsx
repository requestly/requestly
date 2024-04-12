import React, { createContext, useState, useContext } from "react";
import { BottomSheetPlacement } from "../types";

interface BottomSheetContextProps {
  isBottomSheetOpen: boolean;
  isSheetPlacedAtBottom: boolean;
  toggleBottomSheet: () => void;
  toggleSheetPlacement: () => void;
  openBottomSheet: () => void;
  changeSheetPlacement: (placement: BottomSheetPlacement) => void;
}

const BottomSheetContext = createContext<BottomSheetContextProps | undefined>(undefined);

export const BottomSheetProvider: React.FC<{ children: React.ReactNode; defaultPlacement: BottomSheetPlacement }> = ({
  children,
  defaultPlacement,
}) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isSheetPlacedAtBottom, setIsSheetPlacedAtBottom] = useState(defaultPlacement === "bottom");

  const toggleBottomSheet = () => setIsBottomSheetOpen(!isBottomSheetOpen);
  const toggleSheetPlacement = () => setIsSheetPlacedAtBottom(!isSheetPlacedAtBottom);
  const openBottomSheet = () => setIsBottomSheetOpen(true);
  const changeSheetPlacement = (placement: BottomSheetPlacement) => {
    setIsSheetPlacedAtBottom(placement === "bottom");
  };

  return (
    <BottomSheetContext.Provider
      value={{
        isBottomSheetOpen,
        isSheetPlacedAtBottom,
        toggleBottomSheet,
        toggleSheetPlacement,
        openBottomSheet,
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
