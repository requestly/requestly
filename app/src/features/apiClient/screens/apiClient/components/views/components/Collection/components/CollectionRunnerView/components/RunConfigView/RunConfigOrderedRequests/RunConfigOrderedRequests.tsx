import React, { useCallback, useEffect } from "react";
import { ReorderableList } from "./ReorderableList/ReorderableList";
import { useCollectionView } from "../../../../../collectionView.context";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { selectBufferedRunConfigOrderedRequests } from "features/apiClient/slices/runConfig/selectors";
import { RQAPI } from "features/apiClient/types";
import { getRunnerConfigId } from "features/apiClient/slices/runConfig/utils";
import { DEFAULT_RUN_CONFIG_ID } from "features/apiClient/slices/runConfig/constants";
import { useAllDescendantApiRecordIds } from "features/apiClient/slices";
import { runnerConfigActions } from "features/apiClient/slices/runConfig/slice";

export const RunConfigOrderedRequests: React.FC = () => {
  const { collectionId, bufferedEntity } = useCollectionView();
  const apiClientDispatch = useApiClientDispatch();
  const descendantApiRecordIds = useAllDescendantApiRecordIds(collectionId);

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
    apiClientDispatch(runnerConfigActions.patchRunOrder({ id: referenceId, requestIds: descendantApiRecordIds }));
  }, [descendantApiRecordIds, collectionId, apiClientDispatch]);

  return <ReorderableList requests={items} onOrderUpdate={handleOrderUpdate} />;
};
