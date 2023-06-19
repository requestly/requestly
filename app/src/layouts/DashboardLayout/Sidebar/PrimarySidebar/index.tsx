import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getNetworkSessionSaveInProgress, getUserAuthDetails } from "store/selectors";
import { PrimarySidebarItem } from "../type";
import PATHS from "config/constants/sub/paths";
import { Tooltip } from "antd";
import { ApiOutlined, MobileOutlined } from "@ant-design/icons";
import { ReactComponent as NetworkTrafficIcon } from "assets/icons/network-traffic.svg";
import { ReactComponent as HttpRulesIcon } from "assets/icons/http-rules.svg";
import { ReactComponent as SessionIcon } from "assets/icons/session.svg";
import { ReactComponent as MockServerIcon } from "assets/icons/mock-server.svg";
import FEATURES from "config/constants/sub/features";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { ReactComponent as InviteIcon } from "assets/icons/invite.svg";
import { PrimarySidebarLink } from "./PrimarySidebarLink";
import { isUserUsingAndroidDebugger } from "components/features/mobileDebugger/utils/sdkUtils";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { RQBadge } from "lib/design-system/components/RQBadge";
import "./PrimarySidebar.css";

export const PrimarySidebar: React.FC = () => {
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const isSavingNetworkSession = useSelector(getNetworkSessionSaveInProgress);
  const [isAndroidDebuggerEnabled, setIsAndroidDebuggerEnabled] = useState(false);

  useEffect(() => {
    isUserUsingAndroidDebugger(user?.details?.profile?.uid).then(setIsAndroidDebuggerEnabled);
  }, [user?.details?.profile?.uid]);

  const sidebarItems: PrimarySidebarItem[] = useMemo(() => {
    const showTooltipForSessionIcon = appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP && isSavingNetworkSession;

    const items = [
      {
        id: 0,
        title: "Network traffic",
        path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.RELATIVE,
        icon: <NetworkTrafficIcon />,
        display: appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
      },
      {
        id: 1,
        title: "HTTP Rules",
        path: PATHS.RULES.INDEX,
        icon: <HttpRulesIcon />,
        display: true,
      },
      {
        id: 2,
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
      {
        id: 3,
        title: "Mock server",
        path: PATHS.MOCK_SERVER.INDEX,
        icon: <MockServerIcon />,
        display: true,
      },
      {
        id: 4,
        title: "API client",
        path: PATHS.API_CLIENT.INDEX,
        icon: (
          <span className="icon-with-badge">
            <ApiOutlined /> <RQBadge badgeText="BETA" />
          </span>
        ),
        feature: FEATURES.API_CLIENT,
        display: true,
      },
      {
        id: 5,
        title: "Android Debugger",
        path: PATHS.MOBILE_DEBUGGER.INDEX,
        icon: <MobileOutlined />,
        display: isAndroidDebuggerEnabled,
      },
    ];

    return items.filter((item) => !item.feature || isFeatureCompatible(item.feature));
  }, [appMode, isAndroidDebuggerEnabled, isSavingNetworkSession]);

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

      <PrimarySidebarLink title="Invite" icon={<InviteIcon />} path={PATHS.ACCOUNT.MY_TEAMS.ABSOLUTE} />
    </div>
  );
};
