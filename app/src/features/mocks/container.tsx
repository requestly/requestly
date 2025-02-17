import React from "react";
import { Outlet } from "react-router-dom";
import { MocksSidebar } from "./components/MocksSidebar/MocksSidebar";
import { SecondarySidebarLayout } from "componentsV2/SecondarySidebar";
import { MocksContextProvider } from "./contexts";
import { getIsWorkspaceLocal } from "store/features/teams/selectors";
import { useSelector } from "react-redux";

const MocksFeatureContainer: React.FC = () => {
  const isWorkspaceLocal = useSelector(getIsWorkspaceLocal);

  if (isWorkspaceLocal) {
    return <div>NO ACCESS - LOCAL WORKSPACE</div>;
  }

  return (
    <SecondarySidebarLayout secondarySidebar={<MocksSidebar />}>
      <MocksContextProvider>
        <Outlet />
      </MocksContextProvider>
    </SecondarySidebarLayout>
  );
};

export default MocksFeatureContainer;
