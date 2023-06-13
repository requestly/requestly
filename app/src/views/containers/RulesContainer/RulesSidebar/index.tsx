import React, { useCallback } from "react";
import { useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { SecondarySidebarLink } from "../../common/SecondarySidebarLink";
import { ReactComponent as MyRulesIcon } from "assets/icons/http-rules/my-rules.svg";
import { ReactComponent as TemplatesIcon } from "assets/icons/http-rules/templates.svg";
import { ReactComponent as SharedListIcon } from "assets/icons/http-rules/shared-list.svg";
import { ReactComponent as TrashIcon } from "assets/icons/http-rules/trash.svg";
import "./RulesSidebar.css";

const ruleRoutes = [
  {
    title: "My Rules",
    path: PATHS.RULES.MY_RULES.ABSOLUTE,
    icon: <MyRulesIcon />,
  },
  {
    title: "Shared lists",
    path: PATHS.SHARED_LISTS.RELATIVE,
    icon: <SharedListIcon />,
  },
  {
    title: "Templates",
    path: PATHS.RULES.TEMPLATES.ABSOLUTE,
    icon: <TemplatesIcon />,
  },
  {
    title: "Trash",
    path: PATHS.RULES.TRASH.ABSOLUTE,
    icon: <TrashIcon />,
  },
];

export const RulesSidebar: React.FC = () => {
  const { pathname } = useLocation();

  const isActiveLink = useCallback(
    (isActive: boolean, path: string) => {
      return isActive || (path === PATHS.RULES.MY_RULES.ABSOLUTE && pathname.includes(PATHS.RULE_EDITOR.RELATIVE));
    },
    [pathname]
  );

  return (
    <div className="rules-sidebar-container">
      <ul>
        {ruleRoutes.map(({ path, title, icon }) => (
          <li key={title}>
            <SecondarySidebarLink icon={icon} path={path} title={title} isActiveLink={isActiveLink} />
          </li>
        ))}
      </ul>
    </div>
  );
};
