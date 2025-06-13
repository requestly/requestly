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
import JoinSlackButton from "./components/JoinSlackButton/JoinSlackButton";
import useFetchSlackInviteVisibility from "components/misc/SupportPanel/useSlackInviteVisibility";
import { SidebarToggleButton } from "componentsV2/SecondarySidebar/components/SidebarToggleButton/SidebarToggleButton";
import APP_CONSTANTS from "config/constants";
import { RQBadge } from "lib/design-system/components/RQBadge";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import "./PrimarySidebar.css";
import { isSafariBrowser, isSafariExtension } from "actions/ExtensionActions";
import { SafariComingSoonTooltip } from "componentsV2/SafariExtension/SafariComingSoonTooltip";

export const PrimarySidebar: React.FC = () => {
  const { pathname } = useLocation();
  const appMode = useSelector(getAppMode);
  const isSavingNetworkSession = useSelector(getNetworkSessionSaveInProgress);
  const isSecondarySidebarCollapsed = useSelector(getIsSecondarySidebarCollapsed);
  const isSlackConnectFeatureEnabled = useFeatureIsOn("slack_connect");
  const isSlackInviteVisible = useFetchSlackInviteVisibility();
  const isLocalSyncEnabled = useCheckLocalSyncSupport();

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
        display: appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && !isSafariBrowser(),
      },
      {
        id: 1,
        title: "Network",
        path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.RELATIVE,
        icon: <NetworkTrafficIcon />,
        display: appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
      },
      {
        id: 2,
        title: "Network",
        path: PATHS.NETWORK_INSPECTOR.RELATIVE,
        icon: <NetworkTrafficInspectorIcon />,
        display: appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && !isSafariBrowser(),
      },
      {
        id: 3,
        title: "Rules",
        path: PATHS.RULES.INDEX,
        icon: (
          <SafariComingSoonTooltip isVisible={isSafariExtension()}>
            <HttpRulesIcon />
          </SafariComingSoonTooltip>
        ),
        display: true,
      },
      {
        id: 4,
        title: "APIs",
        path: PATHS.API_CLIENT.INDEX,
        icon: (
          <span className="icon-with-badge">
            <ApiOutlined />
            <RQBadge badgeText="BETA" />
          </span>
        ),
        display: true,
      },
      {
        id: 5,
        title: "Files",
        path: PATHS.MOCK_SERVER.INDEX,
        icon: <MockServerIcon />,
        display: true,
      },
      {
        id: 6,
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
      },
    ];

    if (isDesktopSessionsCompatible) {
      items[6] = {
        id: 6,
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
        {isSlackConnectFeatureEnabled && isSlackInviteVisible && <JoinSlackButton />}
        {!isLocalSyncEnabled && <InviteButton />}
      </div>
    </div>
  );
};
