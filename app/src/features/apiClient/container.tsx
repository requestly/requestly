import { TabsContainer } from "componentsV2/Tabs/components/TabsContainer";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import Split from "react-split";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RootState } from "store/types";
import "./container.scss";
import { ApiClientProvider } from "./contexts";
import APIClientSidebar from "./screens/apiClient/components/sidebar/APIClientSidebar";
import { ApiClientLoadingView } from "./screens/apiClient/components/views/components/ApiClientLoadingView/ApiClientLoadingView";
import { useWorkspaceLoadingError } from "./slices";
import { getWorkspaceViewSlice } from "./slices/workspaceView/slice";
import { setupWorkspaceView } from "./slices/workspaceView/thunks";
import Daemon from "./store/apiRecords/Daemon";
import { useMigrationSegment } from "./hooks/useMigrationSegment";
import { MigrationBlockModal } from "./screens/migrationBlock";
import { MIGRATION_BLOCK_FLAG, MIGRATION_BLOCK_DISMISSABLE_FLAG } from "./screens/migrationBlock/constants";
import { WorkspaceProvider } from "./common/WorkspaceProvider";
import { useGetAllSelectedWorkspaces } from "./slices/workspaceView/hooks";

const ApiClientFeatureContainer: React.FC = () => {
  const dispatch = useDispatch();
  const user: Record<string, any> = useSelector(getUserAuthDetails);
  const isSetupDone = useSelector((s: RootState) => getWorkspaceViewSlice(s).isSetupDone);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const loadingError = useWorkspaceLoadingError();

  const isBlockFlagOn = useFeatureIsOn(MIGRATION_BLOCK_FLAG);
  const isDismissableFlagOn = useFeatureIsOn(MIGRATION_BLOCK_DISMISSABLE_FLAG);
  const segment = useMigrationSegment();
  const shouldShowBlock = isBlockFlagOn && segment === "local-storage";

  // The modal calls useWorkspaceZipDownload, which uses useApiClientSelector + the
  // API Client context registry. Both are keyed off the API Client's internal
  // workspace (registered by setupWorkspaceView — can differ from the global
  // getActiveWorkspace.id, e.g., FAKE_LOGGED_OUT_WORKSPACE_ID when signed out).
  // Read from the same source the sidebar uses, and gate on status.loading so
  // WorkspaceProvider doesn't hit the registry before the entry is populated.
  const selectedWorkspaces = useGetAllSelectedWorkspaces();
  const blockWorkspace =
    shouldShowBlock && selectedWorkspaces.length === 1 && !selectedWorkspaces[0]?.status.loading
      ? selectedWorkspaces[0]
      : null;

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
    dispatch(
      setupWorkspaceView({
        userId: user.details?.profile?.uid,
      }) as any
    );
  }, [dispatch, user.details?.profile?.uid]);

  if (!isSetupDone) {
    return <ApiClientLoadingView />;
  }

  if (loadingError) {
    throw loadingError;
  }

  return (
    <DndProvider backend={HTML5Backend} context={window}>
      {/*<LocalSyncRefreshHandler /> */}
      <div className="api-client-container">
        <Daemon />
        <ApiClientProvider>
          <Split
            className="api-client-container__split"
            direction="horizontal"
            sizes={[20, 80]}
            minSize={[300, getSecondPaneMinSize()]}
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
          {blockWorkspace && (
            <WorkspaceProvider workspaceId={blockWorkspace.id}>
              <MigrationBlockModal dismissable={isDismissableFlagOn} />
            </WorkspaceProvider>
          )}
        </ApiClientProvider>
      </div>
    </DndProvider>
  );
};

export default ApiClientFeatureContainer;
