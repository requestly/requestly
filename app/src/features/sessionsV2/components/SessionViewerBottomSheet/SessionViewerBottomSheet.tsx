import { useMemo } from "react";
import { MdOutlineTerminal } from "@react-icons/all-files/md/MdOutlineTerminal";
import { MdNetworkCheck } from "@react-icons/all-files/md/MdNetworkCheck";
import { MdConnectedTv } from "@react-icons/all-files/md/MdConnectedTv";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { BottomSheet } from "componentsV2/BottomSheet";

const BOTTOM_SHEET_TAB_KEYS = {
  INFO: "info",
  CONSOLE: "console",
  NETWORK: "network",
  ENVIRONMENT: "environment",
};
export const SessionViewerBottomSheet = () => {
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
        children: <>SESSION INFO HERE</>,
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
        children: <>CONSOLE LOGS HERE</>,
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
        children: <>NETOWRK LOGS HERE</>,
        // forceRender: true,
      },
      {
        key: BOTTOM_SHEET_TAB_KEYS.ENVIRONMENT,
        label: (
          <div className="bottom-sheet-tab">
            <MdConnectedTv />
            <span>Environment</span>
          </div>
        ),
        children: <>ENV DETAILS HERE</>,
        // forceRender: true,
      },
    ];
  }, []);

  return <BottomSheet items={bottomSheetTabItems} defaultActiveKey={BOTTOM_SHEET_TAB_KEYS.INFO} />;
};
