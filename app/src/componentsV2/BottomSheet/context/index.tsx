import React, { createContext, useState, useContext, useCallback } from "react";
import { BottomSheetPlacement } from "../types";
import {
  trackBottomSheetToggled,
  trackViewBottomSheetOnBottomClicked,
  trackViewBottomSheetOnRightClicked,
} from "../analytics";

interface toggleParams {
  isOpen: boolean;
  isTrack: boolean;
  action: string;
}
interface BottomSheetContextProps {
  isBottomSheetOpen: boolean;
  sheetPlacement: BottomSheetPlacement;
  toggleBottomSheet: (params?: toggleParams) => void;
  toggleSheetPlacement: (placement?: BottomSheetPlacement) => void;
}

const BottomSheetContext = createContext<BottomSheetContextProps | undefined>(undefined);

export const BottomSheetProvider: React.FC<{
  children: React.ReactNode;
  defaultPlacement: BottomSheetPlacement;
  isSheetOpenByDefault?: boolean;
}> = ({ children, defaultPlacement, isSheetOpenByDefault = false }) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(isSheetOpenByDefault);
  const [sheetPlacement, setSheetPlacement] = useState(() => {
    const savedPlacement = localStorage.getItem("sheet_placement");
    return savedPlacement || defaultPlacement;
  });

  const toggleBottomSheet = ({ isOpen, isTrack, action }: toggleParams) => {
    if (isOpen) {
      setIsBottomSheetOpen(isOpen);
      if (isTrack) {
        trackBottomSheetToggled(isOpen, action);
      }
    } else {
      setIsBottomSheetOpen((prev) => !prev);
      if (isTrack) {
        trackBottomSheetToggled(!isBottomSheetOpen, action);
      }
    }
  };

  const toggleSheetPlacement = useCallback(
    (placement?: BottomSheetPlacement) => {
      if (placement) {
        setSheetPlacement(placement);
        localStorage.setItem("sheet_placement", placement);
        return;
      }
      if (sheetPlacement === BottomSheetPlacement.BOTTOM) {
        setSheetPlacement(BottomSheetPlacement.RIGHT);
        localStorage.setItem("sheet_placement", BottomSheetPlacement.RIGHT);
        trackViewBottomSheetOnRightClicked();
      } else {
        setSheetPlacement(BottomSheetPlacement.BOTTOM);
        localStorage.setItem("sheet_placement", BottomSheetPlacement.BOTTOM);
        trackViewBottomSheetOnBottomClicked();
      }
    },
    [sheetPlacement]
  );

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
