import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { getIsSecondarySidebarCollapsed } from "store/selectors";
import { MocksSidebar } from "./components/MocksSidebar/MocksSidebar";
import "./container.scss";

const MocksFeaturecontainer: React.FC = () => {
  const isSecondarySidebarCollapsed = useSelector(getIsSecondarySidebarCollapsed);

  return (
    <div className="mocks-container">
      {!isSecondarySidebarCollapsed && (
        <div className="secondary-sidebar-container">
          <MocksSidebar />
        </div>
      )}

      <div className="mocks-content-container">
        <Outlet />
      </div>
    </div>
  );
};

export default MocksFeaturecontainer;
