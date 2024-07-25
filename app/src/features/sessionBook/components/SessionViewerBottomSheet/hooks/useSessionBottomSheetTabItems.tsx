import { useMemo } from "react";
import { SessionInfo } from "../components/SessionInfo/SessionInfo";
import SessionConsoleLogs from "../components/SessionConsoleLogs/SessionConsoleLogs";
import SessionNetworkLogs from "../components/SessionNetworkLogs/SessionNetworkLogs";
import { SessionEnvironmentDetails } from "../components/SessionEnvironmentDetails/SessionEnvironmentDetails";
import { MdOutlineTerminal } from "@react-icons/all-files/md/MdOutlineTerminal";
import { MdNetworkCheck } from "@react-icons/all-files/md/MdNetworkCheck";
import { MdConnectedTv } from "@react-icons/all-files/md/MdConnectedTv";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { useLocation } from "react-router-dom";

const BOTTOM_SHEET_TAB_KEYS = {
  INFO: "info",
  CONSOLE: "console",
  NETWORK: "network",
  ENVIRONMENT: "environment",
};

interface Props {
  playerTimeOffset: number;
}

export const useSessionBottomSheetTabItems = ({ playerTimeOffset }: Props) => {
  const location = useLocation();
  const isDraftSession = location.pathname.includes("draft");

  return useMemo(() => {
    const tabItems = [
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

    if (!isDraftSession) {
      tabItems.unshift({
        key: BOTTOM_SHEET_TAB_KEYS.INFO,
        label: (
          <div className="bottom-sheet-tab">
            <MdOutlineInfo />
            <span>Info</span>
          </div>
        ),
        children: <SessionInfo />,
      });
    }

    return tabItems;
  }, [playerTimeOffset, isDraftSession]);
};
