import React, { useEffect, useState } from "react";
import APIClientSidebar from "./screens/apiClient/components/sidebar/APIClientSidebar";
import { TabsContainer } from "componentsV2/Tabs/components/TabsContainer";
import { TabServiceProvider } from "componentsV2/Tabs/store/TabServiceContextProvider";
import { LocalSyncRefreshHandler } from "./LocalSyncRefreshHandler";
import "./container.scss";
import { useGetApiClientSyncRepo } from "./helpers/modules/sync/useApiClientSyncRepo";
import { ApiClientLoadingView } from "./screens/apiClient/components/views/components/ApiClientLoadingView/ApiClientLoadingView";
import { setupContextWithRepo } from "./commands/context";
import { useSelector } from "react-redux";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { useApiClientMultiWorkspaceView } from "./store/multiWorkspaceView/multiWorkspaceView.store";
import { ApiClientFilesProvider } from "./store/ApiClientFilesContextProvider";
import Daemon from "./store/apiRecords/Daemon";
import { ApiClientProvider } from "./contexts";

const ApiClientFeatureContainer: React.FC = () => {
  const repository = useGetApiClientSyncRepo();
  const activeWorkspace = useSelector(getActiveWorkspace);
  const viewMode = useApiClientMultiWorkspaceView((s) => s.viewMode);

  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      await setupContextWithRepo(activeWorkspace.id, repository);
      setIsLoaded(true);
    })();
    // TODO: handle case for when viewMode is MULTI
  }, [repository, activeWorkspace.id, viewMode]);

  if (!isLoaded) {
    return <ApiClientLoadingView />;
  }

  return (
    <TabServiceProvider>
      <LocalSyncRefreshHandler />
      <div className="api-client-container">
        <Daemon />
        <ApiClientFilesProvider>
          <ApiClientProvider>
            <APIClientSidebar />
            <TabsContainer />
          </ApiClientProvider>
        </ApiClientFilesProvider>
      </div>
    </TabServiceProvider>
  );
};

export default ApiClientFeatureContainer;
