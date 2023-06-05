import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { PrimarySidebarItem } from "../type";
import PATHS from "config/constants/sub/paths";
import { ReactComponent as NetworkTrafficIcon } from "assets/icons/network-traffic.svg";
import { ReactComponent as HttpRulesIcon } from "assets/icons/http-rules.svg";
import { ReactComponent as SessionIcon } from "assets/icons/session.svg";
import { ReactComponent as MockServerIcon } from "assets/icons/mock-server.svg";
// import { ReactComponent as NetworkTrafficIcon } from "assets/icons/network-traffic.svg";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { ReactComponent as InviteIcon } from "assets/icons/invite.svg";
import { PrimarySidebarLink } from "./PrimarySidebarLink";
import "./PrimarySidebar.css";

export const PrimarySidebar: React.FC = () => {
  const appMode = useSelector(getAppMode);

  const sidebarItems: PrimarySidebarItem[] = useMemo(
    () => [
      {
        title: "Network traffic",
        path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.RELATIVE,
        icon: <NetworkTrafficIcon />,
        display: appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
      },
      {
        title: "HTTP rules",
        path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.RELATIVE,
        icon: <HttpRulesIcon />,
        display: true,
      },
      {
        title: "Session",
        path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.RELATIVE,
        icon: <SessionIcon />,
        display: true,
      },
      {
        title: "Mock server",
        path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.RELATIVE,
        icon: <MockServerIcon />,
        display: true,
      },
      {
        title: "API client",
        path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.RELATIVE,
        icon: <SessionIcon />,
        display: true,
      },
    ],
    [appMode]
  );

  return (
    <div className="primary-sidebar-container">
      <ul>
        {sidebarItems
          .filter((item) => item.display)
          .map((item) => (
            <li>
              <PrimarySidebarLink {...item} />
            </li>
          ))}
      </ul>

      <div>
        <PrimarySidebarLink title="Invite" icon={<InviteIcon />} path="/" />
      </div>
    </div>
  );
};
