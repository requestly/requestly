import React, { createContext, useState, useContext } from "react";
import { BottomSheetPlacement } from "../types";
import {
  trackBottomSheetToggled,
  trackViewBottomSheetOnBottomClicked,
  trackViewBottomSheetOnRightClicked,
} from "../analytics";

interface BottomSheetContextProps {
  isBottomSheetOpen: boolean;
  sheetPlacement: BottomSheetPlacement;
  toggleBottomSheet: (isOpen?: boolean) => void;
  toggleSheetPlacement: (placement?: BottomSheetPlacement) => void;
}

const BottomSheetContext = createContext<BottomSheetContextProps | undefined>(undefined);

export const BottomSheetProvider: React.FC<{ children: React.ReactNode; defaultPlacement: BottomSheetPlacement }> = ({
  children,
  defaultPlacement,
}) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [sheetPlacement, setSheetPlacement] = useState(defaultPlacement);

  const toggleBottomSheet = (isOpen?: boolean) => {
    if (isOpen) {
      setIsBottomSheetOpen(isOpen);
      trackBottomSheetToggled(isOpen);
    } else {
      setIsBottomSheetOpen((prev) => !prev);
      trackBottomSheetToggled(!isBottomSheetOpen);
    }
  };
  const toggleSheetPlacement = (placement?: BottomSheetPlacement) => {
    if (placement) {
      setSheetPlacement(placement);
      return;
    }
    if (sheetPlacement === BottomSheetPlacement.BOTTOM) {
      setSheetPlacement(BottomSheetPlacement.RIGHT);
      trackViewBottomSheetOnRightClicked();
    } else {
      setSheetPlacement(BottomSheetPlacement.BOTTOM);
      trackViewBottomSheetOnBottomClicked();
    }
  };

  return (
    <BottomSheetContext.Provider
      value={{
        isBottomSheetOpen,
        toggleBottomSheet,
        sheetPlacement,
        toggleSheetPlacement,
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
