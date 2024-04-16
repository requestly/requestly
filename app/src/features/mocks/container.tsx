import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { getIsSecondarySidebarCollapsed } from "store/selectors";
import { MocksSidebar } from "./components/MocksSidebar/MocksSidebar";
import "./container.scss";

/**
 * - update the name of compoenent
 * - mount this component v2 route
 * - render an outlet
 * - render mockslist component
 * - fetch all the mocks
 * - render the old contentlist with this mocks
 * - update the header
 *  - search
 *  - actions
 *    - new mocks
 *    - upload json
 * - move analytics into this feature component
 * - move the types
 * - SEE: Postman and Hopscotch for there collection feature [IMPPPP]
 *
 * Modals:
 *  -
 */

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
      {/*
        - add modals
        - add context
        - add outlet
          - mocks listing
          - files listing
          - editor for both
        - add sidebar
      */}
    </div>
  );
};

export default MocksFeaturecontainer;
