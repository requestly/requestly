import React, { useMemo, useCallback, useEffect, useRef } from "react";
import { ReorderableList } from "./ReorderableList/ReorderableList";
import { useCollectionView } from "../../../../../collectionView.context";
import { useApiClientSelector, useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { selectRunConfig, selectRunConfigWithRecordsByArgs } from "features/apiClient/slices/runConfig/selectors";
import { runnerConfigActions } from "features/apiClient/slices/runConfig/slice";
import { DEFAULT_RUN_CONFIG_ID, getRunnerConfigId } from "features/apiClient/slices/runConfig/types";
import { RQAPI } from "features/apiClient/types";
import { selectAllDescendantIds } from "features/apiClient/slices/apiRecords/selectors";
import { selectRecordById } from "features/apiClient/slices/apiRecords/selectors";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { useBufferedEntity } from "features/apiClient/slices/entities/hooks";

export const RunConfigOrderedRequests: React.FC = () => {
  const { collectionId } = useCollectionView();
  const dispatch = useApiClientDispatch();
  const runOrderPatchedRef = useRef(false);

  // Get config with records from Redux slice
  // const configWithRecords = useApiClientSelector((state) =>
  //   selectRunConfigWithRecordsByArgs(state, collectionId, DEFAULT_RUN_CONFIG_ID)
  // );
  //
  const bufferedEntity = useBufferedEntity({
    id: getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID),
    type: ApiClientEntityType.RUN_CONFIG,
  });

  const configId = DEFAULT_RUN_CONFIG_ID;

  const items = useApiClientSelector((state) => {
    const runOrder = bufferedEntity.getRunOrder(state);

    return runOrder
      .map(({ id, isSelected }) => {
        const record = selectRecordById(state, id);
        return { record, isSelected };
      })
      .filter((item) => !!item.record) as RQAPI.OrderedRequest[];
  });

  // const configWithRecordsw = useApiClientSelector((state) => {bufferedEntity.getSelectedRequestIds(state) })
  // Get all descendant IDs÷ and filter for API records only
  const allRequestIds = useApiClientSelector((state) => {
    const descendantIds = selectAllDescendantIds(state, collectionId);
    // Filter to get only API records (requests), not collections
    return descendantIds.filter((id) => {
      const record = selectRecordById(state, id);
      return record?.type === RQAPI.RecordType.API;
    });
  });

  useEffect(() => {
    if (runOrderPatchedRef.current) {
      return;
    }

    runOrderPatchedRef.current = true;
    dispatch(runnerConfigActions.patchRunOrder(collectionId, configId, allRequestIds));
  }, [collectionId, configId, allRequestIds, dispatch]);

  // const orderedRequests = useMemo(() => {
  //   return configWithRecords.runOrderWithRecords
  //     .filter((item) => item.record !== null)
  //     .map((item) => ({
  //       record: item.record!,
  //       isSelected: item.item.isSelected,
  //     }));
  // }, [configWithRecords]);

  const handleOrderUpdate = useCallback(
    (updatedRunOrder: RQAPI.RunConfig["runOrder"]) => {
      bufferedEntity.setRunOrder(updatedRunOrder);
    },
    [bufferedEntity]
  );

  return <ReorderableList requests={items} onOrderUpdate={handleOrderUpdate} />;
};
