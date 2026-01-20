import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Tooltip } from "antd";
import { getAppMode, getIsSecondarySidebarCollapsed, getNetworkSessionSaveInProgress } from "store/selectors";

import { PrimarySidebarLink } from "./components/PrimarySidebarLink/PrimarySidebarLink";
import { PrimarySidebarItem } from "../type";
import InviteButton from "./components/InviteButton/InviteButton";
import PATHS from "config/constants/sub/paths";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import JoinSlackButton from "./components/JoinSlackButton/JoinSlackButton";
import useFetchSlackInviteVisibility from "components/misc/SupportPanel/useSlackInviteVisibility";
import { SidebarToggleButton } from "componentsV2/SecondarySidebar/components/SidebarToggleButton/SidebarToggleButton";
import APP_CONSTANTS from "config/constants";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import { isSafariBrowser, isSafariExtension } from "actions/ExtensionActions";
import { SafariComingSoonTooltip } from "componentsV2/SafariExtension/SafariComingSoonTooltip";
import { RQTooltip } from "lib/design-system-v2/components";
import HomeIcon from "/assets/media/common/feature_home.svg";
import NetworkIcon from "/assets/media/common/feature_network.svg";
import RulesIcon from "/assets/media/common/feature_rules.svg";
import ApiIcon from "/assets/media/common/feature_apis.svg";
import FilesIcon from "/assets/media/common/feature_files.svg";
import SessionsIcon from "/assets/media/common/feature_sessions.svg";

import "./PrimarySidebar.css";

enum SidebarItemKey {
  HOME = "home",
  NETWORK = "network",
  NETWORK_INSPECTOR = "network_inspector",
  RULES = "rules",
  APIs = "apis",
  FILES = "files",
  SESSIONS = "sessions",
}

const LocalWorkspaceSidebarOrder = [
  SidebarItemKey.HOME,
  SidebarItemKey.NETWORK,
  SidebarItemKey.APIs,
  SidebarItemKey.SESSIONS,
  SidebarItemKey.RULES,
  SidebarItemKey.FILES,
];

const defaultSidebarOrder = [
  SidebarItemKey.HOME,
  SidebarItemKey.NETWORK,
  SidebarItemKey.NETWORK_INSPECTOR,
  SidebarItemKey.RULES,
  SidebarItemKey.APIs,
  SidebarItemKey.FILES,
  SidebarItemKey.SESSIONS,
];

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

  const sidebarItems = useMemo(() => {
    const showTooltipForSessionIcon = appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP && isSavingNetworkSession;

    const itemsMap: Record<SidebarItemKey, PrimarySidebarItem> = {
      [SidebarItemKey.HOME]: {
        id: 0,
        title: "Home",
        path: PATHS.HOME.RELATIVE,
        icon: <img src={HomeIcon} alt="home" />,
        display: appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && !isSafariBrowser(),
      },
      [SidebarItemKey.NETWORK]: {
        id: 1,
        title: "Network",
        path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.RELATIVE,
        icon: <img src={NetworkIcon} alt="network" />,
        display: appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
      },
      [SidebarItemKey.NETWORK_INSPECTOR]: {
        id: 2,
        title: "Network",
        path: PATHS.NETWORK_INSPECTOR.RELATIVE,
        icon: <img src={NetworkIcon} alt="network" />,
        display: appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && !isSafariBrowser(),
      },
      [SidebarItemKey.RULES]: {
        id: 3,
        title: "Rules",
        path: PATHS.RULES.INDEX,
        icon: (
          <SafariComingSoonTooltip isVisible={isSafariExtension()}>
            <img src={RulesIcon} alt="rules" />
          </SafariComingSoonTooltip>
        ),
        display: true,
        tooltipContent: (
          <>
            Rules are conditions that automatically apply modifications to HTTP traffic, helping you customize and test
            network behavior without manual steps.
            <br />
            <br />
            They are currently not available in local workspaces. Switch to a private or team workspace to access Rules.
          </>
        ),
        disabled: isLocalSyncEnabled,
      },
      [SidebarItemKey.APIs]: {
        id: 4,
        title: "APIs",
        path: PATHS.API_CLIENT.INDEX,
        icon: <img src={ApiIcon} alt="apis" />,
        display: true,
      },
      [SidebarItemKey.FILES]: {
        id: 5,
        title: "Files",
        path: PATHS.MOCK_SERVER.INDEX,
        icon: <img src={FilesIcon} alt="files" />,
        display: true,
        tooltipContent: (
          <>
            Quickly upload JSON, JS, or CSS files and serve them as mock API endpoints to test your frontend without any
            backend changes.
            <br />
            <br />
            File Server is not available in local workspaces yet. Switch to a private or team workspace to access the
            feature.
          </>
        ),
        disabled: isLocalSyncEnabled,
      },
      [SidebarItemKey.SESSIONS]: {
        id: 6,
        title: "Sessions",
        path: PATHS.SESSIONS.INDEX,
        icon: (
          <Tooltip
            placement="right"
            open={isSavingNetworkSession}
            title={showTooltipForSessionIcon ? "View and manage your saved sessions here" : ""}
          >
            <img src={SessionsIcon} alt="sessions" />
          </Tooltip>
        ),
        display: true,
      },
    };

    if (isDesktopSessionsCompatible) {
      itemsMap[SidebarItemKey.SESSIONS] = {
        id: 6,
        title: "Desktop Sessions",
        path: PATHS.SESSIONS.DESKTOP.INDEX,
        icon: (
          <Tooltip
            placement="right"
            open={isSavingNetworkSession}
            title={showTooltipForSessionIcon ? "View and manage your saved sessions here" : ""}
          >
            <img src={SessionsIcon} alt="Desktopsessions" />
          </Tooltip>
        ),
        display: true,
      };
    }
    return itemsMap;
  }, [appMode, isSavingNetworkSession, isLocalSyncEnabled, isDesktopSessionsCompatible]);

  const renderSidebarItems = (order: SidebarItemKey[]) => {
    return order.map((item) => {
      const sidebarItem = sidebarItems[item];
      return sidebarItem.disabled ? (
        <RQTooltip placement="rightTop" showArrow={false} title={sidebarItem.tooltipContent} key={sidebarItem.id}>
          <li style={{ cursor: "not-allowed" }}>
            <PrimarySidebarLink {...sidebarItem} />
          </li>
        </RQTooltip>
      ) : sidebarItem.display ? (
        <li key={sidebarItem.id}>
          <PrimarySidebarLink {...sidebarItem} />
        </li>
      ) : null;
    });
  };

  return (
    <div className="primary-sidebar-container">
      {isSecondarySidebarCollapsed && isSecondarySidebarToggleAllowed && <SidebarToggleButton />}
      <ul>
        {isLocalSyncEnabled ? renderSidebarItems(LocalWorkspaceSidebarOrder) : renderSidebarItems(defaultSidebarOrder)}
      </ul>
      <div className="primary-sidebar-bottom-btns">
        {isSlackConnectFeatureEnabled && isSlackInviteVisible && <JoinSlackButton />}
        {!isLocalSyncEnabled && <InviteButton />}
      </div>
    </div>
  );
};
