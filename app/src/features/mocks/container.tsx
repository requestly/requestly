import React from "react";
import { Outlet } from "react-router-dom";
import { MocksSidebar } from "./components/MocksSidebar/MocksSidebar";
import { SecondarySidebarLayout } from "componentsV2/SecondarySidebar";
import { MocksContextProvider } from "./contexts";
import { LocalFirstComingSoon } from "componentsV2/Nudge/views/LocalFirstComingSoon/LocalFirstComingSoon";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";

const MocksFeatureContainer: React.FC = () => {
  const isLocalSyncEnabled = useCheckLocalSyncSupport();

  if (isLocalSyncEnabled) {
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
