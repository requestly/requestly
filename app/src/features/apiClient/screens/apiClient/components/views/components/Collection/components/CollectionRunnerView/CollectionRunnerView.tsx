import React, { useEffect, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { CollectionViewContextProvider } from "../../collectionView.context";
import Split from "react-split";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { toast } from "utils/Toast";
import * as Sentry from "@sentry/react";
import { RunnerViewLoader } from "./components/RunnerViewLoader/RunnerViewLoader";
import { RunConfigView } from "./components/RunConfigView/RunConfigView";
import { RunResult } from "features/apiClient/store/collectionRunResult/runResult.store";
import { DataFileModalProvider } from "./components/RunConfigView/ParseFileModal/Modals/DataFileModalContext";
import { getDefaultRunConfig } from "features/apiClient/slices/runConfig/thunks";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { runnerConfigActions } from "features/apiClient/slices/runConfig/slice";
import { fromSavedRunConfig, getRunnerConfigId } from "features/apiClient/slices/runConfig/types";
import { useActiveTabId } from "componentsV2/Tabs/slice/hooks";
import { bufferActions } from "features/apiClient/slices/buffer";
import { tabsActions } from "componentsV2/Tabs/slice";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import "./collectionRunnerView.scss";
import { useApiClientStore } from "features/apiClient/slices";
import { findBufferByReferenceId } from "features/apiClient/slices/buffer/slice";

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
  const [isLoading, setIsLoading] = useState(true);
  const [runResults] = useState<RunResult[]>([]);
  const store = useApiClientStore();

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const result = await dispatch(getDefaultRunConfig({ workspaceId, collectionId })).unwrap();
        dispatch(runnerConfigActions.hydrateRunConfig(collectionId, result));

        // Create buffer for run config
        const state = store.getState();
        const referenceId = getRunnerConfigId(collectionId, result.id);
        // Need to fix
        const existingBuffer = referenceId ? findBufferByReferenceId(state.buffer.entities, referenceId) : null;

        const bufferAction = dispatch(
          bufferActions.open(
            {
              entityType: ApiClientEntityType.RUN_CONFIG,
              isNew: false,
              referenceId,
              data: fromSavedRunConfig(collectionId, result),
            },
            {
              id: existingBuffer?.id,
            }
          )
        );

        // Register buffer as secondary buffer to the tab
        dispatch(
          tabsActions.registerSecondaryBuffer({
            tabId: activeTabId,
            bufferId: bufferAction.meta.id,
          })
        );
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
