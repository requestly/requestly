import React from "react";
import { SingleWorkspaceSidebar } from "./SingleWorkspaceSidebar/SingleWorkspaceSidebar";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { MultiWorkspaceSidebar } from "./MultiWorkspaceSidebar/MultiWorkspaceSidebar";

const APIClientSidebar: React.FC = () => {
  const viewMode = useApiClientMultiWorkspaceView((s) => s.viewMode);

  return viewMode === ApiClientViewMode.SINGLE ? <SingleWorkspaceSidebar /> : <MultiWorkspaceSidebar />;
};

export default APIClientSidebar;
