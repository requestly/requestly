import React from "react";
import { NavLink } from "react-router-dom";

import "./SecondarySidebarItem.css";

interface Props {
  path: string;
  title: string;
  customClass?: string;
  icon?: React.ReactNode;
}

export const SecondarySidebarItem: React.FC<Props> = ({ path, title, icon, customClass = "" }) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `rq-secondary-sidebar-item ${customClass} ${isActive ? "rq-secondary-sidebar-active-item" : ""}`
      }
    >
      {icon ? <span className="icon__wrapper">{icon}</span> : null}
      {title}
    </NavLink>
  );
};
