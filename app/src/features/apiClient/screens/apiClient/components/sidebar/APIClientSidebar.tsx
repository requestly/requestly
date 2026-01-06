import React from "react";
import { SingleWorkspaceSidebar } from "./SingleWorkspaceSidebar/SingleWorkspaceSidebar";
import { ApiClientViewMode } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { useViewMode, useGetSingleModeWorkspace } from "features/apiClient/slices/workspaceView/hooks";
import { MultiWorkspaceSidebar } from "./MultiWorkspaceSidebar/MultiWorkspaceSidebar";
import { WorkspaceProvider } from "features/apiClient/common/WorkspaceProvider";
import { ApiClientLoadingView } from "../views/components/ApiClientLoadingView/ApiClientLoadingView";

const SingleViewSidebarWrapper = () => {
  const workspace = useGetSingleModeWorkspace();

  if (workspace.status.loading) {
    return <ApiClientLoadingView />;
  }

  return (
    <WorkspaceProvider workspaceId={workspace.id}>
      <SingleWorkspaceSidebar />
    </WorkspaceProvider>
  );
};

const APIClientSidebar: React.FC = () => {
  const viewMode = useViewMode();

  if (viewMode === ApiClientViewMode.SINGLE) {
    return <SingleViewSidebarWrapper />;
  }

  return <MultiWorkspaceSidebar />;
};

export default APIClientSidebar;
