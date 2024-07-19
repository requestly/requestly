import React from "react";
import { BottomSheetWithoutContext } from "componentsV2/BottomSheet";
import { useSessionBottomSheetTabItems } from "./hooks/useSessionBottomSheetTabItems";

const BOTTOM_SHEET_TAB_KEYS = {
  INFO: "info",
  CONSOLE: "console",
  NETWORK: "network",
  ENVIRONMENT: "environment",
};

interface Props {
  playerTimeOffset: number;
}

const StaticSessionViewerBottomSheet: React.FC<Props> = ({ playerTimeOffset }) => {
  const bottomSheetTabItems = useSessionBottomSheetTabItems({ playerTimeOffset });

  return <BottomSheetWithoutContext items={bottomSheetTabItems} defaultActiveKey={BOTTOM_SHEET_TAB_KEYS.INFO} />;
};

export default React.memo(StaticSessionViewerBottomSheet);
