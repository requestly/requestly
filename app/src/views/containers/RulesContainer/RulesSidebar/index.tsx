import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import "./RulesSidebar.css";

const ruleRoutes = [
  {
    title: "My rules",
    path: PATHS.RULES.MY_RULES.ABSOLUTE,
  },
  {
    title: "Shared list",
    path: PATHS.SHARED_LISTS.RELATIVE,
  },
  {
    title: "Templates",
    path: PATHS.RULES.TEMPLATES.ABSOLUTE,
  },
  {
    title: "Trash",
    path: PATHS.RULES.TRASH.ABSOLUTE,
  },
];

export const RulesSidebar: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <div className="rules-sidebar-container secondary-sidebar-container">
      <ul>
        {ruleRoutes.map(({ path, title }) => (
          <li key={title}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                isActive || (path === PATHS.RULES.MY_RULES.ABSOLUTE && pathname.includes(PATHS.RULE_EDITOR.RELATIVE))
                  ? `rules-sidebar-active-link`
                  : ``
              }
            >
              {title}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
