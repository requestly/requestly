import React from "react";
import { NavLink } from "react-router-dom";
import { PrimarySidebarItem } from "../../../type";

export const PrimarySidebarLink: React.FC<PrimarySidebarItem> = ({
  title,
  path,
  icon,
  activeColor = "var(--requestly-color-primary)",
  disabled,
}) => (
  <NavLink
    to={path}
    className={({ isActive }) => `primary-sidebar-link ${isActive ? "primary-sidebar-active-link" : ""}`}
    aria-disabled={disabled || undefined}
    onClick={disabled ? (e) => e.preventDefault() : undefined}
    style={({ isActive }) => {
      return {
        borderLeftColor: isActive ? activeColor : null,
        pointerEvents: disabled ? "none" : undefined,
      };
    }}
  >
    {icon}
    <span className="link-title">{title}</span>
  </NavLink>
);
