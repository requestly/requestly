import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Tooltip } from "antd";
import { getAppMode, getNetworkSessionSaveInProgress, getUserAuthDetails } from "store/selectors";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { ApiOutlined, HomeOutlined, MobileOutlined } from "@ant-design/icons";
import { ReactComponent as NetworkTrafficIcon } from "assets/icons/network-traffic.svg";
import { ReactComponent as HttpRulesIcon } from "assets/icons/http-rules.svg";
import { ReactComponent as SessionIcon } from "assets/icons/session.svg";
import { ReactComponent as MockServerIcon } from "assets/icons/mock-server.svg";
import { PrimarySidebarLink } from "./PrimarySidebarLink";
import { isUserUsingAndroidDebugger } from "components/features/mobileDebugger/utils/sdkUtils";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { RQBadge } from "lib/design-system/components/RQBadge";
import { PrimarySidebarItem } from "../type";
import InviteButton from "./InviteButton";
import PATHS from "config/constants/sub/paths";
import FEATURES from "config/constants/sub/features";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./PrimarySidebar.css";

export const PrimarySidebar: React.FC = () => {
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const isSavingNetworkSession = useSelector(getNetworkSessionSaveInProgress);
  const [isAndroidDebuggerEnabled, setIsAndroidDebuggerEnabled] = useState(false);
  const ecosystemExperiment = useFeatureValue("ecosystem-experiment", null);

  useEffect(() => {
    isUserUsingAndroidDebugger(user?.details?.profile?.uid).then(setIsAndroidDebuggerEnabled);
  }, [user?.details?.profile?.uid]);

  const sidebarItems: PrimarySidebarItem[] = useMemo(() => {
    const showTooltipForSessionIcon = appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP && isSavingNetworkSession;

    const items = [
      {
        id: 0,
        title: "Home",
        path: PATHS.HOME.RELATIVE,
        icon: <HomeOutlined />,
        display: ecosystemExperiment === "ecosystem",
      },
      {
        id: 1,
        title: "Network traffic",
        path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.RELATIVE,
        icon: <NetworkTrafficIcon />,
        display: appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
      },
      {
        id: 2,
        title: "HTTP Rules",
        path: PATHS.RULES.INDEX,
        icon: <HttpRulesIcon />,
        display: true,
        activeColor: "var(--http-rules)",
      },
      {
        id: 3,
        title: "Sessions",
        path: PATHS.SESSIONS.INDEX,
        icon: (
          <Tooltip
            placement="right"
            open={isSavingNetworkSession}
            title={showTooltipForSessionIcon ? "View and manage your saved sessions here" : ""}
          >
            <SessionIcon />
          </Tooltip>
        ),
        display: true,
        activeColor: "var(--session-recording)",
      },
      {
        id: 4,
        title: "Mock server",
        path: PATHS.MOCK_SERVER.INDEX,
        icon: <MockServerIcon />,
        display: true,
        activeColor: "var(--mock-server)",
      },
      {
        id: 5,
        title: "API client",
        path: PATHS.API_CLIENT.INDEX,
        icon: (
          <span className="icon-with-badge">
            <ApiOutlined /> <RQBadge badgeText="BETA" />
          </span>
        ),
        feature: FEATURES.API_CLIENT,
        display: true,
        activeColor: "var(--api-client)",
      },
      {
        id: 6,
        title: "Android Debugger",
        path: PATHS.MOBILE_DEBUGGER.INDEX,
        icon: <MobileOutlined />,
        display: isAndroidDebuggerEnabled,
      },
    ];

    return items.filter((item) => !item.feature || isFeatureCompatible(item.feature));
  }, [appMode, isAndroidDebuggerEnabled, isSavingNetworkSession, ecosystemExperiment]);

  return (
    <div className="primary-sidebar-container">
      <ul>
        {sidebarItems
          .filter((item) => item.display)
          .map((item) => (
            <li key={item.id}>
              <PrimarySidebarLink {...item} isEcosystemExperiment={ecosystemExperiment === "ecosystem"} />
            </li>
          ))}
      </ul>

      <InviteButton />
    </div>
  );
};
