import React from "react";
import { Outlet } from "react-router-dom";
import { MocksSidebar } from "./components/MocksSidebar/MocksSidebar";
import { SecondarySidebarLayout } from "componentsV2/SecondarySidebar";
import { MocksContextProvider } from "./contexts";
import { LocalFirstComingSoon } from "componentsV2/Nudge/views/LocalFirstComingSoon/LocalFirstComingSoon";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";

const MocksFeatureContainer: React.FC = () => {
  const isLocalSyncEnabled = useCheckLocalSyncSupport();
  const viewMode = useApiClientMultiWorkspaceView((s) => s.viewMode);

  // fixme: rethink when expanding multi view to cloud workspaces
  if (isLocalSyncEnabled || viewMode === ApiClientViewMode.MULTI) {
    return (
      <LocalFirstComingSoon
        featureName="Mock Server"
        featureDescription="Mock Server is a powerful and open-source tool to modify & mock API responses superfast, allows you to build frontend faster without waiting for backend & much more."
      />
    );
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
