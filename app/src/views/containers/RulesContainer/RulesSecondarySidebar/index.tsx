import React from "react";
import { NavLink } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import "./RulesSecondarySidebar.css";

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

export const RulesSecondarySidebar: React.FC = () => {
  return (
    <div className="rules-secondary-sidebar-container">
      <ul>
        {ruleRoutes.map(({ path, title }) => (
          <li key={title}>
            <NavLink to={path} className={({ isActive }) => (isActive ? `rules-secondary-sidebar-active-link` : ``)}>
              {title}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
