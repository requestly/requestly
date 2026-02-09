import React, { useEffect, useLayoutEffect, useState } from "react";
import APIClientSidebar from "./screens/apiClient/components/sidebar/APIClientSidebar";
import { TabsContainer } from "componentsV2/Tabs/components/TabsContainer";
import "./container.scss";
import { ApiClientLoadingView } from "./screens/apiClient/components/views/components/ApiClientLoadingView/ApiClientLoadingView";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getWorkspaceViewSlice } from "./slices/workspaceView/slice";
import Daemon from "./store/apiRecords/Daemon";
import { ApiClientProvider } from "./contexts";
import { setupWorkspaceView } from "./slices/workspaceView/thunks";
import Split from "react-split";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { RootState } from "store/types";
import { InvalidContextVersionError } from "./slices/workspaceView/helpers/ApiClientContextRegistry/ApiClientContextRegistry";

const ApiClientFeatureContainer: React.FC = () => {
  const dispatch = useDispatch();
  const user: Record<string, any> = useSelector(getUserAuthDetails);
  const isSetupDone = useSelector((s: RootState) => getWorkspaceViewSlice(s).isSetupDone);
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
      const result = await dispatch(
        setupWorkspaceView({
          userId: user.details?.profile?.uid,
        }) as any
      ).unwrap();
      if (result?.error) {
        if (result.error.name === InvalidContextVersionError.name) {
          return;
        } else {
          throw new Error(result?.error);
        }
      }
    })();
  }, [dispatch, user.details?.profile?.uid]);

  if (!isSetupDone) {
    return <ApiClientLoadingView />;
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
