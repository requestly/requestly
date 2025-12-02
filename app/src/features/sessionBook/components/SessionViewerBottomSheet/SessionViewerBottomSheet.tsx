import React, { useEffect } from "react";
import { BottomSheet, BottomSheetPlacement, useBottomSheetContext } from "componentsV2/BottomSheet";
import { useMediaQuery } from "react-responsive";
import { useLocation } from "react-router-dom";
import { useSessionBottomSheetTabItems } from "./hooks/useSessionBottomSheetTabItems";
import PATHS from "config/constants/sub/paths";

const BOTTOM_SHEET_TAB_KEYS = {
  INFO: "info",
  CONSOLE: "console",
  NETWORK: "network",
  ENVIRONMENT: "environment",
};

interface SessionViewerBottomSheetProps {
  playerTimeOffset: number;
  disableDocking?: boolean;
}

const SessionViewerBottomSheet: React.FC<SessionViewerBottomSheetProps> = ({
  playerTimeOffset,
  disableDocking = false,
}) => {
  const location = useLocation();
  const { toggleSheetPlacement } = useBottomSheetContext();
  const bottomSheetBottomBreakpoint = useMediaQuery({ query: "(max-width: 1092px)" });

  const bottomSheetTabItems = useSessionBottomSheetTabItems({ playerTimeOffset });

  useEffect(() => {
    const savedPlacement = localStorage.getItem("sheet_placement");
    if (bottomSheetBottomBreakpoint && location.pathname.includes(PATHS.SESSIONS.INDEX) && !savedPlacement) {
      toggleSheetPlacement(BottomSheetPlacement.BOTTOM);
    }
  }, [bottomSheetBottomBreakpoint, toggleSheetPlacement, location.pathname]);

  return (
    <BottomSheet
      items={bottomSheetTabItems}
      defaultActiveKey={BOTTOM_SHEET_TAB_KEYS.INFO}
      disableDocking={disableDocking || bottomSheetBottomBreakpoint}
    />
  );
};

export default React.memo(SessionViewerBottomSheet);
