import React, { useEffect, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { CollectionViewContextProvider } from "../../collectionView.context";
import Split from "react-split";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { toast } from "utils/Toast";
import * as Sentry from "@sentry/react";
import { RunnerViewLoader } from "./components/RunnerViewLoader/RunnerViewLoader";
import { RunConfigView } from "./components/RunConfigView/RunConfigView";
import { RunViewContextProvider } from "./run.context";
import { RunResultView } from "./components/RunResultView/RunResultView";
import { RunResult } from "features/apiClient/store/collectionRunResult/runResult.store";
import { DataFileModalProvider } from "./components/RunConfigView/ParseFileModal/Modals/DataFileModalContext";
import { getDefaultRunConfig } from "features/apiClient/slices/runConfig/thunks";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { runnerConfigActions } from "features/apiClient/slices/runConfig/slice";
import { fromSavedRunConfig, getRunnerConfigId } from "features/apiClient/slices/runConfig/types";
import { useActiveTabId } from "componentsV2/Tabs/slice/hooks";
import { getApiClientFeatureContext } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/hooks";
import { bufferActions } from "features/apiClient/slices/buffer";
import { tabsActions } from "componentsV2/Tabs/slice";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import "./collectionRunnerView.scss";

interface Props {
  collectionId: RQAPI.CollectionRecord["id"];
  activeTabKey: string;
}

export const CollectionRunnerView: React.FC<Props> = ({ collectionId, activeTabKey }) => {
  // const {
  //   runner: { getDefaultRunConfig, getRunResults },
  // } = useCommand();

  const workspaceId = useWorkspaceId();
  const dispatch = useApiClientDispatch();
  const activeTabId = useActiveTabId();
  const [isLoading, setIsLoading] = useState(false);
  const [runResults] = useState<RunResult[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const result = await dispatch(getDefaultRunConfig({ workspaceId, collectionId })).unwrap();
        dispatch(runnerConfigActions.hydrateRunConfig(collectionId, result));

        // Create buffer for run config
        if (activeTabId) {
          const referenceId = getRunnerConfigId(collectionId, result.id);

          const ctx = getApiClientFeatureContext(workspaceId);
          const bufferAction = ctx.store.dispatch(
            bufferActions.open({
              entityType: ApiClientEntityType.RUN_CONFIG,
              isNew: false,
              referenceId,
              data: fromSavedRunConfig(collectionId, result),
            })
          );

          // Register buffer as secondary buffer to the tab
          dispatch(
            tabsActions.registerSecondaryBuffer({
              tabId: activeTabId,
              bufferId: bufferAction.meta.id,
            })
          );
        }
      } catch (error) {
        toast.error("Something went wrong!");
        Sentry.captureException(error, { extra: { collectionId } });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [collectionId, workspaceId, activeTabId, dispatch]);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       setRunResults(null);
  //       const results = await getRunResults({ collectionId });
  //       setRunResults(results);
  //     } catch (error) {
  //       toast.error("Something went wrong!");
  //       Sentry.captureException(error, { extra: { collectionId } });
  //     }
  //   })();
  // }, [collectionId, getRunResults]);

  if (isLoading) {
    return <RunnerViewLoader />;
  }

  return (
    <CollectionViewContextProvider key={collectionId} collectionId={collectionId}>
      <AutogenerateProvider>
        {/* <RunViewContextProvider runConfig={config} history={runResults}> */}
        <div className="collection-runner-view">
          <Split
            gutterSize={4}
            sizes={[50, 50]}
            minSize={[400, 500]}
            direction="horizontal"
            className="collection-runner-view-split"
          >
            <DataFileModalProvider>
              <RunConfigView activeTabKey={activeTabKey} />
              {/* <RunResultView /> */}
            </DataFileModalProvider>
          </Split>
        </div>
        {/* </RunViewContextProvider> */}
      </AutogenerateProvider>
    </CollectionViewContextProvider>
  );
};
