import React, { useCallback } from "react";
import { useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { SecondarySidebarLink } from "../../common/SecondarySidebarLink";
import MyRulesIcon from "assets/icons/http-rules/my-rules.svg?react";
import TemplatesIcon from "assets/icons/http-rules/templates.svg?react";
import SharedListIcon from "assets/icons/http-rules/shared-list.svg?react";
import TrashIcon from "assets/icons/http-rules/trash.svg?react";
import "./RulesSidebar.css";
import { useFeatureIsOn } from "@growthbook/growthbook-react";

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
  const enableTrash = useFeatureIsOn("enable-trash");

  const isActiveLink = useCallback(
    (isActive: boolean, path: string) => {
      return isActive || (path === PATHS.RULES.MY_RULES.ABSOLUTE && pathname.includes(PATHS.RULE_EDITOR.RELATIVE));
    },
    [pathname]
  );

  return (
    <div className="rules-sidebar-container">
      <ul>
        {ruleRoutes.map(({ path, title, icon }) => {
          if (title === "Trash" && !enableTrash) {
            return null;
          }
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
