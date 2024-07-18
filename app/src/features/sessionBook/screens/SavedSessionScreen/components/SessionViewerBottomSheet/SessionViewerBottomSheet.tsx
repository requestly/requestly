import React, { useMemo } from "react";
import { MdOutlineTerminal } from "@react-icons/all-files/md/MdOutlineTerminal";
import { MdNetworkCheck } from "@react-icons/all-files/md/MdNetworkCheck";
import { MdConnectedTv } from "@react-icons/all-files/md/MdConnectedTv";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { BottomSheet } from "componentsV2/BottomSheet";
import { SessionInfo } from "./components/SessionInfo/SessionInfo";
import SessionNetworkLogs from "./components/SessionNetworkLogs/SessionNetworkLogs";
import SessionConsoleLogs from "./components/SessionConsoleLogs/SessionConsoleLogs";
import { SessionEnvironmentDetails } from "./components/SessionEnvironmentDetails/SessionEnvironmentDetails";

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
  const bottomSheetTabItems = useMemo(() => {
    return [
      {
        key: BOTTOM_SHEET_TAB_KEYS.INFO,
        label: (
          <div className="bottom-sheet-tab">
            <MdOutlineInfo />
            <span>Info</span>
          </div>
        ),
        children: <SessionInfo />,
        forceRender: true,
      },
      {
        key: BOTTOM_SHEET_TAB_KEYS.CONSOLE,
        label: (
          <div className="bottom-sheet-tab">
            <MdOutlineTerminal />
            <span>Console</span>
          </div>
        ),
        children: <SessionConsoleLogs playerTimeOffset={playerTimeOffset} />,
        forceRender: true,
      },
      {
        key: BOTTOM_SHEET_TAB_KEYS.NETWORK,
        label: (
          <div className="bottom-sheet-tab">
            <MdNetworkCheck />
            <span>Network</span>
          </div>
        ),
        children: <SessionNetworkLogs playerTimeOffset={playerTimeOffset} />,
      },
      {
        key: BOTTOM_SHEET_TAB_KEYS.ENVIRONMENT,
        label: (
          <div className="bottom-sheet-tab">
            <MdConnectedTv />
            <span>Environment</span>
          </div>
        ),
        children: <SessionEnvironmentDetails />,
      },
    ];
  }, [playerTimeOffset]);

  return (
    <BottomSheet
      items={bottomSheetTabItems}
      defaultActiveKey={BOTTOM_SHEET_TAB_KEYS.INFO}
      disableDocking={disableDocking}
    />
  );
};

export default React.memo(SessionViewerBottomSheet);
