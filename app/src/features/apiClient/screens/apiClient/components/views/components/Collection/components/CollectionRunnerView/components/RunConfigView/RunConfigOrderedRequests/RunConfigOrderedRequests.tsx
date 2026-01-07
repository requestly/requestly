import React, { useCallback, useEffect } from "react";
import { ReorderableList } from "./ReorderableList/ReorderableList";
import { useCollectionView } from "../../../../../collectionView.context";
import { useApiClientSelector, useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { runnerConfigActions } from "features/apiClient/slices/runConfig/slice";
import { DEFAULT_RUN_CONFIG_ID, getRunnerConfigId } from "features/apiClient/slices/runConfig/types";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { useBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { getAllDescendantApiRecordIds } from "features/apiClient/slices/apiRecords/utils";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { selectBufferedRunConfigOrderedRequests } from "features/apiClient/slices/runConfig/selectors";
import { RQAPI } from "features/apiClient/types";

export const RunConfigOrderedRequests: React.FC = () => {
  const { collectionId } = useCollectionView();
  const workspaceId = useWorkspaceId();
  const apiClientDispatch = useApiClientDispatch();

  const bufferedEntity = useBufferedEntity({
    id: getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID),
    type: ApiClientEntityType.RUN_CONFIG,
  });

  const referenceId = getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID);
  const items = useApiClientSelector((state) => selectBufferedRunConfigOrderedRequests(state, referenceId));

  useEffect(() => {
    const allRequestIds = getAllDescendantApiRecordIds(collectionId, workspaceId);
    const id = getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID);
    apiClientDispatch(runnerConfigActions.patchRunOrder({ id, requestIds: allRequestIds }));
  }, [collectionId, workspaceId, apiClientDispatch]);

  const handleOrderUpdate = useCallback(
    (updatedRunOrder: RQAPI.RunConfig["runOrder"]) => {
      bufferedEntity.setRunOrder(updatedRunOrder);
    },
    [bufferedEntity]
  );

  return <ReorderableList requests={items} onOrderUpdate={handleOrderUpdate} />;
};
