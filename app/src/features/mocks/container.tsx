import React from "react";
import { Outlet } from "react-router-dom";
import { MocksSidebar } from "./components/MocksSidebar/MocksSidebar";
import { SecondarySidebarLayout } from "componentsV2/SecondarySidebar";
import { MocksContextProvider } from "./contexts";
import { getIsWorkspaceLocal } from "store/features/teams/selectors";
import { useSelector } from "react-redux";
import { LocalFirstComingSoon } from "componentsV2/Nudge/views/LocalFirstComingSoon/LocalFirstComingSoon";

const MocksFeatureContainer: React.FC = () => {
  const isWorkspaceLocal = useSelector(getIsWorkspaceLocal);

  if (isWorkspaceLocal) {
    return <LocalFirstComingSoon featureName="Mock Server" />;
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
