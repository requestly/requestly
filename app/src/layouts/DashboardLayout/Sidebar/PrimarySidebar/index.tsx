import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Tooltip } from "antd";
import { getAppMode, getIsSecondarySidebarCollapsed, getNetworkSessionSaveInProgress } from "store/selectors";
import { ApiOutlined, HomeOutlined } from "@ant-design/icons";
import NetworkTrafficIcon from "assets/icons/network-traffic.svg?react";
import HttpRulesIcon from "assets/icons/http-rules.svg?react";
import SessionIcon from "assets/icons/session.svg?react";
import NetworkTrafficInspectorIcon from "assets/icons/network-traffic-inspector.svg?react";
import { TbDeviceDesktopSearch } from "@react-icons/all-files/tb/TbDeviceDesktopSearch";
import { PrimarySidebarLink } from "./components/PrimarySidebarLink/PrimarySidebarLink";
import MockServerIcon from "assets/icons/mock-server.svg?react";
import { PrimarySidebarItem } from "../type";
import InviteButton from "./components/InviteButton/InviteButton";
import PATHS from "config/constants/sub/paths";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { CreditsButton } from "./components/CreditsButton/CreditsButton";
import { useIsIncentivizationEnabled } from "features/incentivization/hooks";
import JoinSlackButton from "./components/JoinSlackButton/JoinSlackButton";
import useFetchSlackInviteVisibility from "components/misc/SupportPanel/useSlackInviteVisibility";
import { SidebarToggleButton } from "componentsV2/SecondarySidebar/components/SidebarToggleButton/SidebarToggleButton";
import APP_CONSTANTS from "config/constants";
import { RQBadge } from "lib/design-system/components/RQBadge";
import "./PrimarySidebar.css";

export const PrimarySidebar: React.FC = () => {
  const { pathname } = useLocation();
  const appMode = useSelector(getAppMode);
  const isSavingNetworkSession = useSelector(getNetworkSessionSaveInProgress);
  const isSecondarySidebarCollapsed = useSelector(getIsSecondarySidebarCollapsed);

  const isIncentivizationEnabled = useIsIncentivizationEnabled();
  const isSlackConnectFeatureEnabled = useFeatureIsOn("slack_connect");
  const isSlackInviteVisible = useFetchSlackInviteVisibility();

  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);

  const isSecondarySidebarToggleAllowed = [
    APP_CONSTANTS.PATHS.RULES.INDEX,
    APP_CONSTANTS.PATHS.MOCK_SERVER.INDEX,
  ].some((path) => pathname.includes(path));

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
        title: "Network inspector",
        path: PATHS.NETWORK_INSPECTOR.RELATIVE,
        icon: (
          <span className="icon-with-badge">
            <NetworkTrafficInspectorIcon /> <RQBadge badgeText="NEW" />
          </span>
        ),

        display: appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION,
      },
      {
        id: 3,
        title: "HTTP Rules",
        path: PATHS.RULES.INDEX,
        icon: <HttpRulesIcon />,
        display: true,
        activeColor: "var(--http-rules)",
      },
      // {
      //   id: 6,
      //   title: "API Security & Testing",
      //   path: PATHS.API_SECURITY_TESTING.INDEX,
      //   icon: (
      //     <span className="icon-with-badge">
      //       <WolfSafeIcon /> <RQBadge badgeText="NEW" />
      //     </span>
      //   ),
      //   display: true,
      //   activeColor: "var(--session-recording)",
      // },
      {
        id: 4,
        title: "Sessions",
        path: PATHS.SESSIONS.INDEX,
        icon: (
          <Tooltip
            placement="right"
            open={isSavingNetworkSession}
            title={showTooltipForSessionIcon ? "View and manage your saved sessions here" : ""}
          >
            <span className="icon-with-badge">
              <SessionIcon />
            </span>
          </Tooltip>
        ),
        display: true,
        activeColor: "var(--session-recording)",
      },
      {
        id: 5,
        title: "Mock server",
        path: PATHS.MOCK_SERVER.INDEX,
        icon: <MockServerIcon />,
        display: true,
        activeColor: "var(--mock-server)",
      },
      {
        id: 6,
        title: "API client",
        path: PATHS.API_CLIENT.INDEX,
        icon: <ApiOutlined />,
        display: true,
        activeColor: "var(--api-client)",
      },
    ];

    if (isDesktopSessionsCompatible) {
      items[4] = {
        id: 4,
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
      {isSecondarySidebarCollapsed && isSecondarySidebarToggleAllowed && <SidebarToggleButton />}
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
        {isIncentivizationEnabled ? <CreditsButton /> : null}
        {isSlackConnectFeatureEnabled && isSlackInviteVisible && <JoinSlackButton />}
        <InviteButton />
      </div>
    </div>
  );
};
