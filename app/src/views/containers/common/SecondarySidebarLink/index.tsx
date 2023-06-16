import React from "react";
import { NavLink } from "react-router-dom";
import "./SecondarySidebarLink.css";

interface Props<T = string> {
  path: T;
  title: T;
  customClass?: T;
  icon?: React.ReactNode;
  isActiveLink: (isActive: boolean, path?: T) => boolean;
}

export const SecondarySidebarLink: React.FC<Props> = ({ path, title, icon, customClass = "", isActiveLink }) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `secondary-sidebar-link ${customClass} ${isActiveLink(isActive, path) ? "secondary-sidebar-active-link" : ""}`
      }
    >
      {icon ? <span className="icon__wrapper">{icon}</span> : null}
      {title}
    </NavLink>
  );
};
