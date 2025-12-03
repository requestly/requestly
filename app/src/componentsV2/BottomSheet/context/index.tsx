import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { BottomSheetPlacement } from "../types";
import {
  trackBottomSheetToggled,
  trackViewBottomSheetOnBottomClicked,
  trackViewBottomSheetOnRightClicked,
} from "../analytics";

const getStoredPlacement = (): BottomSheetPlacement | null => {
  const storedValue = localStorage.getItem("sheet_placement");
  return storedValue === BottomSheetPlacement.BOTTOM || storedValue === BottomSheetPlacement.RIGHT ? storedValue : null;
};

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
    const savedPlacement = getStoredPlacement();
    return savedPlacement ?? defaultPlacement;
  });

  const persistPlacement = (placement: BottomSheetPlacement) => {
    setSheetPlacement(placement);
    localStorage.setItem("sheet_placement", placement);
  };

  useEffect(() => {
    const storedPlacement = getStoredPlacement();
    const nextPlacement = storedPlacement ?? defaultPlacement;
    if (sheetPlacement !== nextPlacement) {
      setSheetPlacement(nextPlacement);
    }
  }, [defaultPlacement]);

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

  const toggleSheetPlacement = useCallback((placement?: BottomSheetPlacement) => {
    if (placement) {
      persistPlacement(placement);
      return;
    }
    setSheetPlacement((prev) => {
      const nextPlacement =
        prev === BottomSheetPlacement.BOTTOM ? BottomSheetPlacement.RIGHT : BottomSheetPlacement.BOTTOM;

      localStorage.setItem("sheet_placement", nextPlacement);

      if (nextPlacement === BottomSheetPlacement.RIGHT) {
        trackViewBottomSheetOnRightClicked();
      } else {
        trackViewBottomSheetOnBottomClicked();
      }

      return nextPlacement;
    });
  }, []);

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
