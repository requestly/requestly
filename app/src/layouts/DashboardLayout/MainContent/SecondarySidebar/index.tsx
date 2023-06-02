import React from "react";
import { NavLink } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import "./SecondarySidebar.css";

const items = [
  {
    title: "My rules",
    path: PATHS.NEW.RULES.MY_RULES.ABSOLUTE,
  },
  {
    title: "Shared list",
    path: PATHS.NEW.RULES.SHARED_LISTS.ABSOLUTE,
  },
  {
    title: "Templates",
    path: PATHS.NEW.RULES.TEMPLATES.ABSOLUTE,
  },
  {
    title: "Trash",
    path: PATHS.NEW.RULES.TRASH.ABSOLUTE,
  },
];

export const SecondarySidebar: React.FC = () => {
  return (
    <div className="secondary-sidebar-container">
      <ul>
        {items.map(({ path, title }) => (
          <li key={title}>
            <NavLink to={path} className={({ isActive }) => (isActive ? `secondary-sidebar-active-link` : ``)}>
              {title}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
