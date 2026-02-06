import React from "react";
import { useGetSingleModeWorkspace, useViewMode } from "@adapters/workspace";

import { WorkspaceProvider } from "@apiClientV2/common/WorkspaceProvider";
import { EnvironmentSwitcher } from "@apiClientV2/modules/Environments";

import { ApiClientLoadingView } from "../components/ApiClientLoadingView";

const SidebarContent: React.FC = () => {
  const workspace = useGetSingleModeWorkspace();

  if (workspace.status.loading) {
    return <ApiClientLoadingView />;
  }

  return (
    <WorkspaceProvider workspaceId={workspace.id}>
      <div className="flex flex-1 flex-col border-r border-r-neutral-600 bg-surface-0">
        <div className="flex items-center justify-between border-b border-b-neutral-600 p-1">
          <EnvironmentSwitcher />
        </div>
      </div>
    </WorkspaceProvider>
  );
};

const Sidebar: React.FC = () => {
  const viewMode = useViewMode();

  if (viewMode === "SINGLE") {
    return <SidebarContent />;
  }

  return <>Multi Workspace mode</>;
};

export default Sidebar;
