import { TabsContainer } from "componentsV2/Tabs/components/TabsContainer";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
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

const ApiClientFeatureContainer: React.FC = () => {
  const dispatch = useDispatch();
  const user: Record<string, any> = useSelector(getUserAuthDetails);
  const isSetupDone = useSelector((s: RootState) => getWorkspaceViewSlice(s).isSetupDone);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const loadingError = useWorkspaceLoadingError();

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

  const setupPromiseRef = useRef<ReturnType<typeof dispatch> & { abort?: () => void }>(undefined);

  useEffect(() => {
    // Abort any in-flight setup before starting a new one.
    // createAsyncThunk returns a promise with .abort() that sets signal.aborted = true
    // and rejects the thunk, preventing stale clearAll()/addContext() from racing.
    setupPromiseRef.current?.abort?.();

    const promise = dispatch(
      setupWorkspaceView({
        userId: user.details?.profile?.uid,
      }) as any
    );

    setupPromiseRef.current = promise;

    return () => {
      promise.abort?.();
    };
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
        </ApiClientProvider>
      </div>
    </DndProvider>
  );
};

export default ApiClientFeatureContainer;
