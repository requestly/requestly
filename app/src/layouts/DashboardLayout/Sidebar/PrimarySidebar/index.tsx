import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Tooltip } from "antd";
import { getAppMode, getNetworkSessionSaveInProgress } from "store/selectors";
import { ApiOutlined, HomeOutlined } from "@ant-design/icons";
import NetworkTrafficIcon from "assets/icons/network-traffic.svg?react";
import HttpRulesIcon from "assets/icons/http-rules.svg?react";
import SessionIcon from "assets/icons/session.svg?react";
import MockServerIcon from "assets/icons/mock-server.svg?react";
import { TbDeviceDesktopSearch } from "@react-icons/all-files/tb/TbDeviceDesktopSearch";
import { PrimarySidebarLink } from "./components/PrimarySidebarLink/PrimarySidebarLink";
import { RQBadge } from "lib/design-system/components/RQBadge";
import { PrimarySidebarItem } from "../type";
import InviteButton from "./components/InviteButton/InviteButton";
import PATHS from "config/constants/sub/paths";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { CreditsButton } from "./components/CreditsButton/CreditsButton";
import "./PrimarySidebar.css";

export const PrimarySidebar: React.FC = () => {
  const appMode = useSelector(getAppMode);
  const isSavingNetworkSession = useSelector(getNetworkSessionSaveInProgress);
  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);
  const isIncentivizationEnabled = useFeatureIsOn("incentivization_onboarding");

  const sidebarItems: PrimarySidebarItem[] = useMemo(() => {
    const showTooltipForSessionIcon = appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP && isSavingNetworkSession;

    const items = [
      {
        id: 0,
        title: "Home",
        path: PATHS.HOME.RELATIVE,
        icon: <HomeOutlined />,
        display: appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
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
            <span className="icon-with-badge">
              <SessionIcon /> <RQBadge badgeText="BETA" />
            </span>
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
        icon: <ApiOutlined />,
        display: true,
        activeColor: "var(--api-client)",
      },
    ];

    if (isDesktopSessionsCompatible) {
      items[3] = {
        id: 3,
        title: "Desktop Sessions",
        path: PATHS.SESSIONS.DESKTOP.INDEX,
        icon: (
          <Tooltip
            placement="right"
            open={isSavingNetworkSession}
            title={showTooltipForSessionIcon ? "View and manage your saved sessions here" : ""}
          >
            <TbDeviceDesktopSearch />
          </Tooltip>
        ),
        display: true,
        activeColor: "var(--desktop-sessions)",
      };
    }
    return items;
  }, [appMode, isSavingNetworkSession, isDesktopSessionsCompatible]);

  return (
    <div className="primary-sidebar-container">
      <ul>
        {sidebarItems
          .filter((item) => item.display)
          .map((item) => (
            <li key={item.id}>
              <PrimarySidebarLink {...item} />
            </li>
          ))}
      </ul>
      <div className="primary-sidebar-bottom-btns">
        {isIncentivizationEnabled && <CreditsButton />}
        <InviteButton />
      </div>
    </div>
  );
};
