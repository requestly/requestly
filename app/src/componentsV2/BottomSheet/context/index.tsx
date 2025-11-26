import React, { createContext, useState, useContext, useCallback } from "react";
import { BottomSheetPlacement } from "../types";
import {
  trackBottomSheetToggled,
  trackViewBottomSheetOnBottomClicked,
  trackViewBottomSheetOnRightClicked,
} from "../analytics";

interface toggleParams {
  isOpen?: boolean;
  isTrack?: boolean;
  action?: string;
}
interface BottomSheetContextProps {
  isBottomSheetOpen: boolean;
  sheetPlacement: BottomSheetPlacement;
  toggleBottomSheet: (params?: toggleParams) => void;
  toggleSheetPlacement: (placement?: BottomSheetPlacement) => void;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const BottomSheetContext = createContext<BottomSheetContextProps | undefined>(undefined);

export const BottomSheetProvider: React.FC<{
  children: React.ReactNode;
  defaultPlacement: BottomSheetPlacement;
  isSheetOpenByDefault?: boolean;
}> = ({ children, defaultPlacement, isSheetOpenByDefault = false }) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(isSheetOpenByDefault);
  const [sheetPlacement, setSheetPlacement] = useState<BottomSheetPlacement>(defaultPlacement);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleBottomSheet = ({ isOpen, isTrack = false, action = "" }: toggleParams = {}) => {
    if (typeof isOpen !== "undefined") {
      setIsBottomSheetOpen(isOpen);

      // Only toggle collapsed state when using collapse/expand button, not on tab clicks
      if (action === "bottom_sheet_collapse_expand") {
        setIsCollapsed(!isOpen);
      } else if (action === "bottom_sheet_utility_toggle" && isOpen) {
        // When clicking tab in collapsed state, expand it
        setIsCollapsed(false);
      }

      if (isTrack) {
        trackBottomSheetToggled(isOpen, action);
      }
    } else {
      const newOpenState = !isBottomSheetOpen;
      setIsBottomSheetOpen(newOpenState);

      if (action === "bottom_sheet_collapse_expand") {
        setIsCollapsed(!newOpenState);
      }

      if (isTrack) {
        trackBottomSheetToggled(newOpenState, action);
      }
    }
  };

  const toggleSheetPlacement = useCallback(
    (placement?: BottomSheetPlacement) => {
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
        isCollapsed,
        setIsCollapsed,
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
