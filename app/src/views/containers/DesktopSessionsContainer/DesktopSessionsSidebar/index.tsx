import PATHS from "config/constants/sub/paths";
import React, { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { SecondarySidebarLink } from "views/containers/common/SecondarySidebarLink";

import { VscFileSymlinkDirectory } from "@react-icons/all-files/vsc/VscFileSymlinkDirectory";
import SessionIcon from "assets/icons/session.svg?react";

import "./DesktopSessionsSidebar.css";

const desktopSessionsRoutes: any[] = [
  {
    path: PATHS.SESSIONS.DESKTOP.SAVED_LOGS.RELATIVE,
    title: "Network Sessions",
    icon: <VscFileSymlinkDirectory />,
  },
  {
    path: PATHS.SESSIONS.DESKTOP.WEB_SESSIONS_WRAPPER.RELATIVE,
    title: "Web Sessions",
    icon: <SessionIcon />,
  },
];

export const DesktopSessionsSidebar: React.FC = () => {
  const { pathname } = useLocation();

  const isActiveLink = useCallback(
    (isActive: boolean, path: string) => {
      return isActive || (path === PATHS.RULES.MY_RULES.ABSOLUTE && pathname.includes(PATHS.RULE_EDITOR.RELATIVE));
    },
    [pathname]
  );

  return (
    <div className="desktop-sidebar-container">
      <ul>
        {desktopSessionsRoutes.map(({ path, title, icon }) => {
          return (
            <li key={title}>
              <SecondarySidebarLink icon={icon} path={path} title={title} isActiveLink={isActiveLink} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
