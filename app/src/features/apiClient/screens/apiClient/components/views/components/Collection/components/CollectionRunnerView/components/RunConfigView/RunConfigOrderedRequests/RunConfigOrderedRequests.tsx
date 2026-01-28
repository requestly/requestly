import React, { useCallback, useEffect } from "react";
import { ReorderableList } from "./ReorderableList/ReorderableList";
import { useCollectionView } from "../../../../../collectionView.context";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { selectBufferedRunConfigOrderedRequests } from "features/apiClient/slices/runConfig/selectors";
import { RQAPI } from "features/apiClient/types";
import { getRunnerConfigId } from "features/apiClient/slices/runConfig/utils";
import { DEFAULT_RUN_CONFIG_ID } from "features/apiClient/slices/runConfig/constants";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { useAllDescendantIds } from "features/apiClient/slices";
import { getAllDescendantApiRecordIds } from "features/apiClient/slices/apiRecords/utils";
import { runnerConfigActions } from "features/apiClient/slices/runConfig/slice";

export const RunConfigOrderedRequests: React.FC = () => {
  const { collectionId, bufferedEntity } = useCollectionView();
  const workspaceId = useWorkspaceId();
  const apiClientDispatch = useApiClientDispatch();
  const descendantIds = useAllDescendantIds(collectionId);

  const referenceId = getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID);
  const items = useApiClientSelector((state) => selectBufferedRunConfigOrderedRequests(state, referenceId));

  const handleOrderUpdate = useCallback(
    (updatedRunOrder: RQAPI.RunConfig["runOrder"]) => {
      bufferedEntity.setRunOrder(updatedRunOrder);
    },
    [bufferedEntity]
  );

  useEffect(() => {
    const referenceId = getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID);
    const allRequestIds = getAllDescendantApiRecordIds(collectionId, workspaceId);
    apiClientDispatch(runnerConfigActions.patchRunOrder({ id: referenceId, requestIds: allRequestIds }));
  }, [descendantIds, collectionId, workspaceId, apiClientDispatch]);

  return <ReorderableList requests={items} onOrderUpdate={handleOrderUpdate} />;
};
