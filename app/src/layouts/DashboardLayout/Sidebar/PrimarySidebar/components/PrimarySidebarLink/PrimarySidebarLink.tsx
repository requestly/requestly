import React from "react";
import { NavLink } from "react-router-dom";
import { PrimarySidebarItem } from "../../../type";

export const PrimarySidebarLink: React.FC<PrimarySidebarItem> = ({
  title,
  path,
  icon,
  activeColor = "var(--primary)",
}) => (
  <NavLink
    to={path}
    className={({ isActive }) => `primary-sidebar-link ${isActive ? "primary-sidebar-active-link" : ""}`}
    style={({ isActive }) => {
      return {
        borderLeftColor: isActive ? activeColor : null,
      };
    }}
  >
    {icon}
    <span className="link-title">{title}</span>
  </NavLink>
);
