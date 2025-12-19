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
  sheetSize: number[];
  toggleBottomSheet: (params: ToggleParams) => void;
  toggleSheetPlacement: (placement?: BottomSheetPlacement) => void;
  updateSheetSize: (size: number[]) => void;
}

const DEFAULT_SIZE: number[] = [70, 30];

const isValidSize = (size?: number[]) => Array.isArray(size) && size.length === 2 && size[0] >= 10 && size[1] >= 10;

const BottomSheetContext = createContext<BottomSheetContextProps | null>(null);

export const BottomSheetProvider: React.FC<{
  children: React.ReactNode;
  context?: "api_client" | "rules";
  defaultPlacement?: BottomSheetPlacement;
  isSheetOpenByDefault?: boolean;
}> = ({
  children,
  context = "rules",
  defaultPlacement = BottomSheetPlacement.BOTTOM,
  isSheetOpenByDefault = false,
}) => {
  const dispatch = useDispatch();
  const reduxState = useSelector((state) => getBottomSheetState(state, context));

  const hasReduxState = typeof reduxState?.open === "boolean";

  const [userHasInteracted, setUserHasInteracted] = useState(hasReduxState);

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(hasReduxState ? reduxState.open : isSheetOpenByDefault);

  const [sheetPlacement, setSheetPlacement] = useState<BottomSheetPlacement>(
    reduxState?.placement === "right" ? BottomSheetPlacement.RIGHT : defaultPlacement
  );

  const [sheetSize, setSheetSize] = useState<number[]>(isValidSize(reduxState?.size) ? reduxState!.size : DEFAULT_SIZE);

  useEffect(() => {
    if (!reduxState) return;

    const shouldSyncOpen = !isSheetOpenByDefault || userHasInteracted;

    if (shouldSyncOpen && reduxState.open !== isBottomSheetOpen) {
      setIsBottomSheetOpen(reduxState.open);
    }

    setSheetPlacement(reduxState.placement === "right" ? BottomSheetPlacement.RIGHT : BottomSheetPlacement.BOTTOM);

    if (isValidSize(reduxState.size)) {
      setSheetSize(reduxState.size);
    }
  }, [reduxState, userHasInteracted, isSheetOpenByDefault, isBottomSheetOpen]);

  const toggleBottomSheet = useCallback(
    ({ isOpen, action }: ToggleParams) => {
      const nextState = typeof isOpen === "boolean" ? isOpen : !isBottomSheetOpen;

      setUserHasInteracted(true);
      setIsBottomSheetOpen(nextState);

      dispatch(
        globalActions.updateBottomSheetState({
          context,
          state: { open: nextState },
        })
      );

      trackBottomSheetToggled(nextState, action);
    },
    [dispatch, context, isBottomSheetOpen]
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
        globalActions.updateBottomSheetState({
          context,
          state: {
            placement: nextPlacement === BottomSheetPlacement.RIGHT ? "right" : "bottom",
          },
        })
      );
    },
    [dispatch, context, sheetPlacement]
  );

  const updateSheetSize = useCallback(
    (size: number[]) => {
      if (!isValidSize(size)) return;

      setSheetSize(size);
      dispatch(
        globalActions.updateBottomSheetState({
          context,
          state: { size },
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
