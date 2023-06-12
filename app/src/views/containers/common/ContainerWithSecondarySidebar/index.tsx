import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { getIsSecondarySidebarCollapsed } from "store/selectors";
import "./containerWithSecondarySidebar.css";

interface Props {
  sidebar: React.ReactNode;
}

export const ContainerWithSecondarySidebar: React.FC<Props> = ({ sidebar }) => {
  const isSecondarySidebarCollapsed = useSelector(getIsSecondarySidebarCollapsed);

  return (
    <div className="parent-container">
      {!isSecondarySidebarCollapsed && <div className="secondary-sidebar-container">{sidebar}</div>}
      <div className="outlet-container">
        <Outlet />
      </div>
    </div>
  );
};
