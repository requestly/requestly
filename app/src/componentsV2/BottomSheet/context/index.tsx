import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BottomSheetPlacement, BottomSheetFeatureContext } from "../types";
import { trackViewBottomSheetOnBottomClicked, trackViewBottomSheetOnRightClicked } from "../analytics";
import { getBottomSheetState } from "store/selectors";
import { globalActions } from "store/slices/global/slice";

interface ToggleParams {
  isOpen?: boolean;
  action: string;
}

interface BottomSheetContextProps {
  isBottomSheetOpen: boolean;
  sheetPlacement: BottomSheetPlacement;
  sheetSize: number[];
  toggleBottomSheet: (params: ToggleParams) => void;
  toggleSheetPlacement: (placement?: BottomSheetPlacement) => void;
  updatePersistedSheetSize: (size: number[]) => void;
}

const DEFAULT_SIZE = [55, 45];
const CLOSED_SIZE = [100, 0];

const BottomSheetContext = createContext<BottomSheetContextProps | null>(null);

export const BottomSheetProvider: React.FC<{
  children: React.ReactNode;
  context: BottomSheetFeatureContext;
}> = ({ children, context }) => {
  const dispatch = useDispatch();
  const sheetOrientation = useSelector((state) => getBottomSheetState(state, context));
  const { open: isBottomSheetOpen, placement: sheetPlacement, size: sheetSize } = sheetOrientation;

  const toggleBottomSheet = useCallback(
    ({ isOpen }: ToggleParams) => {
      const nextState = typeof isOpen === "boolean" ? isOpen : !isBottomSheetOpen;
      const newSize: number[] = nextState ? (sheetSize[0] < 80 ? sheetSize : DEFAULT_SIZE) : CLOSED_SIZE;

      dispatch(
        globalActions.updateBottomSheetToggle({
          context,
          open: nextState,
        })
      );

      dispatch(
        globalActions.updateBottomSheetSize({
          context,
          size: newSize,
        })
      );
    },
    [isBottomSheetOpen, sheetSize, dispatch, context]
  );

  const toggleSheetPlacement = useCallback(
    (placement?: BottomSheetPlacement) => {
      const nextPlacement =
        placement ??
        (sheetPlacement === BottomSheetPlacement.RIGHT ? BottomSheetPlacement.BOTTOM : BottomSheetPlacement.RIGHT);
      if (!placement) {
        nextPlacement === BottomSheetPlacement.RIGHT
          ? trackViewBottomSheetOnRightClicked()
          : trackViewBottomSheetOnBottomClicked();
      }

      dispatch(
        globalActions.updateBottomSheetPlacement({
          context,
          placement: nextPlacement,
        })
      );
    },
    [sheetPlacement, dispatch, context]
  );

  const updatePersistedSheetSize = useCallback(
    (size: number[]) => {
      if (!size) return;

      dispatch(
        globalActions.updateBottomSheetSize({
          context,
          size: size,
        })
      );
    },
    [dispatch, context]
  );

  const value = useMemo(
    () => ({
      isBottomSheetOpen,
      toggleBottomSheet,
      sheetPlacement,
      toggleSheetPlacement,
      sheetSize,
      updatePersistedSheetSize,
    }),
    [isBottomSheetOpen, toggleBottomSheet, sheetPlacement, toggleSheetPlacement, sheetSize, updatePersistedSheetSize]
  );

  return <BottomSheetContext.Provider value={value}>{children}</BottomSheetContext.Provider>;
};

export const useBottomSheetContext = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error("useBottomSheetContext must be used within BottomSheetProvider");
  }
  return context;
};
