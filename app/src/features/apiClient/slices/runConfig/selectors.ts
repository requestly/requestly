import { createSelector } from "@reduxjs/toolkit";
import { runConfigAdapter } from "./slice";
import type { RunnerConfigId, RunConfigEntity } from "./types";
import { selectRecordsEntities } from "../apiRecords/selectors";
import type { RQAPI } from "features/apiClient/types";
import type { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry";
import { findBufferByReferenceId } from "../buffer/slice";
import { isApiRequest } from "features/apiClient/screens/apiClient/utils";
import { EntityNotFound } from "../types";

const selectRunConfigSlice = (state: ApiClientStoreState) => {
  return state.runnerConfig;
};

const selectRunConfigEntityState = createSelector(selectRunConfigSlice, (slice) => slice?.configs);

const adapterSelectors = runConfigAdapter.getSelectors(selectRunConfigEntityState);

export const selectAllRunConfigs = adapterSelectors.selectAll;

export const selectRunConfigEntities = adapterSelectors.selectEntities;
export const selectRunConfigIds = adapterSelectors.selectIds;

export const selectTotalRunConfigs = adapterSelectors.selectTotal;

export const selectRunConfigById = adapterSelectors.selectById;

export const selectRunConfigByKey = createSelector(
  [selectRunConfigEntities, (_state: ApiClientStoreState, key: RunnerConfigId) => key],
  (entities, key) => entities[key] ?? null
);

export const selectRunConfig = createSelector(
  [
    selectRunConfigEntities,
    (_state: ApiClientStoreState, collectionId: string, _configId: string) => collectionId,
    (_state: ApiClientStoreState, _collectionId: string, configId: string) => configId,
  ],
  (entities, collectionId, configId) => {
    const key = `${collectionId}::${configId}`;
    return entities[key] ?? null;
  }
);

export const selectBufferedRunConfigOrderedRequests = createSelector(
  [
    (state: ApiClientStoreState) => state.buffer,
    selectRecordsEntities,
    (_state: ApiClientStoreState, referenceId: string) => referenceId,
  ],
  (bufferState, recordsEntities, referenceId): RQAPI.OrderedRequest[] => {
    const bufferEntry = findBufferByReferenceId(bufferState.entities, referenceId);

    if (!bufferEntry) {
      throw new EntityNotFound(referenceId, "BUFFER");
    }

    const runConfig = bufferEntry.current as RunConfigEntity;
    if (!runConfig || !runConfig.runOrder) {
      return [];
    }

    return runConfig.runOrder
      .map(({ id, isSelected }) => {
        return { record: recordsEntities[id], isSelected };
      })
      .filter((item) => !!item.record && isApiRequest(item.record)) as RQAPI.OrderedRequest[];
  }
);
