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
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ApiClientFeatureContainer: React.FC = () => {
  const MINIMUM_SIDEBAR_WIDTH = 280;
  const SCREEN_CONTENT_GAP = 70;
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

  const getContentHalfScreenSize = () => {
    return screenWidth / 2 - SCREEN_CONTENT_GAP;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- not adding `activeWorkspace` to control reactivity
  }, [user.loggedIn, user.details?.profile?.uid, activeWorkspace?.id, viewMode]);

  if (!isLoaded) {
    return <ApiClientLoadingView />;
  }

  return (
    <DndProvider backend={HTML5Backend} context={window}>
      <TabServiceProvider>
        <LocalSyncRefreshHandler />
        <div className="api-client-container">
          <Daemon />
          <ApiClientProvider>
            <Split
              className="api-client-container__split"
              direction="horizontal"
              sizes={[20, 80]}
              minSize={[MINIMUM_SIDEBAR_WIDTH]}
              maxSize={[getContentHalfScreenSize()]}
              gutter={(index, direction) => {
                const gutterContainer = document.createElement("div");
                gutterContainer.style.position = "relative";
                gutterContainer.className = `api-client-container__split-gutter gutter-container gutter-container-${direction}`;
                gutterContainer.innerHTML = `<div class="gutter" />`;
                return gutterContainer;
              }}
              gutterStyle={() => {
                return {
                  height: "100%",
                  width: "0px",
                };
              }}
              gutterAlign="center"
            >
              <APIClientSidebar />
              <TabsContainer />
            </Split>
          </ApiClientProvider>
        </div>
      </TabServiceProvider>
    </DndProvider>
  );
};

export default ApiClientFeatureContainer;
