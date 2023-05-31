import React from "react";
import { NavLink } from "react-router-dom";
import { PrimarySidebarItem } from "../type";

export const PrimarySidebarLink: React.FC<PrimarySidebarItem> = ({ title, path, icon }) => (
  <NavLink to={path} className="primary-sidebar-link">
    <span className="icon__wrapper">{icon}</span>
    <span className="link-title">{title}</span>
  </NavLink>
);
