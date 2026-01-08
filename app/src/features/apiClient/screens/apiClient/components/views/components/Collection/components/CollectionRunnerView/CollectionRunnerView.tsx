import * as Sentry from "@sentry/react";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { getApiClientFeatureContext } from "features/apiClient/slices";
import { getAllDescendantApiRecordIds } from "features/apiClient/slices/apiRecords/utils";
import { bufferActions } from "features/apiClient/slices/buffer";
import { findBufferByReferenceId } from "features/apiClient/slices/buffer/slice";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { runnerConfigActions } from "features/apiClient/slices/runConfig/slice";
import { getDefaultRunConfig, getRunResults } from "features/apiClient/slices/runConfig/thunks";
import { DEFAULT_RUN_CONFIG_ID } from "features/apiClient/slices/runConfig/types";
import { fromSavedRunConfig, getRunnerConfigId } from "features/apiClient/slices/runConfig/utils";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { RunResult } from "features/apiClient/store/collectionRunResult/runResult.store";
import { RQAPI } from "features/apiClient/types";
import { useHostContext } from "hooks/useHostContext";
import React, { useEffect, useState } from "react";
import Split from "react-split";
import { toast } from "utils/Toast";
import { CollectionViewContextProvider } from "../../collectionView.context";
import "./collectionRunnerView.scss";
import { DataFileModalProvider } from "./components/RunConfigView/ParseFileModal/Modals/DataFileModalContext";
import { RunConfigView } from "./components/RunConfigView/RunConfigView";
import { RunnerViewLoader } from "./components/RunnerViewLoader/RunnerViewLoader";
import { RunResultView } from "./components/RunResultView/RunResultView";
import { runHistoryActions, RunHistoryEntry } from "features/apiClient/slices/runHistory";

interface Props {
  collectionId: RQAPI.CollectionRecord["id"];
  activeTabKey: string;
}

export const CollectionRunnerView: React.FC<Props> = ({ collectionId, activeTabKey }) => {
  const workspaceId = useWorkspaceId();
  const apiClientDispatch = useApiClientDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isResultsLoading, setIsResultsLoading] = useState(true);
  const { registerSecondaryBuffer, unregisterSecondaryBuffer } = useHostContext();

  useEffect(() => {
    const promise = (async () => {
      try {
        setIsLoading(true);
        const result = await apiClientDispatch(getDefaultRunConfig({ workspaceId, collectionId })).unwrap();
        apiClientDispatch(runnerConfigActions.hydrateRunConfig(collectionId, result));

        const referenceId = getRunnerConfigId(collectionId, result.id);

        const allRequestIds = getAllDescendantApiRecordIds(collectionId, workspaceId);
        apiClientDispatch(runnerConfigActions.patchRunOrder({ id: referenceId, requestIds: allRequestIds }));

        // Need to fix
        const state = getApiClientFeatureContext(workspaceId).store.getState();
        const existingBuffer = referenceId ? findBufferByReferenceId(state.buffer.entities, referenceId) : null;

        // Create buffer for run config
        const bufferAction = apiClientDispatch(
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

        registerSecondaryBuffer(bufferAction.meta.id);

        return bufferAction.meta.id;
      } catch (error) {
        toast.error("Something went wrong!");
        Sentry.captureException(error, { extra: { collectionId } });
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      promise.then((id) => {
        if (id) {
          unregisterSecondaryBuffer(id);
        }
      });
    };
  }, [collectionId, workspaceId, apiClientDispatch, registerSecondaryBuffer, unregisterSecondaryBuffer]);

  useEffect(() => {
    (async () => {
      try {
        setIsResultsLoading(true);
        const results = await apiClientDispatch(getRunResults({ workspaceId, collectionId })).unwrap();
        apiClientDispatch(
          runHistoryActions.addHistoryEntries({
            collectionId,
            entries: results as RunHistoryEntry[],
          })
        );
        setIsResultsLoading(false);
      } catch (error) {
        toast.error("Something went wrong!");
        Sentry.captureException(error, { extra: { collectionId } });
      }
    })();
  }, [collectionId]);

  if (isLoading || isResultsLoading) {
    return <RunnerViewLoader />;
  }

  return (
    <CollectionViewContextProvider key={collectionId} collectionId={collectionId} configId={DEFAULT_RUN_CONFIG_ID}>
      <AutogenerateProvider>
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
              <RunResultView />
            </DataFileModalProvider>
          </Split>
        </div>
      </AutogenerateProvider>
    </CollectionViewContextProvider>
  );
};
