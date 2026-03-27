import { createSlice, createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { RunConfigEntity, RunnerConfigId, RunnerConfigState as RunConfigState, SavedRunConfig } from "./types";
import { API_CLIENT_RUNNER_CONFIG_SLICE_NAME } from "../common/constants";
import { fromSavedRunConfig, isValidDelay, isValidIterations, patchRunOrder } from "./utils";
import { entitySynced } from "../common";
import { ApiClientEntityType } from "../entities/types";
import { RQAPI } from "features/apiClient/types";
import { ApiClientFile, apiClientFileStore, FileFeature } from "features/apiClient/store/apiClientFilesStore";

export const runConfigAdapter = createEntityAdapter<RunConfigEntity>({
  selectId: (config) => config.collectionId + "::" + config.configId,
  sortComparer: (a, b) => (a.createdTs || 0) - (b.createdTs || 0),
});

const initialState: RunConfigState = {
  configs: runConfigAdapter.getInitialState(),
};

export const runnerConfigSlice = createSlice({
  name: API_CLIENT_RUNNER_CONFIG_SLICE_NAME,
  initialState,
  reducers: {
    setAllConfigs(state, action: PayloadAction<RunConfigEntity[]>) {
      runConfigAdapter.setAll(state.configs, action.payload);
    },
    upsertConfig(state, action: PayloadAction<RunConfigEntity>) {
      runConfigAdapter.upsertOne(state.configs, action.payload);
    },
    upsertConfigs(state, action: PayloadAction<RunConfigEntity[]>) {
      runConfigAdapter.upsertMany(state.configs, action.payload);
    },
    removeConfig(state, action: PayloadAction<RunnerConfigId>) {
      runConfigAdapter.removeOne(state.configs, action.payload);
    },
    removeConfigsForCollection(state, action: PayloadAction<RunnerConfigId[]>) {
      runConfigAdapter.removeMany(state.configs, action.payload);
    },
    updateRunOrder(state, action: PayloadAction<{ key: RunnerConfigId; runOrder: RQAPI.RunOrder }>) {
      const config = state.configs.entities[action.payload.key];
      if (config) {
        config.runOrder = action.payload.runOrder;
      }
    },
    updateDelay(state, action: PayloadAction<{ key: RunnerConfigId; delay: number }>) {
      const { key, delay } = action.payload;
      const config = state.configs.entities[key];

      if (config && isValidDelay(delay)) {
        config.delay = delay;
      }
    },
    updateIterations(state, action: PayloadAction<{ key: RunnerConfigId; iterations: number }>) {
      const { key, iterations } = action.payload;
      const config = state.configs.entities[key];

      if (config && isValidIterations(iterations)) {
        config.iterations = iterations;
      }
    },
    updateDataFile(state, action: PayloadAction<{ key: RunnerConfigId; dataFile: RunConfigEntity["dataFile"] }>) {
      const config = state.configs.entities[action.payload.key];
      if (config) {
        config.dataFile = action.payload.dataFile;
      }
    },
    toggleRequestSelection(state, action: PayloadAction<{ key: RunnerConfigId; requestId: string }>) {
      const { key, requestId } = action.payload;
      const config = state.configs.entities[key];

      if (config) {
        config.runOrder = config.runOrder.map((item) =>
          item.id === requestId ? { ...item, isSelected: !item.isSelected } : item
        );
      }
    },
    setRequestSelection(
      state,
      action: PayloadAction<{
        key: RunnerConfigId;
        requestId: string;
        isSelected: boolean;
      }>
    ) {
      const { key, requestId, isSelected } = action.payload;
      const config = state.configs.entities[key];

      if (config) {
        config.runOrder = config.runOrder.map((item) => (item.id === requestId ? { ...item, isSelected } : item));
      }
    },
    toggleAllSelections(state, action: PayloadAction<{ key: RunnerConfigId; isSelected: boolean }>) {
      const { key, isSelected } = action.payload;
      const config = state.configs.entities[key];

      if (config) {
        config.runOrder = config.runOrder.map((item) => ({
          ...item,
          isSelected,
        }));
      }
    },
    patchRunOrder(
      state,
      action: PayloadAction<{
        id: RunnerConfigId;
        requestIds: string[];
      }>
    ) {
      const { id, requestIds } = action.payload;
      const config = state.configs.entities[id];

      if (config) {
        config.runOrder = patchRunOrder(config.runOrder, requestIds);
      }
    },

    unsafePatch(
      state,
      action: PayloadAction<{
        id: RunnerConfigId;
        patcher: (config: RunConfigEntity) => void;
      }>
    ) {
      const config = state.configs.entities[action.payload.id];
      if (config) {
        action.payload.patcher(config);
      }
    },

    hydrateRunConfig: {
      reducer(
        state,
        action: PayloadAction<{
          entity: RunConfigEntity;
        }>
      ) {
        runConfigAdapter.upsertOne(state.configs, action.payload.entity);
      },
      prepare(
        collectionId: string,
        savedConfig: SavedRunConfig,
        timestamps?: { createdTs?: number; updatedTs?: number }
      ) {
        const entity = fromSavedRunConfig(collectionId, savedConfig, timestamps);
        // Re-hydrate dataFile into apiClientFilesStore
        if (savedConfig.dataFile) {
          const apiClientFile: Omit<ApiClientFile, "isFileValid"> = {
            name: savedConfig.dataFile.name,
            path: savedConfig.dataFile.path,
            source: savedConfig.dataFile.source,
            size: savedConfig.dataFile.size,
            fileFeature: FileFeature.COLLECTION_RUNNER,
          };
          apiClientFileStore.getState().addFile(savedConfig.dataFile.id, apiClientFile);
        }

        return {
          payload: { entity },
        };
      },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(entitySynced, (state, action) => {
      const { entityType, entityId, data } = action.payload;
      if (entityType === ApiClientEntityType.RUN_CONFIG) {
        if (data) {
          runConfigAdapter.updateOne(state.configs, {
            id: entityId,
            changes: data,
          });
        }
      }
    });
  },
});
export const runnerConfigActions = runnerConfigSlice.actions;
export const runnerConfigReducer = runnerConfigSlice.reducer;
