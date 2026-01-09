import React, { useCallback } from "react";
import { ReorderableList } from "./ReorderableList/ReorderableList";
import { useCollectionView } from "../../../../../collectionView.context";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { selectBufferedRunConfigOrderedRequests } from "features/apiClient/slices/runConfig/selectors";
import { RQAPI } from "features/apiClient/types";
import { getRunnerConfigId } from "features/apiClient/slices/runConfig/utils";
import { DEFAULT_RUN_CONFIG_ID } from "features/apiClient/slices/runConfig/constants";

export const RunConfigOrderedRequests: React.FC = () => {
  const { collectionId, bufferedEntity } = useCollectionView();

  const referenceId = getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID);
  const items = useApiClientSelector((state) => selectBufferedRunConfigOrderedRequests(state, referenceId));

  const handleOrderUpdate = useCallback(
    (updatedRunOrder: RQAPI.RunConfig["runOrder"]) => {
      bufferedEntity.setRunOrder(updatedRunOrder);
    },
    [bufferedEntity]
  );

  return <ReorderableList requests={items} onOrderUpdate={handleOrderUpdate} />;
};
