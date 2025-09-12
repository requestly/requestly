import React, { useEffect, useLayoutEffect, useState } from "react";
import APIClientSidebar from "./screens/apiClient/components/sidebar/APIClientSidebar";
import { TabsContainer } from "componentsV2/Tabs/components/TabsContainer";
import { TabServiceProvider } from "componentsV2/Tabs/store/TabServiceContextProvider";
import { LocalSyncRefreshHandler } from "./LocalSyncRefreshHandler";
import "./container.scss";
import { ApiClientLoadingView } from "./screens/apiClient/components/views/components/ApiClientLoadingView/ApiClientLoadingView";
import { clearAllStaleContextOnAuthChange, setupContextWithRepo } from "./commands/context";
import { useSelector } from "react-redux";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import {
  apiClientMultiWorkspaceViewStore,
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "./store/multiWorkspaceView/multiWorkspaceView.store";
import Daemon from "./store/apiRecords/Daemon";
import { ApiClientProvider } from "./contexts";
import { loadWorkspaces } from "./commands/multiView/loadPendingWorkspaces.command";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { createRepository } from "./commands/context/setupContext.command";
import Split from "react-split";

const ApiClientFeatureContainer: React.FC = () => {
  const user: Record<string, any> = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const [viewMode, isLoaded, getViewMode] = useApiClientMultiWorkspaceView((s) => [
    s.viewMode,
    s.isLoaded,
    s.getViewMode,
  ]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useLayoutEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getSecondPaneMinSize = () => {
    return screenWidth < 1440 ? 700 : 800;
  };

  useEffect(() => {
    (async () => {
      if (getViewMode() === ApiClientViewMode.MULTI) {
        await loadWorkspaces();
        return;
      }
    })();
  }, [getViewMode]);

  useEffect(() => {
    if (viewMode === ApiClientViewMode.MULTI) {
      return;
    }

    if (!activeWorkspace) {
      return;
    }

    (async () => {
      apiClientMultiWorkspaceViewStore.getState().setIsLoaded(false);

      clearAllStaleContextOnAuthChange({
        user: { loggedIn: user.loggedIn },
        workspaceType: activeWorkspace.workspaceType,
      });

      const repository = createRepository(activeWorkspace, {
        loggedIn: user.loggedIn,
        uid: user.details?.profile?.uid ?? "",
      });

      await setupContextWithRepo(activeWorkspace.id, repository);
    })();
  }, [user.loggedIn, user.details?.profile?.uid, activeWorkspace?.id, viewMode]);

  if (!isLoaded) {
    return <ApiClientLoadingView />;
  }

  return (
    <TabServiceProvider>
      <LocalSyncRefreshHandler />
      <div className="api-client-container">
        <Daemon />
        <ApiClientProvider>
          <Split
            className="api-client-container__split"
            direction="horizontal"
            sizes={[20, 80]}
            minSize={[300, getSecondPaneMinSize()]}
            gutterSize={8}
          >
            <APIClientSidebar />
            <TabsContainer />
          </Split>
        </ApiClientProvider>
      </div>
    </TabServiceProvider>
  );
};

export default ApiClientFeatureContainer;
