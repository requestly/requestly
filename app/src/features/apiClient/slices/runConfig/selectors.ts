import { createSelector } from "@reduxjs/toolkit";
import { runConfigAdapter } from "./slice";
import type { RunnerConfigKey, RunConfigEntity, RunOrderItem } from "./types";
import { selectRecordsEntities } from "../apiRecords/selectors";
import type { RQAPI } from "features/apiClient/types";
import type { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry";


const selectRunConfigSlice = (state: ApiClientStoreState) => {
  return state.runConfig;
};


const selectRunConfigEntityState = createSelector(selectRunConfigSlice, (slice) => slice?.configs);

const adapterSelectors = runConfigAdapter.getSelectors(selectRunConfigEntityState);


export const selectAllRunConfigs = adapterSelectors.selectAll;

export const selectRunConfigEntities = adapterSelectors.selectEntities;
export const selectRunConfigIds = adapterSelectors.selectIds;

export const selectTotalRunConfigs = adapterSelectors.selectTotal;

export const selectRunConfigById = adapterSelectors.selectById;

export const selectRunConfigByKey = createSelector(
  [selectRunConfigEntities, (_state: ApiClientStoreState, key: RunnerConfigKey) => key],
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

export interface RunOrderWithRecord {
  item: RunOrderItem;
  record: RQAPI.ApiRecord | null;
}

export const selectRunConfigWithRecords = createSelector(
  [selectRunConfigByKey, selectRecordsEntities],
  (config, recordsEntities): { config: RunConfigEntity; runOrderWithRecords: RunOrderWithRecord[] } | null => {
    if (!config) return null;

    const runOrderWithRecords: RunOrderWithRecord[] = config.runOrder.map((item) => ({
      item,
      record: (recordsEntities[item.id] as RQAPI.ApiRecord) ?? null,
    }));

    return {
      config,
      runOrderWithRecords,
    };
  }
);


export const selectRunConfigWithRecordsByArgs = createSelector(
  [selectRunConfig, selectRecordsEntities],
  (config, recordsEntities): { config: RunConfigEntity; runOrderWithRecords: RunOrderWithRecord[] } | null => {
    if (!config) return null;

    const runOrderWithRecords: RunOrderWithRecord[] = config.runOrder.map((item) => ({
      item,
      record: (recordsEntities[item.id] as RQAPI.ApiRecord) ?? null,
    }));

    return {
      config,
      runOrderWithRecords,
    };
  }
);


export const selectSelectedRequests = createSelector([selectRunConfigWithRecords], (result): RunOrderWithRecord[] => {
  if (!result) return [];

  return result.runOrderWithRecords.filter((entry) => entry.item.isSelected && entry.record !== null);
});


export const selectSelectedRequestsByArgs = createSelector(
  [selectRunConfigWithRecordsByArgs],
  (result): RunOrderWithRecord[] => {
    if (!result) return [];

    return result.runOrderWithRecords.filter((entry) => entry.item.isSelected && entry.record !== null);
  }
);


export const selectSelectedRequestIds = createSelector([selectRunConfigByKey], (config): string[] => {
  if (!config) return [];

  return config.runOrder.filter((item) => item.isSelected).map((item) => item.id);
});


export const selectSelectedRequestCount = createSelector([selectRunConfigByKey], (config): number => {
  if (!config) return 0;

  return config.runOrder.filter((item) => item.isSelected).length;
});

export const selectTotalRequestCount = createSelector([selectRunConfigByKey], (config): number => {
  if (!config) return 0;

  return config.runOrder.length;
});

export const selectAreAllRequestsSelected = createSelector([selectRunConfigByKey], (config): boolean => {
  if (!config || config.runOrder.length === 0) return false;

  return config.runOrder.every((item) => item.isSelected);
});

export const selectHasAnySelectedRequests = createSelector([selectRunConfigByKey], (config): boolean => {
  if (!config) return false;

  return config.runOrder.some((item) => item.isSelected);
});


export interface SelectionStats {
  total: number;
  selected: number;
  unselected: number;
  allSelected: boolean;
  noneSelected: boolean;
  someSelected: boolean;
}

export const selectSelectionStats = createSelector([selectRunConfigByKey], (config): SelectionStats => {
  if (!config) {
    return {
      total: 0,
      selected: 0,
      unselected: 0,
      allSelected: false,
      noneSelected: true,
      someSelected: false,
    };
  }

  const total = config.runOrder.length;
  const selected = config.runOrder.filter((item) => item.isSelected).length;
  const unselected = total - selected;

  return {
    total,
    selected,
    unselected,
    allSelected: total > 0 && selected === total,
    noneSelected: selected === 0,
    someSelected: selected > 0 && selected < total,
  };
});


export const selectRunConfigsByCollectionId = createSelector(
  [selectAllRunConfigs, (_state: ApiClientStoreState, collectionId: string) => collectionId],
  (configs, collectionId) => configs.filter((config) => config.collectionId === collectionId)
);

export const selectRunConfigCountForCollection = createSelector(
  [selectRunConfigsByCollectionId],
  (configs) => configs.length
);


export const makeSelectRunConfigByKey = () =>
  createSelector(
    [selectRunConfigEntities, (_state: ApiClientStoreState, key: RunnerConfigKey) => key],
    (entities, key) => entities[key] ?? null
  );


export const makeSelectRunConfigWithRecords = () =>
  createSelector(
    [makeSelectRunConfigByKey(), selectRecordsEntities],
    (config, recordsEntities): { config: RunConfigEntity; runOrderWithRecords: RunOrderWithRecord[] } | null => {
      if (!config) return null;

      const runOrderWithRecords: RunOrderWithRecord[] = config.runOrder.map((item) => ({
        item,
        record: (recordsEntities[item.id] as RQAPI.ApiRecord) ?? null,
      }));

      return {
        config,
        runOrderWithRecords,
      };
    }
  );


export const makeSelectSelectedRequests = () =>
  createSelector([makeSelectRunConfigWithRecords()], (result): RunOrderWithRecord[] => {
    if (!result) return [];

    return result.runOrderWithRecords.filter((entry) => entry.item.isSelected && entry.record !== null);
  });
