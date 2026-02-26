import * as Sentry from "@sentry/react";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { getApiClientFeatureContext } from "features/apiClient/slices";
import { bufferActions } from "features/apiClient/slices/buffer";
import { findBufferByReferenceId } from "features/apiClient/slices/buffer/slice";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { runnerConfigActions } from "features/apiClient/slices/runConfig/slice";
import { getDefaultRunConfig, getRunResults } from "features/apiClient/slices/runConfig/thunks";
import { fromSavedRunConfig, getRunnerConfigId } from "features/apiClient/slices/runConfig/utils";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { RQAPI } from "features/apiClient/types";
import { useHostContext } from "hooks/useHostContext";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Split from "react-split";
import { toast } from "utils/Toast";
import { CollectionViewContextProvider } from "../../collectionView.context";
import "./collectionRunnerView.scss";
import { DataFileModalProvider } from "./components/RunConfigView/ParseFileModal/Modals/DataFileModalContext";
import { RunConfigView } from "./components/RunConfigView/RunConfigView";
import { RunnerViewLoader } from "./components/RunnerViewLoader/RunnerViewLoader";
import { RunResultView } from "./components/RunResultView/RunResultView";
import { runHistoryActions } from "features/apiClient/slices/runHistory";
import { DEFAULT_RUN_CONFIG_ID } from "features/apiClient/slices/runConfig/constants";
import { RunHistorySaveStatus } from "features/apiClient/slices/runHistory/types";

interface Props {
  collectionId: RQAPI.CollectionRecord["id"];
  activeTabKey: string;
}

export const CollectionRunnerView: React.FC<Props> = ({ collectionId, activeTabKey }) => {
  const workspaceId = useWorkspaceId();
  const apiClientDispatch = useApiClientDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isResultsLoading, setIsResultsLoading] = useState(true);
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);
  const { registerSecondaryBuffer, unregisterSecondaryBuffer } = useHostContext();

  useEffect(() => {
    const promise = (async () => {
      try {
        setIsLoading(true);
        const result = await apiClientDispatch(getDefaultRunConfig({ workspaceId, collectionId })).unwrap();
        apiClientDispatch(runnerConfigActions.hydrateRunConfig(collectionId, result));

        const referenceId = getRunnerConfigId(collectionId, result.id);

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
            history: results,
            status: RunHistorySaveStatus.IDLE,
            error: null,
          })
        );
        setIsResultsLoading(false);
      } catch (error) {
        toast.error("Something went wrong!");
        Sentry.captureException(error, { extra: { collectionId } });
      }
    })();
  }, [apiClientDispatch, collectionId, workspaceId]);

  const handleToggleDetailedView = useCallback((open: boolean) => {
    setIsDetailedViewOpen(open);
  }, []);

  const runResultViewProps = useMemo(
    () => ({
      isDetailedViewOpen,
      onToggleDetailedView: handleToggleDetailedView,
    }),
    [isDetailedViewOpen, handleToggleDetailedView]
  );

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
              <div className={isDetailedViewOpen ? "hidden" : ""}>
                <RunConfigView activeTabKey={activeTabKey} />
              </div>
              <RunResultView {...runResultViewProps} />
            </DataFileModalProvider>
          </Split>
        </div>
      </AutogenerateProvider>
    </CollectionViewContextProvider>
  );
};
