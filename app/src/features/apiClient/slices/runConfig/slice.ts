import { createSlice, createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import type { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";
import {
  getRunnerConfigKey,
  RunConfigEntity,
  RunnerConfigKey,
  RunnerConfigState as RunConfigState,
  RunOrder,
  RunDataFile,
  isValidDelay,
  isValidIterations,
  fromSavedRunConfig,
} from "./types";

export const runConfigAdapter = createEntityAdapter<RunConfigEntity>({
  selectId: (config) => config.id,
  sortComparer: (a, b) => (a.createdTs || 0) - (b.createdTs || 0),
});

const initialState: RunConfigState = {
  configs: runConfigAdapter.getInitialState(),
};

export const runnerConfigSlice = createSlice({
  name: "runnerConfig",
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
    removeConfig(state, action: PayloadAction<RunnerConfigKey>) {
      runConfigAdapter.removeOne(state.configs, action.payload);
    },
    removeConfigsForCollection: {
      reducer(state, action: PayloadAction<{ keys: RunnerConfigKey[] }>) {
        runConfigAdapter.removeMany(state.configs, action.payload.keys);
      },
      prepare(collectionId: string) {
        return { payload: { keys: [] } }; // Placeholder
      },
    },
    updateRunOrder: {
      reducer(state, action: PayloadAction<{ key: RunnerConfigKey; runOrder: RunOrder }>) {
        const config = state.configs.entities[action.payload.key];
        if (config) {
          config.runOrder = action.payload.runOrder;
          // TODO: Phase 4 - Persist via repository: toSavedRunConfig(config) -> repository.save()
        }
      },
      prepare(collectionId: string, configId: string, runOrder: RunOrder) {
        return {
          payload: {
            key: getRunnerConfigKey(collectionId, configId),
            runOrder,
          },
        };
      },
    },
    updateDelay: {
      reducer(state, action: PayloadAction<{ key: RunnerConfigKey; delay: number }>) {
        const { key, delay } = action.payload;
        const config = state.configs.entities[key];

        if (!config) return;
        if (!isValidDelay(delay)) {
          console.error(`Invalid delay: ${delay}`);
          return;
        }

        config.delay = delay;
        // TODO: Phase 4 - Persist via repository: toSavedRunConfig(config) -> repository.save()
      },
      prepare(collectionId: string, configId: string, delay: number) {
        return {
          payload: {
            key: getRunnerConfigKey(collectionId, configId),
            delay,
          },
        };
      },
    },
    updateIterations: {
      reducer(state, action: PayloadAction<{ key: RunnerConfigKey; iterations: number }>) {
        const { key, iterations } = action.payload;
        const config = state.configs.entities[key];

        if (!config) return;
        if (!isValidIterations(iterations)) {
          console.error(`Invalid iterations: ${iterations}`);
          return;
        }

        config.iterations = iterations;
        // TODO: Phase 4 - Persist via repository: toSavedRunConfig(config) -> repository.save()
      },
      prepare(collectionId: string, configId: string, iterations: number) {
        return {
          payload: {
            key: getRunnerConfigKey(collectionId, configId),
            iterations,
          },
        };
      },
    },
    updateDataFile: {
      reducer(state, action: PayloadAction<{ key: RunnerConfigKey; dataFile: RunDataFile | null }>) {
        const config = state.configs.entities[action.payload.key];
        if (config) {
          config.dataFile = action.payload.dataFile;
          // TODO: Phase 4 - Persist via repository: toSavedRunConfig(config) -> repository.save()
        }
      },
      prepare(collectionId: string, configId: string, dataFile: RunDataFile | null) {
        return {
          payload: {
            key: getRunnerConfigKey(collectionId, configId),
            dataFile,
          },
        };
      },
    },
    toggleRequestSelection: {
      reducer(state, action: PayloadAction<{ key: RunnerConfigKey; requestId: string }>) {
        const { key, requestId } = action.payload;
        const config = state.configs.entities[key];

        if (!config) return;

        config.runOrder = config.runOrder.map((item) =>
          item.id === requestId ? { ...item, isSelected: !item.isSelected } : item
        );
        // TODO: Phase 4 - Persist via repository: toSavedRunConfig(config) -> repository.save()
      },
      prepare(collectionId: string, configId: string, requestId: string) {
        return {
          payload: {
            key: getRunnerConfigKey(collectionId, configId),
            requestId,
          },
        };
      },
    },
    setRequestSelection: {
      reducer(
        state,
        action: PayloadAction<{
          key: RunnerConfigKey;
          requestId: string;
          isSelected: boolean;
        }>
      ) {
        const { key, requestId, isSelected } = action.payload;
        const config = state.configs.entities[key];

        if (!config) return;

        config.runOrder = config.runOrder.map((item) => (item.id === requestId ? { ...item, isSelected } : item));
        // TODO: Phase 4 - Persist via repository: toSavedRunConfig(config) -> repository.save()
      },
      prepare(collectionId: string, configId: string, requestId: string, isSelected: boolean) {
        return {
          payload: {
            key: getRunnerConfigKey(collectionId, configId),
            requestId,
            isSelected,
          },
        };
      },
    },
    toggleAllSelections: {
      reducer(state, action: PayloadAction<{ key: RunnerConfigKey; isSelected: boolean }>) {
        const { key, isSelected } = action.payload;
        const config = state.configs.entities[key];

        if (!config) return;

        config.runOrder = config.runOrder.map((item) => ({
          ...item,
          isSelected,
        }));
        // TODO: Phase 4 - Persist via repository: toSavedRunConfig(config) -> repository.save()
      },
      prepare(collectionId: string, configId: string, isSelected: boolean) {
        return {
          payload: {
            key: getRunnerConfigKey(collectionId, configId),
            isSelected,
          },
        };
      },
    },

    /**
     * Hydrates Redux store from backend SavedRunConfig format
     * Used when loading configs from Firebase/local storage
     * TODO: Phase 4 - This will be called by sync layer when loading configs
     */
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
        return {
          payload: { entity },
        };
      },
    },
  },
});
export const runnerConfigActions = runnerConfigSlice.actions;
export const runnerConfigReducer = runnerConfigSlice.reducer;
