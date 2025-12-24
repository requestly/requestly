import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BottomSheetPlacement } from "../types";
import {
  trackBottomSheetToggled,
  trackViewBottomSheetOnBottomClicked,
  trackViewBottomSheetOnRightClicked,
} from "../analytics";
import { getBottomSheetState } from "store/selectors";
import { globalActions } from "store/slices/global/slice";

interface ToggleParams {
  isOpen?: boolean;
  action: string;
}

interface BottomSheetContextProps {
  isBottomSheetOpen: boolean;
  sheetPlacement: BottomSheetPlacement;
  sheetSize: [number, number];
  toggleBottomSheet: (params: ToggleParams) => void;
  toggleSheetPlacement: (placement?: BottomSheetPlacement) => void;
  updateSheetSize: (size: [number, number]) => void;
}

const DEFAULT_SIZE: [number, number] = [55, 45];
const CLOSED_SIZE: [number, number] = [100, 0];

const BottomSheetContext = createContext<BottomSheetContextProps | null>(null);

export const BottomSheetProvider: React.FC<{
  children: React.ReactNode;
  context: "api_client" | "rules";
  defaultPlacement?: BottomSheetPlacement;
  isSheetOpenByDefault?: boolean;
}> = ({ children, context, defaultPlacement, isSheetOpenByDefault }) => {
  const dispatch = useDispatch();
  const reduxState = useSelector((state) => getBottomSheetState(state, context));
  const hasReduxState = typeof reduxState?.open === "boolean";

  const [userHasInteracted, setUserHasInteracted] = useState(hasReduxState);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(hasReduxState ? reduxState.open : isSheetOpenByDefault);
  const [sheetPlacement, setSheetPlacement] = useState<BottomSheetPlacement>(
    reduxState?.placement ? reduxState.placement : defaultPlacement
  );
  const [sheetSize, setSheetSize] = useState<[number, number]>(reduxState?.size ? reduxState.size : DEFAULT_SIZE);

  useEffect(() => {
    if (!reduxState) return;
    const shouldSyncOpen = !isSheetOpenByDefault || userHasInteracted;
    if (shouldSyncOpen && reduxState.open !== isBottomSheetOpen) {
      setIsBottomSheetOpen(reduxState.open);
    }
    setSheetPlacement(reduxState.placement === "right" ? BottomSheetPlacement.RIGHT : BottomSheetPlacement.BOTTOM);
    setSheetSize(reduxState.size);
  }, [reduxState, userHasInteracted, isSheetOpenByDefault, isBottomSheetOpen]);

  const toggleBottomSheet = useCallback(
    ({ isOpen, action }: ToggleParams) => {
      const nextState = typeof isOpen === "boolean" ? isOpen : !isBottomSheetOpen;
      const newSize: [number, number] = nextState ? (sheetSize[0] < 80 ? sheetSize : DEFAULT_SIZE) : CLOSED_SIZE;
      setUserHasInteracted(true);
      setIsBottomSheetOpen(nextState);
      setSheetSize(newSize);

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

      trackBottomSheetToggled(nextState, action);
    },
    [dispatch, context, isBottomSheetOpen, sheetSize]
  );

  const toggleSheetPlacement = useCallback(
    (placement?: BottomSheetPlacement) => {
      const nextPlacement =
        placement ??
        (sheetPlacement === BottomSheetPlacement.BOTTOM ? BottomSheetPlacement.RIGHT : BottomSheetPlacement.BOTTOM);

      if (!placement) {
        nextPlacement === BottomSheetPlacement.RIGHT
          ? trackViewBottomSheetOnRightClicked()
          : trackViewBottomSheetOnBottomClicked();
      }

      setSheetPlacement(nextPlacement);

      dispatch(
        globalActions.updateBottomSheetPlacement({
          context,
          placement: nextPlacement === BottomSheetPlacement.RIGHT ? "right" : "bottom",
        })
      );
    },
    [dispatch, context, sheetPlacement]
  );

  const updateSheetSize = useCallback(
    (size: [number, number]) => {
      if (!size || size.length !== 2) return;

      setSheetSize(size);
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
      updateSheetSize,
    }),
    [isBottomSheetOpen, toggleBottomSheet, sheetPlacement, toggleSheetPlacement, sheetSize, updateSheetSize]
  );

  return <BottomSheetContext.Provider value={value}>{children}</BottomSheetContext.Provider>;
};

export const useBottomSheetContext = () => {
  const ctx = useContext(BottomSheetContext);
  if (!ctx) {
    throw new Error("useBottomSheetContext must be used within BottomSheetProvider");
  }
  return ctx;
};
