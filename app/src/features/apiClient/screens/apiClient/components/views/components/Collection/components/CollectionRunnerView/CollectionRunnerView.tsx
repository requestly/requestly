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
import { bufferActions } from "features/apiClient/slices/buffer";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { getApiClientFeatureContext } from "features/apiClient/slices";
import { findBufferByReferenceId } from "features/apiClient/slices/buffer/slice";
import { useHostContext } from "hooks/useHostContext";
import { fromSavedRunConfig, getRunnerConfigId } from "features/apiClient/slices/runConfig/utils";
import { getAllDescendantApiRecordIds } from "features/apiClient/slices/apiRecords/utils";
import "./collectionRunnerView.scss";

interface Props {
  collectionId: RQAPI.CollectionRecord["id"];
  activeTabKey: string;
}

export const CollectionRunnerView: React.FC<Props> = ({ collectionId, activeTabKey }) => {
  const workspaceId = useWorkspaceId();
  const apiClientDispatch = useApiClientDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [runResults] = useState<RunResult[]>([]);
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
      </AutogenerateProvider>
    </CollectionViewContextProvider>
  );
};
